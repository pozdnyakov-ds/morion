<template>
    <div class="main-content">
        <div class="page-title">
            Услуги  
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