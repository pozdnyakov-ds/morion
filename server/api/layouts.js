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

            var query = `SELECT layouts.id, layouts.name, layouts.description, layouts.partner, layouts.ratio, layouts.resolution, 
                layouts.width, layouts.height, layouts.content, layouts.created_at, layouts.status, 
                layouts_ratios.width AS ratio_width, layouts_ratios.height AS ratio_height, 
                layouts_resolutions.width AS resolution_width, layouts_resolutions.height AS resolution_height
                FROM layouts 
                LEFT JOIN layouts_ratios ON layouts_ratios.id = layouts.ratio
                LEFT JOIN layouts_resolutions ON layouts_resolutions.id = layouts.resolution
                WHERE layouts.partner=?`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [partner], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Layouts list Ok', data)
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
                    db.query("UPDATE layouts SET status=? WHERE id=?", 
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
                const ratioCreate = params.ratio !== null ? params.ratio : null
                const resolutionCreate = params.resolution !== null ? params.resolution : null
                const widthCreate = params.width ? params.width : null
                const heightCreate = params.height ? params.height : null
                const partnerCreate = params.partner

                const data = await new Promise((resolve, reject) => {
                    db.query("INSERT INTO layouts (id, name, description, partner, ratio, resolution, width, height, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'))", 
                    [idCreate, nameCreate, descriptionCreate, partnerCreate, ratioCreate, resolutionCreate, widthCreate, heightCreate], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (data && data.affectedRows == 1) {
                    setResponse(200, 'Create layout OK', null)
                    return response
                } 
              
            // } catch (e) {
            //     setResponse(204, 'Create layout error', e)
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
            var query = `SELECT layouts.id, layouts.name, layouts.description, layouts.partner, layouts.ratio, layouts.resolution, layouts.width, layouts.height, 
                layouts.content, layouts.created_at, layouts.status, 
                layouts_ratios.width AS ratio_width, layouts_ratios.height AS ratio_height, 
                layouts_resolutions.width AS resolution_width, layouts_resolutions.height AS resolution_height, layouts.created_at
                FROM layouts 
                LEFT JOIN layouts_ratios ON layouts_ratios.id = layouts.ratio
                LEFT JOIN layouts_resolutions ON layouts_resolutions.id = layouts.resolution
                WHERE layouts.id=? LIMIT 1`
            
            try {
                const dataGet = await new Promise((resolve, reject) => {
                    db.query(query, 
                        [idGet], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (dataGet && dataGet.length == 1 ) {
                    setResponse(200, 'Layout get Ok', dataGet)
                    return response
                }
                setResponse(204, 'Layout no data', null)
                
            } catch (error) {
                setResponse(400, 'Layout get error', null)
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
                
                const ratioSave = params.ratio
                const resolutionSave = params.resolution
                const widthSave = params.width
                const heightSave = params.height

                const dataSave = await new Promise((resolve, reject) => {
                    db.query("UPDATE layouts SET name=?, description=?, ratio=?, resolution=?, width=?, height=? WHERE id=?", 
                    [nameSave, descriptionSave, ratioSave, resolutionSave, widthSave, heightSave, idSave], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (dataSave && dataSave.affectedRows == 1) {
                    setResponse(200, 'Update layout OK', null)
                    return response
                } 
                   
            // } catch (e) {
            //     setResponse(204, 'Update layout error', e)
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
            //console.log("LOOP API: ", params.item)
            
            const idUpdate = params.item && params.item.id ? params.item.id : null
            const itemName = params.item && params.item.name ? params.item.name : null
            const itemDescription = params.item && params.item.description ? params.item.description : null

            const data8 = await new Promise((resolve, reject) => {
                db.query("UPDATE loops SET name=?, description=? WHERE id=?", 
                [itemName, itemDescription, idUpdate], (err, data) => {
                    if (err) {reject(err)} else {resolve(data)}
                })
            })  

            if (data8 && data8.affectedRows == 1) {
                setResponse(200, 'Update loop OK', null)
                return response
            }

        } catch (e) {
            setResponse(204, 'Update loop error', e)
        }
        return response
          
        case 'index.delete':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Loop delete
            try {
                const idDelete = params.id
                
                const dataDelete = await new Promise((resolve, reject) => {
                    db.query("DELETE FROM layouts WHERE id=?", 
                    [idDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (dataDelete && dataDelete.affectedRows == 1) {
                    setResponse(200, 'Delete layout OK', null)
                    return response
                }

            } catch (e) {
                setResponse(204, 'Delete layout error', e)
            }
            return response 

        case 'ratios.list':
            // Get ratios list
            var query = `SELECT id, name, width, height, status 
                FROM layouts_ratios 
                WHERE status=1
                ORDER BY id`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Ratios list Ok', data)

            } catch (error) {
                setResponse(204, 'Ratios no content', null)
            }
            return response 
            
        case 'resolutions.list':
            // Get resolutions list
            const ratio = params.ratio

            var query = "SELECT id, name, ratio, width, height, status FROM layouts_resolutions WHERE ratio=? AND status=1"
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [ratio], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Resolutions list Ok', data)
                
            } catch (error) {
                setResponse(204, 'Resolutions no content', null)
            }
            return response 
            
        case 'content.save':  
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Layout save
            // try {
                const idContentSave = params.id
                const contentSave = params.content && params.content.length ? params.content : null

                const dataContentSave = await new Promise((resolve, reject) => {
                    db.query("UPDATE layouts SET content=? WHERE id=?", 
                    [contentSave, idContentSave], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (dataContentSave && dataContentSave.affectedRows == 1) {
                    setResponse(200, 'Update layout OK', null)
                    return response
                } 
                    
            // } catch (e) {
            //     setResponse(204, 'Update layout error', e)
            // }

        return response    

        case 'media.save':  
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Layout save
            // try {
                const idMediaSave = params.id
                const idLayoutSave = params.layout_id
                const mediaSave = params.media && params.media.length ? params.media : null

                const dataMediaSave = await new Promise((resolve, reject) => {
                    db.query("UPDATE layouts SET content=? WHERE id=?", 
                    [contentSave, idContentSave], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (dataContentSave && dataContentSave.affectedRows == 1) {
                    setResponse(200, 'Update layout OK', null)
                    return response
                } 
                    
            // } catch (e) {
            //     setResponse(204, 'Update layout error', e)
            // }

            return response 
        
        default:
            setResponse(400, 'Action error', null)
            return response
    }
})