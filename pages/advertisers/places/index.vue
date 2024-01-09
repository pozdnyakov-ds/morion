<template>
    <div class="main-content">
        <div class="page-title">
            Места размещения
        </div>
    
        <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
            <div class='col-12'><span>Ошибка: {{ message }}</span></div>
        </div> 
    
        <v-row>
            <v-col>
                <nuxt-link to="/advertisers/places/map">
                    <v-btn style="background-color: #28a745; color: #fff;">Поиск по карте</v-btn>
                </nuxt-link>
            </v-col>
            <v-col>
                <v-text-field
                    v-model="search"
                    label="Поиск..."
                    single-line
                    hide-details
                    variant="outlined"
                    style="margin-bottom: 15px;"
                >
                </v-text-field>
            </v-col>
        </v-row>
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
                    <td v-if="column.key=='data-table-expand'" style="padding: 10px; background-color: #D6EAF8; width: 25px;"><b>{{ column.title }}</b></td>
                    <td v-else style="padding: 10px; background-color: #D6EAF8;"><b>{{ column.title }}</b></td>
                </template>
            </tr>
        </template>

        <!-- <template v-slot:expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length" style="padding: 0; margin: 0;">
                <Playlist :id="item.id"/>
              </td>
            </tr>
        </template> -->
    
        <template v-slot:item.name="{ item }">
            <div>{{ item.name }}</div>
            <div v-if="item.description && item.description.length > 0" class="description">{{ item.description }}</div>
        </template>

        <template v-slot:item.address="{ item }">
            <div>{{ item.address }}</div>
            <div v-if="item.geo && item.geo.length > 0" class="description">{{ item.geo }}</div>
        </template>

        <template v-slot:item.layout_name="{ item }">
            <div>
                {{ getLayoutResolution(item) }} {{ getLayoutRatio(item) }}
            </div> 
        </template>
     
        <template v-slot:item.actions="{ item }">
            <span><v-icon class="item-action" size="small" @click="addOrder(item)">fa-regular fa-square-plus</v-icon><v-tooltip activator="parent" location="top">Заявка на размещение</v-tooltip></span>
            <span><v-icon class="item-action" size="small" @click="viewRecord(item)">fa-solid fa-eye</v-icon><v-tooltip activator="parent" location="top">Подробности</v-tooltip></span>
        </template>
    
        </v-data-table>

        <YandexInfo :key="indexStore.displayInfo.key" />
          
    </div>
</template>
    
<script setup>
import YandexInfo from '~/components/navigation/YandexInfo.vue';
import randomId from '~/config/misc'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
const router = useRouter()

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

const items = ref([])
const page = ref(1)
const showBy = ref(10)
const search = ref('')
const message = ref('')

const partner = reactive({
    selected: null,
})

const dialog = reactive({
    delete: false,
    action: null
})

watch(showBy, () => {
    loadRecords(partner.selected)
})

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
    indexStore.displayInfo.visible = false
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        loadRecords()
    }
})

watch(() => indexStore.displayAdd.reload, () => {
    loadRecords()
})

const headers = [
    // { title: '', key: 'data-table-expand' },
    { title: 'Партнер', key: 'partner_name' },
    { title: 'Имя/Описание', key: 'name' },
    { title: 'Адрес/координаты', key: 'address' },
    { title: 'Разрешение экрана', key: 'layout_name' },
    { title: 'Действия', key: 'actions', sortable: false }
]

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
            return '[' + item.ratio_name + ']'
            break
        case 1:
            return '[' + item.ratio_name + ']'
            break
        case 99:
            return ''
            break
        default:
            return 'Нет данных'
    }
}

const viewRecord = (item) => {
    const current = item
    //console.log("VIEW: ", current)
    indexStore.displayInfo.key = randomId(32)
    indexStore.displayInfo.data = current
    indexStore.displayInfo.visible = true
}

const addOrder = (item) => {
    router.push('/advertisers/orders/' + item.id)
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
                action: 'places.list'
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
    color: #666;
}
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
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>