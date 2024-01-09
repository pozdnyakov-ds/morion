<template>
    <client-only>
    <v-navigation-drawer location="right" color="#fff" class="mt-5" temporary width="450"
        style="top: 15px; padding: 15px 0 15px 0; box-shadow: -5px 0 5px #aaa;" v-model="indexStore.elementInfo.visible" text-color="white">
        <div>
            <div class="page-title" style="padding: 20px; margin: 0 0 15px 0; background-color: #E8F0F8;">Данные области</div>
        </div>
        <v-form v-model="valid"> 
            <v-row>
                <v-col cols=6 style="padding: 0 10px 0 10px;">
                    <v-text-field
                        style="margin: 0;"
                        label="Тип объекта"
                        readonly 
                        v-model="recordInfo.type"
                        type="text"
                    ></v-text-field>
                </v-col>
                <v-col cols=6 style="padding: 0 10px 0 10px;">
                    <v-switch
                        v-model="recordInfo.fixed"
                        hide-details
                        inset
                        label="Блокировка"
                        color="#28a745"
                    ></v-switch>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols=6 style="padding: 0 10px 0 10px;">
                    <v-text-field
                        style="margin: 0;"
                        label="Слева, пикс."
                        required
                        v-model="recordInfo.x"
                        type="number"
                        :rules="[required(''), minValue('', 0)]"
                    ></v-text-field>
                </v-col>
                <v-col cols=6 style="padding: 0 10px 0 10px;">
                    <v-text-field
                        style="margin: 0;"
                        label="Сверху, пикс."
                        required
                        v-model="recordInfo.y"
                        type="number"
                        :rules="[required(''), minValue('', 0)]"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols=6 style="padding: 0 10px 0 10px;">
                    <v-text-field
                        style="margin: 0;"
                        label="Ширина, пикс."
                        required
                        v-model="recordInfo.w"
                        type="number"
                        :rules="[required(''), minValue('', 100)]"
                    ></v-text-field>
                </v-col>
                <v-col cols=6 style="padding: 0 10px 0 10px;">
                    <v-text-field
                        style="margin: 0;"
                        label="Высота, пикс."
                        required
                        v-model="recordInfo.h"
                        type="number"
                        :rules="[required(''), minValue('', 100)]"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols=6 style="padding: 0 10px 0 10px;">
                    <v-text-field
                        style="margin: 0;"
                        label="Z-Index"
                        required
                        v-model="recordInfo.zIndex"
                        type="number"
                        :rules="[required(''), minValue('', -999), maxValue('', 999)]"
                    ></v-text-field>
                </v-col>
                <v-col cols=6 style="padding: 0 10px 0 10px; display: flex; justify-content: left;">
                    <div class="color-picker" :style="{ backgroundColor: recordInfo.style.background.color }" @click="showColorPicker = !showColorPicker"></div>
                    <div style="color: #666;">
                        Цвет фона<br>
                        <i @click="showColorPicker = false" v-if="showColorPicker" class="fa-regular fa-square-caret-up" style="cursor: pointer;"><v-tooltip activator="parent" location="top">Закрыть цветовую панель</v-tooltip></i>
                    </div>
                </v-col>
            </v-row>
            <v-row v-if="showColorPicker" style="margin-top: 0;">
                <v-col cols=12 style="padding: 0 10px 0 10px;">
                    <v-color-picker
                        v-model="recordInfo.style.background.color"
                    ></v-color-picker>
                </v-col>
            </v-row>
            <v-row style="margin-top: 0;">
                <v-col cols=12 style="padding: 0 10px 0 10px;">
                    <div style="border: 1px solid #ccc; border-radius: 5px; padding: 10px 0 0 0px;">
                    <div style="font-size: 90%; margin: 0 0 10px 10px;">Контент</div>
                    <div v-if="indexStore.media && indexStore.media.filename && indexStore.media.filename.length" 
                        class="content">
                        <div class="media-picker">
                            <div ref="picType"></div>
                            <div v-if="indexStore.media && indexStore.media.type && indexStore.media.type.includes('image/')" class="media">
                                <img 
                                    :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${indexStore.media.filename}`" 
                                    class="media" 
                                >
                            </div>
                            <div v-else-if="indexStore.media && indexStore.media.type && indexStore.media.type.includes('video/')" class="media">
                                <video class="media">
                                    <source :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${indexStore.media.filename}`" />
                                </video>
                            </div>
                        </div>
                        <div style="color: #666; width: 100%;">{{ getFilename(indexStore.media) }}</div>
                        <div style="display: inline-block;">
                            <div @click="addMedia" style="display: inline-block; color: #666; cursor: pointer; font-size: 150%;"><i class="fa-solid fa-pen-to-square"></i></div>
                            <div @click="deleteMedia" style="display: inline-block; color: #666; cursor: pointer; font-size: 150%;"><i class="fa-solid fa-xmark"></i></div>
                        </div>
                    </div>
                    <div v-else style="width: 100%; text-align: left;">
                        <div @click="addMedia" style="color: #666; border-radius: 5px; border: 1px solid #ccc; background-color: #eee; justify-content: left; margin: 0 10px 10px 10px; padding: 5px 10px 5px 10px; cursor: pointer;">Выбрать...</div>
                    </div>
                    <div v-if="indexStore.media.filename">
                        <v-radio-group inline v-model="recordInfo.imageMode">
                            <v-radio label="Оригинал" value="0" style="font-size: 80%;"><template v-slot:label><div style="font-size: 80%;">Оригинал</div></template></v-radio>
                            <v-radio label="Растянуть" value="1" style="font-size: 80%;"><template v-slot:label><div style="font-size: 80%;">Растянуть</div></template></v-radio>
                            <v-radio label="Обрезать" value="2" style="font-size: 80%;"><template v-slot:label><div style="font-size: 80%;">Обрезать</div></template></v-radio>
                        </v-radio-group>
                    </div>
                </div>    
                </v-col>    
            </v-row>    
            <v-row style="margin-top: 10px;">  
                <v-col cols=12 style="padding: 0 10px 0 10px;">  
                    <div style="border: 1px solid #ccc; border-radius: 5px; padding: 10px 0 0 5px;">
                    <div style="font-size: 90%; margin: 0 0 10px 10px;">Параметры рамки</div>
                    <div style="width: 100%; margin-top: 0px; display: flex; justify-content: space-between; padding: 0 10px 0 5px;">
                        <div class="color-picker" 
                            :style="{ backgroundColor: '#eee',
                                borderColor: recordInfo.style.border.color, 
                                borderWidth: recordInfo.style.border.width + 'px', 
                                borderRadius: recordInfo.style.border.radius + 'px',
                                borderStyle: recordInfo.style.border.type }" 
                            @click="showBorderPicker = !showBorderPicker"></div>
                        <v-text-field
                            style="margin: 0; margin-left: 10px;"
                            label="Толщина, пикс."
                            required
                            v-model="recordInfo.style.border.width"
                            type="number"
                            :rules="[required(''), minValue('', 0)]"
                        ></v-text-field>
                        <v-text-field
                            style="margin: 0; margin-left: 20px;"
                            label="Радиус, пикс."
                            required
                            v-model="recordInfo.style.border.radius"
                            type="number"
                            :rules="[required(''), minValue('', 0)]"
                        ></v-text-field>
                    </div>
                    <div v-if="showBorderPicker" style="margin-top: 0; padding: 0 10px 0 10px;">
                        <v-color-picker
                            v-model="recordInfo.style.border.color"
                        ></v-color-picker>
                    </div>
                </div>    
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-btn @click="saveData" block style="background-color: #28a745; color: #fff;">Сохранить</v-btn>
                    <v-btn @click="closeAll" block style="background-color: #999; color: #fff; margin-top: 10px;">Закрыть</v-btn>
                </v-col>
            </v-row>
        </v-form>

    </v-navigation-drawer>
    </client-only>
</template>

<script setup>
import randomId from '~/config/misc';

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRouter()
const valid = ref(false)
const message = ref('')

const showColorPicker = ref(false)
const showBorderPicker = ref(false)
const picType = ref(null)

const partner = reactive({
    selected: null
})
partner.selected = userStore.partner

const recordInfo = reactive({
    id: null,
    type: null,
    fixed: null,
    x: null,
    y: null,
    w: null,
    h: null,
    isActive: false,
    isMenu: false,
    zIndex: 1,
    imageMode: '2',
    code: null,
    style: {
        background: { color: 'transparent' },
        border: { color: 'transparent', width: 0, type: 'solid', radius: 0 },
        // shadow: { x: null, y: null, blur: null, color: null, opacity: null },
    }    
})

const dialog = reactive({
    view: false
})

onMounted(() => {
    //..
})

const required = () => {
	return v => v != null || 'Указать значение'
}
const requiredResolution = [
	(v) => v != null || 'Выбрать значение'
]
const minLength = (propertyType, minLength) => {
	return v => v && v.length >= minLength || `Длина не меньше ${minLength}`
}
const maxLength = (propertyType, maxLength) => {
	return v => v && v.length <= maxLength || `Длина не больше ${maxLength}`
}
const minValue = (propertyType, minValue) => {
	return v => v && v >= minValue || `Не меньше ${minValue}`
}
const maxValue = (propertyType, maxValue) => {
	return v => v && v <= maxValue || `Не больше ${maxValue}`
}

const getFilename = (item) => {
    let typeString = ''
    let result = ''
    let type = item.type
    if (item.type.includes('image')) type = 'image'
    if (item.type.includes('video')) type = 'video'

    switch (type) {
        case 'image':
            typeString = 'Изображение'
            if (picType.value) picType.value.innerHTML = ''
            result = item.filename.length >=20 ? '[' + typeString + ']: ' + item.filename.substring(0, 20) + '...' : '[' + typeString + ']: ' + item.filename
            break
        case 'video':
            typeString = 'Видео'
            if (picType.value) picType.value.innerHTML = ''
            result = item.filename.length >=20 ? '[' + typeString + ']: ' + item.filename.substring(0, 20) + '...' : '[' + typeString + ']: ' + item.filename
            break
        case 'playlist':
            typeString = 'Плейлист'
            if (picType.value) picType.value.innerHTML = '<i class="fa-solid fa-list"></i>'
            result = '[' + typeString + ']'
            break
        case 'marquee':
            typeString = 'Бегущая строка'
            if (picType.value) picType.value.innerHTML = '<i class="fa-regular fa-closed-captioning"></i>'
            result = '[' + typeString + ']'
            break
        case 'html':
            typeString = 'HTML'
            if (picType.value) picType.value.innerHTML = '<i class="fa-solid fa-code"></i>'
            result = '[' + typeString + ']'
            break
        case 'link':
            typeString = 'Ссылка'
            if (picType.value) picType.value.innerHTML = '<i class="fa-solid fa-link"></i>'
            result = '[' + typeString + ']'
            break
    }
    return result
}

const dialog_action_no = () => {
    dialog.view = false
}

const deleteMedia = () => {
    indexStore.media = {
        direct: true,
        id: null,
        filename: null,
        type: null,
        duration: null,
        code: null
    }
}

const addMedia = () => {
    indexStore.media.direct = false
    indexStore.elementAdd.key = randomId(32)
    indexStore.elementAdd.visible = true
}

const closeAll = () => {
    indexStore.elementInfo.visible = false
    indexStore.elementAdd.visible = false
}

const loadData = async () => {
    if (!indexStore.elementInfo.visible) return

    const content = indexStore.layout.content ? indexStore.layout.content : []

    var element = null
    content.forEach((el) => {
        if (el.id == indexStore.elementInfo.id) {
            element = JSON.parse(JSON.stringify(el))   //{ ...el }
            return
        }
    })

    // console.log("LOAD ELEMENT: ", element)

    recordInfo.id = element.id
    recordInfo.type = element.type
    recordInfo.fixed = element.fixed ? element.fixed : false
    recordInfo.x = (element.x / indexStore.layout.container.coef).toFixed(2) 
    recordInfo.y = (element.y / indexStore.layout.container.coef).toFixed(2)
    recordInfo.w = (element.w / indexStore.layout.container.coef).toFixed(2)
    recordInfo.h = (element.h / indexStore.layout.container.coef).toFixed(2)
    recordInfo.isMenu = false
    recordInfo.zIndex = element.zIndex
    recordInfo.imageMode = element.imageMode ? element.imageMode : '2'
    recordInfo.style = element.style
    recordInfo.media = element.media

    indexStore.media = element.media
}

loadData()

const saveData = async () => {
    if (indexStore.layout.content && indexStore.layout.content.length) {
        indexStore.layout.content.forEach((el, index) => {
            if (el.id == indexStore.elementInfo.id) {

                indexStore.layout.content[index].x = Math.floor(recordInfo.x) * indexStore.layout.container.coef
                indexStore.layout.content[index].y = Math.floor(recordInfo.y) * indexStore.layout.container.coef
                indexStore.layout.content[index].w = Math.floor(recordInfo.w) * indexStore.layout.container.coef
                indexStore.layout.content[index].h = Math.floor(recordInfo.h) * indexStore.layout.container.coef
                indexStore.layout.content[index].fixed = recordInfo.fixed
                indexStore.layout.content[index].zIndex = recordInfo.zIndex
                indexStore.layout.content[index].imageMode = recordInfo.imageMode ? recordInfo.imageMode : '2'
                indexStore.layout.content[index].style = recordInfo.style
                indexStore.layout.content[index].media = indexStore.media

                //console.log("TRY TO SAVE: ", indexStore.layout.content[index])
                return
            }
        })
    }

    indexStore.elementInfo.visible = false
    useNuxtApp().$toast.success('Данные сохранены')
}

</script>

<style lang="scss" scoped>
.content {
    width: 100%; 
    display: flex; 
    padding: 0 10px 0 5px;
    justify-content: space-between;
}
.color-picker {
    border: 1px solid #ccc;
    width: 50px;
    min-width: 50px;
    height: 50px;
    min-height: 50px;
    border-radius: 5px;
    margin-right: 10px;
}
.media-picker {
    border: 1px solid #ccc;
    width: 50px;
    min-width: 50px;
    height: 50px;
    border-radius: 5px;
    margin: 0 10px 0 5px;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center; 
    justify-content: center;
}
.media {
    width: 100%; 
    height: 100%;
    object-fit: cover;
    display: block;
}
</style>