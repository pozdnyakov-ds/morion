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
        case 'menu.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get index list
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("SELECT id, title, description, parent, path, rights, list_order, visible, status FROM menu WHERE status=?", 
                    [params.status], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Ok', data)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response

        case 'roles.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get roles list
            try {
                const status = 1
                const data1 = await new Promise((resolve, reject) => {
                    db.query("SELECT id, role, name, status FROM roles WHERE status=?", 
                    [status], (err, data1) => {
                        if (err) {reject(err)} else {resolve(data1)}
                    })
                })
                setResponse(200, 'Ok', data1)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response  
            
        case 'roles.status':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Update user status 
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("UPDATE menu SET status=? WHERE id=?", 
                    [params.status, params.id], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (data && data.affectedRows != 1) {
                    setResponse(400, 'Update status error', null)
                    return response
                }
                setResponse(200, 'Ok', data)

            } catch (error) {
                setResponse(400, 'Update status error', null)
            }
            return response     

        default:
            setResponse(204, 'No Content', null)
            return response
    }
})