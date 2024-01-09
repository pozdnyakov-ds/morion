<template>
<client-only>
    <yandex-map
        class="map"
        :settings="{
            location: {
                center: coords,
                zoom: zoom,
            },
            restrictMapArea: restrictArea,
        }"
        style="width: 100%; height: 200px; margin-bottom: 20px; background-color: #eee;"
    >
        <yandex-map-default-scheme-layer/>

        <yandex-map-controls :settings="{ position: 'right' }">
        <yandex-map-zoom-control />
        </yandex-map-controls>

    </yandex-map>
</client-only>
</template>

<script setup>
import { YandexMap, VueYandexMaps, YandexMapControlButton, YandexMapControls, YandexMapDefaultSchemeLayer, YandexMapZoomControl, 
    YandexMapDefaultFeaturesLayer, YandexMapDefaultMarker, YandexMapMarker, YandexMapFeature } from 'vue-yandex-maps'

const config = useRuntimeConfig()
const indexStore = useIndexStore()

const restrictArea = ref(null)
const coords = ref(null)
const zoom = ref(null)

const data = indexStore.display.coordinates
if (data) {
    coords.value = [data[0]*1, data[1]*1]
    zoom.value = 16
} else {
    coords.value = [49.106414, 55.796127]
    zoom.value = 9
}    

</script>

<style lang="scss" scoped>

</style>