<template>
<div>
    <!-- <b>Content: </b>{{ indexStore.layout }} -->
    <client-only>
        <v-container style="padding: 0px; margin: 0px;">
            <div style="padding: 12px; margin: 0px; border-bottom: 1px solid #ccc; margin: 10px;">
                <div class="page-title" style="margin: 0px;">МАКЕТ: {{ indexStore.layout.container.name }} </div>
                <div style="font-size: small;" >Описание: {{ indexStore.layout.container.description }} </div>
            </div>

            <div v-if="message" class="row" style="text-align: center; margin-top: 10px; color: red;">
                <div class='col-12'><span>Ошибка: {{ message }}</span></div>
            </div>

            <Content :id="id" :key="id"/>
            
        </v-container>
    </client-only>

    <LayoutInfo :id="id" :key="indexStore.layoutInfo.key"/>
    <!-- <LayoutInfo :id="id"/> -->

</div>
</template>

<script setup>
import LayoutInfo from '../components/navigation/LayoutInfo.vue'
import randomId from "../config/misc"

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

const route = useRoute()
const router = useRouter()
const valid = ref(false)
const message = ref('')

const config = useRuntimeConfig()
const indexStore = useIndexStore()
const userStore = useUserStore()
indexStore.progress = false
indexStore.captchaReady = false

indexStore.layout.container.key = randomId(32)
indexStore.layoutInfo.key = randomId(32)
indexStore.layoutInfo.visible = false
indexStore.elementAdd.visible = false
indexStore.elementInfo.visible = false

const recordInfo = reactive({
    id: null,
    name: '',
    description: null
})

const loadData = async (id) => {
    if (!id) {
        return
    }
    // try {
		indexStore.progress = true
		message.value = ''
		
		const { data, error } = await useFetch('/api/layouts', { 
			method: 'post', 
			body: { 
				action: 'index.get', 
				id: id,
			} 
		})
		indexStore.progress = false

		if (data.value && data.value.code == 200) {
			const code = data.value.code
            const record = data.value.data[0]

            indexStore.layout.container = {
                id: record.id,
                key: randomId(32),
                name: record.name,
                description: record.description,
                partner: record.partner,
                coef: 1.0,
                ratio: record.ratio,
                ratio_width: record.ratio_width,
                ratio_height: record.ratio_height,
                resolution: record.resolution,
                resolution_width: record.resolution_width,
                resolution_height: record.resolution_height,
                width: record.width,
                height: record.height,
                style: {
                    width: 0,
                    height: 0,
                    // backgroundColor: '#fff',
                    // border: '1px solid #ccc',
                    // boxShadow: '5px 5px 5px #ccc'
                },
                created_at: record.created_at.split('T')[0]
            }
            
            indexStore.layout.content = []

            if (record.ratio != 99) {
                indexStore.layout.container.coef = 1024 / record.resolution_width
                //console.log("РАЗМЕРЫ !=99: ", indexStore.layout.container.coef, record.resolution_width, record.resolution_height)
                indexStore.layout.container.style.width = (record.resolution_width * indexStore.layout.container.coef) + 'px'
                indexStore.layout.container.style.height = (record.resolution_height * indexStore.layout.container.coef) + 'px'
            }
            if (record.ratio == 99) {
                indexStore.layout.container.coef = 1024 / record.width
                //console.log("РАЗМЕРЫ ==99: ", indexStore.layout.container.coef, record.ratio, record.width, record.height)
                indexStore.layout.container.style.width = (record.width * indexStore.layout.container.coef) + 'px'
                indexStore.layout.container.style.height = (record.height * indexStore.layout.container.coef) + 'px'
            } 

            if (record.content && record.content.length) {
                record.content.forEach((el, index) => {

                    let elReady = JSON.parse(JSON.stringify(el))

                    indexStore.layout.content.push({
                        id: elReady.id,
                        type: elReady.type,
                        fixed: elReady.fixed,
                        x: elReady.x * indexStore.layout.container.coef,
                        y: elReady.y * indexStore.layout.container.coef,
                        w: elReady.w * indexStore.layout.container.coef,
                        h: elReady.h * indexStore.layout.container.coef,
                        isActive: elReady.isActive,
                        zIndex: elReady.zIndex,
                        isMenu: elReady.isMenu,
                        imageMode: elReady.imageMode,
                        media: {
                            id: elReady.media.id,
                            type: elReady.media.type,
                            filename: elReady.media.filename,
                            stratch: elReady.media.stratch,
                            duration: elReady.media.duration
                        },
                        style: {
                            background: { color: elReady.style.background.color },
                            border: { color: elReady.style.border.color, type: elReady.style.border.type, width: elReady.style.border.width, radius: elReady.style.border.radius },
                            shadow: {}
                        }
                    })
                })
                //console.log("READY: ", indexStore.layout.content)
            }
          
		} else {
			message.value = (error.value) ? error.value : ''
		}

	// } catch (e) {
    //     message.value = e
	// 	indexStore.progress = false
	// }
}

const id = ref((route.params.id) ? route.params.id : null)
loadData(id.value)

onMounted(() => {
    //...
})
   
</script>

<style lang="scss" scoped>

</style>