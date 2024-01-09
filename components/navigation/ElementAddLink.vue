<template>
    <div>
        <v-row style="margin: 10px 0 0 0;">
            <v-col style="padding: 0 20px 0 20px;">
                Указать ссылку на внешний документ<br> 
                http:// или https://
                <v-text-field
                    label="Ссылка"
                    required
                    v-model="region.link"
                    append-inner-icon="fa-regular fa-circle-xmark"
                    @click:append-inner="clearLink"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn @click="saveData" :disabled="!region.link || !region.link.length" block style="background-color: #28a745; color: #fff;">Выбрать</v-btn>
                <v-btn @click="indexStore.elementAdd.visible = false" block style="background-color: #999; color: #fff; margin-top: 10px;">Закрыть</v-btn>
            </v-col>
        </v-row>

    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

const region = reactive({
    id: null,
    data: {},
    link: null
})

region.id = indexStore.elementAdd.id

onMounted(() => {
    loadData()
})

const clearLink = () => {
    region.link = null
}

const loadData = () => {
    if (indexStore.layout.content.length) {
        indexStore.layout.content.forEach((item, index) => {
            if (region.id == item.id) {
                    region.link = item.media.type == 'link' ? item.media.filename : null
                    console.log("LINK: ", region, item)
            }
        })
    }
}

const saveData = async () => {
    if (indexStore.layout.content.length) {
        indexStore.layout.content.forEach((el, index) => {
            if (region.id == indexStore.elementAdd.id) {
                if (indexStore.media.direct) {
                    indexStore.layout.content[index].media.id = null
                    indexStore.layout.content[index].media.type = 'link'
                    indexStore.layout.content[index].media.filename = region.link
                    indexStore.layout.content[index].media.duration = 0
                    indexStore.layout.content[index].imageMode = '2'
                } else {
                    indexStore.media.id = null
                    indexStore.media.type = 'link'
                    indexStore.media.filename = region.link
                    indexStore.media.duration = 0
                }
            }
        })
    }
    indexStore.elementAdd.visible = false
}
</script>

<style lang="scss" scoped>

</style>