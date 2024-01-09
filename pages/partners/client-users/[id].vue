<template>
<div class="main-content">
    <div class="page-title">
        Редактировать пользователи клиента / рекламодателя партнера
    </div>
    <p style="text-align: right; margin-right: 20px;">Создано: {{ recordInfo.created_at }}</p>

    <v-form v-model="valid">
        <v-container style="padding: 0px;">
            <client-only>
            <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
                <div class='col-12'><span>Ошибка: {{ message }}</span></div>
            </div>
            <v-row>
                <v-col>
                    &nbsp;
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
                        <v-btn style="background-color: #fff; color: #333;" outline @click.prevent="router.push('/partners')">Назад</v-btn>
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

const recordInfo = reactive({
    id: '',
    name: '',
    description: '',
    scope: null,
    partner: null,
    partnerName: null,
    contacts: {country:'', city: '', address: '', office: '', person: '', phone: '', email: '', whatsapp: '', telegram: ''},
    created_at: ''
})

const id = (route.params.id) ? route.params.id : null

const scopeSelect = ref([
    {id: 'owner', name: 'Владелец'}, 
    {id: 'admin', name: 'Админ'}, 
    {id: 'marketing', name: 'Маркетинг'}
])

const loadData = async (id) => {
    if (!id) {
        return
    }
    try {
		indexStore.progress = true
		message.value = ''
		
		const { data, error } = await useFetch('/api/partners', { 
			method: 'post', 
			body: { 
				action: 'users.get', 
				id: id,
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const code = data.value.code
            const record = data.value.data[0]
            recordInfo.id = record.id
            recordInfo.name = record.name
            recordInfo.surname = record.surname
            recordInfo.email = record.email
            recordInfo.password = record.password
            recordInfo.description = record.description
            recordInfo.contacts = record.contacts
            recordInfo.created_at = record.created_at.split('T')[0]
            recordInfo.partner = (userStore.partner) ? userStore.partner : null
            recordInfo.partnerName = (userStore.partnerName) ? userStore.partnerName : null
            recordInfo.scope = (record.scope) ? record.scope : null

		} else {
			message.value = (error.value) ? error.value : ''
		}

	} catch (e) {
        message.value = e
		indexStore.progress = false
	}
}

loadData(id)

const submitForm = async (recordInfo) => {
	const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
    if (!token_recaptcha) return

	try {
		indexStore.progress = true
		message.value = ''

		const { data, error } = await useFetch('/api/partners', { 
			method: 'post', 
			body: { 
				action: 'users.save', 
                id: recordInfo.id,
				name: recordInfo.name,
                surname: recordInfo.surname, 
				email: recordInfo.email, 
                password: recordInfo.password,
                scope: recordInfo.scope,
                contacts: recordInfo.contacts,
                partner: recordInfo.partner,
                token_recaptcha: token_recaptcha
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const code = data.value.code
            
			const router = useRouter()
			router.push("/partners/client-users")

		} else {
            useNuxtApp().$toast.error('Ошибка обновления')
			message.value = (error.value) ? error.value : ''
		}

	} catch (e) {
        message.value = e
		indexStore.progress = false
	}
}
    
</script>

<style lang="scss" scoped>
</style>