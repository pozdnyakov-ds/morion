<template>
<div>
    <v-footer padless>
        <v-col class="text-center" cols="12">
            2012-{{ new Date().getFullYear() }} — <strong>Morion</strong>
        </v-col>
    </v-footer>  
</div>

</template>

<script setup>
    
</script>

<style lang="scss" scoped>
.v-footer {
    background-color: #eee;
    height: 50px;
    color: #333;
    z-index: 9999;
    padding: 0px;
}
</style>