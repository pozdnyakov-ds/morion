<template>
<div class="main-content">
    <div class="page-title">
        Редактировать медиа
    </div>
    <p style="text-align: right; margin-right: 20px;">Создано: {{ recordInfo.created_at }}</p>

    <v-form v-model="valid">
        <v-container style="padding: 0px;">

            <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
                <div class='col-12'><span>Ошибка: {{ message }}</span></div>
            </div>    
            <v-row>
                <v-col>
                    <div class="input-group mb-12">
                        <v-text-field v-model="recordInfo.name" label="Наименование" type="text" counter=64
                            outlined :rules="[required(''), minLength('', 3), maxLength('', 64)]" />
                    </div>
                </v-col>
                <v-col>
                    <v-text-field v-model="recordInfo.description" label="Описание" type="text" counter=255 outlined  />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-file-input 
                        accept="image/*, video/*, audio/*"
                        label="Выбрать файл"
                        show-size
                        v-model="chosenFile"
                        @change="importImage"
                        ref="media"
                        >
                    </v-file-input>
                    <div style="font-size: small; margin-top: 10px; border: 1px solid #ccc; border-radius: 5px; padding: 10px;">
                        <b>Файл:</b> {{ recordInfo.filename ? recordInfo.filename : "Нет данных" }}<br>
                        <b>Тип:</b> {{ recordInfo.type ? recordInfo.type : "Нет данных" }}<br>
                        <b>Размер:</b> {{ recordInfo.size ? Math.round(recordInfo.size / 1024) + " Kb" : "Нет данных" }}<br>
                        <b>Длительность:</b> {{ recordInfo.duration ? recordInfo.duration + " сек." : "Нет данных" }}<br>
                    </div>
                </v-col>
                <v-col cols="6">

                    <v-card class="dialog" :loading="loading" style="padding: 10px; text-align: center; vertical-align: middle;">
                        <div v-if="!recordInfo.src">
                            <img src="/img/media/no_image.png" style="max-width: 100%; display: block; margin: 0 auto;">
                        </div>
                        <div v-if="recordInfo.src && recordInfo.type && recordInfo.type.includes('image/')">
                            <img :src="recordInfo.src" style="width: 100%; display: block; margin: 0 auto;">
                        </div>
                        <div :style="recordInfo.src && recordInfo.type && recordInfo.type.includes('video/') ? { 'display': 'block' } : { 'display': 'none' }">
                            <video
                                ref="playerId"
                                class="video-js vjs-default-skin"
                                data-setup='{"controls": true, "autoplay": false, "preload": "auto"}'
                                fluid="true"
                                width="100%"
                                >
                                <source :src="recordInfo.src ? recordInfo.src : null" :type="recordInfo.type ? recordInfo.type : null" />
                            </video>
                        </div>
                    </v-card>

                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <div style="padding: 0px; margin-bottom: 0px;">
                        <v-btn style="background-color: #fff; color: #333;" outline @click.prevent="router.push('/clients/media')">Назад</v-btn>
                        <v-btn style="background-color: #119DFF; color: #fff; margin-left: 15px;" @click.prevent="submitForm(recordInfo)" :disabled="!valid && !indexStore.captchaReady">Сохранить</v-btn>
                    </div>
                </v-col>
            </v-row>

        </v-container>
    </v-form>

</div>
</template>

<script setup>
import randomId from "../../config/misc"
import translit from '../config/translit'
import videojs from 'video.js'

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

const route = useRoute()
const router = useRouter()
const action = ref(route.query.action)
const valid = ref(false)
const message = ref('')
const loading = ref(false)

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
indexStore.progress = false
indexStore.captchaReady = false
const chosenFile = ref(null)

const partner = reactive({
    selected: null
})
partner.selected = userStore.partner ? userStore.partner : null

const playerId = ref(null)
const player = ref(null)

useHead({
    script: [
      { 
        src: "https://vjs.zencdn.net/8.5.2/video.min.js", 
        defer: true,
      }
    ]
})

const required = () => {
	return v => v && v.length > 0 || 'Выбрать файл'
}
const minLength = (propertyType, minLength) => {
	return v => v && v.length >= minLength || `Не меньше ${minLength} символов`
}
const maxLength = (propertyType, maxLength) => {
	return v => v && v.length <= maxLength || `Не больше ${maxLength} символов`
}
const maxSize = () => {
return v => !v || !v.length || v[0].size <= 50000000 || 'Размер файла должен быть меньше 50 Мб!'
}
watch(valid, (n, o) => {
    if (o === false && n === null && recordInfo.name && recordInfo.name.length && chosenFile.value && chosenFile.value[0] && chosenFile.value[0].length) {
        valid.value = true
    }
})

const recordInfo = reactive({
    id: '',
    name: '',
    description: '',
    filename: null,
    type: null,
    size: 0,
    duration: 0,
    content: null,
    src: null,
    partner: null,
    retire: '',
    status: '',
    created_at: ''
})

recordInfo.id = (route.params.id) ? route.params.id : null

const importImage = () => {
  let reader = new FileReader();
    message.value = null

  const file = chosenFile.value[0]
  reader.readAsDataURL(file)

  reader.onload = () => {
    recordInfo.content = reader.result
    recordInfo.src = window.URL.createObjectURL(file)   //reader.result
    recordInfo.filename = file.name
    recordInfo.type = file.type
    recordInfo.size = file.size
    recordInfo.duration = 0
    
    if (recordInfo.type.includes('video/')) {
        const options = {
                controls: true,
                sources: [{
                    src: window.URL.createObjectURL(file),
                    type: file.type
                }]
            }
            if (player.value == null) {
                    player.value = videojs(playerId.value, options, () => {
                        //...
                    }) 
            } else {
                player.value.src({
                    src: window.URL.createObjectURL(file),
                    type: file.type
                })
            }    
        }
    }

    reader.onloadstart = function() {
        loading.value = true
        recordInfo.duration = 0
    }

  reader.onloadend = function() {
    if (recordInfo.type.includes('video/')) {
        player.value.src({
            src: window.URL.createObjectURL(file),
            type: file.type
        })
        setTimeout(() => {
            loading.value = false
            recordInfo.duration = player.value ? player.value.duration() : null
        }, 1000)
    }
    loading.value = false
  }

  reader.onerror = function() {
    loading.value = false
    message.value = reader.error
    recordInfo.content = null
    recordInfo.src = null
    recordInfo.filename = null
    recordInfo.type = null
    recordInfo.size = 0
    recordInfo.duration = 0
  }
}

watch(chosenFile, (n, o) => {
	if (n == '' && n.length == 0) {
		recordInfo.content = null
        recordInfo.src = null
        recordInfo.filename = null
        recordInfo.type = null
        recordInfo.size = 0
        recordInfo.duration = 0
	}
})

const loadData = async (id) => {
    if (!id) {
        return
    }
    try {
		indexStore.progress = true
		message.value = ''
		
		const { data, error } = await useFetch('/api/media', { 
			method: 'post', 
			body: { 
				action: 'index.get', 
				id: id,
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const code = data.value.code
            const record = data.value.data[0]
            recordInfo.name = record.name
            recordInfo.description = record.description
            recordInfo.content = record.content
            recordInfo.filename = record.filename
            recordInfo.type = record.type
            recordInfo.size = record.size
            recordInfo.duration = record.duration
            recordInfo.created_at = record.created_at.split('T')[0]
            recordInfo.src = `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${recordInfo.filename}`

            // Load video
            const options = {
                    controls: true,
                    sources: [{
                            src: recordInfo.src,
                            type: recordInfo.type
                    }]
                }
                if (player.value === null) {
                    player.value = videojs(playerId.value, options, () => {
                    }) 
                } else {
                    player.value.src({
                        src: recordInfo.src,
                        type: recordInfo.type
                    })
                }

		} else {
			message.value = (error.value) ? error.value : ''
		}

	} catch (e) {
        message.value = e
		indexStore.progress = false
	}
}

loadData(recordInfo.id)

const submitForm = async (recordInfo) => {

    const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
    if (!token_recaptcha) return

	try {
		indexStore.progress = true
		message.value = ''

		const { data, error } = await useFetch('/api/media', { 
			method: 'post', 
			body: { 
				action: 'index.save', 
                id: recordInfo.id,
				name: recordInfo.name,
                description: recordInfo.description, 
                filename: recordInfo.filename,
                type: recordInfo.type,
                size: recordInfo.size,
                duration: recordInfo.duration,
                content: (recordInfo.content && recordInfo.content !== undefined) ? recordInfo.content : null,
                partner: partner.selected,
                update_media: recordInfo.updateMedia,
				token_recaptcha: token_recaptcha
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const code = data.value.code

			const router = useRouter()
			router.push("/clients/media")

		} else {
			message.value = (error.value) ? error.value : ''
		}

	} catch (e) {
        message.value = e
		indexStore.progress = false
	}
}
    
</script>

<style lang="scss" scoped>
@import "https://vjs.zencdn.net/8.5.2/video-js.css";

</style>