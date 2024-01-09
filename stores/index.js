export const useIndexStore = defineStore('index', {
    state: () => ({
        progress: false,
        captchaReady: false,
    }),
    actions: {
        getRoles() {
            const headers = [
                { title: 'Документ', key: 'title' },
                { title: 'Владелец', key: 'owner' },
                { title: 'Админ', key: 'admin' },
                { title: 'Маркетинг', key: 'marketing' },
                { title: 'Статус', key: 'status' }
            ]
            return headers
        },
        async getRights() {
            const { data: menuList } = await useFetch('/api', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }, 
                body: JSON.stringify({ 
                    action: 'menu.list', 
                    status: 1 
                }),
            })

            var list = (menuList.value && menuList.value.data) ? JSON.parse(JSON.stringify(menuList.value.data)) : []
            list.forEach((item) => {
                item.id = Number(item.id)
                item.parent = Number(item.parent)
                item.visible = Number(item.visible)
                item.status = (item.status === 1) ? true : false
            })
            return list
        },
        setCookie(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "expires=" + date.toUTCString();
            document.cookie = name + "=" + value + "; " + expires + "; path=/";
        },
    },
    getters: {
    },
})