<template>
    <div class="main-content">
    
        <v-form v-model="valid">
            <v-container style="padding: 20px 0 0 0;">
                <client-only>

                <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
                    <div class='col-12'><span>Ошибка: {{ message }}</span></div>
                </div>
                <v-row>
                    <v-col cols="6">
                        <v-card style="padding: 10px;"><b>Поступления</b>
                            <v-row style="margin: 20px 0 20px 0;">
                                <v-col cols="4"> 
                                    <v-text-field v-model="recordInfo.wallet" label="Пополнения кошелька, руб." type="text" outlined readonly />
                                </v-col>    
                                <v-col cols="8">
                                    Сумма операций по пополнению кошелька
                                </v-col>
                            </v-row>
                            <v-row style="margin: 20px 0 20px 0;">
                                <v-col cols="4">
                                    <v-text-field v-model="recordInfo.adv_income" label="Доходы от рекламы, руб." type="text" outlined readonly />
                                </v-col>    
                                <v-col cols="8">
                                    Доход владельца экрана от партнерской рекламы
                                </v-col>
                            </v-row>
                            <v-row style="margin: 20px 0 20px 0;">
                                <v-col cols="4">
                                    <v-text-field v-model="recordInfo.income" label="Партнерский доход, руб." type="text" outlined readonly />
                                </v-col>    
                                <v-col cols="8">
                                    Доход от партнерской программы
                                </v-col>
                            </v-row>    
                        </v-card>
                    </v-col>
                    <v-col cols="6">
                        <v-card style="padding: 10px;"><b>Расходы</b>
                            <v-row style="margin: 20px 0 20px 0;">
                                <v-col cols="4">
                                    <v-text-field v-model="recordInfo.cost" label="Начисления за аренду экранов, руб." type="text" outlined readonly />
                                </v-col>
                                <v-col cols="8">
                                    Сумма ежедневных начислений за аренду экранов. 
                                </v-col>
                            </v-row>
                            <v-row style="margin: 20px 0 20px 0;">
                                    <v-col cols="4">         
                                    <v-text-field v-model="recordInfo.adv" label="Расходы на рекламу, руб." type="text" outlined readonly />
                                </v-col>
                                <v-col cols="8">
                                    Стоимость рекламных кампаний на партнерских экранах.
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row style="margin: 20px 0 0 0;">
                    <v-col cols="2">
                        <div class="input-group mb-4">
                            <v-text-field v-model="recordInfo.balance" label="Итоговый баланс, руб." type="text" outlined readonly />   
                        </div>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <div>
                            <v-btn style="background-color: #119DFF; color: #fff;" @click.prevent="charge" :disabled="!valid && !indexStore.captchaReady">Пополнить</v-btn>
                        </div>
                    </v-col>
                </v-row>
                            
                </client-only>
            </v-container>
        </v-form>
    
    </div>
</template>

<script setup>
const valid = ref(false)
const message = ref('')

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
indexStore.progress = false
indexStore.captchaReady = false

const recordInfo = reactive({
    id: '',
    wallet: 0.0,
    cost: 0.0,
    income: 0.0,
    balance: 0.0,
    adv: 0.0
})

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

watch(() => recordInfo.wallet, (n, o) => {
    recordInfo.balance = (recordInfo.wallet*1.0 + recordInfo.income*1.0 - recordInfo.cost - recordInfo.adv).toFixed(2)
})

watch(() => recordInfo.cost, (n, o) => {
    recordInfo.balance = (recordInfo.wallet*1.0 + recordInfo.income*1.0 - recordInfo.cost - recordInfo.adv).toFixed(2)
})

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
                action: 'balance.get', 
                id: partner.selected,
            } 
        })
        indexStore.progress = false

        if (data.value && data.value.code == 200) {
            const code = data.value.code
            const record = data.value.data[0]
            recordInfo.id = record.id
            recordInfo.wallet = record.wallet && record.wallet !== undefined ? record.wallet : 0.00
            recordInfo.cost = record.cost && record.cost !== undefined ? record.cost : 0.00
            recordInfo.income = record.income && record.income !== undefined ? record.income : 0.00
            recordInfo.adv = record.adv && record.adv !== undefined ? record.adv : 0.00
            recordInfo.adv_income = record.adv_income && record.adv_income !== undefined ? record.adv_income : 0.00

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
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>