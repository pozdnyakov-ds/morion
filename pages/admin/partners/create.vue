<template>
<div class="main-content">
    <div class="page-title">
        Создание партнера
    </div>

    <v-form v-model="valid">
        <v-container style="padding: 0px;">
            <client-only>
            <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
                <div class='col-12'><span>Ошибка: {{ message }}</span></div>
            </div>
            <v-row>
                <v-col cols="6">
                    <v-select
                    label="Роли партнера"
                    :items="[{ id: 0, name: 'Партнер'}, { id: 1, name: 'Клиент'}, { id: 2, name: 'Рекламодатель'}]"
                    v-model="recordInfo.scope"
                    item-title="name"
                    item-value="id"
                    multiple
                    chips
                    ></v-select>
                    <div class="input-group mb-12">
                        <v-text-field v-model="recordInfo.name" label="Наименование" type="text" counter=64
                            outlined :rules="[required(''), minLength('', 6), maxLength('', 64)]" />
                    </div>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.description" label="Описание" type="text" counter=255 outlined  />
                    </div>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.contacts.email" label="Email" type="text" counter=64
                            outlined :rules="[required(''), minLength('', 6), maxLength('', 64)]" />
                    </div>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.tags" label="Теги (через запятую)" type="text" counter=255
                            outlined :rules="[maxLength('', 255)]" />
                    </div>
                </v-col>
                <v-col cols="6">
                    <v-card class="dialog" :loading="loading" style="display: flex; align-items: center; justify-content: center;">
                        <div v-if="!recordInfo.src">
                            <img src="/img/media/no_image.png" style="max-width: 100%; display: block; margin: 0 auto; margin: 50px 0 50px 0;">
                        </div>
                        <div v-if="recordInfo.src && recordInfo.type && recordInfo.type.includes('image/')">
                            <img :src="recordInfo.src" style="width: 100%; display: block; margin: 0 auto;">
                        </div>
                    </v-card>
                    <v-file-input 
                        accept="image/*"
                        label="Выбрать файл"
                        show-size
                        :rules="[required(), maxSize()]"
                        v-model="chosenFile"
                        @change="importImage"
                        ref="media"
                        style="margin-top: 20px;"
                    >
                    </v-file-input>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.contacts.country" label="Страна" type="text" counter=64 outlined  />
                    </div>
                </v-col>
                <v-col>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.contacts.city" label="Город" type="text" counter=64 outlined  />
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.contacts.address" label="Адрес" type="text" counter=64
                            outlined  />
                    </div>
                </v-col>
                <v-col>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.contacts.office" label="Офис" type="text" counter=64
                            outlined  />
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.contacts.whatsapp" label="Whatsapp" type="text" counter=64
                            outlined  />
                    </div>
                </v-col>
                <v-col>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.contacts.telegram" label="Telegram" type="text" counter=64
                            outlined  />
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.contacts.phone" label="Телефон" type="text" counter=64
                            outlined  />
                    </div>
                </v-col>
                <v-col>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.contacts.person" label="Контактное лицо" type="text" counter=64
                            outlined  />
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <div style="padding: 0px; margin-bottom: 0px;">
                        <v-btn style="background-color: #fff; color: #333;" outline @click.prevent="router.push('/admin/partners')">Назад</v-btn>
                        <v-btn style="background-color: #119DFF; color: #fff; margin-left: 15px;" @click.prevent="submitForm(recordInfo)" :disabled="!valid && !indexStore.captchaReady">Сохранить</v-btn>
                    </div>
                </v-col>
            </v-row>
                        
            </client-only>
        </v-container>
    </v-form>

</div>
</template>

<script setup>
import randomId from "../../config/misc"

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

const route = useRoute()
const router = useRouter()
const action = ref(route.query.action)
const valid = ref(false)
const message = ref('')
const chosenFile = ref(null)
const loading = ref(false)

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
indexStore.progress = false
indexStore.captchaReady = false

const required = (propertyType) => {
	return v => v && v.length > 0 || 'Указать значение'
}
const minLength = (propertyType, minLength) => {
	return v => v && v.length >= minLength || `Не меньше ${minLength} символов`
}
const maxLength = (propertyType, maxLength) => {
	return v => v && v.length <= maxLength || `Не больше ${maxLength} символов`
}
const maxSize = () => {
    return v => !v || !v[0] || v[0].size <= 50000000 || 'Размер файла должен быть меньше 50 Мб!'
}
watch(valid, (n, o) => {
    if (o === false && n === null && recordInfo.name && recordInfo.name.length && recordInfo.email && recordInfo.email.length) {
        valid.value = true
    }
})

let recordInfo = reactive({
    id: '',
    name: '',
    description: '',
    scope: [],
    partner: null,
    contacts: {country:'', city: '', address: '', office: '', person: '', phone: '', email: '', whatsapp: '', telegram: ''},
    tags: '',
    created_at: '',

    filename: null,
    type: null,
    size: 0,
    logo: null,
    src: null
})

const importImage = () => {
  let reader = new FileReader();
    message.value = null

  const file = chosenFile.value[0]
  reader.readAsDataURL(file)
  //reader.readAsArrayBuffer(file)

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
                preload: true,
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

const submitForm = async (recordInfo) => {
    // console.log("recordInfo 0: ", recordInfo)

	const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
    if (!token_recaptcha) return
    // console.log("indexStore.partner:", indexStore.partner)

	try {
		indexStore.progress = true
        recordInfo.id = randomId(32)
		message.value = ''

		const { data, error } = await userStore.myFetch('/api/partners', { 
			method: 'post', 
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
			body: { 
				action: 'index.create', 
                id: recordInfo.id,
				name: recordInfo.name,
                description: recordInfo.description,
                tags: recordInfo.tags,
                
                filename: recordInfo.filename,
                type: recordInfo.type,
                size: recordInfo.size,

                scope: recordInfo.scope,
                parent: userStore.partner,
				contacts: recordInfo.contacts,
                content: recordInfo.content,
				token_recaptcha: token_recaptcha
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const code = data.value.code

			const router = useRouter()
			router.push("/admin/partners")

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
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>