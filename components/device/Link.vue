<template>
    <div 
        class="region" 
        :style="getMediaStyle(imageMode)" >

        <!-- <div style="position: absolute; left: 10px; top: 10px; border: 1px solid #ccc; background-color: #eee; padding: 10px; margin: 10px; z-index: 999; border-radius: 5px;">
            {{ iframeSrc }}<br>
            {{ getMediaItemStyle(imageMode) }}<br>
        </div> -->

        <iframe
            ref="iframeRef"
            class="media"
            :style="getMediaItemStyle(imageMode)" 
            :src="iframeSrc"
            frameborder="0">
        </iframe>

    </div>
</template>

<script setup>
const props = defineProps({
    partner: String,
    filename: String,
    type: String,
    imageMode: String
})

const iframeRef = ref(null)
const iframeSrc = ref(null)
const imageMode = ref(null)

onMounted(() => {
    iframeSrc.value = props.filename ? props.filename : 'about:blank'
    iframeRef.value.style.transform = `scale(1.0)`
    imageMode.value = props.imageMode ? Number(props.imageMode) : 3
    console.log("External Link: ", iframeSrc.value)
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
            return { width: 'auto', height: '100vh' }
        break;

        case 1:
            return { width: '100%', height: '100vh' }
        break;

        case 2:
            return { width: '100%', height: '100vh' }
        break;
    }
}

</script>

<style lang="scss" scoped>
.region {
    width: 100%;
    height: 100%;
}
.media {
    overflow: hidden;
    width: 100%; 
    height: auto;
}
</style>