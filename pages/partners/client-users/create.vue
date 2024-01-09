<template>
<div class="main-content">
    <div class="page-title">
        Создание пользователя клиента / рекламодателя партнера
    </div>
    
    <v-form v-model="valid">
        <v-container style="padding: 0px;">
            <client-only>
            <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
                <div class='col-12'><span>Ошибка: {{ message }}</span></div>
            </div> 
            <v-row>
                <v-col>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.partnerName" label="Партнер" type="text" outlined readonly />
                    </div>
                </v-col>
                <v-col>
                    <v-select
                        label="Права пользователя"
                        :items="scopeSelect"
                        v-model="recordInfo.scope"
                        item-title="name"
                        item-value="id"
                ></v-select></v-col>
            </v-row>
            <v-row>
                <v-col>
                    <div class="input-group mb-12">
                        <v-text-field v-model="recordInfo.name" label="Имя" type="text" counter=64
                            outlined :rules="[required(''), minLength('', 3), maxLength('', 64)]" />
                    </div>
                </v-col>
                <v-col>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.surname" label="Фамилия" type="text" counter=255 outlined  />
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.email" label="Email" type="text" counter=64
                            outlined :rules="[required(''), minLength('', 6), maxLength('', 64)]" />
                    </div>
                </v-col>
                <v-col>
                    <div class="input-group mb-6">
                        <v-text-field v-model="recordInfo.password" label="Пароль" type="text" counter=64
                            outlined :rules="[required(''), minLength('', 6), maxLength('', 64)]" />
                    </div>
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
                        <v-text-field v-model="recordInfo.contacts.comments" label="Комментарии" type="text" counter=64
                            outlined  />
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <div style="padding: 0px; margin-bottom: 0px;">
                        <v-btn style="background-color: #fff; color: #333;" outline @click.prevent="router.push('/partners/client-users')">Назад</v-btn>
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
watch(valid, (n, o) => {
	if (o === false && n === null && recordInfo.name.length && recordInfo.email.length && recordInfo.password.length) {
		valid.value = true
	}
})

let recordInfo = reactive({
    id: '',
    name: '',
    surname: '',
    email: '', 
    password: '',
    partner: (userStore.partner) ? userStore.partner : null,
    partnerName: (userStore.partnerName) ? userStore.partnerName : null,
    scope: null,
    contacts: {country:'', city: '', address: '', office: '', comments: '', phone: '', whatsapp: '', telegram: ''},
    created_at: null
})

const scopeSelect = ref([
    {id: 'owner', name: 'Владелец'}, 
    {id: 'admin', name: 'Админ'}, 
    {id: 'marketing', name: 'Маркетинг'}
])

const submitForm = async (recordInfo) => {

	const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
    if (!token_recaptcha) return

	try {
		indexStore.progress = true
        recordInfo.id = randomId(32)
		message.value = ''

		const { data, error } = await useFetch('/api/partners', { 
			method: 'post', 
			body: { 
				action: 'users.create', 
				name: recordInfo.name,
                surname: recordInfo.surname, 
				email: recordInfo.email, 
                password: recordInfo.password,
                partner: recordInfo.partner,
                scope: recordInfo.scope,
                contacts: recordInfo.contacts,
                token_recaptcha: token_recaptcha
			} 
		})
		indexStore.progress = false
        //console.log("recordInfo: ", data.value)

		if (data.value && data.value.code == 200) {
			const code = data.value.code

            const router = useRouter()
			router.push("/partners/client-users")

		} else {
            switch(data.value.data) {
            case 'ER_DUP_ENTRY':
                useNuxtApp().$toast.error('Адрес Email уже занят')
                message.value = 'Адрес Email уже занят'
                break

            default: 
                useNuxtApp().$toast.error('Ошибка создания записи')
                message.value = (data.value.message) ? data.value.message : ''
            }
		}

	} catch (e) {
        useNuxtApp().$toast.error('Ошибка создания записи')
        message.value = e
		indexStore.progress = false
	}
}

</script>

<style lang="scss" scoped>
</style>