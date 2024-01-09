<template>
<v-app style="background-color: #eee">
    <v-container class="fill-height">
        <v-row align-content="center" justify="center" class="fill-height">
            <slot />
        </v-row>
    </v-container>
    <Progress />
</v-app>
</template>

<script setup>
const config = useRuntimeConfig()
const indexStore = useIndexStore()
indexStore.captchaReady = false
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
</style>