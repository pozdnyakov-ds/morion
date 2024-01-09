<template>
    <div>
        <v-row style="margin: 0;">
            <v-col style="padding: 20px 20px 0 20px;">
                <b>Список сообщений хранится в разделе "Сообщения"</b><br><br>
                <!-- <div 
                    v-for="item in items" 
                    :key="item"
                >
                    {{ item.name }}
                    <div style="color: #666; font-size: 90%; margin: 0 0 20px 0;">{{ item.code }}</div>
                </div> -->
            </v-col>
        </v-row>
        <v-row>
            <v-col style="padding: 0 20px 0 20px;">
                <v-text-field
                    style="margin: 0;"
                    label="Размер текста, пт"
                    required
                    v-model="recordInfo.fontSize"
                    type="number"
                    :rules="[required(''), minValue('', 1)]"
                ></v-text-field>
            </v-col>    
            <v-col style="padding: 0 20px 0 20px;">
                <v-text-field
                    style="margin: 0;"
                    label="Скорость"
                    required
                    v-model="recordInfo.duration"
                    type="number"
                    :rules="[required(''), minValue('', 1)]"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>    
            <v-col style="padding: 0 20px 0 20px;">
                Цвет текста по-умолчанию
                <div class="color-picker" :style="{ backgroundColor: recordInfo.color, margin: '10px 0 0 0' }" @click="showColorPicker = !showColorPicker"></div>
                <v-color-picker
                    v-if="showColorPicker"
                    v-model="recordInfo.color"
                    style="margin: 20px 0 0 0;"
                ></v-color-picker>
            </v-col>
        </v-row>    
        <v-row>    
            <v-col style="padding: 0 20px 0 20px;">
                <v-switch
                    v-model="recordInfo.vertical"
                    hide-details
                    inset
                    label="Вертикальное движение"
                    color="#28a745"
                ></v-switch>
                <v-switch
                    v-model="recordInfo.direction"
                    hide-details
                    inset
                    label="Обратное движение"
                    color="#28a745"
                ></v-switch>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn @click="saveData" block style="background-color: #28a745; color: #fff;">Сохранить</v-btn>
                <v-btn @click="indexStore.elementAdd.visible = false" block style="background-color: #999; color: #fff; margin-top: 10px;">Закрыть</v-btn>
            </v-col>
        </v-row>

    </div>
</template>

<script setup>
import randomId from '~/config/misc'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

const items = ref([])
const showColorPicker = ref(false)

const partner = reactive({
    selected: null      
})

const region = reactive({
    id: null,
    data: {},
    link: null
})
region.id = indexStore.elementAdd.id

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        loadData()
    }
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

const recordInfo = reactive({
    fontSize: 32,
    duration: 10,
    vertical: false,
    direction: false,
    color: '#fff' 
})

const loadData = async () => {
    if (indexStore.layout.content.length) {
        indexStore.layout.content.forEach((item, index) => {
            if (region.id == item.id) {
                    if (item.media.type == 'marquee' && item.media.code) {
                        recordInfo.fontSize = item.media.code.fontSize
                        recordInfo.duration = item.media.code.duration
                        recordInfo.vertical = item.media.code.vertical
                        recordInfo.direction = item.media.code.direction
                        recordInfo.color = item.media.code.color
                    } else {
                        recordInfo.fontSize = 32
                        recordInfo.duration = 10
                        recordInfo.vertical = false
                        recordInfo.direction = false 
                        recordInfo.color = '#fff'
                    }
                    console.log("LOAD MARQUEE: ", recordInfo)
            }
        })
    }
}

const saveData = () => {
    if (indexStore.layout.content.length) {
        indexStore.layout.content.forEach((el, index) => {
            if (region.id == indexStore.elementAdd.id) {
                if (indexStore.media.direct) {
                    indexStore.layout.content[index].media.id = null
                    indexStore.layout.content[index].media.type = 'marquee'
                    indexStore.layout.content[index].media.filename = 'Marquee'
                    indexStore.layout.content[index].media.duration = 0
                    indexStore.layout.content[index].media.code = recordInfo

                    indexStore.layout.content[index].imageMode = '2'
                } else {
                    indexStore.media.id = null
                    indexStore.media.type = 'marquee'
                    indexStore.media.filename = 'Marquee'
                    indexStore.media.duration = 0
                    indexStore.media.code = recordInfo
                }
            }
        })
    }
    indexStore.elementAdd.visible = false
}
</script>

<style lang="scss" scoped>
.color-picker {
    border: 1px solid #ccc;
    width: 50px;
    min-width: 50px;
    height: 50px;
    min-height: 50px;
    border-radius: 5px;
    margin-right: 10px;
}
</style>