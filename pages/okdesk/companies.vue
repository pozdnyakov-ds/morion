<template>
    <div class="main-content">
        <div class="page-title">
            Клиенты из Okdesk
        </div>
  
        <v-row>
            <v-col>
                <!-- <nuxt-link to="/partners/clients/create">
                    <v-btn style="background-color: #28a745; color: #fff;">Создать</v-btn>
                </nuxt-link> -->
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
    
        <template v-slot:expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length">
                
              </td>
            </tr>
        </template>

        <template v-slot:item.id="{ item }">
            <div style="width: 50px;">{{ item.id }}</div>
        </template>

        <template v-slot:item.name="{ item }">
            <div style="width: 200px;">{{ item.name }}</div>
        </template>

        <template v-slot:item.urcom="{ item }">
            <div style="width: 200px;">{{ item.urcom }}</div>
        </template>

        <template v-slot:item.fr="{ item }">
            <div style="width: 200px;">{{ item.fr }}</div>
        </template>
  
        <template v-slot:item.actions="{ item }">
            <!-- <v-icon class="item-action" size="small" @click="editRecord(item.id)">fa-regular fa-pen-to-square</v-icon> -->
            <!-- <v-icon class="item-action" size="small" @click="deleteRecord(item.id)">fa-solid fa-trash</v-icon> -->
            <v-icon class="item-action" size="small" @click="sendRecord(item)">fa-regular fa-envelope</v-icon>
        </template>
    
        </v-data-table>
    
        <client-only>
            <v-row justify="center">
                <v-dialog v-model="dialog.send" persistent width="auto">
                  <v-card class="dialog-edit">
                    <v-card-text class="text-h6">Отправить документ?</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_send_yes">Да</v-btn>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_action_no">Нет</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
            </v-row>
        </client-only>

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
    
    definePageMeta({
        layout: "default",
        middleware: ['auth', 'access']
    })
    
    const userStore = useUserStore()
    
    const items = ref([])
    const showBy = ref(10)
    const page = ref(1)
    const search = ref('')
    const dialog = reactive({
        send: false,
        edit: false,
        delete: false,
        action:false
    })
    
    const partner = reactive({
        selected: null,
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
        // { title: '', key: 'data-table-expand' },
        { title: 'Okdesk ID', key: 'id' },
        { title: 'Наименование', key: 'name' },
        { title: 'Юр. наименование', key: 'urcom' },
        { title: 'ИНН', key: 'inn' },
        { title: 'Фискальный регистратор', key: 'fr' },
        { title: 'Действия', key: 'actions', sortable: false }
    ]
       
    const sendRecord = (item) => {
        dialog.send = true
        dialog.action = item
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
        router.push({ path: `/partners/clients/${dialog.action}` })
    }
    
    const dialog_send_yes = async () => {
        dialog.send = false
        const id = dialog.action.id
        const urcom = dialog.action.urcom
    
        const { data, error } = await userStore.myFetch('/api/okdesk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'company.send',
                id: id,
                num: '0001',
                date: '25.01.2024',
                ul: urcom,
                inn: '165111111',
                kpp: '165222222',
                address: '420139, Казань, ул. Р. Зорге, д.93',
                email: "2903015@mail.ru", 
                type: 1,
                items: [{
                    name: "Товар 1",
                    price: 1.50,
                    quantity: 1.00
                },
                {
                    name: "Товар 2",
                    price: 2.50,
                    quantity: 2.00
                }]
            }),
        })
        //console.log("SEND RESULT: ", data)

        if (data && data._rawValue && data._rawValue.code && data._rawValue.code==200) {
            useNuxtApp().$toast.success('Документ отправлен');

        } else {
            useNuxtApp().$toast.error('Ошибка отправки документа!');
        }
    
        dialog.action = 0
    }

    const dialog_delete_yes = async () => {
        dialog.delete = false
    
        const { data, error } = await userStore.myFetch('/api/okdesk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'company.delete',
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
        dialog.send = false
        dialog.edit = false
        dialog.delete = false
        dialog.action = 0
    }
    
    const loadRecords = async () => {
        items.value.splice(0)
        items.value = []
    
        try {
            indexStore.progress = true
            const { data, error } = await userStore.myFetch('/api/okdesk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userStore.accessToken}`
                },
                body: JSON.stringify({ 
                    action: 'get.companies', 
                }),
            })
    
            if (data.value && data.value.code == 200) {
                items.value = data.value.data
                items.value.forEach((item) => {
                    //...
                })
            }
            indexStore.progress = false
            //console.log("OKDESK COMPANIES: ", items.value)
    
        } catch(e) {
            // console.log("ITEMS ERROR: ", e)
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
        margin-right: 15px;
    }
    .dialog-delete {
        padding: 0px;
    }
    </style>