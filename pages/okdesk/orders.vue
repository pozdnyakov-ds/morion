<template>
    <div class="main-content">
        <div class="page-title">
            Заказы из Okdesk
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
            <div v-if="item.deleted==0" style="width: 50px;">{{ item.id }}</div>
            <div v-if="item.deleted==1" style="width: 50px; text-decoration: line-through; color: #ddd;">{{ item.id }}</div>
        </template>

        <template v-slot:item.company_name="{ item }">
            <div v-if="item.deleted==0" style="width: 150px;">{{ item.company_name ? item.company_name : "-" }}</div>
            <div v-if="item.deleted==1" style="width: 150px;text-decoration: line-through; color: #ddd;">{{ item.company_name ? item.company_name : "-" }}</div>
        </template>

        <template v-slot:item.title="{ item }">
            <div v-if="item.deleted==0" style="">{{ item.title }}</div>
            <div v-if="item.deleted==1" style="text-decoration: line-through; color: #ddd;">{{ item.title }}</div>
        </template>

        <template v-slot:item.created_at="{ item }">
            <div v-if="item.deleted==0" style="width: 125px;">{{ item.created_at.split("T")[0] }} {{ item.created_at.split("T")[1].substring(0, 5) }}</div>
            <div v-if="item.deleted==1" style="width: 125px; text-decoration: line-through; color: #ddd;">{{ item.created_at.split("T")[0] }} {{ item.created_at.split("T")[1].substring(0, 5) }}</div>
        </template>
        
        <template v-slot:item.spent_time_total="{ item }">
            <div v-if="item.deleted==0" style="width: 125px;">{{ (item.spent_time_total * 60).toFixed(0) }} мин</div>
            <div v-if="item.deleted==1" style="width: 125px; text-decoration: line-through; color: #ddd;">{{ (item.spent_time_total * 60).toFixed(0) }} мин</div>
        </template>

        <template v-slot:item.actions="{ item }">
            <div style="width: 100px;">
                <v-icon v-if="item.deleted==0" class="item-action" size="small" @click="deleteRecord(item.id)">fa-solid fa-trash</v-icon>
                <v-icon v-if="item.deleted==1" class="item-action" size="small" @click="restoreRecord(item.id)">fa-solid fa-trash-can-arrow-up</v-icon>
            </div>
        </template>
    
        </v-data-table>
    
        <client-only>
            <v-row justify="center">
                <v-dialog v-model="dialog.restore" persistent width="auto">
                  <v-card class="dialog-edit">
                    <v-card-text class="text-h6">Восстановить запись?</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_restore_yes">Да</v-btn>
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
        restore: false,
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
        { title: '', key: 'data-table-expand' },
        { title: 'Okdesk ID', key: 'id' },
        { title: 'Клиент', key: 'company_name' },
        { title: 'Наименование', key: 'title' },
        { title: 'Создано', key: 'created_at' },
        { title: 'Трудозатраты', key: 'spent_time_total' },
        { title: 'Статус', key: 'status' },
        { title: 'Действия', key: 'actions', sortable: false }
    ]
    
    const restoreRecord = (id) => {
        dialog.restore = true
        dialog.action = id
    }
    
    const deleteRecord = (id) => {
        dialog.delete = true
        dialog.action = id
    }

    const dialog_restore_yes = async () => {
        dialog.restore = false
    
        const { data, error } = await userStore.myFetch('/api/okdesk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'order.restore',
                id: dialog.action
            }),
        })
    
        if (data) {
            useNuxtApp().$toast.success('Запись восстановлена');

        } else {
            useNuxtApp().$toast.error('Ошибка восстановления записи!');
        }
    
        dialog.action = 0
        loadRecords()
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
                action: 'order.delete',
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
        dialog.restore = false
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
                    action: 'get.orders', 
                }),
            })
    
            if (data.value && data.value.code == 200) {
                items.value = data.value.data
                items.value.forEach((item) => {
                    // item['urcom'] = item.parameters[2]
                    // item['fr'] = item.parameters[4]
                })
            }
            indexStore.progress = false
    
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