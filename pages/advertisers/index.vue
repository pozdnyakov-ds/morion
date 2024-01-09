<template>
    <div class="main-content">
        <div class="page-title">
            Статистика  
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
    .chips {
        border-radius: 10px;
        background-color: #eee;
        padding: 3px 10px 3px 10px;
        font-size: small;
        display: inline-block;
        margin-right: 5px;
    }
    .item-action {
        color: #666;
        margin-right: 10px;
    }
    .dialog-delete {
        padding: 0px;
    }
    </style>