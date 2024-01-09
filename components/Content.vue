<template>
    <div>
        <div style="width: 100%; text-align: right; padding-right: 30px;">
            Масштаб: {{ indexStore.layout.container.coef.toFixed(2) }} | 
            {{ getLayoutData() }}
            <v-btn @click="saveContent" style="margin-left: 10px; background-color: #28a745; color: #fff;">Сохранить</v-btn>
            <nuxt-link to="/clients/layouts"><v-btn style="margin-left: 10px; background-color: #aaa; color: #fff;">Закрыть</v-btn></nuxt-link>
        </div>
        
        <v-container style="padding: 0px; margin: 0;">
            <v-row style="margin: 0 20px 0 30px;">
                <v-col cols="12">
                    <div>
                    <client-only>    
                    <DraggableResizableContainer 
                        :style="indexStore.layout.container.style"
                        :key="indexStore.layout.container.key" 
                        class="container"
                        >

                        <div class="content-toolbar">
                            <div class="content-toolbar-item"><i @click="addElement" class="fa-regular fa-square-plus">
                                <v-tooltip activator="parent" location="top">Создать область</v-tooltip></i></div>
                            <div class="content-toolbar-item"><i @click="indexStore.layoutInfo.visible = true" class="fa-solid fa-circle-info">
                                <v-tooltip activator="parent" location="top">Данные макета</v-tooltip></i></div>
                            <!--<div class="content-toolbar-item"><i @click="zoomIn" class="fa-solid fa-magnifying-glass-plus">
                                <v-tooltip activator="parent" location="top">Увеличить масштаб</v-tooltip></i></div>
                            <div class="content-toolbar-item"><i @click="zoomOut" class="fa-solid fa-magnifying-glass-minus">
                                <v-tooltip activator="parent" location="top">Уменьшить масштаб</v-tooltip></i></div>     -->
                        </div>

                        <!-- <div class="element-info">
                            w: {{ indexStore.layout.content.container && indexStore.layout.content.container.style && indexStore.layout.content.container.style.width ? (indexStore.layout.content.container.style.width.slice(0, -2) / indexStore.layout.container.coef).toFixed(0) + 'px' : NaN }}<br> 
                            h: {{ indexStore.layout.content.container && indexStore.layout.content.container.style && indexStore.layout.content.container.style.height ? (indexStore.layout.content.container.style.height.slice(0, -2) / indexStore.layout.container.coef).toFixed(0) + 'px' : NaN }}<br>
                        </div> -->

                        <draggable-resizable-vue v-for="item in indexStore.layout.content" 
                            :key="item.id"
                            :style="{ 
                                backgroundColor: item.style.background.color,
                                borderColor: item.style.border.color, 
                                borderWidth: item.style.border.width + 'px', 
                                borderRadius: item.style.border.radius + 'px',
                                borderStyle: item.style.border.type
                             }"
                            @activated="onActivated(item.id, item.x, item.y)"
                            @deactivated="onDeactivated(item.id, item.x, item.y)"
                            @dblclick.prevent="infoElement(item.id)"
                            v-model:id="item.id"
                            v-model:x="item.x"
                            v-model:y="item.y"
                            v-model:w="item.w"
                            v-model:h="item.h"
                            v-model:active="item.active"
                            :min-width="50"
                            :min-height="50"
                            :z="item.zIndex * 1"
                            :draggable="!item.fixed"
                            :resizable="!item.fixed"
                            :parent="true"
                            class="el"
                        >

                        <div v-if="item.media && item.media && item.media.type && item.media.type.includes('image/')" class="media" 
                            :style="getMediaStyle(item.imageMode)" :key="item.media.id">
                            <img 
                                :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${item.media.filename}`" 
                                class="media-item"
                                :style="getMediaItemStyle(item.imageMode)"
                            >
                        </div>
                        <div v-if="item.media && item.media && item.media.type && item.media.type.includes('video/')" class="media" 
                            :style="getMediaStyle(item.imageMode)" :key="item.media.id">
                            <video 
                                class="media-item"
                                :style="getMediaItemStyle(item.imageMode)"
                            >
                                <source :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${item.media.filename}`" />
                            </video>
                        </div>
                        
                        <div class="element-toolbar" v-show="item.isMenu">
                            <div class="content-toolbar-item"><i @click="addContent(item.id)" class="fa-regular fa-square-plus"><v-tooltip activator="parent" location="top">Добавить контент для области</v-tooltip></i></div>
                            <div class="content-toolbar-item"><i @click="infoElement(item.id)" class="fa-solid fa-circle-info"><v-tooltip activator="parent" location="top">Данные области</v-tooltip></i></div>
                            <div class="content-toolbar-item"><i @click="upElement(item.id)" class="fa-regular fa-square-caret-up"><v-tooltip activator="parent" location="top">Поднять область выше</v-tooltip></i></div>
                            <div class="content-toolbar-item"><i @click="downElement(item.id)" class="fa-regular fa-square-caret-down"><v-tooltip activator="parent" location="top">Опустить область ниже</v-tooltip></i></div>
                            <div class="content-toolbar-item"><i @click="deleteElement(item.id)" class="fa-solid fa-trash-can"><v-tooltip activator="parent" location="top">Удалить область</v-tooltip></i></div>
                        </div>

                        <div class="element-info">
                            <div style="background-color: #ffffff66; border-radius: 5px; padding: 10px; height: 120px; overflow: hidden;">
                                x: {{ (item.x / indexStore.layout.container.coef).toFixed(0) }} | y: {{ (item.y / indexStore.layout.container.coef).toFixed(0) }} | 
                                w: {{ (item.w / indexStore.layout.container.coef).toFixed(0) }} | h: {{ (item.h / indexStore.layout.container.coef).toFixed(0) }}<br>
                                media: {{ item.media.filename ? item.media.filename : '-' }}<br> 
                                type: {{ item.media.type ? item.media.type : '-' }}<br>
                                <!-- code: {{ item.media.code ? item.media.code : '-' }}<br> -->
                                fixed: {{ item.fixed ? item.fixed : false }}<br>
                                z-index: {{ item.zIndex }}<br>
                                <!-- time: {{ item.media.duration ? item.media.duration : '-' }}<br> -->
                                <!-- style: {{ item.style }}<br>
                                imageMode: {{ item.imageMode ? item.imageMode : '-' }} -->
                            </div>
                        </div>

                        </draggable-resizable-vue>

                        {{ message }}

                    </DraggableResizableContainer>
                    </client-only>
                    </div>
                </v-col>
            </v-row>
        </v-container>

        <!-- <ElementAdd :id="indexStore.elementAdd.id" :key="indexStore.elementAdd.key" /> -->
        <ElementInfo :key="indexStore.elementInfo.key" />
        <ElementAdd :id="indexStore.elementAdd.id" />

    </div>
</template>

<script setup>
import { DraggableResizableVue, DraggableResizableContainer } from 'draggable-resizable-vue3'
import randomId from "../config/misc"

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
const router = useRouter()

const message = ref(null)
const tab = ref(null)
indexStore.elementAdd.id = null
indexStore.elementAdd.key = randomId(32)

indexStore.elementInfo.id = null
indexStore.elementInfo.key = randomId(32)

indexStore.elementAdd.visible = false
indexStore.elementInfo.visible = false

const props = defineProps({
    id: String,
})
const id = ref(props && props.id ? props.id : null)

const partner = reactive({
    selected: false
})
partner.selected = userStore.partner

const getLayoutData = () => {
    var width = 0
    var height = 0
    if (indexStore.layout.container.ratio != 99) {
        width = indexStore.layout.container.resolution_width
        height = indexStore.layout.container.resolution_height
        return width + "x" + height
    }
    if (indexStore.layout.container.ratio == 99) {
        width = indexStore.layout.container.width
        height = indexStore.layout.container.height
        return width + "x" + height
    }
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

// const zoomIn = () => {
//     // $('.DraggableResizableContainer').fadeOut("normal", () => {
//         indexStore.layout.container.coef = 1.1
//         indexStore.layout.content.container.style.width = (recordInfo.layout_width * indexStore.layout.container.coef) + 'px'
//         indexStore.layout.content.container.style.height = (recordInfo.layout_height * indexStore.layout.container.coef) + 'px'

//         indexStore.layout.content.forEach((el, index) => {
//             indexStore.layout.content[index].x =  el.x * indexStore.layout.container.coef
//             indexStore.layout.content[index].y =  el.y * indexStore.layout.container.coef
//             indexStore.layout.content[index].w =  el.w * indexStore.layout.container.coef
//             indexStore.layout.content[index].h =  el.h * indexStore.layout.container.coef
        
//         })
        
//     //     $('.DraggableResizableContainer').fadeIn("normal")
//     // })
// }

// const zoomOut = () => {
//     // $('.DraggableResizableContainer').fadeOut("normal", () => {
//         indexStore.layout.container.coef = 1.1
//         indexStore.layout.content.container.style.width = (recordInfo.layout_width / indexStore.layout.container.coef) + 'px'
//         indexStore.layout.content.container.style.height = (recordInfo.layout_height / indexStore.layout.container.coef) + 'px'

//         indexStore.layout.content.forEach((el, index) => {
//             indexStore.layout.content[index].x =  el.x / indexStore.layout.container.coef
//             indexStore.layout.content[index].y =  el.y / indexStore.layout.container.coef
//             indexStore.layout.content[index].w =  el.w / indexStore.layout.container.coef
//             indexStore.layout.content[index].h =  el.h / indexStore.layout.container.coef
        
//         })

//     //     $('.DraggableResizableContainer').fadeIn("normal")
//     // })
// }

const saveContent = async () => {
    const content = []

    if (indexStore.layout.content && indexStore.layout.content.length >=0) {
        indexStore.layout.content.forEach((el) => {
            const item = JSON.parse(JSON.stringify(el))
            item.x =  el.x / indexStore.layout.container.coef
            item.y =  el.y / indexStore.layout.container.coef
            item.w =  el.w / indexStore.layout.container.coef
            item.h =  el.h / indexStore.layout.container.coef

            content.push(item)
        })
    }

    // try {
        indexStore.progress = true
        const { data, error } = await useFetch('/api/layouts', { 
            method: 'post', 
            body: { 
                action: 'content.save', 
                id: id.value,
                content: JSON.stringify(content),
            } 
        })
        indexStore.progress = false

        if (data.value && data.value.code == 200) {
            const code = data.value.code
            useNuxtApp().$toast.success('Данные сохранены')

        } else {
            useNuxtApp().$toast.error('Ошибка сохранения данных')
            message.value = (error.value) ? error.value : ''
        }

    // } catch (e) {
    //     message.value = e
    // 	indexStore.progress = false
    // }
}

var recordInfo = reactive({
    id: null,
    name: '',
    description: null,
    partner: null,
    ratio: null,
    ratio_width: null,
    ratio_height: null,
    resolution: null,
    resolution_width: null,
    resolution_height: null,
    layout_width: null,
    layout_height: null,
    content: null,
    created_at: null,
    status: 0,
})

onMounted(() => {
    //...
})

const addElement = () => {
    const el = {
        id: randomId(32),
        type: 'Область',
        fixed: false,
        x: 20,
        y: 20,
        w: 300,
        h: 200,
        isActive: true,
        zIndex: 1,
        isMenu: false,
        imageMode: 0,
        media: {
            type: null,
            filename: null,
            id: null,
            stratch: null,
            duration: null
        },
        style: {
            background: { color: 'transparent' },
            border: { color: 'transparent', type: 'solid', width: 0, radius: 0 },
            shadow: {}
        }
    }
    // console.log("CONTENT: ", indexStore.layout.content)
    indexStore.layout.content.push(el)
}

const infoElement = (id) => {
    indexStore.elementAdd.id = id
    indexStore.elementInfo.id = id
    indexStore.media.direct = false
    indexStore.elementInfo.key = randomId(32)
    indexStore.elementInfo.visible = true
}

const upElement = (id) => {
    indexStore.layout.content.forEach((item) => {
        if (item.id == id) {
            item.zIndex = item.zIndex + 1
        }
    })
}

const downElement = (id) => {
    indexStore.layout.content.forEach((item) => {
        if (item.id == id) {
            item.zIndex = item.zIndex - 1
        }
    })
}

const deleteElement = (id) => {
    const els = []
    indexStore.layout.content.forEach((item) => {
        if (item.id != id) {
            els.push(item)
        }
    })
    indexStore.layout.content = els
}

const addContent = (id) => {
    indexStore.media.direct = true
    // console.log("DIRECT ADD TO ELEMENT: ", indexStore.media.direct)
    indexStore.elementAdd.key = ref(randomId(32))
    indexStore.elementAdd.id = id
    indexStore.elementInfo.id = id
    indexStore.elementAdd.visible = true
}

const onActivated = (id, x, y) => {
    if (indexStore.layout.content && indexStore.layout.content.length) {
        indexStore.layout.content.forEach((el) => {
            if (el.id == id) {
                el.isMenu = true
            }
        })
    }
}

const onDeactivated = (id, x, y) => {
    if (indexStore.layout.content && indexStore.layout.content.length) {
        indexStore.layout.content.forEach((el) => {
            el.isMenu = false
        })
    }
}

</script>

<style lang="scss" scoped>
.container {
    background-color: '#fff';
    border: 1px solid #ccc;
    box-shadow: 5px 5px 5px #ccc;
}
.content {
    background-color: #fff;
    width: 100%;
    min-width: 100px;
    min-height: 100px;
    height: 0;
    padding-bottom: 56.25%;
    border: 2px solid #ccc;
    position: relative;
    margin-top: 10px;
}
.content-toolbar {
    position: absolute;
    top: 0px;
    height: 30px;
    left: -35px;
    flex-wrap: nowrap;
    padding: 0 0 0 10px;
    background-color: #ffffff66;
    z-index: 999;
}
.content-info {
    position: absolute;
    border: 1px solid #ccc; 
    border-radius: 0 0 5px 0;
    top: 5px;
    left: 5px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    padding: 5px;
    background-color: #ffffff66;
    display: flex;
    font-size: small;
}
.content-toolbar-item {
    margin: 0;
    color: #666;
    font-size: large;
    cursor: pointer;
    margin-right: 10px;
}
.element-toolbar {
    position: absolute;
    border: 1px solid #ccc; 
    border-radius: 0 5px 0 0;
    top: -35px;
    height: 30px;
    left: 10px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    padding: 0 0 0 10px;
    background-color: #ffffff99;
    z-index: 999;
    display: flex;
    justify-content: center;
}
.element-toolbar-item {
    margin: 0 10px 0 0;
    color: #333;
    cursor: pointer;
}
.element-info {
    position: absolute;
    outline: 1px solid #ccc;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    padding: 10px 10px 10px 10px;
    display: flex;
    font-size: small;
}
.el {
    border: 1px solid #ccc;
    background-color: #eee;
}
.media {
    width: 100%;
    height: 100%;
}
.media-item {
    width: 100%; 
    height: auto;
}
</style>