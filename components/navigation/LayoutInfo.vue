<template>
    <client-only>
    <v-navigation-drawer location="right" color="#fff" class="mt-5" temporary width="350" 
        style="top: 15px; padding: 15px 0 15px 0; box-shadow: -5px 0 5px #aaa" v-model="indexStore.layoutInfo.visible" text-color="white">
    <div>
        <div class="page-title" style="padding: 20px; margin: 0px; background-color: #E8F0F8;">Данные макета </div>
        <div style="min-width: 350px; text-align: left; padding: 5px 0 5px 10px; font-size: small;">Создано: {{ recordInfo.created_at }}</div>

        <v-form v-model="valid"> 
            <v-row style="margin: 0px;">
                <v-col style="padding: 0 10px 0 10px;">
                    <v-text-field
                        style=""
                        label="Наименование"
                        required
                        v-model="recordInfo.name"
                        :rules="[required(''), minLength('', 3), maxLength('', 64)]"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row style="margin: 0px;">
                <v-col style="padding: 0 10px 0 10px;">
                    <v-text-field
                        style=""
                        label="Описание (до 255 символов)"
                        v-model="recordInfo.description"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row style="margin: 0px;">
                <v-col cols=6 style="padding: 0 10px 0 10px;">
                    <v-select
                        label="Размер экрана"
                        :items="ratio.ratios"
                        v-model="ratio.selected"
                        item-title="name"
                        item-value="id"
                    ></v-select>
                </v-col>
                <v-col v-if="ratio.selected != 99" cols=6 style="padding: 0 10px 0 10px;">
                    <v-select
                        label="Разрешение"
                        :items="resolution.resolutions"
                        v-model="resolution.selected"
                        item-title="name"
                        item-value="id"
                        style="width: 100%;"
                    ></v-select>
                </v-col>
                <v-col v-else>
                    &nbsp;
                </v-col>
            </v-row>
            <v-row v-if="ratio.selected == 99">
                <v-col cols=6 style="padding: 0 10px 0 10px;">
                    <v-text-field
                        style="margin: 0;"
                        label="Ширина, пикс."
                        required
                        v-model="recordInfo.width"
                        type="number"
                        :rules="[required(''), minValue('', 100)]"
                    ></v-text-field>
                </v-col>
                <v-col cols=6 style="padding: 0 10px 0 10px;">
                    <v-text-field
                        style="margin: 0;"
                        label="Высота, пикс."
                        required
                        v-model="recordInfo.height"
                        type="number"
                        :rules="[required(''), minValue('', 100)]"
                    ></v-text-field>
                </v-col>
            </v-row>      
            <v-row style="margin: 0px;">
                <v-col>
                    <v-btn @click="submitForm" block :disabled="!valid || (ratio.selected != 99 && resolution.selected === null) || (ratio.selected == 99 && (recordInfo.width == null || recordInfo.height == null))" style="background-color: #28a745; color: #fff;">Сохранить</v-btn>
                    <v-btn @click="indexStore.layoutInfo.visible = false" block style="background-color: #999; color: #fff; margin-top: 10px;">Закрыть</v-btn>
                </v-col>
            </v-row>
        </v-form>
    </div>

    </v-navigation-drawer>
    </client-only>
</template>

<script setup>
import randomId from '~/config/misc'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRouter()
const valid = ref(false)
const message = ref('')

const props = defineProps({
    id: String,
})

const partner = reactive({
    selected: null
})

const ratio = reactive({
    selected: null,
    default: null,
    ratios: []
})

watch(() => ratio.selected, (n, o) => {
    loadResolutions(n)
    if (o !== null) {
        resolution.selected = null
        // valid.value = false
    }    
})

const resolution = reactive({
    selected: null,
    default: null,
    resolutions: [],
    width: null,
    height: null
})

// watch(() => resolution.selected, (n, o) => {
//     if (n !== null) {
//         recordInfo.width = resolution.resolutions[n] ? resolution.resolutions[n].width : null
//         recordInfo.height = resolution.resolutions[n] ? resolution.resolutions[n].height : null
//     }    
// })

const recordInfo = reactive({
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
    width: null,
    height: null,
    content: null,
    created_at: null,
    status: 0,
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
	return v => v && v >= minValue || `Не меньше ${minValue} пикселей`
}

const dialog_action_no = () => {
    dialog.view = false
}

const loadRecords = async (id) => {

    // try {
		indexStore.progress = true
		
		const { data, error } = await useFetch('/api/layouts', { 
			method: 'post', 
			body: { 
				action: 'index.get', 
				id: id,
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const code = data.value.code
            const record = data.value.data[0]

            //console.log("LOAD LEYOUT: ", record)

            recordInfo.id = record.id
            recordInfo.name = record.name 
            recordInfo.description = record.description
            recordInfo.partner = record.partner
            recordInfo.ratio = record.ratio
            recordInfo.ratio_width = record.ratio_width
            recordInfo.ratio_height = record.ratio_height
            recordInfo.resolution = record.resolution
            recordInfo.resolution_width = record.resolution_width
            recordInfo.resolution_height = record.resolution_height
            recordInfo.width = record.width ? record.width : 100 
            recordInfo.height = record.height ? record.height : 100
            recordInfo.content = record.content
            recordInfo.created_at = record.created_at.split('T')[0]

            loadRatios()
            loadResolutions(recordInfo.ratio)

            // Select values
            ratio.selected = recordInfo.ratio
            resolution.selected = recordInfo.resolution
           
		} else {
			message.value = (error.value) ? error.value : ''
		}

	// } catch (e) {
    //     message.value = e
	// 	indexStore.progress = false
	// }
       
}

const loadRatios = async () => {
    ratio.ratios = []
    try {
        indexStore.progress = true
        message.value = ''
        const { data, error } = await useFetch('/api/layouts', { 
            method: 'post', 
            body: { 
                action: 'ratios.list', 
            } 
        })
        indexStore.progress = false
        if (data.value && data.value.code == 200) {
            data.value.data.forEach((item) => {
                ratio.ratios.push(item)
            })

        } else {
            message.value = (error.value) ? error.value : ''
        }
    } catch (e) {
        message.value = e
        indexStore.progress = false
    }
}

const loadResolutions = async (ratio) => {
    try {
        indexStore.progress = true
        message.value = ''
        const { data, error } = await useFetch('/api/layouts', { 
            method: 'post', 
            body: { 
                action: 'resolutions.list',
                ratio: ratio 
            } 
        })
        indexStore.progress = false
        if (data.value && data.value.code == 200) {
            resolution.resolutions.splice(0)

            data.value.data.forEach((item) => {
                resolution.resolutions.push(item)
            })

        } else {
            message.value = (error.value) ? error.value : ''
        }
    } catch (e) {
        message.value = e
        indexStore.progress = false
    }
}

const id = ref(props && props.id ? props.id : null)
loadRecords(id.value)

const submitForm = async () => {
    //console.log("recordInfo: ", recordInfo)

    const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
    if (!token_recaptcha) return

	// try {
		indexStore.progress = true

		const { data, error } = await useFetch('/api/layouts', { 
			method: 'post', 
			body: { 
				action: 'index.save', 
                id: recordInfo.id,
				name: recordInfo.name,
                description: recordInfo.description, 
                ratio: ratio.selected,
                resolution: resolution.selected,
                width: recordInfo.width,
                height: recordInfo.height,
				token_recaptcha: token_recaptcha
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const code = data.value.code
            indexStore.layoutInfo.visible = false
            useNuxtApp().$toast.success('Данные сохранены')

            indexStore.layout.container.name = recordInfo.name
            indexStore.layout.container.description = recordInfo.description
            indexStore.layout.container.ratio = ratio.selected
            indexStore.layout.container.resolution = resolution.selected
            
            if (ratio.selected != 99) {
                const currentRatio = ratio.ratios.find(obj => obj.id === ratio.selected)
                const currentResolution = resolution.resolutions.find(obj => obj.id === resolution.selected)
                // console.log("Selected: ", currentRatio, currentResolution)

                indexStore.layout.container.ratio_width = currentRatio.width
                indexStore.layout.container.ratio_height = currentRatio.height
                indexStore.layout.container.resolution_width = currentResolution.width
                indexStore.layout.container.resolution_height = currentResolution.height
                indexStore.layout.container.width = currentResolution.width
                indexStore.layout.container.height = currentResolution.height
                indexStore.layout.container.coef = 1024 / currentResolution.width

                indexStore.layout.container.style.width = (currentResolution.width * indexStore.layout.container.coef) + 'px'
                indexStore.layout.container.style.height = (currentResolution.height * indexStore.layout.container.coef) + 'px'
            }
            if (ratio.selected == 99) {
                const currentRatio = ratio.ratios.find(obj => obj.id === ratio.selected)

                indexStore.layout.container.ratio_width = currentRatio.width
                indexStore.layout.container.ratio_height = currentRatio.height
                indexStore.layout.container.resolution_width = 0
                indexStore.layout.container.resolution_height = 0
                indexStore.layout.container.width = recordInfo.width
                indexStore.layout.container.height = recordInfo.height
                indexStore.layout.container.coef = 1024 / recordInfo.width

                indexStore.layout.container.style.width = (recordInfo.width * indexStore.layout.container.coef) + 'px'
                indexStore.layout.container.style.height = (recordInfo.height * indexStore.layout.container.coef) + 'px'
            }

            indexStore.layout.container.key = randomId(32)

		} else {
            useNuxtApp().$toast.error('Ошибка сохранения данных')
			message.value = (error.value) ? error.value : ''
		}

	// } catch (e) {
    //     message.value = e
	// 	indexStore.progress = false
	// }
}

</script>

<style lang="scss" scoped>

</style>