<template>
    <div style="margin: 20px 0 20px 0;">
        <b>Владелец партнера</b>
        <v-form v-model="valid">
            <v-container style="padding: 0px; margin-top: 20px;">
                <client-only>
                <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
                    <div class='col-12'><span>Ошибка: {{ message }}</span></div>
                </div> 
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
                            <v-btn style="background-color: #119DFF; color: #fff;" @click.prevent="saveData" :disabled="!valid && !indexStore.captchaReady">Сохранить</v-btn>
                        </div>
                    </v-col>
                </v-row>
                            
                </client-only>
    
            </v-container>
        </v-form>
    </div>
    
</template>

<script setup>
import randomId from "~/config/misc"

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
const valid = ref(false)
const message = ref(null)

const recordInfo = reactive({
    id: '',
    name: '',
    surname: '',
    email: '', 
    password: '',
    partner: null,
    scope: null,
    contacts: {country:'', city: '', address: '', office: '', comments: '', phone: '', whatsapp: '', telegram: ''},
    created_at: null
})

const props = defineProps({
    partner: String,
    filename: String,
    type: String,
    imageMode: String
})

const partner = reactive({
    partners: [],
    selected: null
})

partner.selected = props.partner ? props.partner : ''

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

const loadData = async () => {
    try {
		indexStore.progress = true
		message.value = ''
		
		const { data, error } = await userStore.myFetch('/api/partners', { 
			method: 'post',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            }, 
			body: { 
				action: 'owner.get', 
				partner: partner.selected,
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
            const record = data.value.data[0]
            
            recordInfo.id = record.id
            recordInfo.name = record.name
            recordInfo.surname = record.surname
            recordInfo.email = record.email
            recordInfo.password = record.password
            recordInfo.partner = record.partner
            recordInfo.scope = record.scope
            recordInfo.contacts = record.contacts
            recordInfo.created_at = record.created_at

		} else {
			message.value = (error.value) ? error.value : ''
		}

	} catch (e) {
        message.value = e
		indexStore.progress = false
	}
}

loadData()

const saveData = async () => {
	const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
    if (!token_recaptcha) return

	// try {
		indexStore.progress = true
		message.value = ''

        // Сохранить данные
        if (recordInfo.id) {

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
                useNuxtApp().$toast.success('Данные успешно сохранены')

            } else {
                useNuxtApp().$toast.error('Ошибка сохранения данных')
                message.value = (error.value) ? error.value : ''
            }
        } else { // Создать owner
            indexStore.progress = true
            message.value = ''

            const { data, error } = await useFetch('/api/partners', { 
                method: 'post', 
                body: { 
                    action: 'users.create', 
                    name: recordInfo.name,
                    surname: recordInfo.surname, 
                    email: recordInfo.email, 
                    password: recordInfo.password,
                    partner: partner.selected,
                    scope: 'owner',
                    contacts: recordInfo.contacts,
                    token_recaptcha: token_recaptcha
                } 
            })
            indexStore.progress = false
            //console.log("recordInfo: ", data.value)

            if (data.value && data.value.code == 200) {
                useNuxtApp().$toast.success('Данные успешно добавлены')

            } else {
                switch(data.value.data) {
                case 'ER_DUP_ENTRY':
                    useNuxtApp().$toast.error('Адрес Email уже занят')
                    break

                default: 
                    useNuxtApp().$toast.error(data.value.message)
                }
            }
        }

	// } catch (e) {
    //     message.value = e
	// 	indexStore.progress = false
	// }
}

</script>

<style lang="scss" scoped>
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>