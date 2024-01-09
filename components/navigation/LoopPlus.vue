<template>
    <v-navigation-drawer location="right" color="#fff" class="mt-5" temporary
    style="top: 15px; width: 350px; padding: 15px 0 15px 0; border: 0px" v-model="indexStore.loopPlus.visible" text-color="white">
    <div>
        <div class="page-title" style="padding: 20px; margin: 0px; background-color: #E8F0F8;">Добавить контент (LoopPlus)</div>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="search"
                    label="Поиск..."
                    single-line
                    hide-details
                    variant="outlined"
                >
                </v-text-field>
            </v-col>
        </v-row>
        <v-row style="margin: 0;">
            <v-col style="padding: 0 20px 0 20px;">
                <v-data-iterator 
                    :items="items"
                    items-per-page="999"
                    item-value="id"
                    :search="search"
                    >
                    <template v-slot:default="{ items }">
                        <template v-for="item in items" :key="item">
                            <!-- {{ item }} -->
                            <div style="display: flex; margin: 0 0 10px 0; position: relative;">
                                <div v-if="item.raw && item.raw.type.includes('image/')" class="item">
                                    <img :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${item.raw.filename}`" class="item-media">
                                </div>
                                <div v-if="item.raw && item.raw.type.includes('video/')" class="item">
                                    <video class="item-media">
                                        <source :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${item.raw.filename}`" />
                                    </video>
                                </div>
                                <div style="margin-left: 10px; width: 180px;">
                                    <div style="font-size: normal; color: #333;">{{ getTitle(item.raw.name) }}</div>
                                    <div style="font-size: small; color: #333;">{{ getTitle(item.raw.filename) }}</div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <div style="font-size: small; color: #999;">{{ getType(item.type) }}</div>
                                        <div style="font-size: small; color: #999;">{{ getTime(item.raw.duration) }} сек.</div>
                                    </div>
                                </div>
                                <div style="position: absolute; right: 0; color: #ccc;"> 
                                    <v-checkbox-btn v-model="item.raw.status" @click="selectMedia(item)"></v-checkbox-btn>
                                </div>
                            </div>    
                        </template>
                    </template>
                </v-data-iterator>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn @click="saveList" block style="background-color: #28a745; color: #fff;" :disabled="selectedMedia.length == 0">Добавить</v-btn>
                <v-btn @click="indexStore.loopPlus.visible = false" block style="background-color: #999; color: #fff; margin-top: 10px;">Закрыть</v-btn>
            </v-col>
        </v-row>

    </div>
    </v-navigation-drawer>
</template>

<script setup>
import randomId from '~/config/misc'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

const partner = reactive({
    selected: null
})

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        if (partner.selected) loadRecords()
    }
})

const items = ref([])
const search = ref('')
const selectedMedia = ref([])
const message = ref('')
const selectedDuration = ref(0)

const getTitle = (title) => {
    if (!title || title === undefined) return ''
    const name = title && title.length > 20 ? title.slice(0, 20) : title
    const ext = title.slice(title.lastIndexOf('.'))
    return name + "..." + ext
}

const getTime = (duration) => {
    return Math.round(duration * 10) / 10
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

const selectMedia = (item) => {
    const id = item.raw.id
    const status = !item.raw.status
    item.raw.duration = item.raw.duration == 0 ? 15 : item.raw.duration
    item.raw['media_id'] = randomId(32)

    selectedMedia.value = []
    items.value.forEach((media) => {
        media.status = false
    })

    if (status) {
        selectedMedia.value.push(item.raw)
    }
}

const loadRecords = async () => {
    if (indexStore.loopPlus.action == 'LoopPlus' && userStore.loggedIn && partner.selected) {

        items.value.splice(0)
        items.value = []
        selectedMedia.value = []

        try {
            indexStore.progress = true
            const { data, error } = await userStore.myFetch('/api/media', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userStore.accessToken}`
                },
                body: JSON.stringify({ 
                    action: 'index.active', 
                    partner: partner.selected
                }),
            })

            // console.log("LoopPlus loadRecords: ", data.value)
            if (data.value.code == 200) {
                items.value = data.value.data
                items.value.forEach((item) => {
                    // if (item.status == 1) { item.status = false }
                    item.status = false
                })
            }
            console.log("ITEMS: ", items.value)
            indexStore.progress = false

        } catch(e) {
            // console.log("GET LIST ERROR: ", e)
            indexStore.progress = false
        }
    }
}

const saveList = async () => {
    if (!selectedMedia.value || !selectedMedia.value.length) {
        return
    }

    const loopId = indexStore.loopPlus.data && indexStore.loopPlus.data.loopId ? indexStore.loopPlus.data.loopId : null

	// try {
		indexStore.progress = true
		message.value = ''

		const { data, error } = await useFetch('/api/loops', { 
			method: 'post', 
			body: { 
				action: 'media.save', 
				id: loopId,
                media: selectedMedia.value
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const code = data.value.code
            useNuxtApp().$toast.success('Медиа-файлы добавлены к плейлисту')

            var duration = 0
            if (selectedMedia.value && selectedMedia.value.length) {
                selectedMedia.value.forEach((selected) => {
                    indexStore.loops.get(loopId).media.push(selected)
                    duration = duration + selected.duration
                })
            }
            indexStore.loops.get(loopId).duration = duration

            indexStore.loopPlus.visible = false
            items.value = []
            selectedMedia.value = []

		} else {
			message.value = (error.value) ? error.value : ''
		}

	// } catch (e) {
    //     message.value = e
	// 	indexStore.progress = false
	// }
}

</script>

<style lang="scss" scoped>
.item {
    background-color: #fff;
    border-radius: 5px;
    height: 50px;
    width: 50px;
    color: #333;
    margin: 0;
    overflow: hidden;
    position: relative;
    cursor: pointer;
}
.item-play {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    color: #fff;
    padding: 5px;
    margin: 10px;
    font-size: x-large;
    cursor: pointer;
}
.item-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;	
}
.item-info {
    background-color: #fff;
    width: 100%;
    color: #333;
    margin: 0;
    overflow: hidden;
    position: relative;
}

.item-media-info {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;	
}
</style>