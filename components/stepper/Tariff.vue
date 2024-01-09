<template>
    <div>
        <div class="page-title" style="margin: 0 0 20px 0;">Расписание и бюджет рекламной компании</div>
        <div style="border: 0px solid #ccc; border-radius: 10px; padding: 10px; margin-bottom: 20px;">
            <b>Стратегия:</b> Количество показов рекламы. Добиться установленного количества выходов кампании в эфир.
        </div>

        <v-row>
            <v-col cols="6">Расписание</v-col>
            <v-col cols="3">
                <v-text-field
                    type="date"
                    label="Дата начала компании"
                    variant="outlined"
                    :rules="[required('')]"
                    v-model="indexStore.order.startDate"
                ></v-text-field>
            </v-col>
            <v-col cols="3">
                <v-text-field
                    type="date"
                    label="Дата завершения компании"
                    variant="outlined"
                    :rules="[required('')]"
                    v-model="indexStore.order.finishDate"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="9">Бюджет рекламной компании, руб.</v-col>
            <v-col cols="3">
                <v-text-field
                    type="number"
                    label="Руб."
                    variant="outlined"
                    :rules="[required(''), minValue('', 500)]"
                    v-model="indexStore.order.bid"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="9">Стоимость 1000 показов на выбранном экране, руб.</v-col>
            <v-col>
                <v-text-field
                    type="number"
                    min="100"
                    label="Руб."
                    variant="outlined"
                    readonly 
                    v-model="indexStore.display.data.rate"
                ></v-text-field>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const indexStore = useIndexStore()
const displayId = ref(null)

indexStore.display.bid = 500

const now = new Date()
const month = new Date()
month.setDate(month.getDate() + 30)

// indexStore.order.startDate = now
// indexStore.order.finishDate = month

const props = defineProps({
    displayId: String,
})

onMounted(() => {
    displayId.value = props && props.displayId ? props.displayId : null
})

watch(() => displayId.value, () => {
    //...
})

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
    rate: 0,
    ratio_height: null,
    ratio_name: null,
    ratio_width: null,
    resolution_height: null,
    resolution_name: null,
    resolution_width: null,
    resulution_info: null,
    token: null,
    type: null
})

console.log("MEDIA DATA: ", indexStore.display.media)

const required = () => {
	return v => v && v.length > 0 || 'Указать значение'
}
const minLength = (propertyType, minLength) => {
	return v => v && v.length >= minLength || `Не меньше ${minLength} символов`
}
const maxLength = (propertyType, maxLength) => {
	return v => v && v.length <= maxLength || `Не больше ${maxLength} символов`
}
const minValue = (propertyType, minValue) => {
	return v => v && v >= minValue || `Не меньше ${minValue}`
}

</script>

<style lang="scss" scoped>
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>