<template>
    <div class="main-content">
        <div class="page-title">
            Пользователи рекламодателя
        </div>
    
        <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
            <div class='col-12'><span>Ошибка: {{ message }}</span></div>
        </div> 
    
        <v-row>
            <v-col>
                <nuxt-link to="/advertisers/users/create">
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
    
        <template v-slot:item.scope="{ item }">
            <div style="padding: 5px 0 5px 0; display: inline-block">
                <div class="chips">{{ scopes[item.scope] }}</div>
            </div>
        </template>
    
        <template v-slot:item.created_at="{ item }">
            <div>{{ item.created_at.split('T')[0] }}</div>
        </template>
    
        <template v-slot:item.status="{ item }">
            <v-checkbox-btn class="item-action" v-model="item.status" @click="statusToggle(item)"></v-checkbox-btn>
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
    
    const scopes = ref({'owner': 'Владелец', 'admin': 'Админ', 'marketing': 'Маркетинг'})
    
    watch(showBy, (newValue) => {
        loadRecords()
    })
    
    const headers = [
        { title: 'Имя', key: 'name' },
        { title: 'Фамилия', key: 'surname' },
        { title: 'Email', key: 'email' },
        { title: 'Права', key: 'scope' },
        { title: 'Создано', key: 'created_at' },
        { title: 'Статус', key: 'status' },
        { title: 'Действия', key: 'actions', sortable: false }
    ]
    
    const statusToggle = async (item) => {
        const id = item.id
        const status = !item.status
    
        try {
            indexStore.progress = true
            const { data, error } = await userStore.myFetch('/api/partners', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userStore.accessToken}`
                },
                body: JSON.stringify({ 
                    action: 'users.status',
                    id: id,
                    status: status
                }),
            })
            if (data.value.code == 200) {
                useNuxtApp().$toast.success('Статус обновлен');
            }
            indexStore.progress = false
    
        } catch(e) {
            useNuxtApp().$toast.error('Ошибка обновления')
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
        router.push({ path: `/advertisers/users/${dialog.action}` })
    }
    
    const dialog_delete_yes = async () => {
        dialog.delete = false
    
        const { data, error } = await userStore.myFetch('/api/partners', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'users.delete',
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
        dialog.edit = false
        dialog.delete = false
        dialog.action = 0
    }
           
    const loadRecords = async () => {
        items.value.splice(0)
    
        try {
            indexStore.progress = true
            const { data, error } = await userStore.myFetch('/api/partners', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userStore.accessToken}`
                },
                body: JSON.stringify({ 
                    action: 'users.list', 
                    partner: partner.selected
                }),
            })
    
            if (data.value.code == 200) {
                items.value = data.value.data
                items.value.forEach((item) => {
                    if (item.status == 1) item.status = true
                    else item.status = false
                })
            }
            indexStore.progress = false
    
        } catch(e) {
            // console.log("USERS ERROR: ", e)
            indexStore.progress = false
        }
    }
    
    </script>
    
    <style lang="scss" scoped>
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