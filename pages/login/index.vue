<template>
<div>
	<div style="text-align: center; margin-bottom: 20px;">
		<nuxt-link to="/"><img src="/img/logo_morion_login.png" width="192" /></nuxt-link>
	</div>
    <div class="login">
		<v-form v-model="valid">
			<v-container>
					
				<p style="text-align: center; margin-bottom: 10px;"><b>Войти</b></p>

				<div class="input-group mb-3">
					<v-text-field v-model="userInfo.email" label="Email" type="email" append-icon="fa-regular fa-envelope" counter=64
						outlined :rules="[required(''), minLength('', 6), maxLength('', 64)]" />
				</div>

				<div class="input-group mb-3">
					<v-text-field @keyup.enter="submitForm(userInfo)" v-model="userInfo.password" label="Пароль" :type="showPassword ? 'text' : 'password'"
						:append-icon="showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'" @click:append="showPassword = !showPassword"
						counter=16 outlined 
						:rules="[required(''), minLength('', 6), maxLength('', 16)]" />
				</div>

				<div class="col-12" style="padding: 0px; margin-bottom: 0px;">
					<v-btn style="background-color: #119DFF; color: #fff;" block @click.prevent="submitForm(userInfo)" :disabled="!valid && !indexStore.captchaReady">Войти</v-btn>
				</div>

				<div class="col-12" style="text-align: center; padding: 10px 0 0 0;">
					<nuxt-link to="/login/forgot" style="text-decoration: none;">Забыл пароль</nuxt-link>
				</div> 

				<div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
					<div class='col-12'><span>{{ message }}</span></div>
				</div>

			</v-container>
		</v-form>
	</div>
	</div>
</template>

<script setup>
definePageMeta({
	layout: "login"
})

useHead({
    title: 'D24 - Авторизация',
    meta: [
      { name: 'description', content: 'Авторизация' },
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
	email: 'pozdnyakov@morion.tech',
	password: '',
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
				action: 'user.login', 
				email: userInfo.email, 
				password: userInfo.password,
				token_recaptcha: token_recaptcha	
			} 
		})
		indexStore.progress = false
		//console.log("LOGIN: ", data.value)

		if (data.value && data.value.code == 200 && data.value.data) {
			userStore.loggedIn = true
			const user = data.value.data

			userStore.name = user.name
			userStore.surname = user.surname
			userStore.email = user.email
			userStore.accessToken = user.accessToken
			userStore.accessTokenExpDate = user.accessTokenExpDate
			userStore.partner = user.partner
			userStore.partnerName = user.partner_name
        	userStore.partnerScope = user.partner_scope
			userStore.scope = user.scope
			message.value = ''

			const router = useRouter()
			router.push("/")

		} else {
			message.value = "Нет такого пользователя или пароль неверен!"
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
</style>