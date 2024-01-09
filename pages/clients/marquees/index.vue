<template>
    <div class="main-content">
        <div class="page-title">
            Сообщения для бегущей строки
        </div>
    
        <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
            <div class='col-12'><span>Ошибка: {{ message }}</span></div>
        </div> 
    
        <v-row>
            <v-col>
                <v-btn @click="plusRecord" style="background-color: #28a745; color: #fff;">Создать</v-btn>
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
            :items="items"
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
    
        <template v-slot:item.name="{ item }">
            <div>{{ item.name }}</div>
        </template>

        <template v-slot:item.code="{ item }">
            <div style="font-size: 90%;">{{ getCode(item.code) }}</div>
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
                <v-dialog v-model="dialog.plus" persistent width="600">
                    <v-form v-model="valid">
                        <v-card class="dialog-plus">
                            <v-card-text class="text-h6">Создать сообщение</v-card-text>
                            <v-text-field
                                style="margin: 0 20px 0 20px; min-width: 350px;"
                                label="Наименование"
                                required
                                v-model="recordInfo.name"
                                :rules="[required(''), minLength('', 3), maxLength('', 64)]"
                            ></v-text-field>
                            <div style="margin: 0 20px 0 20px; ">
                                <Editor
                                    ref="editorRef"
                                    v-model="recordInfo.code"
                                    api-key="jcdk6tisrzl127y5uc5nw8sne5i26jkemklqanejp2frv3i8"
                                    output-format="html"
                                    :init="{
                                        plugins: 'code',
                                        menubar: false,
                                        statusbar: false,
                                        toolbar: 'bold italic underline'
                                        // toolbar: 'fontselect fontsizeselect forecolor backcolor | bold italic underline code | alignleft aligncenter alignright alignjustify | indent outdent' 
                                    }"
                                />
                            </div>
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
                    <v-card-text class="text-h6">Редактирование записи</v-card-text>
                    <v-text-field
                        style="margin: 0 20px 0 20px; min-width: 350px;"
                        label="Наименование"
                        required
                        v-model="recordInfo.name"
                        :rules="[required(''), minLength('', 3), maxLength('', 64)]"
                    ></v-text-field>
                    <div style="margin: 0 20px 0 20px;">
                        <Editor
                            ref="editorRef"
                            v-model="recordInfo.code"
                            api-key="jcdk6tisrzl127y5uc5nw8sne5i26jkemklqanejp2frv3i8"
                            output-format="html"
                            :init="{
                                plugins: 'code',
                                menubar: false,
                                statusbar: false,
                                toolbar: 'bold italic underline'
                            }"
                        />
                    </div>
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
import Editor from '@tinymce/tinymce-vue'
const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

const items = ref([])
const page = ref(1)
const showBy = ref(10)
const search = ref('')
const message = ref('')
const valid = ref(false)

const editorRef = ref(null)

const partner = reactive({
    selected: null,
})

const getCode = (code) => {
    if (code && code.length >=64) {
        return code.substring(0, 64) + '...'
    } else {
        return code
    }
}

const dialog = reactive({
    plus: false,
    edit: false,
    delete: false,
    action: null
})

const recordInfo = reactive({
    id: null,
    name: null,
    code: null,
    partner: (partner.selected) ? partner.selected : null,
    created_at: null,
    status: true
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
	return v => v && v >= minValue || `Не меньше ${minValue} пикселей`
}

watch(valid, (n, o) => {
    if (o === false && n === null && recordInfo.name && recordInfo.name.length) {
        valid.value = true
    }
})

watch(showBy, (newValue) => {
    loadRecords(partner.selected)
})

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        loadRecords()
    }
})

const headers = [
    { title: 'Наименование', key: 'name' },
    { title: 'Текст', key: 'code' },
    { title: 'Статус', key: 'status' },
    { title: 'Действия', key: 'actions', sortable: false }
]

const statusToggle = async (item) => {
    const id = item.id
    const status = !item.status

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/marquees', {
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

const plusRecord = () => {
    dialog.plus = true
    recordInfo.id = null
    recordInfo.name = ''
    recordInfo.code = null
}

const editRecord = (item) => {
    // console.log("editRecord", item)
    recordInfo.id = item.id
    recordInfo.name = item.name
    recordInfo.code = item.code
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
    const id = recordInfo.id ? recordInfo.id : null

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/marquees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'index.save',
                id: id,
                name: recordInfo.name,
                code: recordInfo.code,
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
    recordInfo.code = null
    loadRecords(partner.selected)
}

const dialog_delete_yes = async () => {
    dialog.delete = false
    // console.log("TO DELETE: ", dialog.action)
    
    const { data, error } = await userStore.myFetch('/api/marquees', {
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
    loadRecords(partner.selected)
}

const dialog_action_no = () => {
    dialog.plus = false
    dialog.edit = false
    dialog.delete = false
    dialog.action = 0
    recordInfo.name = ''
    recordInfo.code = null
}

const loadRecords = async () => {
    items.value.splice(0)

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/marquees', {
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
            items.value = data.value.data
            items.value.forEach((item) => {
                if (item.status == 1) { item.status = true }
                else { item.status = false }
            })
        }
        indexStore.progress = false

    } catch(e) {
        // console.log("DATA ERROR: ", e)
        indexStore.progress = false
    }
}

const submitForm = async (recordInfo) => {
    recordInfo.partner = userStore.partner

    const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
    if (!token_recaptcha) return

	try {
		indexStore.progress = true
		message.value = ''

		const { data, error } = await useFetch('/api/marquees', { 
			method: 'post', 
			body: { 
				action: 'index.create', 
				name: recordInfo.name,
                code: recordInfo.code, 
                partner: partner.selected,
				token_recaptcha: token_recaptcha
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const code = data.value.code
            useNuxtApp().$toast.success('Запись добавлена')
			loadRecords(partner.selected)

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
    margin-right: 10px;
}
.dialog-delete {
    padding: 0px;
}
.tox-tinymce-aux {
    z-index: 9999 !important;    
}
.tox.tox-silver-sink.tox-tinymce-aux {
    z-index: 9999 !important;    
}
</style>