export const useIndexStore = defineStore('index', {
    state: () => ({
        progress: false,
        captchaReady: false,

        // Device
        device: {
            uniqueData: [],
            players: []
        },

        // Loops
        loops: new Map(),

        // Schedules
        schedules: new Map(),

        loopPlus: {
            visible: false,
            action: null,
            data: null,
            key: 0,
        },
        loopInfo: {
            visible: false,
            action: null,
            data: null,
            key: 0,
        },
        order: {
            displayId: null,
            display: null,
            playlist: null,
            media: null,
            playlist: null,
            bid: 100,
            startDate: null,
            finishDate: null,
            owner: null,
            partner: null
        },
        orderView: {
            visible: false,
            action: null,
            data: null,
            key: 0,
            reload: null
        },
        // Displays
        display: {
            coordinates: null,
            visible: false,
            action: null,
            data: null,
            key: 0,
            reload: false,
        },    
        displayAdd: {
            visible: false,
            action: null,
            data: null,
            key: 0,
            reload: false
        },
        displayEdit: {
            visible: false,
            action: null,
            data: null,
            key: 0,
            reload: false
        },
        displayInfo: {
            visible: false,
            action: null,
            data: null,
            key: 0,
            reload: false
        },

        // Layouts
        layout: {
            container: {
                id: null,
                key: null,
                name: null,
                description: null,
                partner: null,
                coef: 1,
                ratio: 0,
                ratio_width: 0,
                ratio_height: 0,
                resolution: 0,
                resolution_width: 0,
                resolution_height: 0,
                layout_width: 0,
                layout_height: 0,
                style: {
                    backgroundColor: '#fff',
                    width: 0,
                    height: 0,
                    minWidth: '100px',
                    minHeight: '100px',
                    border: '0px solid #ccc',
                    position: 'relative',
                    marginTop: '0px',
                    boxShadow: '0px 0px 5px 3px #999'
                }
            },
            content: []
        },
        media: {
            direct: false,
            id: null,
            filename: null,
            type: null,
            duration: null,
            stratch: null
        },
        layoutInfo: {
            visible: false,
            action: null,
            data: null,
            key: 0,
            partner: null
        },
        elementAdd: {
            id: null,
            visible: false,
            action: null,
            data: null,
            key: 0,
        },
        elementInfo: {
            id: null,
            visible: false,
            action: null,
            data: null,
            key: 0,
        },
        videoView: {
            visible: false,
            item: null
        }    
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