<template>
    <div class="main-content">
        <v-container style="padding: 0px;">
            <client-only>

                <v-row>
                    <v-col>&nbsp;</v-col>
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
                    :items="transactions"
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
                    <div>{{ item.created_at ? item.created_at.split('T')[0] + " " + item.created_at.split('T')[1].split('.')[0] : "-" }}</div>
                </template>

                <template v-slot:item.type="{ item }">
                    <div>{{ getTransactionType(item.type) }}</div>
                </template>
          
                </v-data-table>
                        
            </client-only>
        </v-container>   
    </div>
</template>

<script setup>
const valid = ref(false)
const message = ref('')
const page = ref(1)
const showBy = ref(10)
const search = ref('')

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
indexStore.progress = false
indexStore.captchaReady = false

const transactions = ref([])

const headers = [
    { title: 'Дата транзакции', key: 'created_at' },
    { title: 'Тип транзакции', key: 'type' },
    { title: 'Сумма, руб.', key: 'amount' }
]

const partner = reactive({
    selected: null
})

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        loadData()
    }
})

const getTransactionType = (type) => {
    switch (Number(type)) {
        case 0: 
            return "Пополнение баланса"
        break

        case 1: 
            return "Начисление за аренду"
        break

        case 2: 
            return "Партнёрский доход"
        break

        default:
            return "-"
    }
}

const loadData = async () => {
    if (!partner.selected) {
        return
    }
    try {
        indexStore.progress = true
        message.value = ''
        
        const { data, error } = await useFetch('/api/finances', { 
            method: 'post', 
            body: { 
                action: 'transactions.list', 
                partner: partner.selected,
            } 
        })
        indexStore.progress = false

        if (data.value && data.value.code == 200) {
            transactions.value = data.value.data
            
        } else {
            message.value = (error.value) ? error.value : ''
        }

    } catch (e) {
        message.value = e
        indexStore.progress = false
    }
}

const charge = () => {
    console.log("Пополнить баланс")
}

</script>

<style lang="scss" scoped>

</style>