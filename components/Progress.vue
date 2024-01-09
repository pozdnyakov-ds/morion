<template>
    <div>
        <div class="container" v-if="indexStore.progress">
                <v-progress-circular
                    indeterminate
                    color="blue-grey"
                ></v-progress-circular>
        </div>
    </div>
</template>
    
<script setup>
        const indexStore = useIndexStore()

</script>
    
<style scoped>
    .container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
    }
</style>