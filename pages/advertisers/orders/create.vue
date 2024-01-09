<template>
    <div class="main-content">
        <div class="page-title">
            Создать заявку
        </div>
    
        <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
            <div class='col-12'><span>Ошибка: {{ message }}</span></div>
        </div> 
    
        <v-row>
            <v-col>
                <div style="padding: 0px; margin-bottom: 0px;">
                    <v-btn style="background-color: #fff; color: #333;" outline @click.prevent="router.push('/advertisers/orders')">Назад</v-btn>
                    <v-btn style="background-color: #119DFF; color: #fff; margin-left: 15px;" @click.prevent="console.log('Save data...')" :disabled="!valid && !indexStore.captchaReady">Сохранить</v-btn>
                </div>
            </v-col>
        </v-row>

            
    </div>
    </template>
    
    <script setup>
    definePageMeta({
        layout: "default",
        middleware: ['auth', 'access']
    })

    const indexStore = useIndexStore()
    const userStore = useUserStore()
    const route = useRoute()
    const router = useRouter()
    
    const valid = ref(false)
    const message = ref('')
   
    </script>
    
    <style lang="scss" scoped>
    .chips {
        border-radius: 10px;
        background-color: #eee;
        padding: 3px 10px 3px 10px;
        font-size: small;
        display: inline-block;
        margin-right: 5px;
    }
    .item-action {
        color: #666;
        margin-right: 10px;
    }
    .dialog-delete {
        padding: 0px;
    }
    </style>