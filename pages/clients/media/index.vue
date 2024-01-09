<template>
    <div class="main-content">
        <div class="page-title">
            Медиа-файлы
        </div>
    
        <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
            <div class='col-12'><span>Ошибка: {{ message }}</span></div>
        </div> 
    
        <v-row>
            <v-col>
                <nuxt-link to="/clients/media/create">
                    <v-btn style="background-color: #28a745; color: #fff;">Создать</v-btn>
                </nuxt-link>
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
                    <td style="padding: 10px; background-color: #D6EAF8;"><b>{{ column.title }}</b></td>
                </template>
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

        <template v-slot:item.preview="{ item }">
            <div v-if="item.type.includes('image/')">
                <img :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${item.filename}`" style="max-width: 100px; border-radius: 5px; margin: 5px;">
            </div>
            <div v-if="item.type.includes('video/')">
                <video style="max-width: 100px; border-radius: 5px; margin: 5px;">
                    <source :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${partner.selected}/${item.filename}`" />
                </video>    
            </div>
        </template>

        <template v-slot:item.scope="{ item }">
            <div v-for="ind in item.scope[0]" :key="item.id" style="padding: 5px 0 5px 0; display: inline-block">
                <div class="chips">{{ scopes[ind] }}</div>
            </div>
        </template>
    
        <template v-slot:item.created_at="{ item }">
            <div>{{ item.created_at.split('T')[0] }}</div>
        </template>
    
        <template v-slot:item.status="{ item }">
            <v-checkbox-btn style="display: inline-block;" class="item-action" v-model="item.status" @click="statusToggle(item)"></v-checkbox-btn>
        </template>
        
        <template v-slot:item.actions="{ item }">
            <v-icon class="item-action" size="small" @click="editRecord(item.id)">fa-regular fa-pen-to-square</v-icon>
            <v-icon class="item-action" size="small" @click="deleteRecord(item.id)">fa-solid fa-trash</v-icon>
        </template>
    
        </v-data-table>
    
        <client-only>
            <v-row justify="center">
                <v-dialog v-model="dialog.edit" persistent width="auto">
                  <v-card class="dialog-edit">
                    <v-card-text class="text-h6">Редактировать запись?</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_edit_yes">Да</v-btn>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_action_no">Нет</v-btn>
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
const dialog = reactive({
    edit: false,
    delete: false,
    action: false
})
const message = ref('')

const partner = reactive({
    selected: null
})

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        loadRecords()
    }
})

watch(showBy, (newValue) => {
    loadRecords()
})

const headers = [
    { title: 'Предосмотр', key: 'preview' },
    { title: 'Имя/Описание', key: 'name' },
    { title: 'Файл/Тип', key: 'filename' },
    { title: 'Длит., сек.', key: 'duration' },
    { title: 'Создано', key: 'created_at' },
    { title: 'Статус', key: 'status' },
    { title: 'Действия', key: 'actions', sortable: false }
]

const retireToggle = async (item) => {
    const id = item.id
    const retire = !item.retire

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/media', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'index.retire',
                id: id,
                retire: retire
            }),
        })
        if (data.value.code == 200) {
            useNuxtApp().$toast.success('Видимость обновлена');
        }
        indexStore.progress = false

    } catch(e) {
        // console.log("Change retire error: ", e)
        indexStore.progress = false
    }
}

const statusToggle = async (item) => {
    const id = item.id
    const status = !item.status

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/media', {
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

const editRecord = (id) => {
    dialog.edit = true
    dialog.action = id
}

const deleteRecord = (id) => {
    dialog.delete = true
    dialog.action = id
}

const dialog_edit_yes = async () => {
    dialog.edit = false
    const router = useRouter()
    router.push({ path: `/clients/media/${dialog.action}` })
}

const dialog_delete_yes = async () => {
    dialog.delete = false
    
    const { data, error } = await userStore.myFetch('/api/media', {
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
        useNuxtApp().$toast.success('Запись удалена');
    } else {
        useNuxtApp().$toast.error('Ошибка удаления записи!');
    }

    dialog.action = null
    loadRecords()
}

const dialog_action_no = () => {
    dialog.edit = false
    dialog.delete = false
    dialog.action = 0
}

const loadRecords = async () => {
    items.value.splice(0)

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/media', {
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
                if (item.retire == 1) { item.retire = true }
                else { item.retire = false }
                if (item.status == 1) { item.status = true }
                else { item.status = false }
            })
        }
        indexStore.progress = false

    } catch(e) {
        // console.log("MEDIA ERROR: ", e)
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