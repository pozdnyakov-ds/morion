<template>
<div style="width: 100%; display: flex; flex-wrap: wrap; margin: 0;">
    <div v-for="playlist in schedules" :key="playlist.loop_id" style="width: 100%; display: flex; border-bottom: 1px solid #eee;">
        <div style="width: 250px; min-width: 250px; max-width: 250px; border: 0px solid blue; margin: 0px; padding: 10px; display: flex; flex-wrap: wrap;">
            <div>{{ playlist.loop_name }}</div>
            <br><div class="description">{{ playlist.loop_media ? playlist.loop_media.length : 0 }} медиа [{{ playlist.loop_duration ? playlist.loop_duration : 0 }} сек.]</div>
            <br><div class="description">{{ playlist.schedule_name }}</div>
            <br><div class="description">{{ getDate(playlist.schedule_content.start) }} - {{ getDate(playlist.schedule_content.finish) }}</div>
        </div>
        <div v-for="day in days" :key="day.id" style="border-radius: 0 0 0px 0; overflow: hidden; border-left: 1px solid #fff;"> 
            <div v-if="day.date.isSameOrAfter(playlist.schedule_content.start) && day.date.isSameOrBefore(playlist.schedule_content.finish)" 
                style="width: 100px; height: 100%; border-top: 5px solid green; background-color: transparent; padding: 0px;">
                
                <div v-if="checkDay(playlist.schedule_content.days, day.date.day())" style="background-color: #D5F5E3; height: 100%; position: relative;">
                    <div :style="{ 
                        position: 'absolute', 
                        top: 0, 
                        left: getTimeBefore(playlist.schedule_content.days, day.date.day()) + 'px', 
                        width: getTimeAfter(playlist.schedule_content.days, day.date.day()) - getTimeBefore(playlist.schedule_content.days, day.date.day()) + 'px', 
                        height: '100%', 
                        backgroundColor: '#82E0AA' }">
                    </div>
                    <div style="position: absolute; top: 0; left: 0; margin: 10px 0 0 0; width: 100%; display: flex; flex-wrap: wrap;">
                        <div style="width: 100%; font-size: 90%; text-align: center;">{{ getTime(playlist.schedule_content.days, day.date.day()).startTime }}</div>
                        <div style="width: 100%; font-size: 90%; text-align: center;">{{ getTime(playlist.schedule_content.days, day.date.day()).finishTime }}</div>
                    </div>
                </div>
                <div v-else style="background-color: transparent;">&nbsp;
                    <!-- {{ day.date.day() }} -->
                </div>
            </div>
            <div v-else style="width: 100px; height: 100%; border-left: 0px solid #eee; background-color: transparent; padding: 0px;">
                &nbsp;
            </div>
        </div>
    
    </div>
    
    <!-- {{ schedules }} -->

</div>
</template>

<script setup>
import moment from 'moment'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

const props = defineProps({
    id: String,
})
const record = ref(null)
const displayId = ref(null)
const content = ref([])
const playlists = ref([])
const schedules = ref([])
const days = ref([])

const maxDays = config.public.SCHEDULE_MAX_DAYS

onMounted(() => {
    displayId.value = props && props.id ? props.id : null
})

watch(() => displayId.value, () => {
    loadData()
})

const getDate = (d) => {
    const parts = d.split('-')
    return parts[2] + '-' + parts[1] + '-' + parts[0]
}

const getTimeBefore = (days, index) => {
    var data = null
    var startTime = moment('1980-01-01 00:00:00')
    var finishTime = moment('1980-01-01 23:59:59')
    var currentTime = null
    var differ = 0
    
    if (days) {
        days.forEach((item) => {
            if (item.id == index) {
                currentTime = moment('1980-01-01 ' + item.startTime + ':00')
                differ = (currentTime.valueOf() - startTime.valueOf()) * 100 / (finishTime.valueOf() - startTime.valueOf())
                //console.log("getTimeBefore: ", differ.toFixed(0))
                data = item
                return
            }
        })
    }
    return differ ? differ.toFixed(0) : 0
}

const getTimeAfter = (days, index) => {
    var data = null
    var startTime = moment('1980-01-01 00:00:00')
    var finishTime = moment('1980-01-01 23:59:59')
    var currentTime = null
    var differ = 0
    
    if (days) {
        days.forEach((item) => {
            if (item.id == index) {
                currentTime = moment('1980-01-01 ' + item.finishTime + ':00')
                differ = (currentTime.valueOf() - startTime.valueOf()) * 100 / (finishTime.valueOf() - startTime.valueOf())
                //console.log("getTimeBefore: ", differ.toFixed(0))
                data = item
                return
            }
        })
    }
    return differ ? differ.toFixed(0) : 0
}

const getTime = (days, index) => {
    var data = null
    if (days) {
        days.forEach((item) => {
            if (item.id == index) {
                data = item
                return
            }
        })
    }
    return data ? data : false
}

const checkDay = (days, index) => {
    var data = null
    if (days) {
        days.forEach((item) => {
            if (item.id == index) {
                data = item
                return
            }
        })
    }
    return data ? data.status : false
}

const prepareData = () => {
    var currentDate = moment()
    for (var i=0; i<=maxDays; i++) {
        const date = moment(currentDate).add(i, 'd')
        days.value.push({
            id: i,
            date: date
        })
    }
}

const loadSchedulles = async (playlistsArray) => {
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
            console.log("SCHEDULES: ", schedules.value)

            prepareData()
        } else {
            return
        }

    } catch(e) {
        // console.log("DATA ERROR: ", e)
        indexStore.progress = false
    }
}

const loadData = async () => {
    record.value = null
    content.value = []
    playlists.value = []
    const playlistsArray = []

    try {
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

        //console.log("playlists: ", playlists.value)
        //console.log("playlistsArray: ", playlistsArray)

        // GET SCHEDULES LIST
        loadSchedulles(playlistsArray)

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
    width: 100%;
}
.v-data-table { 
    overflow-x: auto;
  }
.v-data-table-rows-no-data {
    text-align: left !important;
}
</style>