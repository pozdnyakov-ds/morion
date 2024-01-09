import db from "../../config/database"
import checkAccessToken from "~/config/token"
import randomId from "../../config/misc"
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

    switch (params.action) {
        case 'index.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get partners list
            const partner = params.partner

            var query = `SELECT id, name, description, partner, created_at, status
                FROM displays_groups 
                WHERE partner=?`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [partner], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Groups list Ok', data)
            } catch (error) {
                setResponse(204, 'Groups no content', null)
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
                    db.query("UPDATE displays_groups SET status=? WHERE id=?", 
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
                const descriptionCreate = params.description
                const partnerCreate = params.partner

                const data = await new Promise((resolve, reject) => {
                    db.query("INSERT INTO displays_groups (id, name, description, partner, created_at) VALUES (?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'))", 
                    [idCreate, nameCreate, descriptionCreate, partnerCreate], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (data && data.affectedRows == 1) {
                    setResponse(200, 'Create group OK', null)
                    return response
                } 
              
            // } catch (e) {
            //     setResponse(204, 'Create group error', e)
            // }
            return response

        case 'index.get':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get group
            const idGet = (params.id) ? params.id : null
            var query = `SELECT id, name, description, partner, created_at, status
                FROM displays_groups 
                WHERE id=? LIMIT 1`
            
            try {
                const dataGet = await new Promise((resolve, reject) => {
                    db.query(query, 
                        [idGet], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (dataGet && dataGet.length == 1 ) {
                    setResponse(200, 'Group get Ok', dataGet)
                    return response
                }
                setResponse(204, 'Group no data', null)
                
            } catch (error) {
                setResponse(400, 'Group get error', null)
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
                const descriptionSave = params.description 
                
                const dataSave = await new Promise((resolve, reject) => {
                    db.query("UPDATE displays_groups SET name=?, description=? WHERE id=?", 
                    [nameSave, descriptionSave, idSave], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (dataSave && dataSave.affectedRows == 1) {
                    setResponse(200, 'Update group OK', null)
                    return response
                } 
                   
            // } catch (e) {
            //     setResponse(204, 'Update group error', e)
            // }

            return response
        
    case 'index.update':
        // Check access token
        if (!checkAccessToken(event)) {
            setResponse(403, 'Invalid access token', null)
            return response
        }

        // Loop update
        try {
            const idUpdate = params.item && params.item.id ? params.item.id : null
            const nameUpdate = params.item && params.item.name ? params.item.name : null
            const descriptionUpdate = params.item && params.item.description ? params.item.description : null

            const data8 = await new Promise((resolve, reject) => {
                db.query("UPDATE displays_groups SET name=?, description=? WHERE id=?", 
                [nameUpdate, descriptionUpdate, idUpdate], (err, data) => {
                    if (err) {reject(err)} else {resolve(data)}
                })
            })  

            if (data8 && data8.affectedRows == 1) {
                setResponse(200, 'Update group OK', null)
                return response
            }

        } catch (e) {
            setResponse(204, 'Update group error', e)
        }
        return response
          
        case 'index.delete':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Group delete
            try {
                const idDelete = params.id
                
                const dataDelete = await new Promise((resolve, reject) => {
                    db.query("DELETE FROM displays_groups WHERE id=?", 
                    [idDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (dataDelete && dataDelete.affectedRows == 1) {
                    setResponse(200, 'Delete group OK', null)
                    return response
                }

            } catch (e) {
                setResponse(204, 'Delete group error', e)
            }
            return response 
       
        default:
            setResponse(400, 'Action error', null)
            return response
    }
})