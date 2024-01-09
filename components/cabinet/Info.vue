<template>
    <div class="main-content">
        <p style="text-align: right; margin-right: 20px;">Создано: {{ recordInfo.created_at }}</p>
    
        <v-form v-model="valid">
            <v-container style="padding: 0px;">
                <client-only>
                <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
                    <div class='col-12'><span>Ошибка: {{ message }}</span></div>
                </div>    
                <v-row>
                    <v-col>
                        <v-select
                            label="Роли партнера"
                            :items="[{ id: 0, name: 'Партнер'}, { id: 1, name: 'Клиент'}, { id: 2, name: 'Рекламодатель'},]"
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
                            <div v-if="!recordInfo.logo.src">
                                <img src="/img/media/no_image.png" style="max-width: 100%; display: block; margin: 0 auto; margin: 50px 0 50px 0;">
                            </div>
                            <div v-if="recordInfo.logo.src && recordInfo.logo.type && recordInfo.logo.type.includes('image/')">
                                <img :src="recordInfo.logo.src" style="width: 100%; display: block; margin: 0 auto;">
                            </div>
                        </v-card>
                        <v-file-input 
                            accept="image/*"
                            label="Выбрать файл"
                            show-size
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
                            <v-text-field v-model="recordInfo.contacts.telegram" label="Телеграм" type="text" counter=64
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
                            <v-btn style="background-color: #119DFF; color: #fff;" @click.prevent="submitForm(recordInfo)" :disabled="!valid && !indexStore.captchaReady">Сохранить</v-btn>
                        </div>
                    </v-col>
                </v-row>
                            
                </client-only>
            </v-container>
        </v-form>
    
    </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const action = ref(route.query.action)
const valid = ref(false)
const message = ref('')
const chosenFile = ref(null)
const loading = ref(false)

const config = useRuntimeConfig()
const indexStore = useIndexStore()
indexStore.progress = false
indexStore.captchaReady = false
const userStore = useUserStore()

const partner = reactive({
    selected: null
})

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        loadData()
    }
})

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
    return v => {
        console.log("V: ", v)
        v[0].size <= 50000000 || 'Размер файла должен быть меньше 50 Мб!'
    }
}
watch(valid, (n, o) => {
    if (o === false && n === null && recordInfo.name && recordInfo.name.length && recordInfo.email && recordInfo.email.length) {
		valid.value = true
	}
})

const recordInfo = reactive({
    id: '',
    name: '',
    description: '',
    scope: [],
    contacts: {country:'', city: '', address: '', office: '', person: '', phone: '', email: '', whatsapp: '', telegram: ''},
    tags: '',
    created_at: '',
    logo: {
        filename: null,
        type: null,
        size: 0,
        src: null
    },    
    updateMedia: null
})

const importImage = () => {
  let reader = new FileReader();
    message.value = null

  const file = chosenFile.value[0]
  reader.readAsDataURL(file)
  //reader.readAsArrayBuffer(file)

  reader.onload = () => {
    recordInfo.content = reader.result
    recordInfo.logo = {
        filename: file.name,
        type: file.type,
        size: file.size,
        src: window.URL.createObjectURL(file)   //reader.result
    }
  }

  reader.onloadstart = function() {
    loading.value = true
    recordInfo.duration = 0
  }

  reader.onloadend = function() {
    loading.value = false
  }

  reader.onerror = function() {
    loading.value = false
    message.value = reader.error
    recordInfo.content = null
    recordInfo.logo = {
        filename: null,
        type: null,
        size: 0,
        src: null
    }
  }
}

watch(chosenFile, (n, o) => {
	if (n == '' && n.length == 0) {
		recordInfo.content = null
        recordInfo.logo = {
            filename: null,
            type: null,
            size: 0,
            src: null
        }
	}
})

const loadData = async () => {
    if (!partner.selected) {
        return
    }
    try {
        indexStore.progress = true
        message.value = ''
        
        const { data, error } = await useFetch('/api/partners', { 
            method: 'post', 
            body: { 
                action: 'index.get', 
                id: partner.selected,
            } 
        })
        indexStore.progress = false

        if (data.value && data.value.code == 200) {
            const code = data.value.code
            const record = data.value.data[0]
            recordInfo.id = record.id
            recordInfo.name = record.name
            recordInfo.description = record.description
            recordInfo.scope = record.scope
            recordInfo.contacts = record.contacts
            recordInfo.tags = record.tags
            
            recordInfo.logo = {
                filename: record.logo && record.logo.filename ? record.logo.filename : null,
                type: record.logo && record.logo.type ? record.logo.type : null,
                size: record.logo && record.logo.size ? record.logo.size : 0,
                src: null
            }
            recordInfo.logo.src = recordInfo.logo && recordInfo.logo.filename ? `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${recordInfo.id}/${recordInfo.logo.filename}` : null
            recordInfo.updateMedia = recordInfo.logo.filename
            recordInfo.created_at = record.created_at.split('T')[0]

        } else {
            message.value = (error.value) ? error.value : ''
        }

    } catch (e) {
        message.value = e
        indexStore.progress = false
    }
}

const submitForm = async (recordInfo) => {
    const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
    if (!token_recaptcha) return

    try {
        indexStore.progress = true
        message.value = ''
        
        const { data, error } = await useFetch('/api/partners', { 
            method: 'post', 
            body: { 
                action: 'index.save', 
                id: recordInfo.id,
				name: recordInfo.name,
                description: recordInfo.description, 
                scope: recordInfo.scope,
				contacts: recordInfo.contacts,
                logo: JSON.stringify(recordInfo.logo),    
                tags: recordInfo.tags,
                content: (recordInfo.content && recordInfo.content !== undefined) ? recordInfo.content : null,
                update_media: recordInfo.updateMedia,

				token_recaptcha: token_recaptcha
            } 
        })
        indexStore.progress = false

        if (data.value && data.value.code == 200) {
            const code = data.value.code
            useNuxtApp().$toast.success('Информация успешно обновлена')

        } else {
            useNuxtApp().$toast.error('Ошибка обновления')
            message.value = (error.value) ? error.value : ''
        }

    } catch (e) {
        useNuxtApp().$toast.error('Ошибка обновления')
        message.value = e
        indexStore.progress = false
    }
}
</script>

<style lang="scss" scoped>
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>