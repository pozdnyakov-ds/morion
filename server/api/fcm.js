import db from "../../config/database"
import checkAccessToken from "~/config/token"
import randomId from "../../config/misc"
import path from 'path'
import translit from '../../config/translit'

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3client"
import { Buffer } from 'node:buffer'

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
    const displayId = params.display_id ? params.display_id : ""
    const displayCode = params.display_code ? params.display_code : ""
    const displayName = params.display_name ? params.display_name : "None"
    const displayToken = params.display_token ? params.display_token : ""

    switch (params.action) {
        case 'display.reload':
            try {
                const response = await fetch('https://fcm.googleapis.com/fcm/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'key=AAAAHEewpyE:APA91bGIfqS7wlS2_2oZyOo92T9fGKEzQYVz0W-yyuWhilrDMPxyfrF2th40JXKXsEGUe85T5oVTlmx1qoigY5foaTYpSjLJGjjUeeNaA86qmkW_Jp7_SLBfUbXj_KDuhNoLVePFqr9x'
                    },
                    body: JSON.stringify({
                        data: {
                            mode: 1,
                            title: "Обновление дисплея",
                            displayId: displayId,
                            displayCode: displayCode,
                            displayName: displayName
                        },
                        to: displayToken
                    }),
                })
                if (!response.ok) {
                    setResponse(204, 'Display refresh command send ERROR', null)
                    return response
                }
                data = await response.json();
                setResponse(200, 'Display refresh command send OK', data)
        
            } catch (err) {
                setResponse(204, 'Display refresh command send ERROR', null)
                return response
            }
            
            return response

        case 'display.status':
            try {
                const response = await fetch('https://fcm.googleapis.com/fcm/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'key=AAAAHEewpyE:APA91bGIfqS7wlS2_2oZyOo92T9fGKEzQYVz0W-yyuWhilrDMPxyfrF2th40JXKXsEGUe85T5oVTlmx1qoigY5foaTYpSjLJGjjUeeNaA86qmkW_Jp7_SLBfUbXj_KDuhNoLVePFqr9x'
                    },
                    body: JSON.stringify({
                        data: {
                            mode: 2,
                            title: "Статус дисплея",
                            displayId: displayId,
                            displayCode: displayCode,
                            displayName: displayName
                        },
                        to: displayToken
                    }),
                })
                if (!response.ok) {
                    setResponse(204, 'Display status command send ERROR', null)
                    return response
                }
                data = await response.json();
                setResponse(200, 'Display status command send OK', data)
        
            } catch (err) {
                setResponse(204, 'Display status command send ERROR', null)
                return response
            }
            
            return response    

        default:
            setResponse(400, 'Action error', null)
            return response
    }
})