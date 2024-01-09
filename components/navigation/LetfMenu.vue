<template>
<client-only>
    <v-navigation-drawer
        app
        location="left"  
        :permanent="true"
        class="mt-5"
        color="#D6EAF8"
        width="250"
        style="top: 30px; padding: 0; border-right: 4px dashed #ccc;" 
        v-model="userStore.loggedIn" 
        >
        <div class="user-info">
            <div class="user-info-item"><b>{{ userStore.name }} {{ userStore.surname }}</b></div>
            <div class="user-info-item"><b>Email:</b> {{ userStore.email }}</div>
            <!-- <div><b>Partner ID:</b> {{ userStore.partner }}</div> -->
            <div class="user-info-item"><b>Роль:</b> {{ getScope() }}</div>
            <!-- <div class="user-info-item"><b>Партнер:</b> {{ userStore.partnerName }}</div> -->
            <!-- <div><b>PartnerScope:</b> {{ userStore.partnerScope }}</div> -->
            
        </div>
        <div class="menu">
            <div v-for="item in tree" :key="item.id" style="">
                <div v-if="item.path != '/' && hasAccess(item) && hasRole(item)" class="menu-line" :style="{
                    'margin-top': (item.level == 0) ? '10px' : '0px'
                    }" onmouseover="this.style.background='#ffffff99';" onmouseout="this.style.background='#D6EAF8';">
                    <div v-if="(item.level == 0)">
                        <div class="menu-item" style="font-weight: bold; margin-left: 15px;">{{ item.title }}</div>
                    </div>
                    <div v-else>
                        <nuxt-link class="menu-item" :to="item.path" :style="{
                            'font-weight': 'normal',
                            'margin-left': (15+item.level*20)+'px',
                        }">{{ item.title }}</nuxt-link>
                    </div>
                </div>
            </div>
        </div> 
    </v-navigation-drawer>
</client-only>
</template>

<script setup>
import LTT from 'list-to-tree'

const indexStore = useIndexStore()
const userStore = useUserStore()
const dialog = reactive({
    exit: false
})

const dialog_exit_yes = async () => {
    dialog.exit = false
    userStore.logout()
}

// Catalog
const tree = ref([])
const menu = new Map([])

const getScope = () => {
switch (userStore.scope) {
    case 'owner':
        return 'Владелец'
        break
    case 'admin':
        return 'Администратор'
        break
    case 'marketing':
        return 'Маркетинг'
        break
}
}

const hasAccess = (item) => {
    const ar = userStore.partnerScope
    const id = item.id

    var routeId = 999
    if (id >= 100 && id < 200) routeId = 0
    if (id >= 200 && id < 300) routeId = 1
    if (id >= 300 && id < 400) routeId = 2

    if (ar && ar.includes(routeId)) { return true }
    else { return false }
}

const hasRole = (item) => {
    const id = Number(item.id)
    const userScope = (userStore.scope) ? userStore.scope : null
    
    var isAccess = true
    const currentItem = menu.get(id)

    if (Number(currentItem.rights[userScope]) == 1) {
        isAccess = true
    } else {
        isAccess = false
    }
    return isAccess
}

const makeTree = async () => {
    const list = await indexStore.getRights()
    
    const ltt = new LTT(list, {
            key_id: 'id',
            key_parent: 'parent'
        });
    const items = ltt.GetTree()

    const tree = []
    const lister = (obj, parent, level) => {
        if (obj && obj.length) {
        obj.forEach((item) => {
            if (item.visible == 1) {
                if (item.child && item.child.length) {
                    tree.push({ 'id': item.id, 'title': item.title, 'description': item.description, 'parent': parent, 'level': level, 
                        'path': item.path, 'list_order': item.list_order, 'rights': item.rights, 'status': item.status })
                    lister(item.child, item.id, level + 1)
                } else {
                    tree.push({ 'id': item.id, 'title': item.title, 'description': item.description, 'parent': parent, 'level': level, 
                        'path': item.path, 'list_order': item.list_order, 'rights': item.rights, 'status': item.status })
                }
            }
        })
        } 
    }
    lister(items, 0, 0)
    return tree
}

// onMounted(async () => {
    tree.value = await makeTree()
    tree.value.forEach((item) => {
        menu.set(item.id, JSON.parse(JSON.stringify(item)))
    })
// })


</script>

<style lang="scss" scoped>
.menu {
    width: 100%;
    padding: 0;
    margin-bottom: 75px;
}
.menu-line {
    width: 100%;
}
.user-info {
    margin: 0px;
    padding: 15px;
    color: #333;
    border-bottom: 0px solid #fff;
    background-color: #ffffff99;
}
.user-info-item {
    font-size: 90%;
}
.navbar-link {
    color: #333;
    text-decoration: none;
    font-weight: normal;
    font-size: 90%;
}
a {
    font-weight: bold;
    text-decoration: none;
    color: #333;
    cursor: pointer;
}  
.v-btn {
    color: #333;
}
.v-list-item--density-default {
    min-height: 32px;
}
</style>