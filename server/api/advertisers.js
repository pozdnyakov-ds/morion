import db from "../../config/database"
import checkAccessToken from "~/config/token"
import randomId from "../../config/misc"

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
        case 'orders.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get orders list
            try {
                const partner = (params.partner) ? params.partner : null

                const data = await new Promise((resolve, reject) => {
                    db.query("SELECT id, name, description, created_at, status FROM orders WHERE partner=?", 
                    [partner], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Ok', data)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response

        default:
            setResponse(400, 'List error', null)
            return response
    }
})