<template>
    <v-app>
        <v-main>
            <v-container fluid style="margin: 0px; padding: 0px;">
                <slot />
            </v-container>
        </v-main>
        <Progress />
    </v-app>
</template>

<script setup>

</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');

body {
    font-family: 'Roboto', sans-serif;
}
a { 
    text-decoration: none; 
}
.page-title {
    font-weight: bold;
    margin-bottom: 15px;
    text-transform: uppercase;
    margin-top: 15px;
}
</style>