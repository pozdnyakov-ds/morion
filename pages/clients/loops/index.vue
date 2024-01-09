<template>
    <div class="main-content">
        <div class="page-title">
            Плейлисты 
        </div>
        <!-- {{ indexStore.loops }} -->
        <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
            <div class='col-12'><span>Ошибка: {{ message }}</span></div>
        </div> 
    
        <v-row>
            <v-col> 
                <v-btn @click="plusRecord" style="background-color: #28a745; color: #fff;">Создать</v-btn>
            </v-col>
            <v-col>
                &nbsp;
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
            v-model:page="page"
            :items-per-page="showBy"
            :headers="headers"
            :items="indexStore.loops.size ? Array.from(indexStore.loops.values()).map((item, key) => ({ id: key, ...item })) : []"
            :search="search"
            item-key="id"
            no-data-text="Нет данных"
            class="elevation-1"
        >
        <template v-slot:headers="{ columns }">
            <tr>
                <template v-for="(column) in columns" :key="column.key">  
                    <td v-if="column.key=='data-table-expand'" style="padding: 10px; background-color: #D6EAF8; width: 25px;"><b>{{ column.title }}</b></td>
                    <td v-else style="padding: 10px; background-color: #D6EAF8;"><b>{{ column.title }}</b></td>
                </template>
            </tr>
        </template>
    
        <template v-slot:expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length">
                <LoopItems :item="item.id" />
              </td>
            </tr>
        </template>

        <template v-slot:item.name="{ item }">
            <div>{{ item.name }}</div>
            <div v-if="item.description && item.description.length > 0" class="description">{{ item.description }}</div>
        </template>

        <template v-slot:item.filename="{ item }">
            <div>{{ item.filename }}</div>
            <div class="description">[{{ item.type }}, {{ Math.round(item.size / 1024) }} Kb]</div>
        </template>

        <template v-slot:item.duration="{ item }">
            <div>{{ countDuration(item.id) }}</div>
        </template>

        <template v-slot:item.created_at="{ item }">
            <div>{{ item.created_at.split('T')[0] }}</div>
        </template>
    
        <template v-slot:item.status="{ item }">
            <v-checkbox-btn style="display: inline-block;" class="item-action" v-model="item.status" @click="statusToggle(item)"></v-checkbox-btn>
        </template>
        
        <template v-slot:item.actions="{ item }">
            <v-icon class="item-action" size="small" @click="editRecord(item)">fa-regular fa-pen-to-square</v-icon>
            <v-icon class="item-action" size="small" @click="deleteRecord(item.id)">fa-solid fa-trash</v-icon>
        </template>
    
        </v-data-table>
    
        <client-only>
            <v-row justify="center">
                <v-dialog v-model="dialog.plus" persistent width="auto">
                    <v-form v-model="valid">
                        <v-card class="dialog-plus">
                            <v-card-text class="text-h6">Создать плейлист</v-card-text>
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
                            <v-select
                                style="margin: 0 20px 0 20px; min-width: 350px;"
                                label="Расписание"
                                :items="schedule.schedules"
                                v-model="schedule.selected"
                                item-title="name"
                                item-value="id"
                            ></v-select>
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
                <v-dialog v-model="dialog.edit" persistent width="auto">
                  <v-card class="dialog-edit">
                    <v-card-text class="text-h6">Редактировать запись?</v-card-text>
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
                    <v-select
                        style="margin: 0 20px 0 20px; min-width: 350px;"
                        label="Расписание"
                        :items="schedule.schedules"
                        v-model="schedule.selected"
                        item-title="name"
                        item-value="id"
                    ></v-select>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_edit_yes">Сохранить</v-btn>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_action_no">Закрыть</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
            </v-row>
        </client-only>
    
        <client-only>
            <v-row justify="center">
                <v-dialog v-model="dialog.delete" persistent width="auto">
                  <v-card class="dialog-delete">
                    <v-card-text class="text-h6">Удалить запись?</v-card-text>
                    <v-card-text>Удаление записи приведет к удалению всех <br>связанных с ним документов!</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_delete_yes">Да</v-btn>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_action_no">Нет</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
            </v-row>
        </client-only>
           
    </div>
</template>
    
<script setup>
import eventBus from '../config/eventBus'
import randomId from '~/config/misc'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

const page = ref(1)
const showBy = ref(10)
const search = ref('')
const dialog = reactive({
    plus: false,
    edit: false,
    delete: false,
    action: null
})    
const message = ref('')
const valid = ref(false)

const partner = reactive({
    selected: null
})

const schedule = reactive({
    schedules: [],
    selected: null
})

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
    loadSchedules()
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
    start: '', 
    finish: '',
    media: [],
    duration: 0,
    partner: null,
    schedule: null,
    tags: '',
    created_at: null,
    status: true
})

const required = () => {
	return v => v && v.length > 0 || 'Указать наименование плейлиста'
}
const minLength = (propertyType, minLength) => {
	return v => v && v.length >= minLength || `Не меньше ${minLength} символов`
}
const maxLength = (propertyType, maxLength) => {
	return v => v && v.length <= maxLength || `Не больше ${maxLength} символов`
}

// Get event
eventBus.on('LoopItems', (data) => {
    if (data.code == 'ReloadLoopMedia') {
        loadRecords()
    }
})

watch(valid, (n, o) => {
    if (o === false && n === null && recordInfo.name.value && recordInfo.name.value.length) {
        valid.value = true
    }
})

watch(showBy, (newValue) => {
    loadRecords()
})

const headers = [
    { title: '', key: 'data-table-expand' },
    { title: 'Имя/Описание', key: 'name' },
    { title: 'Общая длит., сек.', key: 'duration' },
    { title: 'Расписание', key: 'schedule_name' },
    { title: 'Создано', key: 'created_at' },
    { title: 'Статус', key: 'status' },
    { title: 'Действия', key: 'actions', sortable: false }
]

const statusToggle = async (item) => {
    const id = item.id
    const status = !item.status

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/loops', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'index.status',
                id: id,
                status: status
            }),
        })
        if (data.value.code == 200) {
            useNuxtApp().$toast.success('Статус обновлен');
        }
        indexStore.progress = false

    } catch(e) {
        // console.log("Change status error: ", e)
        indexStore.progress = false
    }
}

const countDuration = (loopId) => {
    var duration = 0.0
    if (indexStore.loops.size && indexStore.loops.get(loopId) && indexStore.loops.get(loopId).media && indexStore.loops.get(loopId).media.length) {
        indexStore.loops.get(loopId).media.forEach((media) => {
            duration = duration + (media.duration * 1)
        })
    }
    indexStore.loops.get(loopId).duration = duration
    return duration.toFixed(2)
}

const plusRecord = () => {
    dialog.plus = true
    recordInfo.id = null
    recordInfo.name = ''
    recordInfo.description = ''
    recordInfo.schedule = null
    schedule.selected = null
}

const editRecord = (item) => {
    recordInfo.id = item.id
    recordInfo.name = item.name
    recordInfo.description = item.description
    recordInfo.schedule = item.schedule
    schedule.selected = item.schedule
    dialog.edit = true
}

const deleteRecord = (id) => {
    dialog.delete = true
    dialog.action = id
}

const dialog_plus_yes = async () => {
    dialog.plus = false
    submitForm(recordInfo)
}

const dialog_edit_yes = async () => {
    dialog.edit = false
    recordInfo.schedule = schedule.selected

    const { data, error } = await userStore.myFetch('/api/loops', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userStore.accessToken}`
        },
        body: JSON.stringify({ 
            action: 'index.update',
            item: recordInfo
        }),
    })

    if (data) {
        useNuxtApp().$toast.success('Запись изменена')

    } else {
        useNuxtApp().$toast.error('Ошибка изменения записи')
    }

    dialog.action = null
    recordInfo.name = ''
    recordInfo.description = ''
    recordInfo.schedule = null
    schedule.selected = null
    loadRecords()
}

const dialog_delete_yes = async () => {
    dialog.delete = false
    
    const { data, error } = await userStore.myFetch('/api/loops', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userStore.accessToken}`
        },
        body: JSON.stringify({ 
            action: 'index.delete',
            id: dialog.action
        }),
    })

    if (data) {
        useNuxtApp().$toast.success('Запись удалена')

    } else {
        useNuxtApp().$toast.error('Ошибка удаления записи!')
    }

    dialog.action = null
    recordInfo.name = ''
    recordInfo.description = ''
    recordInfo.schedule = null
    schedule.selected = null
    loadRecords()
}

const dialog_action_no = () => {
    dialog.plus = false
    dialog.edit = false
    dialog.delete = false
    dialog.action = null
    recordInfo.name = ''
    recordInfo.description = ''
    recordInfo.schedule = null
    schedule.selected = null
}

const loadRecords = async () => {
    if (!partner.selected) return
    if (indexStore.loops.size) indexStore.loops.clear()

    // try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/loops', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'index.list', 
                partner: partner.selected
            }),
        })

        if (data.value.code == 200) {
            if (indexStore.loops.size) indexStore.loops.clear()
            
            var m = new Map()
            data.value.data.forEach((item) => {
                if (item.status == 1) { item.status = true }
                else { item.status = false }
                m.set(item.id, item)
            })
            indexStore.loops = m
        }
        indexStore.progress = false

    // } catch(e) {
    //     console.log("LOOPS ERROR: ", e)
    //     indexStore.progress = false
    // }
}

const loadSchedules = async () => {
    if (!partner.selected) return
    schedule.schedules = []

    var data = null 
    var error = null

    try {
        indexStore.progress = true

        const response = await fetch('/api/schedules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                action: 'index.list',
                partner: partner.selected
            }),
        })
        if (!response.ok) {
          throw new Error('Request failed');
        }
        data = await response.json();

        // console.log("SCHEDULES: ", data.data)

        if (data.code == 200 && data.data) {
            schedule.schedules = data.data
        }
        indexStore.progress = false

    } catch(e) {
        // console.log("LOOPS ERROR: ", e)
        indexStore.progress = false
    }
}

const submitForm = async (recordInfo) => {
    recordInfo.partner = partner.selected

    const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
    if (!token_recaptcha) return

	try {
		indexStore.progress = true
		message.value = ''

		const { data, error } = await useFetch('/api/loops', { 
			method: 'post', 
			body: { 
				action: 'index.create', 
				name: recordInfo.name,
                description: recordInfo.description, 
                schedule: schedule.selected,
                partner: partner.selected,
                media: recordInfo.media,
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
.description {
    font-size: 90%;
    color: #666;
}
.chips {
    border-radius: 10px;
    background-color: #eee;
    padding: 3px 10px 3px 10px;
    font-size: small;
    display: inline-block;
    margin-right: 5px;
}
.item-action {
    color: #666;
    margin-right: 10px;
}
.dialog-delete {
    padding: 0px;
}
</style>