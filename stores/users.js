export const useUserStore = defineStore('user', {
    state: () => ({
        loggedIn: false,
        name: 'Guest',
        surname: '',
        company: 'None',
        email: 'None',
        partner: null,
        partnerName: null,
        partnerScope: null,
        scope: null,
        accessToken: null,
        accessTokenExpDate: null,
    }),
    actions: {
        async logout() {
            try {
                this.loggedIn = false
                const logout = await useFetch('/api/users', { 
                    method: 'post', 
                    body: { 
                        action: 'users.logout', 
                        token_refresh: this.accessToken,
                    } 
                })
                this.name = 'Guest'
                this.surname = ''
                this.company = 'None'
                this.email = 'None'
                this.scope = null
                this.partnerName = null
                this.partnerScope = null
                this.accessToken = null
                this.accessTokenExpDate = null

                const router = useRouter()
			    router.push("/")

            } catch(e) {
                //...
            }
        },

        async refreshTokens() {
            try {
                const { data: tokens } = await useFetch('/api/users', { 
                    method: 'post', 
                    body: { 
                        action: 'users.refresh', 
                        token_refresh: this.accessToken,
                    } 
                })
                console.log("Получен токен: ", tokens.value.data)
                this.accessToken = tokens.value.data.accessToken
                this.accessTokenExpDate = tokens.value.data.accessTokenExpDate

            } catch(e) {
                this.logout()
            }
        },

        async myFetch(url, params) {
            try {
                const { data, error } = await useFetch(url, { 
                    method: params.method, 
                    headers: params.headers,
                    body: params.body,
                    // onRequest({ request, options }) {
                    //   console.log("BEFORE REQUEST:")
                    // },
                    // onResponse({ request, response, options }) {
                    //   console.log("AFTER REQUEST: ", response._data)
                    // }  
                }) 
                
                console.log("MYFETCH CODE: ", data.value.code)
                switch (data.value.code) {
                    case 403:
                        refreshTokens()
                        const { dataAfterRefresh, errorAfterRefresh } = await useFetch(url, { 
                            method: params.method, 
                            headers: params.headers.Authorization = `Bearer ${userStore.accessToken}`,
                            body: params.body 
                        })
                        console.log("MYFETCH AFTER REFRESH CODE: ", dataAfterRefresh.value.code)
                        switch (dataAfterRefresh.value.code) {
                            case 403:
                                this.logout()
                                return null
        
                            default: 
                                return { dataAfterRefresh, errorAfterRefresh }
                        }

                    default: 
                        return { data, error }
                }
            } catch(e) {
                this.logout()
                return null
            }
        }
    },
    getters: {
    },
})
