<template>
    <div :style="{ opacity: globalOpacity }">
        <div 
            v-if="currentItem"
            class="region"
            :style="getMediaStyle(imageMode, opacity)"
            >
            <img v-show="currentItem.type.includes('image')"
                ref="imageId"
                class="media"
                :style="getMediaItemStyle(imageMode, 'image')" 
                :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${currentItem.partner}/${currentItem.filename}`" 
            />
            <div v-show="currentItem.type.includes('video')"
                :class="playerClass + ' media'"  
                :style="getMediaItemStyle(imageMode, 'video')"
                >
            </div>
        </div>
    </div>
    </template>
    
    <script setup>
    import Artplayer from 'artplayer'
    import moment from 'moment'
    import randomId from "../config/misc"
    
    const indexStore = useIndexStore()
    const config = useRuntimeConfig()
  
    const props = defineProps({
        partner: String,
        layout: String,
        region: String,
        playlist: String,
        imageMode: String,
        display: String
    })
    
    const partner = ref(props && props.partner ? props.partner : null)
    const layout = ref(props && props.layout ? props.layout : null)
    const region = ref(props && props.region ? props.region : null)
    const playlist = ref(props && props.playlist ? props.playlist : null)
    const display = ref(props && props.display ? props.display : null)
    const imageMode = ref(props && props.imageMode ? props.imageMode : null)
    const media = ref([])
    const schedule = reactive({
        id: null,
        name: '',
        content: null
    })

    //const key = ref(0)
    const source = ref(null)
    const type = ref(null)
    const playerClass = ref('artplayer_' + randomId(4))

    const currentIndex = ref(0)
    const currentItem = ref(null)

    Artplayer.CONTEXTMENU = false
    Artplayer.NOTICE_TIME = 0
    Artplayer.CONTROL_HIDE_TIME = 0
    const player = ref(null)
    
    const globalOpacity = ref(1)
    const opacity = ref(0)
    
    const setRegionOpacity = () => {
        if (opacity.value == 1) { opacity.value = 0 }
        else { opacity.value = 1 }
    }
    
    const countView = async (item) => {
        //console.log(" New item view: ", item.type, item)
        try {
            const response = await fetch('/api/statistics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    action: 'view.create',
                    partner_id: item.partner,
                    owner_id: item.owner ? item.owner : item.partner,
                    order_id: item.budget ? item.id : null,
                    display_id: item.display_id ? item.display_id : null,
                    playlist_id: item.playlist_id ? item.playlist_id : null,
                    media_id: item.budget ? item.media_id : item.id,
                    type: item.type,
                    budget: item.budget ? item.budget : null,
                    rate: item.rate ? item.rate : null,
                    status: 1,
                }),
            })
            if (!response.ok) {
              throw new Error('Request failed');
            }
            const data = await response.json();

        } catch (err) {
            //error.value = err.message;
        }
    }

    const nextItem = () => {
        // Count view
        if (currentItem.value.budget && currentItem.value.budget * 1.0 > 0) {
            if (currentItem.value.count && currentItem.value.count > 0 && currentItem.value.count*1.0 > currentItem.value.counter*1.0) {
                countView(currentItem.value)
                currentItem.value.counter++
                //console.log("ADV ITEM: ", currentItem.value.count, currentItem.value.counter, currentItem.value)
                currentIndex.value++;

            } else {
                // Пропустить элемент
                currentIndex.value = currentIndex.value + 2;
            }
        } else {
            countView(currentItem.value)
            currentIndex.value++;
        }

        if (currentIndex.value >= media.value.length) {
            currentIndex.value = 0;
        }
    
        opacity.value = 0
        setTimeout(() => {
            currentItem.value = media.value[currentIndex.value]
            opacity.value = 1
            if (currentItem.value.type.includes('video')) {
                mediaPlay(currentItem.value)
            }
            setTimeout(nextItem, currentItem.value.duration * 1000);
        }, 500)
    }
    
    // function mediaPlay(item) {
    //     source.value = `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.partner}/${item.filename}`
    //     type.value = item.type
    //     key.value = randomId(16)
    // }

    function mediaPlay(item) {
        if (player.value == null) {
            player.value = new Artplayer({
                container: '.' + playerClass.value,
                url: `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.partner}/${item.filename}`,
                type: item.type,
                autoSize: true,
                autoplay: true,
                muted: true,
                loop: true,
                miniProgressBar: false,
                isLive: true,
                mini: true,
                mutex: false,
            })
            player.value.on('ready', () => {
                player.value.play();
            })

        } else {
            player.value.switch = `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.partner}/${item.filename}`
            player.value.type = item.type 
        }
    }
    
    const checkSchedule = () => {
        let letStart = false
        let letFinish = false
        let letDayStatus = false
        let letDayStart = false
        let letDayFinish = false
    
        if (!schedule.id || !schedule.content) {
            globalOpacity.value = 1
            return true
        }
    
        // Check date
        var currentDate = moment()
        
        if (schedule.content && schedule.content.start && schedule.content.start.length > 0) {
            letStart = currentDate.isSameOrAfter(moment(schedule.content.start))
        } else {
            letStart = true
        }
    
        if (schedule.content && schedule.content.finish && schedule.content.finish.length > 0) {
            letFinish = currentDate.isSameOrBefore(moment(schedule.content.finish))
        } else {
            letFinish = true
        }
    
        // Check day
        var currentDay = null
        schedule.content.days.forEach((day) => {
            if (day.id == moment().day()) {
                currentDay = day
            }
        })
        
        if (currentDay.status == 1) {
            letDayStatus = true
        } else {
            letDayStatus = false
        }
        
        // Check start time
        if (currentDay && currentDay.startTime && currentDay.startTime.length) {
            let checkTime = moment().format(currentDate.format('YYYY-MM-DD') + ' ' + currentDay.startTime)
            if (currentDate.isSameOrAfter(checkTime)) {
                letDayStart = true
            } else {
                letDayStart = false
            }
        } else {
            letDayStart = true
        }
    
        // Check finish time
        if (currentDay && currentDay.finishTime && currentDay.finishTime.length) {
            let checkTime = moment().format(currentDate.format('YYYY-MM-DD') + ' ' + currentDay.finishTime)
            if (currentDate.isSameOrBefore(checkTime)) {
                letDayFinish = true
            } else {
                letDayFinish = false
            }
        } else {
            letDayFinish = true
        }
    
        // Summary
        let res = letStart && letFinish && letDayStatus && letDayStart && letDayFinish
        globalOpacity.value = res ? 1 : 0
        
        setTimeout(checkSchedule, 5000)
    }
    
    onMounted(async () => {
        var data = null
        var dataMedia = null
        var error = null
        var errorMedia = null
    
        try {
            const response = await fetch('/api/loops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    action: 'index.get',
                    id: playlist.value
                }),
            })
            if (!response.ok) {
              throw new Error('Request failed');
            }
            data = await response.json();
            //console.log("LOOPS: ", data)

        } catch (err) {
            error = err.message;
        }
    
        // Считать ролик и даты из рабочих заказов и запушить в массив media.value этот ролик
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    action: 'device.list',
                    playlist_id: playlist.value
                }),
            })
            if (!response.ok) {
              throw new Error('Request failed');
            }
            dataMedia = await response.json();
            //console.log("PLAYLIST PROMO: ", dataMedia.data)

        } catch (err) {
            errorMedia = err.message;
        }

        if (data && data.code && data.code == 200) {
            media.value = data.data[0].media ? data.data[0].media : []

            media.value.forEach((m) => {
                m['playlist_id'] = playlist.value
                m['display_id'] = display.value
            })
            
            // Добавить промо медиа к остальным
            dataMedia.data.forEach((item) => {
                if (item.type.includes('image')) {
                    item.budget = item.budget * 1.0
                    item['duration'] = 15
                }
                // Проверить бюжет кампании (> 0)
                if (item.budget && (item.budget*1.00 + item.rate/1000) > 0) {
                    item['count'] = Number((item.budget*1.00 + item.rate/1000).toFixed(0))
                    item['counter'] = 0
                    media.value.push(item)
                }
            })

            schedule.id = data.data[0].schedule
            schedule.name = data.data[0].schedule_name
            schedule.content = data.data[0].schedule_content
        }
        
        // Check schedule every 5 sec
        setTimeout(checkSchedule, 1)
     
        // Start playlist
        currentItem.value = media.value[currentIndex.value]
        opacity.value = 1
    
        setTimeout(() => {
            if (currentItem.value && currentItem.value.type.includes('video')) {
                mediaPlay(currentItem.value)
            }
            setTimeout(nextItem, currentItem.value.duration * 1000)
        }, 500)
    })
  
    const getMediaStyle = (imageMode, opacity) => {
        switch (Number(imageMode)) {
            case 0:
                return { overflow: 'visible', opacity: opacity }
            break;
    
            case 1:
                return { overflow: 'visible', opacity: opacity }
            break;
    
            case 2:
                return { overflow: 'hidden', opacity: opacity }
            break;
        }
    }
    
    const getMediaItemStyle = (imageMode, type) => {
        switch (Number(imageMode)) {
            case 0:
                return { width: 'auto', height: type == 'image' ? 'auto' : '100vh' }
            break;
    
            case 1:
                return { width: '100%', height: type == 'image' ? 'auto' : '100vh' }
            break;
    
            case 2:
                return { width: '100%', height: type == 'image' ? 'auto' : '100vh' }
            break;
        }
    }
    
    </script>
    
    <style lang="scss" scoped>
    .region {
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity 0.5s;
    }
    .media {
        width: 100%; 
        height: auto;
    }
    </style>