<template>
    <div class="main-content">
        <div class="page-title">
            Статистика  
        </div>
    
        <!-- <template v-slot:text>
            <v-text-field
              v-model="search"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              single-line
              variant="outlined"
              hide-details
            ></v-text-field>
          </template> -->
      
        <v-data-table
            :headers="headers"
            :items="items"
            :search="search"
        >
        <template v-slot:item.name="{ item }">
            ={{ item.name }}=
        </template>

        </v-data-table>

    </div>
</template>
    
<script setup>
const indexStore = useIndexStore()
const userStore = useUserStore()   

const search = ref(null)
const headers = [
    {
    align: 'start',
    key: 'name',
    sortable: false,
    title: 'Dessert (100g serving)',
    },
    { key: 'calories', title: 'Calories' },
    { key: 'fat', title: 'Fat (g)' },
    { key: 'carbs', title: 'Carbs (g)' },
    { key: 'protein', title: 'Protein (g)' },
    { key: 'iron', title: 'Iron (%)' },
]
const items = ref([
    {
        name: 'Frozen Yogurt',
        calories: 159,
        fat: 6.0,
        carbs: 24,
        protein: 4.0,
        iron: 1,
    },
    {
        name: 'Ice cream sandwich',
        calories: 237,
        fat: 9.0,
        carbs: 37,
        protein: 4.3,
        iron: 1,
    }
])

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})
   
</script>
    
<style lang="scss" scoped>
.item-action {
    color: #666;
    margin-right: 10px;
}
</style>