<template>
    <div>
        <v-row style="margin: 0;">
            <v-col style="padding: 20px 20px 0 20px;">
                <Editor
                    v-model="editorContent"
                    :inline="false"
                    style="border: 1px solid blue;"
                    api-key="jcdk6tisrzl127y5uc5nw8sne5i26jkemklqanejp2frv3i8"
                    initial-value="Once upon a time..."
                    output-format="html"
                    :init="{
                    plugins: 'code',
                    toolbar: 'fontselect fontsizeselect forecolor backcolor | bold italic underline code | alignleft aligncenter alignright alignjustify | indent outdent'
                    }"
                />
                <textarea style="width: 100%; height: 100px; border: 1px solid #ccc; padding: 10px; margin-top: 10px;" v-model="editorContent"></textarea>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn @click="saveData" block style="background-color: #28a745; color: #fff;">Сохранить</v-btn>
                <v-btn @click="indexStore.elementAdd.visible = false" block style="background-color: #999; color: #fff; margin-top: 10px;">Закрыть</v-btn>
            </v-col>
        </v-row>

    </div>
</template>

<script setup>
import Editor from '@tinymce/tinymce-vue'

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()

const editorContent = ref(null)

const region = reactive({
    id: null,
    data: {},
    link: null,
})

region.id = indexStore.elementAdd.id

onMounted(() => {
    loadData()
})

const loadData = async () => {
    if (indexStore.layout.content.length) {
        indexStore.layout.content.forEach((item, index) => {
            if (region.id == item.id) {
                editorContent.value = item.media.type == 'html' ? item.media.code : null
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
                    indexStore.layout.content[index].media.type = 'html'
                    indexStore.layout.content[index].media.filename = 'HTML Code'
                    indexStore.layout.content[index].media.duration = 0
                    indexStore.layout.content[index].media.code = editorContent.value
                    indexStore.layout.content[index].imageMode = '2'
                } else {
                    indexStore.media.id = null
                    indexStore.media.type = 'html'
                    indexStore.media.filename = 'HTML Code'
                    indexStore.media.duration = 0
                    indexStore.media.code = editorContent.value
                }
            }
        })
    }
    indexStore.elementAdd.visible = false
}
</script>

<style lang="scss" scoped>

</style>