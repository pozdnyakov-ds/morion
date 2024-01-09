<template>
    <div 
        class="region" 
        :style="getMediaStyle(imageMode)" >
        <img 
            class="media"
            :style="getMediaItemStyle(imageMode)"
            :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner}/${filename}`" 
        >
    </div>
</template>

<script setup>
const props = defineProps({
    partner: String,
    filename: String,
    type: String,
    imageMode: String
})

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
    //...
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

</script>

<style lang="scss" scoped>
.region {
    width: 100%;
    height: 100%;
}
.media {
    width: 100%; 
    height: auto;
}
</style>