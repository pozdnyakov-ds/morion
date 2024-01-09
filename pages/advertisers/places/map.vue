<template>
    <div class="main-content">
        <div class="page-title">
            Места размещения на карте
        </div>
    
        <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
            <div class='col-12'><span>Ошибка: {{ message }}</span></div>
        </div> 
    
        <v-row>
            <v-col>
                <nuxt-link to="/advertisers/places/">
                    <v-btn style="background-color: #28a745; color: #fff;">Поиск по списку</v-btn>
                </nuxt-link>
            </v-col>
            <v-col><br><br><br>
                <!-- <v-text-field
                    v-model="search"
                    label="Поиск..."
                    single-line
                    hide-details
                    variant="outlined"
                    style="margin-bottom: 15px;"
                >
                </v-text-field> -->
            </v-col>
        </v-row>
        
        <YandexMapAll :key="indexStore.display.key" />
          
    </div>
</template>
    
<script setup>
import YandexMapAll from '~/components/YandexMapAll.vue'
import randomId from '~/config/misc'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

indexStore.display.coordinates = [49.106414, 55.796127]
indexStore.display.key = randomId(32)

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

const search = ref('')
const message = ref('')

onMounted(() => {
    indexStore.displayInfo.visible = false
})

</script>

<style lang="scss" scoped>
.description {
    font-size: 90%;
    color: #666;
}
.item-action {
    color: #666;
    margin-right: 10px;
}
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>