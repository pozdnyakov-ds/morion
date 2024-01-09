<template>
    <div class="main-content">
        <div class="page-title">
            Тарифы 
        </div>
        <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
            <div class='col-12'><span>Ошибка: {{ message }}</span></div>
        </div> 
        <v-container style="padding: 0px;">
                <v-row>
                    <v-col>
                        <v-btn @click="addRecord" style="background-color: #28a745; color: #fff;">Создать</v-btn>
                    </v-col>
                    <v-col>
                        <v-text-field
                            v-model="search"
                            label="Поиск..."
                            single-line
                            hide-details
                            variant="outlined"
                            style="margin-bottom: 15px;"
                        >
                        </v-text-field>
                    </v-col>
                </v-row>
                <v-data-table 
                    hover
                    density="compact"
                    v-model:page="page"
                    :items-per-page="showBy"
                    :headers="headers"
                    :items="rates"
                    :search="search"
                    item-key="id"
                    no-data-text="Нет данных"
                    class="elevation-1"
                >
                <template v-slot:headers="{ columns }">
                    <tr>
                        <template v-for="(column) in columns" :key="column.key">  
                            <td style="padding: 10px; background-color: #D6EAF8;"><b>{{ column.title }}</b></td>
                        </template>
                    </tr>
                </template>

                <template v-slot:item.created_at="{ item }">
                    <div>{{ item.created_at.split('T')[0] }}</div>
                </template>

                <template v-slot:item.status="{ item }">
                    <v-checkbox-btn class="item-action" v-model="item.status" @click="statusToggle(item)"></v-checkbox-btn>
                </template>
                
                <template v-slot:item.actions="{ item }">
                    <v-icon class="item-action" size="small" @click="editRecord(item)">fa-regular fa-pen-to-square</v-icon>
                    <v-icon class="item-action" size="small" @click="deleteRecord(item)">fa-solid fa-trash</v-icon>
                </template>
            
                </v-data-table>

                <client-only>
                    <v-row justify="center">
                        <v-dialog v-model="dialog.plus" persistent width="500">
                            <v-form v-model="valid">
                                <v-card class="dialog-plus">
                                    <v-card-text class="text-h6">Создать тариф</v-card-text>
                                    <v-text-field
                                        style="margin: 0 20px 0 20px; min-width: 350px;"
                                        label="Наименование"
                                        required
                                        v-model="recordInfo.name"
                                        :rules="[required(''), minLength('', 3), maxLength('', 64)]"
                                    ></v-text-field>
                                    <v-text-field
                                        style="margin: 0 20px 0 20px; min-width: 350px;"
                                        label="Описание (до 255 символов)"
                                        v-model="recordInfo.description"
                                    ></v-text-field>
                                    <v-row>
                                        <v-col>
                                            <v-text-field
                                                style="margin: 0 20px 0 20px; width: 150px;"
                                                label="Ставка в сутки, руб."
                                                required
                                                v-model="recordInfo.rate"
                                                type="number"
                                                :rules="[required(''), minValue('', 0)]"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-text-field
                                                style="margin: 0 20px 0 20px; width: 150px;"
                                                label="Ставка партнера, %"
                                                required
                                                v-model="recordInfo.partnerRate"
                                                type="number"
                                                :rules="[required(''), minValue('', 0)]"
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="green-darken-1" variant="text" @click="dialog_plus_yes" :disabled="!valid">Создать</v-btn>
                                        <v-btn color="green-darken-1" variant="text" @click="dialog_action_no">Отмена</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-form>
                        </v-dialog>
                    </v-row>
                </client-only>

                <client-only>
                    <v-row justify="center">
                        <v-dialog v-model="dialog.edit" persistent width="500">
                            <v-form v-model="valid">
                                <v-card class="dialog-plus">
                                    <v-card-text class="text-h6">Редактировать тариф</v-card-text>
                                    <v-text-field
                                        style="margin: 0 20px 0 20px; min-width: 350px;"
                                        label="Наименование"
                                        required
                                        v-model="recordInfo.name"
                                        :rules="[required(''), minLength('', 3), maxLength('', 64)]"
                                    ></v-text-field>
                                    <v-text-field
                                        style="margin: 0 20px 0 20px; min-width: 350px;"
                                        label="Описание (до 255 символов)"
                                        v-model="recordInfo.description"
                                    ></v-text-field>
                                    <v-row>
                                        <v-col>
                                            <v-text-field
                                                style="margin: 0 20px 0 20px; width: 150px;"
                                                label="Ставка в сутки, руб."
                                                required
                                                v-model="recordInfo.rate"
                                                type="number"
                                                :rules="[required(''), minValue('', 0)]"
                                            ></v-text-field>
                                        </v-col>
                                        <v-col>
                                            <v-text-field
                                                style="margin: 0 20px 0 20px; width: 150px;"
                                                label="Ставка партнера, %"
                                                required
                                                v-model="recordInfo.partnerRate"
                                                type="number"
                                                :rules="[required(''), minValue('', 0)]"
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="green-darken-1" variant="text" @click="dialog_edit_yes" :disabled="!valid">Сохранить</v-btn>
                                        <v-btn color="green-darken-1" variant="text" @click="dialog_action_no">Отмена</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-form>
                        </v-dialog>
                    </v-row>
                </client-only>

                <client-only>
                    <v-row justify="center">
                        <v-dialog v-model="dialog.delete" persistent width="auto">
                          <v-card class="dialog-delete">
                            <v-card-text class="text-h6">Удалить запись?</v-card-text>
                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn color="green-darken-1" variant="text" @click="dialog_delete_yes">Да</v-btn>
                              <v-btn color="green-darken-1" variant="text" @click="dialog_action_no">Нет</v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                    </v-row>
                </client-only>
                        
        </v-container>   
    </div>
</template>

<script setup>
const indexStore = useIndexStore()

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

const config = useRuntimeConfig()
const userStore = useUserStore()

const rates = ref([])
const page = ref(1)
const showBy = ref(10)
const search = ref('')
const message = ref('')
const valid = ref(false)

const dialog = reactive({
    plus: false,
    edit: false,
    delete: false,
    action: null
})

const required = () => {
	return v => v && v.length > 0 || 'Указать значение'
}
const requiredResolution = [
	(v) => v != null || 'Выбрать значение'
]
const minLength = (propertyType, minLength) => {
	return v => v && v.length >= minLength || `Не меньше ${minLength} символов`
}
const maxLength = (propertyType, maxLength) => {
	return v => v && v.length <= maxLength || `Не больше ${maxLength} символов`
}
const minValue = (propertyType, minValue) => {
	return v => v && v >= minValue || `Не меньше ${minValue}`
}

const partner = reactive({
    selected: null
})

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
})

watch(showBy, (newValue) => {
    loadRecords()
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        loadRecords()
    }
})

const recordInfo = reactive({
    id: '',
    name: '',
    description: '',
    rate: 0,
    partnerRate: 0,
    created_at: '',
    status: null
})

const headers = [
    { title: 'Наименование', key: 'name' },
    { title: 'Описание', key: 'description' },
    { title: 'Ставка в сутки, руб.', key: 'rate' },
    { title: 'Ставка партнера, %', key: 'partner_rate' },
    { title: 'Создано', key: 'created_at' },
    { title: 'Статус', key: 'status' },
    { title: 'Действия', key: 'actions', sortable: false }
]

const statusToggle = async (item) => {
    const id = item.id
    const status = !item.status

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/finances', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'rates.status',
                id: id,
                status: status
            }),
        })

        if (data.value.code == 200) {
            useNuxtApp().$toast.success('Статус обновлен');
        }
        indexStore.progress = false

    } catch(e) {
        useNuxtApp().$toast.error('Ошибка обновления статуса');
        console.log("Change status error: ", e)
        indexStore.progress = false
    }
}

const addRecord = () => {
    recordInfo.name = ''
    recordInfo.description = ''
    recordInfo.rate = 0
    recordInfo.partnerRate = 0
    dialog.plus = true
}

const editRecord = (item) => {
    recordInfo.id = item.id
    recordInfo.name = item.name
    recordInfo.description = item.description
    recordInfo.rate = item.rate
    recordInfo.partnerRate = item.partner_rate
    dialog.edit = true
}

const deleteRecord = (item) => {
    dialog.delete = true
    dialog.action = item.id
}

const dialog_plus_yes = async () => {
    saveData()
    dialog.plus = false
}

const dialog_edit_yes = async () => {
    dialog.edit = false

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/finances', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'rates.save',
                id: recordInfo.id,
                name: recordInfo.name,
                description: recordInfo.description,
                rate: recordInfo.rate,
                partner_rate: recordInfo.partnerRate
            }),
        })
        if (data.value.code == 200) {
            useNuxtApp().$toast.success('Запись обновлена');
        }
        indexStore.progress = false

    } catch(e) {
        // console.log("Update record error: ", e)
        indexStore.progress = false
    }

    dialog.action = null
    recordInfo.name = ''
    recordInfo.description = ''
    recordInfo.rate = 0
    recordInfo.partnerRate = 0
    loadRecords()
}

const dialog_delete_yes = async () => {
    dialog.delete = false

    const { data, error } = await userStore.myFetch('/api/finances', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userStore.accessToken}`
        },
        body: JSON.stringify({ 
            action: 'rates.delete',
            id: dialog.action
        }),
    })

    if (data) {
        useNuxtApp().$toast.success('Запись удалена');
    } else {
        useNuxtApp().$toast.error('Ошибка удаления записи!');
    }

    dialog.action = 0
    loadRecords()
}

const dialog_action_no = () => {
    dialog.plus = false
    dialog.edit = false
    dialog.delete = false
    dialog.action = 0
}

const loadRecords = async () => {
    rates.value.splice(0)
    rates.value = []

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/finances', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'rates.list', 
            }),
        })

        if (data.value.code == 200) {
            rates.value = data.value.data
            rates.value.forEach((item) => {
                if (item.status == 1) item.status = true
                else item.status = false
            })
        }
        indexStore.progress = false

    } catch(e) {
        // console.log("ITEMS ERROR: ", e)
        indexStore.progress = false
    }
}

const saveData = async () => {
    const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
    if (!token_recaptcha) return

	try {
		indexStore.progress = true
		message.value = ''

		const { data, error } = await useFetch('/api/finances', { 
			method: 'post', 
			body: { 
				action: 'rates.create', 
				name: recordInfo.name,
                description: recordInfo.description,
                rate: recordInfo.rate,
                partner_rate: recordInfo.partnerRate,
				token_recaptcha: token_recaptcha
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const code = data.value.code
            useNuxtApp().$toast.success('Запись добавлена')
			loadRecords()

		} else {
			message.value = (error.value) ? error.value : ''
		}

	} catch (e) {
        message.value = e
		indexStore.progress = false
	}
}

</script>

<style lang="scss" scoped>
.item-action {
    color: #666;
    margin-right: 15px;
}
.dialog-delete {
    padding: 0px;
}
</style>