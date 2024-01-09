<template>
    <v-navigation-drawer 
        location="right" 
        color="#fff" 
        class="mt-5" 
        temporary 
        width="450"
        style="top: 15px; padding: 15px 0 15px 0; box-shadow: -5px 0 5px #aaa;" 
        v-model="indexStore.elementAdd.visible" 
        text-color="white"
    >
    <div>
        <div class="page-title" style="padding: 20px; margin: 0px; background-color: #9ce9bf;">Добавить контент</div>
        <v-tabs
            v-model="tab" 
            bg-color="white"
            show-arrows
            >
            <v-tab value="media" @click="currentTab = 0">Медиа</v-tab>
            <v-tab value="playlist" @click="currentTab = 1">Плейлист</v-tab>
            <v-tab value="marquee" @click="currentTab = 2">Бегущая строка</v-tab>
            <v-tab value="html" @click="currentTab = 3">HTML</v-tab>
            <v-tab value="link" @click="currentTab = 4">Внешняя ссылка</v-tab>
            <!-- <v-tab value="schedule" @click="currentTab = 2">Расписание</v-tab> -->
        </v-tabs>
        
        <v-window v-model="tab">
            <v-window-item value="media">
                <ElementAddMedia :id="id" :key="indexStore.elementAdd.key" />
            </v-window-item>
    
            <v-window-item value="playlist">
                <ElementAddPlaylist :id="id" :key="indexStore.elementAdd.key" />
            </v-window-item>

            <v-window-item value="marquee">
                <ElementAddMarquee :id="id" :key="indexStore.elementAdd.key" />
            </v-window-item>

            <v-window-item value="html">
                <ElementAddHtml :id="id" :key="indexStore.elementAdd.key" />
            </v-window-item>

            <v-window-item value="link">
                <ElementAddLink :id="id" :key="indexStore.elementAdd.key" />
            </v-window-item>

            <!-- <v-window-item value="schedule">
                <ElementAddSchedule :id="id" :key="indexStore.elementAdd.key" />
            </v-window-item> -->
        </v-window>
    </div>

    </v-navigation-drawer>
</template>

<script setup>
import randomId from "~/config/misc"

const indexStore = useIndexStore()
const tab = ref(null)
const currentTab = ref(0)

const props = defineProps({
    id: String,
})
const id = ref(props && props.id ? props.id : null)

const region = reactive({
    id: null,
    data: {},
    link: null,
})

region.id = indexStore.elementAdd.id

onMounted(() => {
    indexStore.elementAdd.key = randomId(32)

    if (indexStore.layout.content.length) {
    indexStore.layout.content.forEach((item, index) => {
        if (region.id == item.id) {
            switch (item.type) {
            case 'image': 
                currentTab.value = 0 
                break
            case 'video': 
                currentTab.value = 0
                break
            case 'playlist': 
                currentTab.value = 1
                break
            case 'marquee': 
                currentTab.value = 2
                break
            case 'html': 
                currentTab.value = 3
                break
            case 'link': 
                currentTab.value = 4
                break
            }
        }
    })
}

})

</script>

<style lang="scss" scoped>

</style>