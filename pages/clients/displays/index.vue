<template>
    <div class="main-content">
        <div class="page-title">
            Дисплеи
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
            <div v-if="item.description && item.description.length > 0" class="description">{{ item.description }}</div>
        </template>

        <template v-slot:item.address="{ item }">
            <div>{{ item.address }}</div>
            <div v-if="item.geo && item.geo.length > 0" class="description">{{ item.geo }}</div>
        </template>

        <template v-slot:item.created_at="{ item }">
            <div>{{ item.created_at.split('T')[0] }}</div> 
        </template>
    
        <template v-slot:item.type="{ item }">
            <v-checkbox-btn style="display: inline-block;" class="item-action" v-model="item.type" @click="typeToggle(item)"></v-checkbox-btn>
        </template>

        <template v-slot:item.status="{ item }">
            <v-checkbox-btn style="display: inline-block;" class="item-action" v-model="item.status" @click="statusToggle(item)"></v-checkbox-btn>
        </template>
        
        <template v-slot:item.actions="{ item }">
            <span><v-icon class="item-action" size="small" @click="checkRecord(item)">fa-solid fa-plug</v-icon><v-tooltip activator="parent" location="top">Статус дисплея</v-tooltip></span>
            <span><v-icon class="item-action" size="small" @click="viewRecord(item)">fa-solid fa-eye</v-icon><v-tooltip activator="parent" location="top">Предосмотр дисплея</v-tooltip></span>
            <span><v-icon class="item-action" size="small" @click="reloadRecord(item)">fa-solid fa-rotate-right</v-icon><v-tooltip activator="parent" location="top">Перезагрузка дисплея</v-tooltip></span>
            <span><v-icon class="item-action" size="small" @click="editRecord(item)">fa-regular fa-pen-to-square</v-icon><v-tooltip activator="parent" location="top">Редактировать дисплей</v-tooltip></span>
            <span><v-icon class="item-action" size="small" @click="deleteRecord(item.id)">fa-solid fa-trash</v-icon><v-tooltip activator="parent" location="top">Удалить дисплей</v-tooltip></span>
        </template>
    
        </v-data-table>
                    
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

        <DisplayAdd :key="indexStore.displayAdd.key" />
        <DisplayEdit :key="indexStore.displayEdit.key" />
            
    </div>
</template>
    
<script setup>
import randomId from '~/config/misc'

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

const partner = reactive({
    selected: null,
})

const dialog = reactive({
    delete: false,
    action: null
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

watch(() => indexStore.displayAdd.reload, () => {
    loadRecords()
})

watch(() => indexStore.displayEdit.reload, () => {
    loadRecords()
})

const headers = [
    { title: 'Группа дисплеев', key: 'group_name' },
    { title: 'Имя/Описание', key: 'name' },
    { title: 'Адрес/координаты', key: 'address' },
    { title: 'Макет', key: 'layout_name' },
    { title: 'Код дисплея', key: 'code' },
    { title: 'Участие в сети', key: 'type' },
    { title: 'Ставка', key: 'rate' },
    { title: 'Статус', key: 'status' },
    { title: 'Действия', key: 'actions', sortable: false }
]

const typeToggle = async (item) => {
    const id = item.id
    const type = !item.type

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/displays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'index.type',
                id: id,
                type: type
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

const statusToggle = async (item) => {
    const id = item.id
    const status = !item.status

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/displays', {
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

const viewRecord = (item) => {
    const newWindow = window.open('/device?code=' + item.code, '_blank');
    if (newWindow) {
        newWindow.onload = () => {
          newWindow.document.documentElement.requestFullscreen();
        }
    } else {
        useNuxtApp().$toast.error('Блокировка всплывающих окон может мешать открыть окно в полноэкранном режиме.')
    }
}

const reloadRecord = async (item) => {
    const id = item.id
    const code = item.code
    const name = item.name
    const token = item.token

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/fcm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                action: 'display.reload',
                display_id: id,
                display_code: code,
                display_name: name,
                display_token: token
            }),
        })
        if (data.value.code == 200) {
            useNuxtApp().$toast.success('Команда на обновление отправлена');
        }
        indexStore.progress = false

    } catch(e) {
        useNuxtApp().$toast.error('Ошибка отправки команды на обновление');
        indexStore.progress = false
    }
}

const checkRecord = async (item) => {
    const id = item.id
    const code = item.code
    const name = item.name
    const token = item.token

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/fcm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                action: 'display.status',
                display_id: id,
                display_code: code,
                display_name: name,
                display_token: token
            }),
        })
        //console.log("FCM Check: ", data.value)

        if (data.value.code == 200) {
            useNuxtApp().$toast.success('Команда на проверку статуса отправлена');
        }
        indexStore.progress = false

    } catch(e) {
        useNuxtApp().$toast.error('Ошибка отправки команды проверки статуса');
        indexStore.progress = false
    }
}

const plusRecord = () => {
    indexStore.displayAdd.key = randomId(32)
    indexStore.displayAdd.visible = true
}

const editRecord = (item) => {
    indexStore.displayEdit.data = item.id
    indexStore.displayEdit.key = randomId(32)
    indexStore.displayEdit.visible = true
    console.log("EDIT: ", indexStore.displayEdit)
}

const deleteRecord = (id) => {
    dialog.delete = true
    dialog.action = id
}

const dialog_delete_yes = async () => {
    dialog.delete = false
    // console.log("TO DELETE: ", dialog.action)
    
    const { data, error } = await userStore.myFetch('/api/displays', {
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
    loadRecords(partner.selected)
}

const dialog_action_no = () => {
    dialog.delete = false
    dialog.action = 0
}


const loadRecords = async () => {
    items.value.splice(0)

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/displays', {
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
                if (item.type == 1) { item.type = true }
                else { item.type = false }
                item.geo = item.geo ? JSON.parse(item.geo) : null
            })
        }
        indexStore.progress = false

    } catch(e) {
        // console.log("DATA ERROR: ", e)
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
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>