<template>
    <div>
        <v-app-bar 
            color="#eee" 
            density="compact"
            >
            <!-- <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon> -->
            <v-toolbar-title style="min-width: 250px; margin: 0px;">
                <div style="background-color: ##eee;">
                    <nuxt-link to="/"><v-img src="/img/logo_morion.png" style="display: inline-block; vertical-align: middle; margin: 0 0 0 40px;" width="48"></v-img></nuxt-link>
                    <nuxt-link style="margin: 0 0 0 10px; display: inline-block; vertical-align: middle; font-weight: bold; font-size: 1.0rem;" to="/">MORION.TECH</nuxt-link>
                </div>
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <v-tabs v-model="tab" color="#AED6F1" style="width: 100%;">
                <v-tab>
                    <nuxt-link to="/" exact>Начало</nuxt-link>
                </v-tab>
                <v-tab>
                    <nuxt-link to="/products">Продукты</nuxt-link>
                </v-tab>
                <v-tab>
                    <nuxt-link to="/services">Услуги</nuxt-link>
                </v-tab>
                <v-tab>
                    <nuxt-link to="/contacts">Контакты</nuxt-link>
                </v-tab>
            </v-tabs>

            <v-spacer></v-spacer>

            <client-only>
                <v-btn icon v-if="!userStore.loggedIn">
                    <nuxt-link to="/login">
                        <i class="fa-solid fa-arrow-right-to-bracket"></i>
                    </nuxt-link>
                </v-btn>
                <v-btn icon v-if="userStore.loggedIn">
                    <i @click="dialog.exit = true" class="fa-solid fa-arrow-right-from-bracket"></i>
                </v-btn>
            </client-only>

        </v-app-bar>

        <client-only>
            <v-row justify="center">
                <v-dialog v-model="dialog.exit" persistent width="auto">
                  <v-card class="dialog-delete">
                    <v-card-text class="text-h6">Выйти из системы?</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_exit_yes">Да</v-btn>
                      <v-btn color="green-darken-1" variant="text" @click="dialog.exit = false">Нет</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
            </v-row>
        </client-only>
    </div>
</template>

<script setup>
import LeftMenu from '../components/navigation/LetfMenu.vue'

const indexStore = useIndexStore()
const userStore = useUserStore()
const router = useRouter()
const tab = ref(null)

const dialog = reactive({
    exit: false
})

const dialog_exit_yes = async () => {
    dialog.exit = false
    userStore.logout()
    router.go("/login")
}

const setActiveTab = () => {
    const path = router.currentRoute.value && router.currentRoute.value.path ? router.currentRoute.value.path : '/'

    switch(path) {
        case '/': 
            tab.value = 0
            break
        case '/products': 
            tab.value = 1
            break
        case '/services': 
            tab.value = 2
            break
        case '/contacts': 
            tab.value = 3
            break
        default: 
            tab.value = null 
    }
}

watch(() => router.currentRoute.value.path, (n, o) => {
    switch(n) {
        case '/': 
            tab.value = 0
            break
        case '/products': 
            tab.value = 1
            break
        case '/services': 
            tab.value = 2
            break
        case '/contacts': 
            tab.value = 3
            break
        default: 
            tab.value = null 
    }
})

onMounted(() => {
    setActiveTab()
})

</script>

<style lang="scss" scoped>
.navbar-link {
    color: #333;
    text-decoration: none;
    font-weight: normal;
    font-size: 90%;
}
a {
    font-weight: bold;
    text-decoration: none;
    color: #333;
    cursor: pointer;
}  
.v-btn {
    color: #333;
}
.v-list-item--density-default {
    min-height: 32px;
}
.v-tab__slider {
    height: 4px !important;
}
</style>