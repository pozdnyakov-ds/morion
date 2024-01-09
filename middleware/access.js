export default defineNuxtRouteMiddleware(async (to, from) => {
    const indexStore = useIndexStore()
    const userStore = useUserStore()

    const list = await indexStore.getRights()
    const scope = userStore.scope

    var isAccess = false
    for (var key in list) {
        const item = list[key]
        if (item.path === to.path && Number(item.rights[scope]) == 1) {
            isAccess = true
        }
    }

    if (!isAccess) {
        const router = useRouter()
        //router.push("/no_access")
    }
})