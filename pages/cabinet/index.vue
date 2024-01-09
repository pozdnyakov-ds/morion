<template>
    <div class="main-content">
        <div class="page-title">
            Кабинет партнера
        </div>

    <v-tabs
        v-model="tab" 
        bg-color="white"
        show-arrows
        >
        <v-tab value="info" @click="currentTab = 0">Общая информация</v-tab>
        <v-tab value="details" @click="currentTab = 1">Реквизиты</v-tab>
        <v-tab value="balance" @click="currentTab = 2">Баланс</v-tab>
        <v-tab value="transactions" @click="currentTab = 3">Транзакции</v-tab>

    </v-tabs>
    
    <v-window v-model="tab">
        <v-window-item value="info">
            <Info :key="keyInfo"/>
        </v-window-item>
        <v-window-item value="details">
            <Details :key="keyDetails"/>
        </v-window-item>
        <v-window-item value="balance">
            <Balance :key="keyBalance"/>
        </v-window-item>
        <v-window-item value="transactions">
            <Transactions :key="keyTransactions"/>
        </v-window-item>
         
    </v-window>
    </div>
</template>
    
<script setup>
import Info from '../components/cabinet/Info.vue'
import Details from '../components/cabinet/Details.vue'
import Balance from '../components/cabinet/Balance.vue'
import Transactions from '../components/cabinet/Transactions.vue'
import randomId from '~/config/misc'

const indexStore = useIndexStore()
const tab = ref(null)
const currentTab = ref(0)

const keyInfo = ref(randomId(32))
const keyDetails = ref(randomId(32))
const keyBalance = ref(randomId(32))
const keyTransactions = ref(randomId(32))

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

watch(() => currentTab.value, (n, o) => {
    switch (Number(n)) {
        case 0: 
            keyInfo.value = randomId(32)
            break
        case 1: 
            keyDetails.value = randomId(32)
            break
        case 2: 
            keyBalance.value = randomId(32)
            break
        case 3: 
            keyTransactions.value = randomId(32)
            break
        default:
            //...
    }
})

</script>
    
<style lang="scss" scoped>

</style>