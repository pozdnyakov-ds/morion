<template>
    <v-navigation-drawer 
        location="right" 
        color="#fff" 
        class="mt-5" 
        temporary 
        width="400"
        style="top: 15px; padding: 15px 0 15px 0; box-shadow: -5px 0 5px #aaa;" 
        v-model="indexStore.displayInfo.visible" 
        text-color="white"
    >
    <div>
        <div class="page-title" style="padding: 20px; margin: 0 0 20px 0; background-color: #9ce9bf;">Информация по дисплею</div>
            <v-row>
                <v-col cols="12">
                        <v-text-field
                        style="width: 100%;"
                        label="Партнер"
                        required
                        variant="outlined"
                        v-model="recordInfo.partner_name"
                        readonly
                    ></v-text-field>
                    <v-text-field
                        style="width: 100%;"
                        label="Наименование"
                        required
                        variant="outlined"
                        v-model="recordInfo.name"
                        readonly
                    ></v-text-field>
                    <v-text-field
                        style="width: 100%;"
                        label="Описание"
                        variant="outlined"
                        v-model="recordInfo.description"
                        readonly
                    ></v-text-field>
                    <v-text-field
                        style="width: 100%;"
                        label="Ставка за 1000 показов"
                        variant="outlined"
                        v-model="recordInfo.rate"
                        readonly
                    ></v-text-field>
                    <v-text-field
                        style="min-width: 300px; width: 100%; margin-top: 10px;"
                        label="Разрешение экрана"
                        variant="outlined"
                        v-model="recordInfo.resulution_info"
                        readonly
                    ></v-text-field>
                    <v-text-field
                        style="min-width: 300px; width: 100%; margin-top: 10px;"
                        label="Адрес"
                        v-model="recordInfo.address"
                        variant="outlined"
                        readonly
                    ></v-text-field>
                    <v-text-field
                        style="min-width: 300px; width: 100%; margin-top: 10px;"
                        label="Координаты"
                        v-model="recordInfo.geo"
                        variant="outlined"
                        readonly
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-card-actions style="margin-bottom: 20px;">
                <v-spacer></v-spacer>
                <v-btn color="green-darken-1" variant="text" @click="submitForm(recordInfo)">Создать заявку</v-btn>
                <v-btn color="green-darken-1" variant="text" @click="dialog_action_cancel">Отмена</v-btn>
            </v-card-actions>
    </div>
    </v-navigation-drawer>
</template>

<script setup>
const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
const message = ref('')
const router = useRouter()

var recordInfo = reactive({
    address:  null,
    code: null,
    created_at: null,
    description: null,
    display_group: null,
    geo: null,
    group_name: null,
    id: null,
    layout: null,
    layout_height: null,
    layout_name: null,
    layout_ratio: null,
    layout_resolution: null,
    layout_width: null,
    name: null,
    partner: null,
    partner_name: null,
    ratio_height: null,
    ratio_name: null,
    ratio_width: null,
    rate: 0,
    resolution_height: null,
    resolution_name: null,
    resolution_width: null,
    resulution_info: null,
    token: null,
    type: null
})

onMounted(() => {
    recordInfo = { ...indexStore.displayInfo.data }
    recordInfo.resulution_info = getLayoutResolution(recordInfo) + getLayoutRatio(recordInfo)
})

const getLayoutResolution = (item) => {
    switch(Number(item.layout_ratio)) {
        case 0:
            return item.resolution_name
            break
        case 1:
            return item.resolution_name
            break
        case 99:
            return item.layout_width + 'x' + item.layout_height
            break
        default:
            return 'Нет данных'
    }
}

const getLayoutRatio = (item) => {
    switch(Number(item.layout_ratio)) {
        case 0:
            return ' [' + item.ratio_name + ']'
            break
        case 1:
            return ' [' + item.ratio_name + ']'
            break
        case 99:
            return ''
            break
        default:
            return 'Нет данных'
    }
}

const submitForm = async (recordInfo) => {
    router.push('/advertisers/orders/' + recordInfo.id)
}

const dialog_action_cancel = () => {
    indexStore.displayInfo.visible = false
}

</script>

<style lang="scss" scoped>
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>