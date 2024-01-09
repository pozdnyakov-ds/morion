<template>
    <div class="main-content">
        <div class="page-title">
            Заявки рекламодателя
        </div>
    
        <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
            <div class='col-12'><span>Ошибка: {{ message }}</span></div>
        </div> 
    
        <v-row>
            <v-col>
                    <div v-if="wallet.id" style="width: 200px; border: 1px solid #bbb; background-color: #fff; border-radius: 5px; padding: 15px;">
                        <b>Баланс:</b> {{ wallet.wallet + wallet.income - wallet.cost - wallet.adv}} руб.
                    </div> 
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

        <template v-slot:item.preview="{ item }">
            <div v-if="item.type.includes('image/')">
                <img :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.partner}/${item.filename}`" 
                    style="max-width: 100px; border-radius: 5px; margin: 5px;">
            </div>
            <div v-if="item.type.includes('video/')">
                <video style="max-width: 100px; border-radius: 5px; margin: 5px;">
                    <source :src="`https://storage.yandexcloud.net/${config.public.S3_BUCKET}/partners/${item.partner}/${item.filename}`" />
                </video>    
            </div>
        </template>

        <template v-slot:item.owner_name="{ item }">
            <div>{{ item.owner_name }}</div>
            <div style="font-size: 90%; color: #666;">{{ item.display_address }}</div>
        </template>
    
        <template v-slot:item.created_at="{ item }">
            <div>{{ item.created_at.split('T')[0] }}</div>
        </template>

        <template v-slot:item.date_start="{ item }">
            <div>{{ item.date_start.split('T')[0] }}</div>
        </template>

        <template v-slot:item.date_finish="{ item }">
            <div>{{ item.date_finish.split('T')[0] }}</div>
        </template>
    
        <template v-slot:item.status="{ item }">
            <span v-if="item.status == 0">{{ getStatus(item.status) }}</span>
            <span v-else-if="item.status == 2" style="color: green;">{{ getStatus(item.status) }}</span>
            <span v-else-if="item.status == 3" style="color: orange;">{{ getStatus(item.status) }}</span>
            <span v-else-if="item.status == 4" style="color: blue;">{{ getStatus(item.status) }}</span>
            <span v-else>{{ getStatus(item.status) }}</span>
        </template>
        
        <template v-slot:item.actions="{ item }">
            <div style="width: 100%; display: flex;">
                <div v-if="item.status == 0"><v-icon class="item-action" size="small" @click="sendRecord(item)">fa-regular fa-bell</v-icon><v-tooltip activator="parent" location="top">Отправить заявку на согласование</v-tooltip></div>
                <div v-if="item.status == 2 || item.status == 5"><v-icon class="item-action" size="small" @click="runRecord(item)">fa-solid fa-play</v-icon><v-tooltip activator="parent" location="top">Запустить кампанию</v-tooltip></div>
                <div v-if="item.status == 4" ><v-icon class="item-action" size="small" @click="stopRecord(item)">fa-solid fa-stop</v-icon><v-tooltip activator="parent" location="top">Остановить кампанию</v-tooltip></div>
                <div><v-icon class="item-action" size="small" @click="deleteRecord(item.id)">fa-solid fa-trash</v-icon><v-tooltip activator="parent" location="top">Удалить кампанию</v-tooltip></div>
            </div>
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
                <v-dialog v-model="dialog.send" persistent width="auto">
                  <v-card class="dialog-edit">
                    <v-card-text class="text-h6">Отправить заявку на рассмотрение владельца экрана?</v-card-text>
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
                <v-dialog v-model="dialog.run" persistent width="auto">
                  <v-card class="dialog-edit">
                    <v-card-text class="text-h6">Запустить кампанию?</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_run_yes">Да</v-btn>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_action_no">Нет</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
            </v-row>
        </client-only>

        <client-only>
            <v-row justify="center">
                <v-dialog v-model="dialog.stop" persistent width="auto">
                  <v-card class="dialog-edit">
                    <v-card-text class="text-h6">Остановить кампанию?</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="green-darken-1" variant="text" @click="dialog_stop_yes">Да</v-btn>
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
import randomId from "~/config/misc"

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
    send: false,
    run: false,
    stop: false,
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
    { title: '', key: 'preview' },
    { title: 'Номер заявки', key: 'name' },
    { title: 'Владелец / Адрес', key: 'owner_name' },
    { title: 'Бюджет', key: 'budget' },
    { title: 'Дата начала', key: 'date_start' },
    { title: 'Дата завершения', key: 'date_finish' },
    { title: 'Статус', key: 'status' },
    { title: 'Комментарий', key: 'description' },
    { title: 'Действия', key: 'actions', sortable: false }
]

const wallet = reactive({
    id: null,
    wallet: 0.00,
    cost: 0.00, 
    income: 0.00,
    adv: 0.00,
    adv_income: 0.00
})

const getStatus = (id) => {
 switch (Number(id)) {
    case 0: 
        return 'Новая'
    
    case 1: 
        return 'На рассмотрении'

    case 2: 
        return 'Одобрена'
    
    case 3: 
        return 'Отклонена'
    
    case 4: 
        return 'Работает'

    case 5: 
        return 'Пауза'

    case 6: 
        return 'Завершена'    
    
    default: 
        return 'Нет данных'
 }
}

const sendRecord = (item) => {
    dialog.send = true
    dialog.action = item
}

const dialog_send_yes = async () => {
    dialog.send = false

    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'send.invite', 
                owner: dialog.action.owner,
                order_id: dialog.action.id
            }),
        })

        if (data.value && data.value.code == 201) {
            useNuxtApp().$toast.error('Недостаточно средств на балансе')
		}

        if (data && data.value.code == 200) {
            useNuxtApp().$toast.success('Запрос успешно отправлен');
            setTimeout(() => {
                indexStore.progress = false
                loadRecords()
            }, 2000)
            
        } 
        if (!data.value || (data.value.code != 200 && data.value.code != 201)) {
            useNuxtApp().$toast.error('Ошибка запроса!');
        }
        indexStore.progress = false
        dialog.action = 0

    } catch(e) {
        console.log("Send invite error: ", e)
        indexStore.progress = false
    }
}

const runRecord = (item) => {
    dialog.run = true
    dialog.action = item
}

const stopRecord = (item) => {
    dialog.stop = true
    dialog.action = item
}

const deleteRecord = (id) => {
    dialog.delete = true
    dialog.action = id
}

const dialog_run_yes = async () => {
    dialog.run = false

	try {
		indexStore.progress = true
		message.value = ''

		const { data, error } = await useFetch('/api/orders', { 
			method: 'post', 
			body: { 
				action: 'index.status', 
				id: dialog.action.id,
                description: '',
                status: 4
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
            useNuxtApp().$toast.success('Кампания запущена')
            loadRecords()
		} 
        if (data.value && data.value.code != 200 && data.value && data.value.code != 201) {
            indexStore.orderView.visible = false
            useNuxtApp().$toast.error('Ошибка при запуске кампании')
			message.value = (error.value) ? error.value : ''
		}

	} catch (e) {
        message.value = e
		indexStore.progress = false
	}
}

const dialog_stop_yes = async () => {
    dialog.stop = false
    console.log("STOP DATA: ", dialog.action)
    
	try {
		indexStore.progress = true
		message.value = ''

		const { data, error } = await useFetch('/api/orders', { 
			method: 'post', 
			body: { 
				action: 'index.status', 
				id: dialog.action.id,
                description: null,
                status: 5
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
            useNuxtApp().$toast.success('Кампания остановлена')
            loadRecords()
            
		} else {
            indexStore.orderView.visible = false
            useNuxtApp().$toast.error('Ошибка при остановке кампании')
			message.value = (error.value) ? error.value : ''
		}

	} catch (e) {
        message.value = e
		indexStore.progress = false
	}
}

const dialog_delete_yes = async () => {
    dialog.delete = false

    const { data, error } = await userStore.myFetch('/api/orders', {
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
        loadRecords()

    } else {
        useNuxtApp().$toast.error('Ошибка удаления записи!');
    }

    dialog.action = 0
}

const dialog_action_no = () => {
    dialog.edit = false
    dialog.send = false
    dialog.run = false
    dialog.stop = false
    dialog.delete = false
    dialog.action = 0
}

const loadRecords = async () => {
    items.value.splice(0)
    items.value = []
    const partner = (userStore.partner) ? userStore.partner : null

    //console.log("loadRecords: ", partner)
    try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userStore.accessToken}`
            },
            body: JSON.stringify({ 
                action: 'index.list', 
                partner: partner
            }),
        })

        if (data.value.code == 200) {
            items.value = data.value.data
            console.log("ORDERS: ", items.value)
        }
        indexStore.progress = false

    } catch(e) {
        //console.log("ITEMS ERROR: ", e)
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