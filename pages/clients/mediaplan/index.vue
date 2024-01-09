<template>
    <div class="main-content">

        <div class="page-title">
            Медиа-план
        </div>
    
        <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
            <div class='col-12'><span>Ошибка: {{ message }}</span></div>
        </div> 
    
    <v-data-table 
            hover
            density="compact"
            v-model:page="page"
            :items-per-page="showBy"
            :headers="headers"
            :items="items"
            :search="search"
            item-key="id"
            no-data-text="Нет данных"
            class="elevation-1"
        >
        <template v-slot:headers="{ columns }">
            <tr>
                <template v-for="(column) in columns" :key="column.key">
                    <td v-if="column.key=='data-table-expand'" style="padding: 0px; background-color: #fff; width: 25px;"><b>{{ column.title }}</b></td>
                    <td v-if="column.id == -1 && column.key != 'data-table-expand'" style="padding: 5px 5px 10px 5px; background-color: #fff; width: 200px; min-width: 200px;">
                        <div style="width: 100%;">
                            <div style="font-size: 100%; color: #333; font-weight: bold; width: 100%; display: flex; flex-wrap: wrap; justify-content: center;">{{ column.title }}</div>
                        </div>
                    </td>
                    <td v-if="column.id % 2 === 0 && column.id != -1 && column.key != 'data-table-expand'" style="padding: 5px 5px 10px 5px; background-color: #D6EAF8; width: 100px; min-width: 100px;">
                        <div style="width: 100%;">
                            <div style="font-size: 150%; color: #333; font-weight: bold; width: 100%; display: flex; flex-wrap: wrap; justify-content: center;">{{ column.dayOfMonth }}</div>
                            <div style="font-size: 90%; color: #999; font-weight: bold; width: 100%; display: flex; flex-wrap: wrap; justify-content: center;">{{ column.month }}.{{ String(column.year).substring(2,4) }}</div>
                            <div style="font-size: 90%; color: #999; font-weight: bold; width: 100%; display: flex; flex-wrap: wrap; justify-content: center;">{{ column.weekDay }}</div>
                        </div>
                    </td> 
                    <td v-if="column.id % 2 != 0 && column.id != -1 && column.key != 'data-table-expand'" style="padding: 5px 5px 10px 5px; background-color: #fff; width: 100px; min-width: 100px;">
                        <div style="width: 100%;">
                            <div style="font-size: 150%; color: #333; font-weight: bold; width: 100%; display: flex; flex-wrap: wrap; justify-content: center;">{{ column.dayOfMonth }}</div>
                            <div style="font-size: 90%; color: #999; font-weight: bold; width: 100%; display: flex; flex-wrap: wrap; justify-content: center;">{{ column.month }}.{{ String(column.year).substring(2,4) }}</div>
                            <div style="font-size: 90%; color: #999; font-weight: bold; width: 100%; display: flex; flex-wrap: wrap; justify-content: center;">{{ column.weekDay }}</div>
                        </div>
                    </td>
                </template>
            </tr>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length" style="padding: 0; margin: 0;">
                <Playlist :id="item.id"/>
              </td>
            </tr>
        </template>

        <template v-slot:item.name="{ item }">
            <div>{{ item.name }}</div>
            <div v-if="item.description && item.description.length > 0" class="description">{{ item.description }}</div>
        </template>

        <template v-slot:item.data="{ item }">
            <div>&nbsp;</div>
            
        </template>
           
        </v-data-table>
    </div>    
</template>

    
<script setup>
import moment from 'moment'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

const items = ref([])
const page = ref(1)
const showBy = ref(10)
const search = ref('')

const maxDays = config.public.SCHEDULE_MAX_DAYS

const dialog = reactive({
    edit: false,
    delete: false,
    action: false
})
const message = ref('')

const partner = reactive({
    selected: null
})

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        loadRecords()
    }
})

watch(showBy, (newValue) => {
    loadRecords()
})

const headers = []
const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

var currentDate = moment()
headers.push(
    { title: '', key: 'data-table-expand' },
    {
        id: -1,
        key: 'name',
        title: 'Дисплей / Плейлисты',
        date: '',
        dayOfMonth: '',
        weekDay: '',
        month: '', 
        year: ''
    }
)
for (var i=0; i<=maxDays; i++) {
    const date = moment(currentDate).add(i, 'd')
    const item = {
        dayOfYear: date.dayOfYear(),
        dayOfMonth: date.date(),
        weekDay: weekDays[date.weekday()],
        month: months[date.month()],
        year: date.year()
    }
    headers.push({
        id: i,
        key: "data",
        date: item.dayOfYear,
        title: item.dayOfMonth + "/" + item.month + "/" + item.year,
        dayOfMonth: item.dayOfMonth,
        weekDay: item.weekDay,
        month: item.month, 
        year: item.year
    })
}

const loadRecords = async () => {
    items.value.splice(0)

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/displays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'index.list', 
                partner: partner.selected
            }),
        })

        if (data.value.code == 200) {
            items.value = data.value.data
            items.value.forEach((item) => {
                item.geo = item.geo ? JSON.parse(item.geo) : null
            })
        }
        indexStore.progress = false

    } catch(e) {
        // console.log("DATA ERROR: ", e)
        indexStore.progress = false
    }
}
</script>

<style lang="scss" scoped>
.description {
    font-size: 90%;
    color: #999;
}
.v-data-table { 
    overflow-x: auto;
  }
.v-data-table-rows-no-data {
    text-align: left !important;
}
</style>