<template>
    <div>
        <div class="page-title" style="margin-top: 0px;">Выбрать медиа</div>
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
        <v-sheet class="d-flex" :elevation="3" style="padding: 10px; margin: 10px; background-color: lightyellow;">
            Согласно правилам работы с рекламной площадкой, возможны к выбору видео-ролики длительностью только до 15 секунд включительно.<br>
            Длительность статичных изображений принимается за 15 секунд.
        </v-sheet>
        <v-row style="margin: 0;">
            <v-col style="padding: 0 20px 0 20px;">
                <v-data-iterator 
                    :items="items"
                    items-per-page="999"
                    item-value="id"
                    :search="search"
                    >
                    <template v-slot:default="{ items }">
                        <template v-for="item in items" :key="item.value">
                            <div style="display: flex; margin: 10px 0 10px 0; position: relative; border-top: 1px solid #ccc; padding: 10px;">
                                <div v-if="item.raw.type.includes('image/')" class="item">
                                    <img :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.raw.partner}/${item.raw.filename}`" class="item-media">
                                </div>
                                <div v-if="item.raw.type.includes('video/')" class="item">
                                    <video class="item-media">
                                        <source :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.raw.partner}/${item.raw.filename}`" />
                                    </video>
                                </div>
                                <div style="margin-left: 10px; width: 100%; display: flex; flex-wrap: wrap;">
                                    <div style="color: #333; margin-right: 20px; width: 100%;">
                                        {{ getTitle(item.raw.name) }} &nbsp; 
                                        [{{ getTitle(item.raw.filename) }}]
                                    </div>
                                    <div style="font-size: 90%; color: #999; width: 100%;">
                                        {{ getType(item.raw.type) }}<span v-if="item.raw.type.includes('video')">, {{ getTime(item.raw.duration) }} сек.</span>
                                    </div>
                                </div>
                                <!-- <div
                                    v-if="item.raw.type.includes('image')"
                                    style="position: absolute; width: 100px; right: 100px;"
                                    >
                                    <v-text-field
                                        type="number"
                                        min="5"
                                        max="15"
                                        label="Сек."
                                        variant="outlined"
                                        v-model="item.raw.duration"
                                    ></v-text-field> 
                                </div> -->
                                <div
                                    v-if="item.raw.duration <= 15"
                                    style="position: absolute; right: 0; color: #ccc;"
                                    > 
                                    <v-checkbox-btn v-model="item.raw.status" @click="selectMedia(item)"></v-checkbox-btn>
                                </div>
                            </div>    
                        </template>
                    </template>
                </v-data-iterator>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

const partner = reactive({
    selected: null      
})

const items = ref([])
const search = ref('')
const selectedMedia = ref([])

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        loadRecords()
    }
})

const getTitle = (title) => {
    // if (!title || title === undefined) { return '' }
    // const name = title.length > 20 ? title.slice(0, 20) : title
    // const ext = title.slice(title.lastIndexOf('.'))
    // return name + "..." + ext
    return title
}

const getTime = (duration) => {
    return Math.round(duration * 10) / 10
}

const getType = (type) => {
    type = type.split('/')[0]
    switch(type) {
        case 'image':
            return 'Изображение'
        case 'video':
            return 'Видео'
        default:
            return 'Нет данных'
    }
}

const selectMedia = (item) => {
    const id = item.raw.id
    const status = !item.raw.status
    indexStore.display.media = null

    if (status) {
        items.value.forEach((select) => {
            if (select.id != id) {
                select.status = false
            }
        })
        selectedMedia.value = []
        selectedMedia.value.push(item)
        indexStore.order.media = item.raw
    } else {
        indexStore.order.media = null
        const indexToRemove = selectedMedia.value.findIndex(selectedItem => selectedItem.id === id);
        if (indexToRemove !== -1) {
            selectedMedia.value.splice(indexToRemove, 1);
        }
    }
}

const loadRecords = async () => {
    if (userStore.loggedIn && partner.selected && partner.selected.length) {

        items.value = []
        selectedMedia.value = []

        try {
            indexStore.progress = true
            const { data, error } = await userStore.myFetch('/api/media', {
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
                    item.status = false
                })
            }
            indexStore.progress = false
            indexStore.display.media = null

        } catch(e) {
            console.log("GET MEDIA LIST ERROR: ", e)
            indexStore.progress = false
        }
    }
}
</script>

<style lang="scss" scoped>
.item {
    background-color: #fff;
    border-radius: 5px;
    height: 50px;
    width: 50px;
    min-width: 50px;
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
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>