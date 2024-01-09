import db from "../../config/database"
import checkAccessToken from "~/config/token"
import randomId from "../../config/misc"
import path from 'path'
import translit from '../../config/translit'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const headers = getRequestHeaders(event)
    const params = { ...body }
    
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
    const address = params.address ? params.address.replace(/ /g, "+") : ''
    const kind = params.kind ? params.kind : 'locality'

    switch (params.action) {
        case 'get.coords':
            try {
                const response = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${config.YANDEX_API_KEY}&geocode=${address}&format=json`, {
                    method: 'GET',
                })
                if (!response.ok) {
                    setResponse(204, 'NO geo data', null)
                    return response
                }
                const data = await response.json();
                setResponse(200, 'Geo data OK', data)
        
            } catch (err) {
                setResponse(204, 'Geo data ERROR', null)
                return response
            }
            
            return response

        // case 'display.status':
        //     try {
        //         const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Authorization': 'key=AAAAHEewpyE:APA91bGIfqS7wlS2_2oZyOo92T9fGKEzQYVz0W-yyuWhilrDMPxyfrF2th40JXKXsEGUe85T5oVTlmx1qoigY5foaTYpSjLJGjjUeeNaA86qmkW_Jp7_SLBfUbXj_KDuhNoLVePFqr9x'
        //             },
        //             body: JSON.stringify({
        //                 data: {
        //                     mode: 2,
        //                     title: "Статус дисплея",
        //                     displayId: displayId,
        //                     displayCode: displayCode,
        //                     displayName: displayName
        //                 },
        //                 to: displayToken
        //             }),
        //         })
        //         if (!response.ok) {
        //             setResponse(204, 'Display status command send ERROR', null)
        //             return response
        //         }
        //         data = await response.json();
        //         setResponse(200, 'Display status command send OK', data)
        
        //     } catch (err) {
        //         setResponse(204, 'Display status command send ERROR', null)
        //         return response
        //     }
            
        //     return response    

        default:
            setResponse(400, 'Action error', null)
            return response
    }
})