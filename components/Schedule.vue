<template>
    <div>
        <!-- Расписание: {{ scheduleId }}<hr> -->
        <div style="display: flex; margin: 20px 0 10px 0; width: 300px;">
            <v-text-field
                style="width: 150px; background-color: #fff;"
                label="Начало"
                v-model="indexStore.schedules.get(scheduleId).content.start"
                type="date"
                single-line
                hide-details
                variant="outlined"
            >
            </v-text-field>
            <v-text-field 
                style="width: 150px; margin: 0 0 0 20px; background-color: #fff;"
                label="Завершение"
                v-model="indexStore.schedules.get(scheduleId).content.finish"
                type="date"
                single-line
                hide-details
                variant="outlined"
            >
            </v-text-field>
        </div>
        <div style="width: 100%; display: flex;">
            <div v-for="(day, index) in indexStore.schedules.get(scheduleId).content.days" :key="day" class="day-column">
                {{ day.name }}
                <v-switch
                    v-model="day.status"
                    hide-details
                    inset
                    color="#28a745"
                ></v-switch>
                <v-text-field 
                    style="background-color: #fff;"
                    v-model="day.startTime"
                    type="time"
                    single-line
                    hide-details
                    variant="outlined"
                    :disabled="!day.status"
                >
                </v-text-field>
                <v-text-field 
                    style="margin: 10px 0 10px 0; background-color: #fff;"
                    v-model="day.finishTime"
                    type="time"
                    single-line
                    hide-details
                    variant="outlined"
                    :disabled="!day.status"
                >
                </v-text-field>
            </div>
        </div>
        <v-btn @click="saveRecord" style="background-color: #28a745; color: #fff; margin: 0 0 20px 0;">Сохранить</v-btn>
    </div>
</template>

<script setup>
const indexStore = useIndexStore()
const props = defineProps({
    id: String,
})
const scheduleId = props.id ? ref(props.id) : ref(null)

const saveRecord = async () => {

    // try {
		indexStore.progress = true

		const { data, error } = await useFetch('/api/schedules', { 
			method: 'post', 
			body: { 
				action: 'index.update', 
				id: scheduleId.value,
                content: indexStore.schedules.get(scheduleId.value).content, 
			} 
		})
		indexStore.progress = false

        // console.log("RESULT: ", data.value)

		if (data.value && data.value.code == 200) {
			const code = data.value.code
            useNuxtApp().$toast.success('Запись обновлена')

		} else {
            useNuxtApp().$toast.error('Ошибка обновления')
		}

	// } catch (e) {
	// 	indexStore.progress = false
	// }
}


</script>

<style lang="scss" scoped>
.day-column {
    flex: 1; /* Равномерно распределяет доступное пространство */
    border: 0px solid #ccc;
    text-align: center;
    padding: 5px;    
}
</style>