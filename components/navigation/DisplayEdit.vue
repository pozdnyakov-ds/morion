<template>
    <v-navigation-drawer 
        location="right" 
        color="#fff" 
        class="mt-5" 
        temporary 
        width="400"
        style="top: 15px; padding: 15px 0 15px 0; box-shadow: -5px 0 5px #aaa;" 
        v-model="indexStore.displayEdit.visible" 
        text-color="white"
    >
    <div>
        <div class="page-title" style="padding: 20px; margin: 0px; background-color: #9ce9bf;">Редактировать дисплей</div>
        <YandexMap :key="indexStore.display.key"/>

        <v-form v-model="valid">
            <v-row>
                <v-col cols="12">
                    <v-text-field
                        style="width: 100%;"
                        label="Наименование"
                        required
                        variant="outlined"
                        v-model="recordInfo.name"
                        :rules="[required(''), minLength('', 3), maxLength('', 64)]"
                    ></v-text-field>
                    <v-text-field
                        style="width: 100%;"
                        label="Описание (до 255 символов)"
                        variant="outlined"
                        v-model="recordInfo.description"
                    ></v-text-field>
                </v-col>
            </v-row>    
            <v-row>
                <v-col cols="6">
                    <v-select
                        label="Группы дисплеев"
                        :items="group.groups"
                        v-model="group.selected"
                        item-title="name"
                        item-value="id"
                        variant="outlined"
                    ></v-select>
                </v-col> 
                <v-col cols="6">    
                    <v-select
                        label="Выбрать макет"
                        :items="layout.layouts"
                        v-model="layout.selected"
                        item-title="name"
                        item-value="id"
                        variant="outlined"
                    ></v-select>
                </v-col>
            </v-row>    
            <v-row>
                <v-col cols="12">
                    <v-checkbox-btn v-model="recordInfo.type" style="margin-bottom: 20px;" label="Участие в рекламной сети"></v-checkbox-btn>
                </v-col>
            </v-row>    
            <v-row v-if="recordInfo.type" style="margin: 0 0 20px 0;">
                <v-col cols="12">
                    <span style="font-size: 90%;"> Расписание работы экрана определяется расписанием, назначенным для плейлиста действующего макета.</span>
                </v-col>
            </v-row>    
            <v-row v-if="recordInfo.type">    
                <v-col cols="6">
                    <v-text-field
                        type="number"
                        style="margin-right: 10px;"
                        label="Ставка, руб."
                        variant="outlined"
                        min="180"
                        v-model="recordInfo.rate"
                        :rules="[required(''), minValue('', 180)]"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">        
                    <span style="font-size: 80%;"> Ставка за 1000 показов. Мин. значение 180 руб.</span>
                </v-col>
            </v-row>            
            <v-row>
                <v-col cols="12">    
                    <span v-if="addressValid < 0" style="color: orange">Адрес не существует</span>
                    <span v-else-if="addressValid > 0"  style="color: green">Адрес верен</span>
                    <span v-else style="color: orange;">Перед сохранением проверить адрес!</span>

                    <v-text-field
                        style="min-width: 300px; width: 100%; margin-top: 10px;"
                        label="Адрес"
                        v-model="recordInfo.address"
                        :rules="[required(''), minLength('', 1), maxLength('', 255)]"
                        append-inner-icon="fa-solid fa-magnifying-glass"
                        @click:append-inner="checkAddress"
                        variant="outlined"
                    ></v-text-field>
                    <v-text-field
                        style="min-width: 300px; width: 100%; margin-top: 10px;"
                        label="Координаты"
                        readonly
                        v-model="recordInfo.geo"
                        variant="outlined"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-card-actions style="margin-bottom: 20px;">
                <v-spacer></v-spacer>
                <v-btn color="green-darken-1" variant="text" @click="submitForm" :disabled="!valid || !group.selected || !layout.selected || addressValid != 1">Сохранить</v-btn>
                <v-btn color="green-darken-1" variant="text" @click="dialog_action_cancel">Отмена</v-btn>
            </v-card-actions>
        </v-form>
    </div>
    </v-navigation-drawer>
</template>

<script setup>
import YandexMap from './YandexMap.vue'
import randomId from '~/config/misc'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

var map = shallowRef(null)
const address = ref(null)
const restrictArea = ref(null)

const valid = ref(false)
const addressValid = ref(0)
const message = ref('')

const partner = reactive({
    selected: null,
})

const recordInfo = reactive({
    id: null,
    name: null,
    description: null,
    group: null,
    layout: null,
    type: 0,
    address: null,
    geo: null,
    partner: (partner.selected) ? partner.selected : null,
    created_at: null,
    status: true,
    rate: 180
})

const group = reactive({
    selected: null,
    default: null,
    groups: []
})

const layout = reactive({
    selected: null,
    default: null,
    layouts: [],
})

watch(() => recordInfo.address, () => {
    addressValid.value = 0
})

const setPoint = (point) => {
    indexStore.display.coordinates = point
    indexStore.display.key = randomId(32)
    recordInfo.geo = point
}

const required = () => {
	return v => v && v.length > 0 || 'Указать значение'
}
const minLength = (propertyType, minLength) => {
	return v => v && v.length >= minLength || `Не меньше ${minLength} символов`
}
const maxLength = (propertyType, maxLength) => {
	return v => v && v.length <= maxLength || `Не больше ${maxLength} символов`
}
const minValue = (propertyType, minValue) => {
	return v => v && v >= minValue || `Не меньше ${minValue} пикселей`
}

watch(valid, (n, o) => {
    if (o === false && n === null && recordInfo.name && recordInfo.name.length) {
        valid.value = true
    }
})

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
    recordInfo.id = indexStore.displayEdit.data
})

watch(() => partner.selected, (n, o) => {
    if (o != n && indexStore.displayEdit.visible) {
        loadGroups()
        loadLayouts()
        loadData()
    }
})

const checkAddress = async () => {
    if (!recordInfo.address || !recordInfo.address.length) {
        return 
    }
    
    // try {
        const response = await fetch(`/api/yandex`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'get.coords',
                address: recordInfo.address,
                kind: 'house'
            })
        })
        if (!response.ok) {
        throw new Error('Request failed');
        }
        const data = await response.json();
        //console.log("featureMember: ", data.data.response.GeoObjectCollection.featureMember[0].GeoObject)
        //console.log("metaDataProperty: ", data.data.response.GeoObjectCollection.metaDataProperty.GeocoderResponseMetaData)

        if (data.data.response && data.data.response.GeoObjectCollection && 
        data.data.response.GeoObjectCollection.featureMember && 
        data.data.response.GeoObjectCollection.featureMember[0] && 
        data.data.response.GeoObjectCollection.featureMember[0].GeoObject) {
            const envelope = data.data.response.GeoObjectCollection.featureMember[0].GeoObject.boundedBy.Envelope
            restrictArea.value = [envelope.lowerCorner.split(' '), envelope.upperCorner.split(' ')]
            //console.log("restrictArea: ", restrictArea.value[0])
                
            const arr = data.data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(" ")
            console.log("Координаты: ", arr)
            setPoint(arr)
            addressValid.value = 1

        } else {
            addressValid.value = -1
        }
      
    // } catch (err) {
    //     console.log("FRONT ERROR: ", err.message)
    // }
}

const loadGroups = async () => {
    group.groups = []
    try {
        indexStore.progress = true
        message.value = ''
        const { data, error } = await useFetch('/api/groups', { 
            method: 'post', 
            body: { 
                action: 'index.list', 
                partner: partner.selected
            } 
        })
        indexStore.progress = false
        // console.log("loadGroups: ", partner.selected, data.value)
        if (data.value && data.value.code == 200) {
            data.value.data.forEach((item) => {
                group.groups.push(item)
            })

        } else {
            message.value = (error.value) ? error.value : ''
        }

    } catch (e) {
        message.value = e
        indexStore.progress = false
    }
}

const loadLayouts = async () => {
    layout.layouts = []

    try {
        indexStore.progress = true
        message.value = ''
        const { data, error } = await useFetch('/api/layouts', { 
            method: 'post', 
            body: { 
                action: 'index.list', 
                partner: partner.selected
            } 
        })
        indexStore.progress = false
        if (data.value && data.value.code == 200) {
            data.value.data.forEach((item) => {
                layout.layouts.push(item)
            })

        } else {
            message.value = (error.value) ? error.value : ''
        }
    } catch (e) {
        message.value = e
        indexStore.progress = false
    }
}

const loadData = async () => {
    recordInfo.name = null
    recordInfo.description = null
    recordInfo.group = null
    recordInfo.layout = null
    recordInfo.type = false
    recordInfo.address = null
    recordInfo.geo = null
    recordInfo.partner = null
    recordInfo.created_at = null
    recordInfo.status = null
    recordInfo.rate = 180

    try {
        indexStore.progress = true
        message.value = ''
        const { data, error } = await useFetch('/api/displays', { 
            method: 'post', 
            body: { 
                action: 'index.get', 
                id: recordInfo.id
            } 
        })
        indexStore.progress = false
        if (data.value && data.value.code == 200) {
            console.log("RECORD: ", data.value.data[0])
            const record = data.value.data[0]
            recordInfo.name = record.name
            recordInfo.description = record.description
            recordInfo.group = record.display_group
            group.selected = record.display_group
            recordInfo.layout = record.layout
            layout.selected = record.layout
            recordInfo.type = record.type ? true : false
            recordInfo.address = record.address
            recordInfo.geo = record.geo
            recordInfo.rate = record.rate

            if (recordInfo.geo && recordInfo.geo.length) {
                setPoint(JSON.parse(recordInfo.geo))
            } else {
                setPoint(null)
            }
            
        } else {
            message.value = (error.value) ? error.value : ''
        }
    } catch (e) {
        message.value = e
        indexStore.progress = false
    }
}

const submitForm = async () => {
    const id = recordInfo.id ? recordInfo.id : null

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/displays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'index.save',
                id: id,
                name: recordInfo.name,
                description: recordInfo.description,
                address: recordInfo.address,
                geo: recordInfo.geo,
                rate: recordInfo.rate,
                group: group.selected,
                layout: layout.selected,
                type: recordInfo.type ? 1 : 0
            }),
        })
        if (data.value.code == 200) {
            useNuxtApp().$toast.success('Запись обновлена');
            indexStore.displayEdit.reload = randomId(32)
            indexStore.displayEdit.visible = false
        }
        indexStore.progress = false

    } catch(e) {
        // console.log("Update record error: ", e)
        indexStore.progress = false
    }
}

const dialog_action_cancel = () => {
    indexStore.displayEdit.visible = false
}

</script>

<style lang="scss" scoped>
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>