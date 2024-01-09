import db from "../../config/database"
import checkAccessToken from "~/config/token"
import randomId from "../../config/misc"
import translit from '../../config/translit'

function getDisplayId(length) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

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

    switch (params.action) {
        case 'index.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get marquees list
            const partner = params.partner

            var query = `SELECT marquees.id, marquees.name, marquees.code, marquees.partner, marquees.created_at, marquees.status 
                FROM marquees 
                WHERE marquees.partner=?`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [partner], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Marquees list Ok', data)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response

        case 'index.active':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get marquees list
            const partnerActive = params.partner

            var query = `SELECT marquees.id, marquees.name, marquees.code, marquees.partner, marquees.created_at, marquees.status 
                FROM marquees 
                WHERE marquees.partner=? AND status = 1`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [partnerActive], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Marquees active list Ok', data)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response

        case 'index.status':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Toggle status
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("UPDATE marquees SET status=? WHERE id=?", 
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

        case 'index.create':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Layout create
            // try {
                const idCreate = randomId(32)
                const nameCreate = params.name
                const codeCreate = params.code
                const partnerCreate = params.partner

                const data = await new Promise((resolve, reject) => {
                    db.query("INSERT INTO marquees (id, name, code, partner, created_at) VALUES (?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'))", 
                    [idCreate, nameCreate, codeCreate, partnerCreate], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (data && data.affectedRows == 1) {
                    setResponse(200, 'Create marquees OK', null)
                    return response
                } 
              
            // } catch (e) {
            //     setResponse(204, 'Create marquees error', e)
            // }
            return response

        case 'index.get':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get layout
            const idGet = (params.id) ? params.id : null
            var query = `SELECT marquees.id, marquees.name, marquees.code, marquees.partner, marquees.created_at, marquees.status
                FROM marquees 
                WHERE marquees.id=? 
                LIMIT 1`
            
            try {
                const dataGet = await new Promise((resolve, reject) => {
                    db.query(query, 
                        [idGet], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (dataGet && dataGet.length == 1 ) {
                    setResponse(200, 'Marquees get Ok', dataGet)
                    return response
                }
                setResponse(204, 'Marquees no data', null)
                
            } catch (error) {
                setResponse(400, 'Marquees get error', null)
            }
            return response

        case 'index.save':  
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Layout save
            // try {
                const idSave = params.id
                const nameSave = params.name
                const codeSave = params.code
                
                const dataSave = await new Promise((resolve, reject) => {
                    db.query("UPDATE marquees SET name=?, code=? WHERE id=?", 
                    [nameSave, codeSave, idSave], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (dataSave && dataSave.affectedRows == 1) {
                    setResponse(200, 'Update marquee OK', null)
                    return response
                } 
                   
            // } catch (e) {
            //     setResponse(204, 'Update marquee error', e)
            // }

            return response
        
              
        case 'index.delete':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Marquee delete
            try {
                const idDelete = params.id
                
                const dataDelete = await new Promise((resolve, reject) => {
                    db.query("DELETE FROM marquees WHERE id=?", 
                    [idDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (dataDelete && dataDelete.affectedRows == 1) {
                    setResponse(200, 'Delete marquee OK', null)
                    return response
                }

            } catch (e) {
                setResponse(204, 'Delete marquee error', e)
            }
            return response 

        default:
            setResponse(400, 'Action error', null)
            return response
    }
})