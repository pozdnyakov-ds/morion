import db from "../../config/database"
import randomId from "../../config/misc"

export default defineEventHandler(async (event) => {
    
    const response = {
        code: 204,
        message: 'No Content',
        data: null,
    }
    
    const setResponse = (code, message, data) => {
        response.code = code
        response.message = message
        response.data = data
    }

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: response.headers,
            body: JSON.stringify({}),
        }
    }

    const params = new URLSearchParams(event.path.split("?")[1])
    const code = params.get("code")

    try {
        var data = await new Promise((resolve, reject) => {
            db.query(`SELECT displays.id AS display_id, displays.name AS display_name, displays.description AS display_description, displays.code AS display_code, 
                displays.layout AS display_layout, displays.display_group AS display_group_id, displays.token AS display_token, 
                displays_groups.name AS display_group_name, 
                displays.partner AS partner_id, 
                partners.name AS partner_name, partners.logo AS partner_logo, 
                layouts.name AS layout_name  
                
                FROM displays
                LEFT JOIN partners ON partners.id = displays.partner
                LEFT JOIN displays_groups ON displays_groups.id = displays.display_group
                LEFT JOIN layouts ON layouts.id = displays.layout 
                WHERE partners.status=1 AND displays.status=1 AND displays.code=?
                LIMIT 1`, [code], (err, data) => {
                if (err) {reject(err)} else {resolve(data)}
            })
        })

        if (!data) { data = [] }

        setResponse(200, 'Display data OK', data)
        return response

    } catch (error) {
        setResponse(204, 'Display data ERROR', null)
        return response
    }

})