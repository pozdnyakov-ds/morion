<template>
    <client-only>
        <YandexMap
            ref="map"
            class="map"
            :controls="controls"
            :settings="{
                location: {
                    center: coords,
                    zoom: zoom,
                    bounds: bounds
                },
                restrictMapArea: restrictArea,
            }"
            style="width: 100%; height: 600px; margin-bottom: 20px; background-color: #eee; border: 1px solid #ccc; border-radius: 5px; overflow: hidden;"
            >
            <yandex-map-default-scheme-layer />
            <yandex-map-default-features-layer />

            <yandex-map-controls :settings="{ position: 'right' }">
                <yandex-map-zoom-control />
            </yandex-map-controls>

            <YandexMapClusterer
                v-model="clusterer" 
                :options="{ 
                    clusterIconLayout: 'default#pieChart', 
                    groupByCoordinates: true, 
                }"
                zoom-on-cluster-click  
                >
                <yandex-map-marker
                    v-for="item in items" 
                    :key="item.id" 
                    :settings="{
                        coordinates: item.geo,
                    }"
                    style="cursor: pointer;"
                    @click="markerInfo(item)"
                >
                    <i class="fa-solid fa-location-dot" style="color: #3498DB; font-size: 200%; position: absolute; top: -32px; left: -12px;"></i>
                    <v-tooltip activator="parent" location="bottom">{{ item.partner_name }}<br>{{ item.address }}</v-tooltip>
                </yandex-map-marker>
               
                <template #cluster="{ length }">
                    <div
                      class="cluster"
                      :style="{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '50px',
                        aspectRatio: '1/1',
                        background: '#3498DB',
                        color: '#fff',
                        borderRadius: '100%',
                        border: '5px solid #fff',
                        cursor: 'pointer',
                      }"
                    >{{ length }}
                    </div>
                </template>
            </YandexMapClusterer>
    
        </YandexMap>

        <YandexInfo :key="indexStore.displayInfo.key" />

    </client-only>
</template>

<script setup>
import { YandexMap, VueYandexMaps, YandexMapControlButton, YandexMapControls, YandexMapDefaultSchemeLayer, YandexMapZoomControl, 
    YandexMapDefaultFeaturesLayer, YandexMapDefaultMarker, YandexMapMarker, YandexMapFeature, YandexMapClusterer } from 'vue-yandex-maps'
import { ref, onMounted, shallowRef } from 'vue';
import randomId from '~/config/misc';

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
const items = ref([])

const map = shallowRef(null)
const restrictArea = ref(null)
const coords = ref(null)
const bounds = ref(null)
const zoom = ref(null)
const controls = ref(['fullscreenControl'])
const clusterer = shallowRef(null)

const data = indexStore.display.coordinates
if (data) {
    coords.value = [data[0]*1, data[1]*1]
    //zoom.value = 5
} else {
    coords.value = [49.106414, 55.796127]
    //zoom.value = 10
}

function markerInfo(item) {
    indexStore.displayInfo.key = randomId(32)
    indexStore.displayInfo.data = item
    indexStore.displayInfo.visible = true
}

onMounted(async () => {
    await nextTick()
    loadRecords()
})

const loadRecords = async () => {
    items.value.splice(0)

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/displays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'places.list'
            }),
        })

        var minLong = 180
        var maxLong = 0
        var minLat = 90
        var maxLat = 0

        if (data.value.code == 200) {
            items.value = data.value.data
            items.value.forEach((item) => {
                const geo = item.geo ? JSON.parse(item.geo) : null
                item.geo = geo ? [geo[0]*1, geo[1]*1] : null
                if (geo[0]*1 < minLong) { minLong = geo[0]*1 - 1}
                if (geo[0]*1 > maxLong) { maxLong = geo[0]*1 + 1}
                if (geo[1]*1 < minLat) { minLat = geo[1]*1 - 1}
                if (geo[1]*1 > maxLat) { maxLat = geo[1]*1 + 1}
            })
        }
        bounds.value = [[minLong, minLat], [maxLong, maxLat]]
        indexStore.progress = false

    } catch(e) {
        indexStore.progress = false
    }
}
    
</script>
    
<style lang="scss" scoped>

</style>