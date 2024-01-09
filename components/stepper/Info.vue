<template>
    <div>
        <div class="page-title" style="margin-top: 0px;">Сводка по дисплею</div>
        <v-row>
            <v-col cols="6">
                    <v-text-field
                    style="width: 100%;"
                    label="Партнер"
                    required
                    variant="outlined"
                    v-model="recordInfo.partner_name"
                    readonly
                ></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field
                    style="width: 100%;"
                    label="Наименование"
                    required
                    variant="outlined"
                    v-model="recordInfo.name"
                    readonly
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>    
            <v-col cols="12">
                <v-text-field
                    style="width: 100%;"
                    label="Описание"
                    variant="outlined"
                    v-model="recordInfo.description"
                    readonly
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>    
            <v-col cols="6">    
                <v-text-field
                    label="Адрес"
                    v-model="recordInfo.address"
                    variant="outlined"
                    readonly
                ></v-text-field>
            </v-col>
            <v-col cols="6">    
                <v-text-field
                    label="Координаты"
                    v-model="recordInfo.geo"
                    variant="outlined"
                    readonly
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>    
            <v-col cols="6">
                <v-text-field
                    label="Разрешение экрана"
                    variant="outlined"
                    v-model="recordInfo.resulution_info"
                    readonly
                ></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field
                    label="Ставка за 1000 показов"
                    variant="outlined"
                    v-model="recordInfo.rate"
                    readonly
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>    
            <v-col cols="6">
                
            </v-col>
            <v-col cols="6">
                
            </v-col>
        </v-row>
        <b>Плейлисты</b><br>
        <span style="font-size: 90%;">Максимальное количество медиа в плейлисте не более 12 штук по 15 секунд, 
            т.е. с максимальной длительностью цикла в 180 секунд. Выберите плейлист с наименьшим количеством других медиа и удобным графиком показа.
        </span>

        <div 
            v-for="item in schedules" 
            :key="item"
            style="border: 1px solid #ccc; border-radius: 5px; padding: 10px; margin: 20px 10px 5px 10px; position: relative; display: flex;"
            >
            <div style="margin: 0 10px 0 0;">
                <v-checkbox-btn v-model="item.status" @click="selectPlaylist(item)"></v-checkbox-btn>
            </div>
            <div>
                {{ item.loop_name }}<br>
                <span style="font-size: 90%;">{{ item.schedule_content.start }} - {{ item.schedule_content.finish }} </span><br>
                <span style="font-size: 90%;">{{ item.loop_media.length }} медиа на {{ item.loop_duration }} сек. </span>
            </div>
            <div style="border: 0px solid #ccc; border-radius: 5px; position: absolute; top: 0; right: 0; margin: 5px; padding: 0px; display: flex; overflow: hidden;">
                <div v-for="day in item.schedule_content.days" :key="day.id">
                    <div v-if="day.status" style="background-color: lightgreen; width: 50px; padding: 5px; text-align: center;">
                        {{ day.name }}
                        <span style="font-size: 90%;">{{ day.startTime }}</span><br>
                        <span style="font-size: 90%;">{{ day.finishTime }}</span>
                        </div>
                    <div v-if="!day.status" style="background-color: #fff; width: 50px; padding: 5px; text-align: center;">{{ day.name }}</div>
                </div>
            </div>
        </div>
        <div v-if="playlists && playlists.length == 0" style="margin: 20px;">Нет данных</div>
        
    </div>
</template>

<script setup>
const indexStore = useIndexStore()
const userStore = useUserStore()

const message = ref('')
const displayId = ref(null)
const display = ref(null)
const playlists = ref([])

const record = ref(null)
const content = ref([])
const schedules = ref([])

indexStore.order.display = null
indexStore.order.playlist = null
indexStore.order.media = null
indexStore.order.bid = 500
indexStore.order.startDate = null
indexStore.order.finishDate = null

const props = defineProps({
    displayId: String,
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

const selectedPlaylist = ref(null)

const selectPlaylist = (item) => {
    const id = item.loop_id
    const status = item.status
    selectedPlaylist.value = null

    schedules.value.forEach((select) => {
        if (select.loop_id != id) {
            select.status = false
        }
    })
    if (!status) {
        selectedPlaylist.value = item
        indexStore.order.playlist = item
        indexStore.order.displayId = displayId.value
        
    } else {
        selectedPlaylist.value = null
        indexStore.order.playlist = null
        indexStore.order.displayId = null
    }
}

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

watch(() => displayId.value, () => {
    loadDisplayData()
    
})

onMounted(() => {
    displayId.value = props.displayId
    //loadData()
})

const loadDisplayData = async () => {
    display.value = null

    // try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/displays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'index.get', 
                id: displayId.value
            }),
        })
        indexStore.progress = false

        if (data.value.code == 200) {
            display.value = data.value.data[0]

            recordInfo.partner = display.value.partner_id
            indexStore.order.owner = display.value.partner_id

            recordInfo.partner_name = display.value.partner_name
            recordInfo.name = display.value.name
            recordInfo.description = display.value.description
            recordInfo.rate = display.value.rate
            recordInfo.address = display.value.address
            recordInfo.geo = display.value.geo ? JSON.parse(display.value.geo) : ''

            recordInfo.layout_ratio = display.value.layout_ratio
            recordInfo.layout_width = display.value.layout_width
            recordInfo.layout_height = display.value.layout_height

            recordInfo.ratio_name = display.value.ratio_name
            recordInfo.resolution_name = display.value.resolution_name

            recordInfo.resulution_info = getLayoutResolution(recordInfo) + getLayoutRatio(recordInfo)

            indexStore.display.data = recordInfo

            loadPlaylistData()

        } else {
            return
        }

    // } catch(e) {
    //     // console.log("DATA ERROR: ", e)
    //     indexStore.progress = false
    // }
}

const loadSchedules = async (playlistsArray) => {
    schedules.value = []
    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/loops', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'schedules.list', 
                list: JSON.stringify(playlistsArray)
            }),
        })
        indexStore.progress = false

        if (data.value.code == 200) {
            schedules.value = data.value.data
            schedules.value.forEach((item) => {
                item['status'] = false
            })
            console.log("SCHEDULES: ", schedules.value)

        } else {
            return
        }

    } catch(e) {
        // console.log("DATA ERROR: ", e)
        indexStore.progress = false
    }
}

const loadPlaylistData = async () => {
    playlists.value = []
    const playlistsArray = []

    // try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/displays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'playlists.list', 
                id: displayId.value
            }),
        })
        indexStore.progress = false

        if (data.value.code == 200) {
            record.value = data.value.data[0]
            content.value = record.value.layout_content && record.value.layout_content.length ? record.value.layout_content : []
        } else {
            return
        }

        content.value.forEach((item) => {
            if (item.media && item.media.type == 'playlist') {
                playlists.value.push(item.media)
                playlistsArray.push(item.media.id)
            }
        })

        console.log("playlists: ", playlists.value)
        //console.log("playlistsArray: ", playlistsArray)

        // GET SCHEDULES LIST
        loadSchedules(playlistsArray)

    // } catch(e) {
    //     // console.log("DATA ERROR: ", e)
    //     indexStore.progress = false
    // }
}
</script>

<style lang="scss" scoped>
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>