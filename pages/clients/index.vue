<template>
    <div class="main-content">
        <div class="page-title">
            Статистика  
        </div>

        <highchart :options="chartOptions" 
            :update="['options.title', 'options.series']"
            style="border: 1px solid #ccc; border-radius: 5px; margin: 10px 0 10px 0;"
        />
    
    </div>
</template>
    
<script setup>
import HighCharts from 'highcharts'

const indexStore = useIndexStore()
const userStore = useUserStore()
const items = ref([]) 

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

const partner = reactive({
    selected: null
})

onMounted(() => {
    partner.selected = userStore.partner ? userStore.partner : null
})

watch(() => partner.selected, (n, o) => {
    if (o != n) {
        loadOwnerViews()
    }
})

const chartOptions = {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Показы собственного контента',
        align: 'left'
    },
    subtitle: {
        text:
            'Source: <a target="_blank" ' +
            'href="https://www.indexmundi.com/agriculture/?commodity=corn">indexmundi</a>',
        align: 'left'
    },
    xAxis: {
        categories: [],
        crosshair: true,
        accessibility: {
        description: 'Countries'
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: '1000 metric tons (MT)'
        }
    },
    tooltip: {
        valueSuffix: ' (1000 MT)'
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: [
        {
        name: 'Media',
        data: []
        },
        // {
        // name: 'Wheat',
        // data: [51086, 136000, 5500, 141000, 107180, 77000]
        // }
    ]
}

const loadOwnerViews = async () => {
    // try {
        indexStore.progress = true
        const { data, error } = await userStore.myFetch('/api/statistics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                action: 'owner.views', 
                owner_id: partner.selected
            }),
        })

        console.log("STATS: ", data.value)
        const filenames = []
        
        if (data.value.code == 200) {
            items.value = data.value.data
            items.value.forEach((item) => {
                filenames.push(item.filename)
            })

            chartOptions.xAxis.categories = [... new Set(filenames)]
            console.log("Unique filenames", chartOptions.xAxis.categories)
        }
        indexStore.progress = false

    // } catch(e) {
    //     console.log("LOOPS ERROR: ", e)
    //     indexStore.progress = false
    // }
}

</script>
    
<style lang="scss" scoped>
.item-action {
    color: #666;
    margin-right: 10px;
}
.dialog-delete {
    padding: 0px;
}
</style>