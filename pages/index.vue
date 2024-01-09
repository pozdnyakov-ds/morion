<template>
  <div class="main-content">
    <div class="slogan">Панель управления</div>
        
  </div>
</template>

<script setup>
definePageMeta({
    layout: "default",
    middleware: ['auth', 'access']
})

const indexStore = useIndexStore()
const userStore = useUserStore()
const message = ref('')
indexStore.progress = false

onMounted(() => {
  console.log("MODE: ", process.env.NODE_ENV)
  //...
})

</script>

<style lang="scss" scoped>
.block-1, .block-2, .block-3  {
  padding: 0;
  margin-bottom: 20px;
  border-radius: 0 0 10px 10px;
  background-position: right bottom;
}
.block-1  {
  background-image: url(/img/index/pic-1.jpg);
  margin-right: 20px;
}
.block-2  {
  background-image: url(/img/index/pic-2.jpg);
  margin-right: 20px;
}
.block-3  {
  background-image: url(/img/index/pic-3.jpg);
}
.head-1 {
  width: 100%;
  background-color: #D6EAF8;
  color: #333;
  padding: 20px;
  font-weight: bold;
}
.content-1, .content-2, .content-3 {
  width: 100%;
  padding: 20px 20px 150px 20px;
  font-size: 90%;
}
.slogan {
  font-size: 32pt; 
  font-weight: bold;
  color: #5DADE2;
  margin: 10px 0 20px 0;
}
.marker {
  background-color: #D6EAF8; 
  width: 15px; 
  height: 15px;
  margin: 0px 10px 0 0;
  float: left;
}
.text-1 {
  flex: 1;
  margin-bottom: 15px;
}
.v-row {
  display: flex;
  align-items: top;
}
</style>