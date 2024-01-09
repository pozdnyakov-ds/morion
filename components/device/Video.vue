<template>
    <div 
        class="region" 
        :style="getMediaStyle(imageMode)" >
        <video 
            ref="videoIdUnique"
            class="video-js media"
            :style="getMediaItemStyle(imageMode)"
            data-setup='{"controls": false, "autoplay": true, "preload": "auto", "muted": "muted"}'
            fluid="true"
            muted="muted"
            autoplay="true"
            loop="true"
        >
            <source :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner}/${filename}`" />
        </video>
    </div>
</template>

<script setup>
import videojs from 'video.js'
import randomId from "../config/misc"

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
    filename: String,
    type: String,
    imageMode: String
})

const player = ref(null)
const videoIdUnique = ref('videoIdUnique')

const config = useRuntimeConfig()
const partner = ref(null)
const filename = ref(null)
const type = ref(null)
const imageMode = ref(null)

partner.value = props.partner ? props.partner : ''
filename.value = props.filename ? props.filename : ''
type.value = props.type ? props.type : ''
imageMode.value = props.imageMode ? Number(props.imageMode) : 3

onMounted(() => {
    mediaPlay()
})

const getMediaStyle = (imageMode) => {
    switch (Number(imageMode)) {
        case 0:
            return { overflow: 'visible' }
        break;

        case 1:
            return { overflow: 'visible' }
        break;

        case 2:
            return { overflow: 'hidden' }
        break;
    }
}

const getMediaItemStyle = (imageMode) => {
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

const mediaPlay = () => {
    const options = {
        controls: false,
        preload: true,
        autoplay: true,
        mute: true,
        loop: true,
        sources: [{
            src: `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.value}/${filename.value}`,
            type: type.value
        }]
    }

    if (player.value == null) {
        player.value = videojs(videoIdUnique.value, options, () => {
                player.value.play()
            }) 
    } else {
        player.value.src({
            src: `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.value}/${filename.value}`,
            type: type.value
        })
    }
}

</script>

<style lang="scss" scoped>
@import "https://vjs.zencdn.net/8.5.2/video-js.css";

.region {
    width: 100%;
    height: 100%;
}
.media {
    width: 100%; 
    height: auto;
}
</style>