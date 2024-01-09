<template>
    <v-app>
        <Header />
        <LeftMenu />
            <v-main style="background-color: #F2F4F4;">
                <v-container fluid :style="{ 
                    margin: '0px', 
                    padding: '0px',
                    }">
                    <slot />
                </v-container>
            </v-main>
        <Footer />
        <Progress />
    </v-app>
</template>

<script setup>
import LeftMenu from '../components/navigation/LetfMenu.vue'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

watch(indexStore.$state, (value) => {
  localStorage.setItem("index", JSON.stringify(indexStore.$state))
})

watch(userStore.$state, (value) => {
  localStorage.setItem("user", JSON.stringify(userStore.$state))
})

useHead({
    script: [
      { 
        hid: 'stripe', 
        src: "https://www.google.com/recaptcha/api.js?render=" + config.public.RECAPTCHA_SITE_KEY, 
        defer: true,
        callback: () => { 
          indexStore.captchaReady = true
          //console.info("Recaptcha loaded")
        }
      }
    ]
})

</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');

body {
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
}
a { 
    text-decoration: none; 
}
.v-row {
    margin: 0px;
}
.input-group {
    margin-bottom: 0px !important;
}
.v-container {
    max-width: 1920px;
}    
.page-title {
    font-weight: bold;
    margin-bottom: 15px;
    text-transform: uppercase;
    margin-top: 15px;
}
.main-content {
    padding: 10px 25px 10px 25px;
}
.v-field__field {
    background-color: #fff;
}
</style>