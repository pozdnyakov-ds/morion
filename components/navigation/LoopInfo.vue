<template>
    <v-navigation-drawer location="right" color="#fff" class="mt-5" temporary
    style="top: 15px; width: 350px; padding: 15px 0 15px 0; border: 0px" v-model="indexStore.loopInfo.visible" text-color="white">
    <div>
        <!-- {{ indexStore.loopInfo.data }} -->
        <div class="page-title" style="padding: 20px; margin: 0px; background-color: #E8F0F8;">Информация </div>
        <v-row style="margin: 0;">
            <v-col style="padding: 0;">
                <div v-if="indexStore.loopInfo.data && indexStore.loopInfo.data.item && indexStore.loopInfo.data.item.type && indexStore.loopInfo.data.item.type.includes('image/')" class="item-info">
                    <img class="item-media-info" :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${indexStore.loopInfo.data.item.filename}`">
                </div>
                <div v-if="indexStore.loopInfo.data && indexStore.loopInfo.data.item.type && indexStore.loopInfo.data.item.type.includes('video/')" class="item-info">
                    <video ref="playerId"
                        class="video-js vjs-default-skin item-media"
                        data-setup='{"controls": true, "autoplay": false, "preload": "auto"}'
                        fluid="true"
                        width="100%">
                        <source :src="indexStore.loopInfo.data.item.type.includes('video/') ? `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${indexStore.loopInfo.data.item.filename}` : ''" />
                    </video>
                    <div class="item-play">
                        <i @click="mediaPlay" class="fa-regular fa-circle-play"></i>
                    </div>
                </div>
            </v-col>
        </v-row> 
        <v-form v-model="valid" v-if="indexStore.loopInfo.data && indexStore.loopInfo.data.item">       
            <v-row style="margin: 0;">
                <v-col style="padding: 20px;">
                    <div style=""><b>Наименование:</b> {{ indexStore.loopInfo.data.item.name }}</div>
                    <div style=""><b>Описание:</b> {{ indexStore.loopInfo.data.item.description }}</div>
                    <div style="margin-top: 10px;"><b>Имя файла:</b> {{ getTitle(indexStore.loopInfo.data.item.filename) }}</div>
                    <div style=""><b>Тип файла:</b> {{ getType(indexStore.loopInfo.data.item.type) }}</div>
                    <div style=""><b>Размер:</b> {{ (indexStore.loopInfo.data.item.size / 1024).toFixed(0) }} Кб</div>
                    <div v-if="indexStore.loopInfo.data.item.type.includes('image/')">
                        <div style="margin-top: 10px;">
                            <b>Длительность:</b> 
                            <v-text-field v-model="selectedDuration" type="number" min="5" max="15"
                            outlined suffix=" сек." :rules="[required(''), minValue('', 5), maxLength('', 15)]" />
                        </div>
                    </div>
                    <div v-if="indexStore.loopInfo.data.item.type.includes('video/')">
                        <div style="margin-top: 10px;"><b>Длительность:</b> {{ getTime(selectedDuration) }} сек. </div>
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <div v-if="indexStore.loopInfo.data.item.type.includes('image/')">
                        <v-btn @click="saveDuration" block :disabled="!valid" style="background-color: #28a745; color: #fff;">Сохранить</v-btn>
                    </div>
                    <v-btn @click="indexStore.loopInfo.visible = false" block style="background-color: #999; color: #fff; margin-top: 10px;">Закрыть</v-btn>
                </v-col>
            </v-row>
        </v-form>
    </div>

    <client-only>
        <v-row justify="center">
            <v-dialog v-model="indexStore.videoView.visible" persistent width="600px">
              <VideoView :key="randomId(32)"/>
            </v-dialog>
        </v-row>
    </client-only>

    </v-navigation-drawer>
</template>

<script setup>
import randomId from '~/config/misc';

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

const partner = reactive({
    selected: null
})
partner.selected = userStore.partner ? userStore.partner : null

const valid = ref(false)
const items = ref([])
const selectedMedia = ref([])
const message = ref('')
const selectedDuration = ref(0)

const dialog = reactive({
    view: false
})

useHead({
    script: [
      { 
        src: "https://vjs.zencdn.net/8.5.2/video.min.js", 
        defer: true,
      }
    ]
})

onMounted(() => {
    if (indexStore.loopInfo.action) {
        selectedDuration.value = indexStore.loopInfo.data.item.duration * 1.0
    }
})

const required = () => {
	return v => v && v.length > 0 || 'Выбрать значение'
}
const minLength = (propertyType, minLength) => {
	return v => v && v >= minLength || `Значение не меньше ${minLength}`
}
const maxLength = (propertyType, maxLength) => {
	return v => v && v <= maxLength || `Значение не больше ${maxLength}`
}
const minValue = (propertyType, minValue) => {
	return v => v && v >= minValue || `Не меньше ${minValue}`
}

const mediaPlay = () => {
    indexStore.videoView.item = {
        partner: indexStore.loopInfo.data.item.partner,
        filename: indexStore.loopInfo.data.item.filename,
        type: indexStore.loopInfo.data.item.type
    }
    indexStore.videoView.visible = true
}

const dialog_action_no = () => {
    dialog.view = false
}

const getTitle = (title) => {
    const name = title.length > 20 ? title.slice(0, 20) : title
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

const saveDuration = async () => {

    const loopId = indexStore.loopInfo.data && indexStore.loopInfo.data.item &&
        indexStore.loopInfo.data.loop ? indexStore.loopInfo.data.loop : null

    const mediaId = indexStore.loopInfo.data && indexStore.loopInfo.data.item &&
        indexStore.loopInfo.data.item.media_id ? indexStore.loopInfo.data.item.media_id : null

    const mediaDuration = selectedDuration.value ? selectedDuration.value : 0

	// try {
		indexStore.progress = true
		message.value = ''

		const { data, error } = await useFetch('/api/loops', { 
			method: 'post', 
			body: { 
				action: 'media.duration', 
				loop: loopId,
                media: mediaId,
                duration: mediaDuration
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const code = data.value.code
            useNuxtApp().$toast.success('Длительность медиа обновлена')

            indexStore.loops.get(loopId).media.forEach((media, index) => {
                if (media.media_id == mediaId) {
                    indexStore.loops.get(loopId).media[index].duration = mediaDuration
                }
            })

            indexStore.loopInfo.visible = false

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
@import "https://vjs.zencdn.net/8.5.2/video-js.css";

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