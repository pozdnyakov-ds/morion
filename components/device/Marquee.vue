<template>
    <div 
        class="region" 
        :style="getMediaStyle(imageMode)" >
        <Vue3Marquee 
            class="media"
            :style="getMediaItemStyle(imageMode)"
            :direction="settings.direction === true ? 'reverse' : 'normal'"
            :duration="settings.duration"
            :delay="0"
            :vertical="settings.vertical === true ? true : false"
            >
            <div 
                v-for="item in marquees" 
                :key="item.id"
                :style="{ margin: '0 50px 0 50px', fontSize: settings.fontSize + 'pt', color: settings.color }"
                >
                <div :innerHTML="item.code"></div>
            </div>
        </Vue3Marquee>

    </div>
</template>

<script setup>
const props = defineProps({
    partner: String,
    filename: String,
    code: Object,
    imageMode: String
})

console.log("CODE: ", props.code)

const partner = ref(null)
const filename = ref(null)
const code = ref(null)
const imageMode = ref(null)

partner.value = props.partner ? props.partner : ''
filename.value = props.filename ? props.filename : ''
code.value = props.code ? props.code : {
    fontSize: 32,
    duration: 10,
    vertical: false,
    direction: false,
    color: '#fff'
}
imageMode.value = props.imageMode ? Number(props.imageMode) : 3

const marquees = ref([])

const settings = reactive({
    fontSize: code.value.fontSize,
    duration: code.value.duration,
    vertical: code.value.vertical,
    direction: code.value.direction,
    color: code.value.color
})

onMounted(() => {
    loadData()
})

const loadData = async () => {
    var data = null 
    var error = null

    try {
        const response = await fetch('/api/marquees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                action: 'index.active',
                partner: partner.value
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
        marquees.value = data.data ? data.data : []
    }

    // console.log("LOAD MARQUEES DATA: ", marquees.value)
}

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