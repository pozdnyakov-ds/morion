<template>
<div>
	<div style="text-align: center; margin-bottom: 20px;">
		<nuxt-link to="/"><img src="/img/logo_morion_login.png" width="192" /></nuxt-link>
	</div>
    <div class="login">
		<v-form v-model="valid">
		<v-container>

			<p style="text-align: center;"><b>Восстановление пароля</b></p>

			<div class="input-group mb-3">
				<v-text-field v-model="userInfo.email" label="Email" type="email" append-icon="fa-regular fa-envelope" counter=64 outlined
					:rules="[required(''), minLength('', 6), maxLength('', 64)]" disabled/>
			</div>

			<div class="input-group mb-3">
				<v-text-field v-model="userInfo.password" label="Пароль" :type="showPassword ? 'text' : 'password'"
					:append-icon="showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'" @click:append="showPassword = !showPassword" counter=16
					outlined :rules="[required(''), minLength('', 6), maxLength('', 16)]" />
			</div>

			<div class="input-group mb-3">
				<v-text-field v-model="userInfo.repeatPassword" label="Повторить пароль" :type="showPassword ? 'text' : 'password'"
					:append-icon="showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'" @click:append="showPassword = !showPassword" counter=16
					outlined :rules="[required(''), minLength('', 6), maxLength('', 16), comparePasswords('', userInfo.password, userInfo.repeatPassword)]" />
			</div>

			<div class='row'>
				<div class="col-12">
					<v-btn style="background-color: #119DFF; color: #fff;" block @click.prevent="submitForm(userInfo)" :disabled="!valid && !indexStore.captchaReady">Восстановить</v-btn>
				</div>
			</div>

			<div class="col-12" style="text-align: center; padding: 10px 0 0 0;">
				<nuxt-link to="/login" style="text-decoration: none; text-align: center;">Назад</nuxt-link>
			</div>

			<div v-if="message" class='row'>
				<div class='col-12'><span style="color: red; font-size: 90%; text-align: center;">{{ message }}</span></div>
			</div>

		</v-container>
		</v-form>
	</div>
	</div>
</template>

<script setup>
import { useRoute } from 'vue-router'

definePageMeta({
	layout: "login"
})

useHead({
        title: 'D24 - Создать новый пароль',
        meta: [
        { name: 'description', content: 'Создать новый пароль' },
        ],
    })

const config = useRuntimeConfig()
const indexStore = useIndexStore()
indexStore.progress = false
indexStore.captchaReady = false

const userStore = useUserStore()

const valid = ref(false)
const message = ref('')
const showPassword = ref(false)

const userInfo = reactive({
	email: '',
	password: '',
	password_repeat: '',
	token: ''
})

// Get query params
try {
	const route = useRoute()
	userInfo.email = route.query.email
	userInfo.token = route.query.token

} catch(e) {
	//...
}

const required = (propertyType) => {
	return v => v && v.length > 0 || 'Указать значение'
}
const minLength = (propertyType, minLength) => {
	return v => v && v.length >= minLength || `Не меньше ${minLength} символов`
}
const maxLength = (propertyType, maxLength) => {
	return v => v && v.length <= maxLength || `Не больше ${maxLength} символов`
}
const comparePasswords = (propertyType, p1, p2) => {
    return v => p1 == p2 || "Пароли не совпадают"
}

watch(valid, (n, o) => {
	if (o === false && n === null && userInfo.password.length >= 6 && userInfo.password.length <= 16) {
		valid.value = true
	}
})

const submitForm = async (userInfo) => {
	const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
	if (!token_recaptcha) return
	
	try {
		indexStore.progress = true
		message.value = ''
		
		const { data, error } = await useFetch('/api/users', { 
			method: 'post', 
			body: { 
				action: 'user.reset', 
				email: userInfo.email, 
				password: userInfo.password,
				token_email: userInfo.token,
				token_recaptcha: token_recaptcha	
			} 
		})
		indexStore.progress = false

		if (!error.value) {

			if (data.value && data.value.code == 200) {
				message.value = ''
				const router = useRouter()
				router.push("/login")
			} else {
				message.value = "Нет такого пользователя"
			}

		} else {
			userStore.loggedIn = false
		}

	} catch (e) {
		indexStore.progress = false
		userStore.loggedIn = false;
	}
}

</script>

<style lang="scss" scoped>
.login {
	background: #fff; 
	border: 1px solid #ccc; 
	border-radius: 10px; 
	padding: 10px; 
	min-width: 350px;
}
.error--text {
	color: red;
}
.v-text-field__slot {
        border: 1px solid #ccc;
        border-radius: 3px;
}
</style>