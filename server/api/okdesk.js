import db from "../../config/database"
import checkAccessToken from "~/config/token"

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const body = await readBody(event)
    const headers = Object.fromEntries(Array.from(event.headers.entries()));
    const params = {...body}
    
    const response = {
        code: 204,
        message: 'No Content',
        data: null
    }
    const setResponse = (code, message, data) => {
        response.code = code
        response.message = message
        response.data = data
    }

    params.action = (params.action) ? params.action : null;

    switch (params.action) {
        case 'get.companies':

            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get companies list
            const token = process.env.OKDESK_TOKEN
            console.log("TOKEN: ", token)
            const list = []
            var res = null
            var data = null
            var step = 0

            do { 
                res = await fetch('https://morion.okdesk.ru/api/v1/companies/list?api_token=' + token + '&page[direction]=forward&page[size]=100&page[from_id]=' + step, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                data = await res.json();
                data.forEach((item) => {
                    list.push(item)
                })

                step = step + data.length

                // Задержка 1 сек для Окдеска
                setTimeout(function() {
                    //...
                }, 1000);

            } while (data.length == 100)

            // console.log("FULL LIST: ", list)

            setResponse(200, 'Ok', list)
            return response    
            
        default:
            setResponse(204, 'No Content', null)
            return response
    }
})