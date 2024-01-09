<template>
    <div>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="search"
                    label="Поиск..."
                    single-line
                    hide-details
                    variant="outlined"
                >
                </v-text-field>
            </v-col>
        </v-row>
        <v-row style="margin: 0;">
            <v-col style="padding: 0 20px 0 20px;">
                <v-data-iterator 
                    :items="items"
                    :items-per-page="999"
                    item-value="id"
                    :search="search"
                    >
                    <template v-slot:default="{ items }">
                        <template v-for="item in items" :key="item">
                            <div style="display: flex; margin: 0 0 10px 0; position: relative;">
                                <div style="margin-left: 10px; width: 220px;">
                                    <div style="font-size: normal; color: #333;">{{ getTitle(item.raw.name) }}</div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <div style="font-size: small; color: #999;">{{ getTime(item.raw.duration) }} сек.</div>
                                    </div>
                                </div>
                                <div style="position: absolute; right: 0; color: #ccc;"> 
                                    <v-checkbox-btn v-model="item.raw.status" @click="selectMedia(item.raw)"></v-checkbox-btn>
                                </div>
                            </div>    
                        </template>
                    </template>
                </v-data-iterator>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn v-if="selectedMedia.length && selectedMedia.length > 0" @click="saveList" block style="background-color: #28a745; color: #fff;">Выбрать</v-btn>
                <v-btn @click="indexStore.elementAdd.visible = false" block style="background-color: #999; color: #fff; margin-top: 10px;">Закрыть</v-btn>
            </v-col>
        </v-row>

    </div>
</template>

<script setup>
const props = defineProps({
    id: String,
})
const id = ref(props && props.id ? props.id : null)

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

const partner = reactive({
    selected: indexStore.layoutInfo.partner ? indexStore.layoutInfo.partner : null
})

const items = ref([])
const search = ref('')
const selectedMedia = ref([])
const message = ref('')
const selectedDuration = ref(0)

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        if (partner.selected) loadRecords()
    }
})

const getTitle = (item) => {
    const name = item.length > 32 ? item.slice(0, 32) + "..." : item
    return name
}

const getTime = (duration) => {
    // return Math.round(duration * 10) / 10
    return duration
}

const selectMedia = (item) => {
    console.log("CHECK: ", item)
    const id = item.id
    const status = item.status

    if (!status) {
        items.value.forEach((select) => {
            if (select.id != id) {
                select.status = false
            }
        })
        selectedMedia.value = []
        selectedMedia.value.push(item)
    } else {
        const indexToRemove = selectedMedia.value.findIndex(selectedItem => selectedItem.id === id);
        if (indexToRemove !== -1) {
        selectedMedia.value.splice(indexToRemove, 1);
        }
    }
}

const loadRecords = async () => {
    if (!indexStore.elementAdd.visible) return

    if (userStore.loggedIn && partner.selected && partner.selected.length) {

        items.value.splice(0)
        items.value = []
        selectedMedia.value = []

        // try {
            indexStore.progress = true
            const { data, error } = await userStore.myFetch('/api/loops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userStore.accessToken}`
                },
                body: JSON.stringify({ 
                    action: 'index.active', 
                    partner: partner.selected
                }),
            })

            if (data.value.code == 200) {
                items.value = data.value.data
                items.value.forEach((item) => {
                    // if (item.status == 1) { item.status = false }
                    item.status = false
                })
            }
            indexStore.progress = false

            console.log("DATA PLAYLISTS: ", items.value)

        // } catch(e) {
        //     console.log("GET LIST ERROR: ", e)
        //     indexStore.progress = false
        // }
    }
}

loadRecords()

const saveList = async () => {
    if (!selectedMedia.value || !selectedMedia.value.length) {
        return
    }
    indexStore.elementAdd.visible = false

    if (indexStore.layout.content.length) {
        indexStore.layout.content.forEach((el, index) => {
            if (el.id == indexStore.elementAdd.id) {
                if (indexStore.media.direct) {
                    indexStore.layout.content[index].media.id = selectedMedia.value[0].id
                    indexStore.layout.content[index].media.type = 'playlist'
                    indexStore.layout.content[index].media.filename = selectedMedia.value[0].name,
                    indexStore.layout.content[index].media.duration = selectedMedia.value[0].duration
                    indexStore.layout.content[index].media.code = null
                } else {
                    indexStore.media.id = selectedMedia.value[0].id
                    indexStore.media.type = 'playlist'
                    indexStore.media.filename = selectedMedia.value[0].name
                    indexStore.media.duration = selectedMedia.value[0].duration
                    indexStore.media.code = null
                }
            }
        })
    }
}

</script>

<style lang="scss" scoped>
.item {
    background-color: #fff;
    border-radius: 5px;
    height: 50px;
    width: 50px;
    color: #333;
    margin: 0;
    overflow: hidden;
    position: relative;
    cursor: pointer;
}
.item-play {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    color: #fff;
    padding: 5px;
    margin: 10px;
    font-size: x-large;
    cursor: pointer;
}
.item-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;	
}
.item-info {
    background-color: #fff;
    width: 100%;
    color: #333;
    margin: 0;
    overflow: hidden;
    position: relative;
}

.item-media-info {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;	
}
</style>