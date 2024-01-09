<template>
    <div class="main-content">
    
        <v-form v-model="valid">
            <v-container style="padding: 20px 0 0 0;">
                <client-only>

                <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
                    <div class='col-12'><span>Ошибка: {{ message }}</span></div>
                </div>
                <v-row>
                    <v-col cols="4">
                        <v-select
                            label="Тип партнера"
                            :items="[{ id: 0, name: 'Юридическое лицо'}, { id: 1, name: 'Индивидуальный предприниматель'}, { id: 2, name: 'Самозанятый'}]"
                            v-model="recordInfo.type"
                            item-title="name"
                            item-value="id"
                    ></v-select>
                    </v-col>
                    <v-col cols="8">&nbsp;</v-col>
                </v-row>
                <div class="block" v-if="recordInfo.type == 0 || recordInfo.type == 1">
                    <v-row>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.shortName" label="Краткое наименование" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.name" label="Полное наименование" type="text" outlined />   
                            </div>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.description" label="Дополнительно" type="text" outlined />   
                            </div>
                        </v-col>
                    </v-row>
                </div>
                <div class="block" v-if="recordInfo.type == 2">
                    <v-row>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.personFamily" label="Фамилия" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.personName" label="Имя" type="text" outlined />   
                            </div>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.personSurname" label="Отчество" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.description" label="Дополнительно" type="text" outlined />   
                            </div>
                        </v-col>
                    </v-row>
                </div>
                <div class="block" v-if="recordInfo.type == 2">
                    <v-row>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.documentType" label="Тип документа" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.documentNumber" label="Номер" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.documentSource" label="Кем выдан" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.documentDate" label="Дата выдачи" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.documentOthers" label="Дополнительно" type="text" outlined />   
                            </div>
                        </v-col>
                    </v-row>
                </div>
                <div class="block">
                    <v-row>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.phone" label="Телефон" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.email" label="Email" type="text" outlined />   
                            </div>
                        </v-col>
                    </v-row>
                </div>
                <div class="block" v-if="recordInfo.type == 0 || recordInfo.type == 1">
                    <v-row>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.ogrn" label="ОГРН" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.inn" label="ИНН" type="text" outlined />   
                            </div>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.kpp" label="КПП" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.okpo" label="ОКПО" type="text" outlined />   
                            </div>
                        </v-col>
                    </v-row>
                </div>
                <div class="block">
                    <v-row>
                        <v-col cols="12">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.addressRegistration" label="Адрес юридический/регистрации" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.addressFact" label="Адрес фактический" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.addressPost" label="Адрес почтовый" type="text" outlined />   
                            </div>
                        </v-col>
                    </v-row>
                </div>
                <div class="block">
                    <v-row>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.accountPayment" label="Расчетный счет" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.accountCorrespondent" label="В банке" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.bankName" label="Корр. счет" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.bankBic" label="БИК" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.bankInn" label="ИНН банка" type="text" outlined />   
                            </div>
                        </v-col>
                        <v-col cols="6">
                            <div class="input-group mb-6">
                                <v-text-field v-model="recordInfo.bankAddress" label="Адрес банка" type="text" outlined />   
                            </div>
                        </v-col>
                    </v-row>
                </div>
                <v-row>
                    <v-col>
                        <div style="padding: 0px; margin-bottom: 0px;">
                            <v-btn style="background-color: #119DFF; color: #fff;" @click.prevent="saveData" :disabled="!valid && !indexStore.captchaReady">Сохранить</v-btn>
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

var recordInfo = reactive({
    id: null,
    type: 0,

    shortName: '',
    name: '',
    description: '',

    personName: '',
    personSurname: '',
    personFamily: '',

    phone: '',
    email: '',

    ogrn: '',
    inn: '',
    kpp: '',
    okpo: '',

    addressRegistration: '',
    addressFact: '',
    addressPost: '',

    accountPayment: '',
    accountCorrespondent: '',
    bankName: '',
    bankBic: '',
    bankInn: '',
    bankAddress: '',

    documentType: '',
    documentNumber: '',
    documentSource: '',
    documentDate: '',
    documentOthers: ''
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

const loadData = async () => {
    if (!partner.selected) {
        return
    }
    // try {
        indexStore.progress = true
        message.value = ''
        
        const { data, error } = await useFetch('/api/finances', { 
            method: 'post', 
            body: { 
                action: 'details.get', 
                partner: partner.selected,
            } 
        })
        indexStore.progress = false

        if (data.value && data.value.code == 200) {
            const code = data.value.code
            const record = data.value.data[0]
            //console.log("DETAILS: ", record)

            recordInfo.id = record.id
            recordInfo.type = record.details.type && record.details.type >= 0 ? record.details.type : 0

            recordInfo.shortName = record.details.shortName ? record.details.shortName : ''
            recordInfo.name = record.details.name ? record.details.name : ''
            recordInfo.description = record.details.description ? record.details.description : ''

            recordInfo.personName = record.details.personName ? record.details.personName : ''
            recordInfo.personSurname = record.details.personSurname ? record.details.personSurname : ''
            recordInfo.personFamily = record.details.personFamily ? record.details.personFamily : ''

            recordInfo.phone = record.details.phone ? record.details.phone : ''
            recordInfo.email = record.details.email ? record.details.email : ''

            recordInfo.ogrn = record.details.ogrn ? record.details.ogrn : ''
            recordInfo.inn = record.details.inn ? record.details.inn : ''
            recordInfo.kpp = record.details.kpp ? record.details.kpp : ''
            recordInfo.okpo = record.details.okpo ? record.details.okpo : ''

            recordInfo.addressRegistration = record.details.addressRegistration ? record.details.addressRegistration : ''
            recordInfo.addressFact = record.details.addressFact ? record.details.addressFact : ''
            recordInfo.addressPost = record.details.addressPost ? record.details.addressPost : ''

            recordInfo.accountPayment = record.details.accountPayment ? record.details.accountPayment : ''
            recordInfo.accountCorrespondent = record.details.accountCorrespondent ? record.details.accountCorrespondent : ''
            recordInfo.bankName = record.details.bankName ? record.details.bankName : ''
            recordInfo.bankBic = record.details.bankBic ? record.details.bankBic : ''
            recordInfo.bankInn = record.details.bankInn ? record.details.bankInn : ''
            recordInfo.bankAddress = record.details.bankAddress ? record.details.bankAddress : ''

            recordInfo.documentType = record.details.documentType ? record.details.documentType : ''
            recordInfo.documentNumber = record.details.documentNumber ? record.details.documentNumber : ''
            recordInfo.documentSource = record.details.documentSource ? record.details.documentSource : ''
            recordInfo.documentDate = record.details.documentDate ? record.details.documentDate : ''
            recordInfo.documentOthers = record.details.documentOthers ? record.details.documentOthers : ''

            //console.log("recordInfo: ", recordInfo)

        } else {
            message.value = (error.value) ? error.value : ''
        }

    // } catch (e) {
    //     message.value = e
    //     indexStore.progress = false
    // }
}

const saveData = async () => {
    const token_recaptcha = await grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'login'})
    if (!token_recaptcha) return

    //console.log("SAVE DETAILS: ", recordInfo)

    // try {
        indexStore.progress = true
        message.value = ''
        
        const { data, error } = await useFetch('/api/finances', { 
            method: 'post', 
            body: { 
                action: 'details.save', 
                partner: recordInfo.id,
                details: JSON.stringify(recordInfo),
                token_recaptcha: token_recaptcha
            } 
        })
        indexStore.progress = false

        if (data.value && data.value.code == 200) {
            const code = data.value.code
            useNuxtApp().$toast.success('Информация успешно обновлена')

        } else {
            useNuxtApp().$toast.error('Ошибка обновления')
            message.value = (error.value) ? error.value : ''
        }

    // } catch (e) {
    //     useNuxtApp().$toast.error('Ошибка обновления')
    //     message.value = e
    //     indexStore.progress = false
    // }
}

</script>

<style lang="scss" scoped>
.block {
    border-top: 0px solid #eee;
    padding: 20px 10px 10px 10px;
    margin: 0 0 20px 0;
}
.v-row {margin: 0px;}
.v-col {padding: 0 12px 0 12px;}
</style>