export default defineNuxtRouteMiddleware(async (to, from) => {

    const indexStore = useIndexStore()
    const index = useLocalStorage("index", JSON.stringify(indexStore.$state))
    //console.log("AUTH INDEX: ", index.value)
    indexStore.$state = (index && index.value && index.value !== undefined) ? JSON.parse(index.value) : {}

    const userStore = useUserStore()
    const user = useLocalStorage("user", JSON.stringify(userStore.$state))
    //console.log("AUTH USER: ", user.value)
    userStore.$state = (user && user.value && user.value !== undefined) ? JSON.parse(user.value) : {}
  
    const now = new Date()
    now.setDate(now.getDate())
    const expire1070 = new Date(0)
    const expire = userStore.accessTokenExpDate ? userStore.accessTokenExpDate : expire1070

    if (now > expire || !userStore.loggedIn) {
        to.path = "/login"
    }

  })