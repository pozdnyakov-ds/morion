<template>
    <div class="main-content">
        <div class="page-title">
            AmoCRM Setup  
        </div>
        <v-row>
            <v-col>
                <div>Получить код на странице: 
                    <a target=_blank href="https://moriontech.amocrm.ru/amo-market/#category-installed">
                        https://moriontech.amocrm.ru/amo-market/#category-installed
                    </a>
                </div>
                <div class="input-group mb-6">
                    <v-textarea v-model="code" clearable label="AmoCRM Code" outlined></v-textarea>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <div style="padding: 0px; margin-bottom: 0px;">
                    <v-btn style="background-color: #119DFF; color: #fff; margin-left: 15px;" @click.prevent="update()" :disabled="code.length == 0">Обновить</v-btn>
                </div>
            </v-col>
        </v-row>

    </div>
</template>
    
<script setup>
const indexStore = useIndexStore()
const userStore = useUserStore() 

const code = ref('')

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

const update = async () => {
    
    // Get IIKO access & refresh tokens
    try {
		indexStore.progress = true

		const { data, error } = await userStore.myFetch('/api/amocrm', { 
			method: 'post', 
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
			body: { 
				action: 'get.tokens', 
                code: code.value,
			} 
		})
		indexStore.progress = false
        //console.log("DATA: ", data.value)

		if (data.value && data.value.code == 200) {
            useNuxtApp().$toast.success(`Код: ${data.value.code}. Успешное обновление токенов`);
            code.value = ''

		} else {
			useNuxtApp().$toast.error('Ошибка: ' + error.value);
		}

	} catch (e) {
        useNuxtApp().$toast.error('Ошибка: ' + e);
		indexStore.progress = false
	}

}
   
</script>
    
<style lang="scss" scoped>

</style>