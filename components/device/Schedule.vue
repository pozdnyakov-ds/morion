<template>
<div>
    <div 
        v-if="currentItem"
        class="region"
        :style="getMediaStyle(imageMode, opacity)"
        >
            <img v-if="currentItem.type.includes('image')"
                ref="imageId"
                class="media"
                :style="getMediaItemStyle(imageMode, 'image', currentItem.type)" 
                :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${currentItem.partner}/${currentItem.filename}`" 
            />

            <video 
                ref="playerId"
                class="video-js media"
                :style="getMediaItemStyle(imageMode, 'video', currentItem.type)"
                data-setup='{"controls": false, "autoplay": true, "preload": "auto", "muted": "muted"}'
                fluid="true"
                muted="muted"
                autoplay="true"
                loop="true"
                >
                <source :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${currentItem.partner}/${currentItem.filename}`" />
            </video>
    </div>

</div>
</template>

<script setup>
import videojs from 'video.js'
import moment from 'moment'

const indexStore = useIndexStore()
const config = useRuntimeConfig()

useHead({
    script: [
      { 
        src: "https://vjs.zencdn.net/8.5.2/video.min.js", 
        defer: true,
      }
    ]
})

const props = defineProps({
    partner: String,
    layout: String,
    region: String,
    playlist: String,
    imageMode: String
})

const partner = ref(props && props.partner ? props.partner : null)
const layout = ref(props && props.layout ? props.layout : null)
const region = ref(props && props.region ? props.region : null)
const playlist = ref(props && props.playlist ? props.playlist : null)
const imageMode = ref(props && props.imageMode ? props.imageMode : null)
const media = ref([])
const schedule = reactive({
    scheduleId: null,
    scheduleName: ''
})

const currentIndex = ref(0)
const currentItem = ref(null)

const player = ref(null)
const playerId = ref(null)
const imageId = ref(null)
const opacity = ref(0)

const setRegionOpacity = () => {
    if (opacity.value == 1) { opacity.value = 0 }
    else { opacity.value = 1 }
}

const nextItem = () => {
    currentIndex.value++;
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

const mediaPlay = (item) => {
    const options = {
        // controls: false,
        // preload: true,
        // autoplay: true,
        // mute: true,
        // loop: true,
        // sources: [{
        //     src: `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.partner}/${item.filename}`,
        //     type: item.type
        // }]
    }

    if (player.value == null) {
        player.value = videojs(playerId.value, options, () => {
            player.value.src({
                src: `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.partner}/${item.filename}`,
                type: item.type
            })
            player.value.play()
        }) 
    } else {
        player.value.src({
            src: `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.partner}/${item.filename}`,
            type: item.type
        })
        player.value.play()
    }

}

onMounted(async () => {
    var data = null 
    var error = null

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
    } catch (err) {
        error = err.message;
    }

    if (data && data.code && data.code == 200) {
        media.value = data.data[0].media ? data.data[0].media : []
        schedule.scheduleId = data.data[0].schedule
        schedule.scheduleName = data.data[0].schedule_name
    }
    // console.log("MEDIA: ", data.data[0])            
 
    // Start playlist
    currentItem.value = media.value[currentIndex.value]
    opacity.value = 1

    setTimeout(() => {
        if (currentItem.value && currentItem.value.type.includes('video')) {
            mediaPlay(currentItem.value)
        }
        setTimeout(nextItem, currentItem.value.duration * 1000);
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

const getMediaItemStyle = (imageMode, type, currentType) => {
    switch (Number(imageMode)) {
        case 0:
            return { width: 'auto', height: 'auto' }
        break;

        case 1:
            return { width: '100%', height: 'auto' }
        break;

        case 2:
            return { width: '100%', height: 'auto' }
        break;
    }
}

</script>

<style lang="scss" scoped>
@import "https://vjs.zencdn.net/8.5.2/video-js.css";
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