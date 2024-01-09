<template>
    <div class="main-content">
        <div class="page-title">
            Контакты  
        </div>
    
    </div>
</template>
    
<script setup>
const indexStore = useIndexStore()
const userStore = useUserStore()   

definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})
   
</script>
    
<style lang="scss" scoped>
    
</style>