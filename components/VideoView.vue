<template>
<div>
    <v-row>
        <video ref="playerId"
            class="video-js vjs-default-skin item-media"
            data-setup='{"controls": true, "autoplay": false, "preload": "auto"}'
            fluid="true"
            width="600px">
            <source :src="item.type.includes('video/') 
                ? `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.partner}/${item.filename}` 
                : ''" />
        </video>
    </v-row>
    <div class="item-close">
        <i @click="indexStore.videoView.visible = false" class="fa-regular fa-circle-xmark"></i>
    </div>
</div>
</template>

<script setup>
import videojs from 'video.js'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

const player = ref(null)
const playerId = ref(null)

const item = ref(null)
item.value = indexStore.videoView.item 
    ? {
        partner: indexStore.videoView.item.partner,
        filename: indexStore.videoView.item.filename,
        type: indexStore.videoView.item.type,
    } 
    : null

useHead({
    script: [
      { 
        src: "https://vjs.zencdn.net/8.5.2/video.min.js", 
        defer: true,
      }
    ]
})

onMounted(() => {
    if (item.value) mediaPlay()
})

const mediaPlay = () => {
    const options = {
        controls: true,
        preload: true,
        sources: [{
            src: `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.value.partner}/${item.value.filename}`,
            type: item.value.type
        }]
    }

    if (player.value == null) {
        player.value = videojs(playerId.value, options, () => {
                //...
            }) 
    } else {
        player.value.src({
            src: `https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.value.partner}/${item.value.filename}`,
            type: item.value.type
        })
    }

}
</script>

<style lang="scss" scoped>
@import "https://vjs.zencdn.net/8.5.2/video-js.css";

.item-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;	
}
.item-close {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    color: #fff;
    padding: 5px;
    margin: 10px;
    font-size: xx-large;
    cursor: pointer;
}
</style>