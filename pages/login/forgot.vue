<template>
    <div>
        <div style="text-align: center;">
            <nuxt-link to="/"><img src="/img/logo_d24_login.png" width="192" /></nuxt-link>
        </div>
        <div class="login">
            <v-form v-model="valid">
                <v-container>

                    <p style="text-align: center; margin-bottom: 10px;"><b>Восстановить пароль</b></p>
    
                    <div class="input-group mb-3">
                        <v-text-field v-model="userInfo.email" label="Email" type="email" append-icon="fa-regular fa-envelope" counter=64
                            outlined :rules="[required(''), minLength('', 6), maxLength('', 64)]" />
                    </div>
    
                    <div class="col-12" style="padding: 0px; margin-bottom: 0px;">
                        <v-btn style="background-color: #119DFF; color: #fff;" block @click.prevent="submitForm(userInfo)" :disabled="!valid && !indexStore.captchaReady">Вперед</v-btn>
                    </div>
    
                    <div class="col-12" style="text-align: center; padding: 10px 0 0 0;">
                        <nuxt-link to="/login" style="text-decoration: none;">Войти</nuxt-link>
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
        title: 'D24 - Восстановление пароля',
        meta: [
        { name: 'description', content: 'Восстановление пароля' },
        ],
    })
    
    const config = useRuntimeConfig()
    const indexStore = useIndexStore()
    indexStore.progress = false
    indexStore.captchaReady = false
    
    const userStore = useUserStore()
    
    const valid = ref(false)
    const message = ref('')
   
    const userInfo = reactive({
        email: '2903015@mail.ru'
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
            if (o === false && n === null && userInfo.email.length >= 6 && userInfo.email.length <= 255) {
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
                    action: 'user.forgot', 
                    email: userInfo.email,
                    token_recaptcha: token_recaptcha
                } 
            })
            indexStore.progress = false
    
            if (!error.value) {
                if (data.value && data.value.code == 401) {
                    message.value = "Нет такого пользователя"
                } else {
                    message.value = "Письмо отправлено"
                }
   
            } else {
                message.value = "Нет такого пользователя"
            }
    
        } catch (e) {
            message.value = "Ошбика соединения"
            indexStore.progress = false
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