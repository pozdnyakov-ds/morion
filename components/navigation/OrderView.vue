<template>
    <v-navigation-drawer 
        location="right" 
        color="#fff" 
        class="mt-5" 
        temporary 
        width="400"
        style="top: 15px; padding: 15px 0 15px 0; box-shadow: -5px 0 5px #aaa;" 
        v-model="indexStore.orderView.visible" 
        text-color="white"
    >
        <div class="page-title" style="padding: 20px; margin: 0; background-color: #9ce9bf;">Заявка на размещение: {{ recordInfo.name }}</div>

        <v-row style="margin: 0 0 15px 0;">
            <v-col style="padding: 0;">
                <div v-if="media.type && media.type.includes('image/')" class="item-info">
                    <img class="item-media" :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${media.partner}/${media.filename}`">
                </div>
                <div v-if="media.type && media.type.includes('video/')" class="item-info">
                    <video 
                        class="item-media"
                        > 
                            <source 
                                :src="media.type.includes('video/') ? `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${media.partner}/${media.filename}` : ''"
                                :type="media.type"
                            >
                        >
                    </video>
                    <div class="item-play">
                        <i @click="mediaPlay" class="fa-regular fa-circle-play"></i>
                    </div>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-text-field
                    style="width: 100%;"
                    label="Рекламодатель"
                    readonly
                    variant="outlined"
                    v-model="recordInfo.partner_name"
                ></v-text-field>
                <v-text-field
                    style="width: 100%;"
                    label="Адрес экрана"
                    readonly
                    variant="outlined"
                    v-model="recordInfo.address"
                ></v-text-field>
                <v-text-field
                    style="width: 100%;"
                    label="Тип контента"
                    readonly
                    variant="outlined"
                    v-model="recordInfo.type"
                ></v-text-field>
                <v-text-field
                    style="width: 100%;"
                    label="Целевой плейлист"
                    readonly
                    variant="outlined"
                    v-model="recordInfo.playlist_name"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">    
                <v-text-field
                    style="width: 100%;"
                    label="Дата начала"
                    readonly
                    variant="outlined"
                    v-model="recordInfo.startDate"
                ></v-text-field>
            </v-col>    
            <v-col cols="6">     
                <v-text-field
                    style="width: 100%;"
                    label="Дата завершения"
                    readonly
                    variant="outlined"
                    v-model="recordInfo.finishDate"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-form v-model="valid">
            <v-row>
                <v-col cols="12">    
                    <v-textarea
                        style="width: 100%;"
                        label="Комментарий по заявке"
                        required
                        rows="1"
                        auto-grow
                        variant="outlined"
                        v-model="recordInfo.description"
                        :rules="[required(''), minLength('', 1), maxLength('', 255)]"
                    ></v-textarea>
                </v-col>
            </v-row>
        </v-form>    
        <v-card-actions style="margin-bottom: 30px;">
            <v-spacer></v-spacer>
            <v-btn color="green-darken-1" variant="text" @click="accept(recordInfo)">Утвердить</v-btn>
            <v-btn color="green-darken-1" variant="text" @click="reject(recordInfo)" :disabled="!valid">Отказать</v-btn>
            <v-btn color="green-darken-1" variant="text" @click="dialog_action_cancel">Закрыть</v-btn>
        </v-card-actions>
        
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
import randomId from '~/config/misc'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
const message = ref('')
const valid = ref(false)

const media = reactive({
    partner: null,
    filename: null,
    type: null,
    duration: null
})

media.partner = indexStore.orderView.data ? indexStore.orderView.data.partner : null
media.filename = indexStore.orderView.data ? indexStore.orderView.data.filename : null
media.type = indexStore.orderView.data ? indexStore.orderView.data.type: null
//media.duration = indexStore.orderView.data ? indexStore.orderView.data.duration: null

const recordInfo = reactive({
    id: null,
    name: null,
    description: null,
    partner: null,
    address: null,
    playlist_name: null,
    startDate: null,
    finishDate: null,
    status: null,
    type: null
})

const getType = (type) => {
    if (type.includes('video')) return 'Видео'
    if (type.includes('image')) return 'Статичное изображение'
    return 'Нет данных'
}

const required = () => {
	return v => v && v.length > 0 || 'При отказе это обязательное поле'
}
const minLength = (propertyType, minLength) => {
	return v => v && v.length >= minLength || `Не меньше ${minLength} символов`
}
const maxLength = (propertyType, maxLength) => {
	return v => v && v.length <= maxLength || `Не больше ${maxLength} символов`
}
const minValue = (propertyType, minValue) => {
	return v => v && v >= minValue || `Не меньше ${minValue}`
}

onMounted(() => {
    const item = indexStore.orderView.data

    if (item) {
        recordInfo.id = item.id
        recordInfo.name = item.name
        recordInfo.description = item.description
        recordInfo.partner = item.partner
        recordInfo.partner_name = item.partner_name
        recordInfo.address = item.display_address
        recordInfo.playlist_name = item.playlist_name
        recordInfo.startDate = item.date_start.split('T')[0]
        recordInfo.finishDate = item.date_finish.split('T')[0]
        recordInfo.type = getType(media.type)   // + ' ' + media.duration + ' сек.'
    }
})

const mediaPlay = () => {
    const item = indexStore.orderView.data

    indexStore.videoView.item = {
        partner: recordInfo.partner,
        filename: item.filename,
        type: item.type
    }
    indexStore.videoView.visible = true
}

const accept = async () => {
	try {
		indexStore.progress = true
		message.value = ''

		const { data, error } = await useFetch('/api/orders', { 
			method: 'post', 
			body: { 
				action: 'index.status', 
				id: recordInfo.id,
                description: recordInfo.description,
                status: 2
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
            useNuxtApp().$toast.success('Заявка утверждена')
            indexStore.orderView.visible = false
            indexStore.orderView.reload = randomId(32)

		} else {
            indexStore.orderView.visible = false
            useNuxtApp().$toast.error('Ошибка при утверждении заявки')
			message.value = (error.value) ? error.value : ''
		}

	} catch (e) {
        message.value = e
		indexStore.progress = false
	}
}

const reject = async () => {
	try {
		indexStore.progress = true
		message.value = ''

		const { data, error } = await useFetch('/api/orders', { 
			method: 'post', 
			body: { 
				action: 'index.status', 
				id: recordInfo.id,
                description: recordInfo.description,
                status: 3
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
            useNuxtApp().$toast.success('Заявка отклонена')
            indexStore.orderView.visible = false
            indexStore.orderView.reload = randomId(32)

		} else {
            indexStore.orderView.visible = false
            useNuxtApp().$toast.error('Ошибка при отклонении заявки')
			message.value = (error.value) ? error.value : ''
		}

	} catch (e) {
        message.value = e
		indexStore.progress = false
	}
}

const dialog_action_cancel = () => {
    indexStore.orderView.visible = false
}

</script>

<style lang="scss" scoped>
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
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
.item-play {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    color: #fff;
    padding: 5px;
    margin: 10px;
    font-size: xx-large;
    cursor: pointer;
}
</style>