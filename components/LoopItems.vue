<template>
    <div style="float: left;">
        <!-- {{ indexStore.loops.get(loopId) }} -->

        <div v-for="media in indexStore.loops.get(loopId).media" :key="media" style="float: left;">

            <div v-if="media && media.type && media.type.includes('image/')" class="item" @click="itemInfo(media)">
                <img :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${media.filename}`" class="item-media">
                <div class="item-title">
                    <div style="font-size: small;">{{ getTitle(media.name) }}</div>
                    <div style="display: flex; justify-content: space-between;">
                        <div style="font-size: x-small;">{{ getType(media.type.split('/')[0]) }}</div>
                        <div style="font-size: x-small;">{{ getTime(media.duration) }} сек.</div>
                    </div>
                </div> 
                <div class="item-trash">
                    <i @click.stop="mediaDelete(media)" class="fa-regular fa-circle-xmark shadow"></i>
                </div>
            </div>

            <div v-if="media && media.type && media.type.includes('video/')" class="item" @click="itemInfo(media)">
                <video class="item-media">
                    <source :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${media.filename}`" />
                </video>
                <div class="item-title">
                    <div style="font-size: small;">{{ getTitle(media.name) }}</div>
                    <div style="display: flex; justify-content: space-between;">
                        <div style="font-size: x-small;">{{ getType(media.type.split('/')[0]) }}</div>
                        <div style="font-size: x-small;">{{ getTime(media.duration) }} сек.</div>
                    </div>
                </div>
                <div class="item-trash">
                    <i @click.stop="mediaDelete(media)" class="fa-regular fa-circle-xmark shadow"></i>
                </div>
            </div>
        </div>

        <div class="item-plus-container" @click="itemPlus(loopId)">
            <i @click="itemPlus(loopId)" class="fa-regular fa-square-plus item-plus"></i>
        </div>

        <client-only>
            <v-row justify="center">
                <v-dialog v-model="dialog.delete" persistent width="auto">
                  <v-card class="dialog-delete">
                    <v-card-text class="text-h6">Удалить запись?</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_delete_yes">Да</v-btn>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_action_no">Нет</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
            </v-row>
        </client-only>

        <LoopPlus :key="indexStore.loopPlus.key" />
        <LoopInfo :key="indexStore.loopInfo.key" />

    </div>
</template>
    
<script setup>
import randomId from "../config/misc"
import eventBus from '../config/eventBus'

import LoopPlus from './navigation/LoopPlus.vue'
import LoopInfo from './navigation/LoopInfo.vue'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
const message = ref('')

const partner = reactive({
    selected: null
})

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        //...
    }
})

const dialog = reactive({
    delete: false,
    action: null,
    listIdAction: null
})

const props = defineProps({
    item: String,
})
const loopId = props.item ? props.item : null

// const media = ref([]) 
// indexStore.loops.items

indexStore.loopPlus.visible = false
indexStore.loopPlus.key = randomId(32)

indexStore.loopInfo.visible = false
indexStore.loopInfo.key = randomId(32)

const dialog_delete_yes = async () => {
    dialog.delete = false

    // console.log("DELETE: ",  dialog.listIdAction, dialog.action)

    // try { 
        const { data, error } = await userStore.myFetch('/api/loops', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'media.delete',
                loop: dialog.listIdAction,
                id: dialog.action
            }),
        })

        if (data.value) {
            var media = []

            if (indexStore.loops.size && indexStore.loops.get(dialog.listIdAction) && 
                indexStore.loops.get(dialog.listIdAction).media && indexStore.loops.get(dialog.listIdAction).media.length) {

                indexStore.loops.get(dialog.listIdAction).media.forEach((m, index) => {
                    if (m.media_id != dialog.action) {
                        media.push(m)
                    }
                })
                indexStore.loops.get(dialog.listIdAction).media = media
            }
            useNuxtApp().$toast.success('Запись удалена')

        } else {
            useNuxtApp().$toast.error('Ошибка удаления записи!')
        }

    // } catch(e) {
    //     useNuxtApp().$toast.error('Ошибка удаления записи!')
    // }
    dialog.listIdAction = null
    dialog.action = null
}

const dialog_action_no = () => {
    dialog.delete = false
    dialog.listIdAction = null
    dialog.action = null
}

const getTitle = (title) => {
    const name = title && title.length > 16 ? title.slice(0, 16) + "..." : title
    return name
}

const getTime = (duration) => {
    // return Math.round(duration * 10) / 10
    return duration
}

const getType = (type) => {
    type = type.split('/')[0]

    switch(type) {
        case 'image':
            return 'Изображение'
        case 'video':
            return 'Видео'
        default:
            return 'Нет данных'
    }
}

const itemPlus = (loopId) => {
    indexStore.loopPlus.action = 'LoopPlus'
    indexStore.loopPlus.data = { loopId: loopId }
    indexStore.loopPlus.key = randomId(32)
    indexStore.loopPlus.visible = true
}

const itemInfo = (media) => {
    indexStore.loopInfo.action = 'LoopInfo'
    indexStore.loopInfo.data = { loop: loopId, item: media }
    indexStore.loopInfo.key = randomId(32)
    indexStore.loopInfo.visible = true
}

const loopDelete = (id) => {
    dialog.delete = true
    dialog.listIdAction = null
    dialog.action = loopId
}

const mediaDelete = (media) => {
    dialog.delete = true
    dialog.listIdAction = loopId
    dialog.action = media.media_id
}

</script>
    
<style lang="scss" scoped>
.item {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    height: 150px;
    width: 150px;
    color: #333;
    margin: 10px 10px 10px 0;
    overflow: hidden;
    position: relative;
    cursor: pointer;
}
.item-plus-container {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    height: 150px;
    width: 150px;
    margin: 10px 10px 10px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}
.item-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;	
}
.item-title {
    width: 100%;
    height: 30%;
    object-fit: cover;
    display: block;	
    position: absolute;
    bottom: 0;
    font-size: normal;
    color: #666;
    padding: 5px 10px 5px 10px;
    background-color: #fff;
}
.item-plus {
    color: #ccc;
    font-size: 32pt;

}
.item-trash {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    color: #fff;
    padding: 0 5px 5px 5px;
    margin: 10px;
    font-size: x-large;
}
.shadow {
    box-shadow: 0px 3px 5px #333;
    border-radius: 10px;
}
</style>