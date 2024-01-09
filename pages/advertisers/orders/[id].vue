<template>
    <div class="main-content">
        <div class="page-title">
            Создать заявку
        </div>
    
        <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
            <div class='col-12'><span>Ошибка: {{ message }}</span></div>
        </div>
        <!-- {{ indexStore.order.playlist }}  -->
        <v-stepper 
            :items="['Сводка по дисплею', 'Выбрать медиа', 'Бюджет и расписание']"
            hide-actions
            v-model="currentStep"
            >
            <template v-slot:item.1>
                <Info :key="stepperKey" :displayId="displayId"/>
            </template>
          
            <template v-slot:item.2>
                <Media :key="stepperKey" :displayId="displayId" />
            </template>
          
            <template v-slot:item.3>
                <Tariff :key="stepperKey" :displayId="displayId" />
            </template>

        </v-stepper>

        <div style="width: 100%; display: flex; justify-content: space-between; margin-top: 20px; margin-bottom: 20px;">
            <div>
                <v-btn v-if="currentStep == 1" style="background-color: #fff; color: #333;" outline @click.prevent="router.push('/advertisers/places')">Назад к поиску</v-btn>
                <v-btn v-if="currentStep > 1" style="background-color: #fff; color: #333;" outline @click.prevent="currentStep--">Назад</v-btn>
            </div>
            <div>
                <v-btn v-if="currentStep >= 1 && currentStep < 3" style="background-color: #fff; color: #333;" 
                    outline @click.prevent="currentStep++" :disabled="(currentStep == 1 && indexStore.order.playlist == null) || (currentStep == 2 && indexStore.order.media == null)">Следующий
                </v-btn>
                <v-btn v-if="currentStep == 3" 
                    style="background-color: #119DFF; color: #fff; margin-left: 15px;" 
                    @click.prevent="submitForm()"
                    :disabled="!indexStore.order.startDate || !indexStore.order.finishDate || !indexStore.order.bid || indexStore.order.bid < 500"
                    >Создать</v-btn>
            </div>
        </div>
            
    </div>
</template>
    
<script setup>
import Info from '~/components/stepper/Info'
import Media from '~/components/stepper/Media'
import Tariff from '~/components/stepper/Tariff'
import randomId from '~/config/misc'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

const route = useRoute()
const router = useRouter()
const message = ref(null)

const displayId = ref(null)
const stepperKey = ref(randomId(32))
const currentStep = ref(1)

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

displayId.value = route.params.id

onMounted(() => {
  //displayId.value = route.params.id
  //console.log("ID", displayId.value)
})

const submitForm = async () => {
    console.log("DISPLAY...", indexStore.display)
    console.log("ORDER...", indexStore.order)

    const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
    if (!token_recaptcha) return

	try {
		indexStore.progress = true
        const order = {
            id: randomId(32),
            name: randomId(8),
            description: '',
            partner: userStore.partner,
            owner: indexStore.order.owner,
            display_id: indexStore.order.displayId,
            playlist_id: indexStore.order.playlist.loop_id,
            media_id: indexStore.order.media.id,
            date_start: indexStore.order.startDate,
            date_finish: indexStore.order.finishDate,
            budget: indexStore.order.bid
        }    
		message.value = ''

		const { data, error } = await useFetch('/api/orders', { 
			method: 'post', 
			body: { 
				action: 'index.create', 
				name: order.name,
                description: order.description,
                partner: order.partner,
                owner: order.owner,
                display_id: order.display_id,
                playlist_id: order.playlist_id,
                media_id: order.media_id,
                date_start: order.date_start,
                date_finish: order.date_finish,
                budget: order.budget,
				token_recaptcha: token_recaptcha
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const router = useRouter()
			router.push("/advertisers/orders")

		} else {
			message.value = (error.value) ? error.value : ''
		}

	} catch (e) {
        message.value = e
		indexStore.progress = false
	}
}

</script>

<style lang="scss" scoped>
.v-stepper-window-item {
    padding: 0px !important;
    margin: 0px !important;
}
</style>