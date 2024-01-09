<template>
    <client-only>
    <div class="error-screen" v-if="showErrorScreen">
        <div class="exclamation">
            <div class="exclamation-border"><i class="fa-solid fa-exclamation"></i></div>
            Отсутсвует подключение к интернету или<br> дисплей отключен вашим администратором.
        </div>
    </div>
    <div class="layout">
        <div v-for="region in indexStore.device.content" 
            class="region" 
            :style="{ left: region.x + 'px', top: region.y + 'px', width: region.w + 'px', height: region.h + 'px', zIndex: region.zIndex,
                backgroundColor: region.style.background && region.style.background.color ? region.style.background.color : 'transparent',
                border: region.style.border.color ? region.style.border.width + 'px ' + region.style.border.type + ' ' + region.style.border.color : '0px solid transparent',
                borderRadius: region.style.border.radius ? region.style.border.radius + 'px' : '0px' }"
            :key="region.id"
            >
            <div v-if="region.media && region.media && region.media.type && region.media.type.includes('image/')" >
                <Image :partner="region.partner" :filename="region.media.filename" 
                    :type="region.media.type" :imageMode="region.imageMode" :key="region.id" />
            </div>
            <div v-if="region.media && region.media && region.media.type && region.media.type.includes('video/')" >
                <Video :partner="region.partner" :filename="region.media.filename" 
                    :type="region.media.type" :imageMode="region.imageMode" :key="region.id"/>
            </div>
            <div v-if="region.media && region.media && region.media.type && region.media.type == 'playlist'" class="media" 
            :style="getMediaStyle(region.imageMode)" :key="region.media.id">
                <Playlist :partner="region.partner" :layout="region.layoutId" :region="region.id" :display="region.displayId"
                    :playlist="region.media.id" :imageMode="region.imageMode" :key="region.id"/>
            </div>
            <div v-if="region.media && region.media && region.media.type && region.media.type == 'marquee'" >
                <Marquee :partner="region.partner" :filename="region.media.filename" 
                    :code="region.media.code" :imageMode="region.imageMode" :key="region.id"/>
            </div>
            <div v-if="region.media && region.media && region.media.type && region.media.type == 'html'" >
                <Html :partner="region.partner" :code="region.media.code" 
                    :type="region.media.type" :imageMode="region.imageMode" :key="region.id"/>
            </div>
            <div v-if="region.media && region.media && region.media.type && region.media.type == 'link'" >
                <Link :partner="region.partner" :filename="region.media.filename" 
                    :type="region.media.type" :imageMode="region.imageMode" :key="region.id" />
            </div>
        </div>
    </div>
    </client-only>
</template>

<script setup>
import Image from '../components/device/Image.vue'
import Video from '../components/device/Video.vue'
import Playlist from '../components/device/Playlist.vue'
import Marquee from '../components/device/Marquee.vue'
import Html from '../components/device/Html.vue'
import Link from '../components/device/Link.vue'

definePageMeta({
	layout: "device"
})

var config = useRuntimeConfig()
const indexStore = useIndexStore()
const route = useRoute()

indexStore.device.players = []

const code = ref(null)
code.value = route.query.code
const partner = ref(null)
const layoutId = ref(null)

const resourcesToPreload = ref([])
const uniqueFilenames = new Set()
const uniqueData = []

const showErrorScreen = ref(false)

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

const loadData = async () => {
    var data = null 
    var error = null

    try {
        const response = await fetch('/api/displays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                action: 'layout.get',
                code: code.value
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
        indexStore.device = { ...data.data[0] }
        indexStore.device.uniqueData = []

        partner.value = indexStore.device.partner ? indexStore.device.partner : null
        layoutId.value = indexStore.device.layout_id ? indexStore.device.layout_id : null

        if (indexStore.device.content && indexStore.device.content.length) {
            indexStore.device.content.forEach(async (item, index) => {

                if (!item.media || !item.media.type) return
                item['partner'] = JSON.parse(JSON.stringify(partner.value))
                item['layoutId'] = JSON.parse(JSON.stringify(layoutId.value))
                item['displayId'] = indexStore.device.id

                if (item.media.type.includes('image/')) { resourcesToPreload.value.push({ filename: item.media.filename, type: item.media.type, partner: partner.value }) }
                if (item.media.type.includes('video/')) { resourcesToPreload.value.push({ filename: item.media.filename, type: item.media.type, partner: partner.value }) }
                if (item.media.type.includes('playlist')) { 
                    
                    try {
                        const response = await fetch('/api/loops', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ 
                                action: 'index.get',
                                id: item.media.id
                            }),
                        })
                        if (!response.ok) {
                            throw new Error('Request failed');
                        }
                        data = await response.json();
                    } catch (err) {
                        error = err.message;
                    }
                    
                    var mediaArray = []
                    indexStore.device.content[index].media['list'] = []

                    if (data && data.code && data.code == 200) {
                        mediaArray = data.data && data.data[0] && data.data[0].media ? data.data[0].media : []
                        mediaArray.forEach((loopItem) => {
                            resourcesToPreload.value.push({ filename: loopItem.filename, type: loopItem.type, partner: partner.value })
                            indexStore.device.content[index].media['list'].push(loopItem)
                        })
                    }

                    // Удалить повторящиеся значения
                    resourcesToPreload.value.filter(item => {
                        if (!uniqueFilenames.has(item.filename)) {
                            uniqueFilenames.add(item.filename)
                            uniqueData.push({ filename: item.filename, type: item.type, partner: partner.value })
                            return true;
                        } else {
                            return false
                        }
                    }) 

                    indexStore.device.uniqueData = uniqueData
                }
            })
        }
        showErrorScreen.value = false
        useNuxtApp().$toast.success('Данные получены')

    } else {
        showErrorScreen.value = true
        useNuxtApp().$toast.error('Ошибка чтения данных')
    }
}

// watch(() => indexStore.device.uniqueData, (n, o) => {
//     if (o != n) {
//         preloadData(JSON.parse(JSON.stringify(indexStore.device.uniqueData)))
//     }
// })

// function preloadData(data) {
//     if (data && data.length == 0) { 
//         return 
//     }

//     var image = null
//     var video = null

//     data.forEach((item) => {
//         console.log("UNIQUE VALUE: ", item)

//         if (item.type.includes('image')) {
//             image = document.createElement('img');
//             image.src = `https://storage.yandexcloud.net/d24/partners/OUb0L2QIIztzKXJYMUN4MW9beC3txuXe/${item.filename}`
//             image.onload = () => {
//                 console.log('Изображение успешно предварительно загружено: ', image)
//             }
//         }

//         if (item.type.includes('video')) {
//             video = document.createElement('video');
//             video.src = `https://storage.yandexcloud.net/d24/partners/OUb0L2QIIztzKXJYMUN4MW9beC3txuXe/${item.filename}`
//             video.oncanplaythrough = () => {
//                 console.log('Видео успешно предварительно загружено: ', video)
//             }
//         }
//     })
// }

onMounted(() => {
    config = useRuntimeConfig()
    loadData()
})

</script>

<style lang="scss" scoped>
.layout {
    position: relative; 
    display: inline-block;
    width: 100%; 
    height: 100vh; 
    border: 0px solid red; 
}
.download-info {
    position: absolute;
    left: 250px;
    top: 20px;
    width: 100%;
    height: auto;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #eee;
    padding: 10px;
    color: #333;
    display: none;
}
.region {
    position: absolute;
    border: 0px solid blue;
}
.media {
    width: 100%;
    height: 100%;
}
.error-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    background-color: #333;
    color: #fff;
}
.exclamation {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
.exclamation-border {
    border: 5px solid yellow;
    color: yellow;
    border-radius: 50px;
    width: 100px;
    height: 100px;
    padding: 0px;
    font-size: 400%; 
    margin-bottom: 20px;
}
</style>