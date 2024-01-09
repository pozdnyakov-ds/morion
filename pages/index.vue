<template>
  <div class="main-content">
    <div class="slogan">Платформа управления цифровыми вывесками
    </div>
    <v-row>

      <v-col class="block-1">
        <div class="head-1">
          ВЛАДЕЛЬЦУ ТОРГОВОЙ ПЛОЩАДИ
        </div>
        <div class="content-1">
          <b>DISPLAY24 - надежное Digital signage решение для розницы и хореки.</b><br><br>

          <div class="marker"></div>
          <div class="text-1"><b>Сокращение постоянных издержек</b><br>
            Избавьтесь от постоянных расходов на изготовление и размещение печатных рекламных материалов. 
            Просто измените макет и нужные экраны обновятся автоматически.

          </div>
          <div class="marker"></div>
          <div class="text-1"><b>Рост продаж</b><br>
            Внедрение системы Digital signage повышает общие продажи в рознице. 

          </div>
          <div class="marker"></div>
          <div class="text-1"><b>Увеличение количества импульсных покупок</b><br>
            Увеличивайте покупательский чек, публикуя вашу рекламу в нужном месте и в правильное время.

          </div>
          <div class="marker"></div>
          <div class="text-1"><b>Доходы от рекламы</b><br>
            Привлекайте бюджеты от сторониих рекламодателей, предоставляя уникальные возможности размещения 
            на рекламных поверхностях качественно нового уровня.

          </div>
          <div class="marker"></div>
          <div class="text-1"><b>Отсутствие влияния человеческого фактора</b><br>
            Планируйте свои акции и загружайте удаленно. Отслеживайте статистику проигрываний.
          </div>
        </div>
      </v-col>
      <v-col class="block-2">
        <div class="head-1">
          РЕКЛАМОДАТЕЛЮ
        </div>
        <div class="content-2">
          <b>Пользуйтесь решением от DISPLAY24 для размещения своей рекламы на сторонних рекламных цифровых площадях.</b><br><br>
      
          <div class="marker"></div>
          <div class="text-1"><b>Универсальность</b><br>
          Подключайтесь к единой системе управления всеми поверхностями в нашей рекламной сети.<br>
          </div>

          <div class="marker"></div>
          <div class="text-1"><b>Планирование</b><br>
          Планируйте ваши кампании, выставляя роликам время жизни и конкретное расписание показов. 
          </div>

          <div class="marker"></div>
          <div class="text-1"><b>Подробная статистика</b><br>
          Получайте актуальную статистику в любое время и из любого места.
          Отслеживайте статистику по показам рекламных роликов в целом по сети или на конкретных экранах. 
          </div>

          <div class="marker"></div>
          <div class="text-1"><b>Актуальный статус работы сети</b><br>
          В реальном времени отслеживайте наличие связи с экранами, получите копии экрана с текущей трансляцией. 
          </div>
        </div>  
      </v-col>
      <v-col class="block-3">
        <div class="head-1">
          ПАРТНЕРУ
        </div>
        <div class="content-3">
          <b>Партнерская программа создана для действующих и новых игроков рекламной отрасли.</b><br><br>

          <div class="marker"></div>
          <div class="text-1"><b>Рынок</b><br>
          В настоящее время рынок Digital Signage стремительно развивается, практически удваиваясь каждые 2-3 года. 
          Сегодня это перспективная сфера бизнеса, в которую имеет смысл инвестировать деньги, время и усилия.
          </div>

          <div class="marker"></div>
          <div class="text-1"><b>С чего же начать?</b><br>
          Вы продаете цифровые экраны и готовые решения на их основе? 
          Получите новых клиентов и увеличьте вашу доходность за счет внедрения в ваши проекты решения от платформы DISPLAY24. 
          </div>

          <div class="marker"></div>
          <div class="text-1"><b>Вы будете получать комиссинные со всех платежей ваших клиентов и привлеченных вами рекламодателей.</b><br>
          Также вы получите брендированную панель управления и брендированное приложение.
          </div>

          <div class="marker"></div>
          <div class="text-1"><b>Стать партнером</b><br>
          Вам будет предоставлена для заполнения короткая форма обратной связи. 
          После наш сотрудник свяжется с вами для обсуждения деталей возможного сотрудничества.
          </div>

        </div>
      </v-col>
    </v-row>
        
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