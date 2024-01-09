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

            // Get partners list
            const partner = params.partner

            var query = `SELECT displays.id, displays.name, displays.description, displays.address, displays.geo, displays.type, 
                displays.code, displays.partner, displays.display_group, displays.token, displays.rate, 
                displays.layout, displays.created_at, displays.status, 
                displays_groups.name AS group_name, layouts.name AS layout_name
                FROM displays 
                LEFT JOIN displays_groups ON displays.display_group = displays_groups.id
                LEFT JOIN layouts ON displays.layout = layouts.id
                WHERE displays.partner=?`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [partner], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Displays list Ok', data)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response

        case 'places.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            var query = `SELECT displays.id, displays.name, displays.description, displays.address, displays.geo, displays.type, displays.code, 
                displays.partner, displays.display_group, displays.token, displays.rate, 
                displays.layout, displays.created_at, displays.status, displays_groups.name AS group_name, 
                layouts.name AS layout_name, layouts.ratio AS layout_ratio, layouts.resolution AS layout_resolution, layouts.width AS layout_width, layouts.height AS layout_height,
                layouts_ratios.name AS ratio_name, layouts_ratios.width AS ratio_width, layouts_ratios.height AS ratio_height,
                layouts_resolutions.name AS resolution_name, layouts_resolutions.width AS resolution_width, layouts_resolutions.height AS resolution_height, 
                partners.name AS partner_name 
                FROM displays 
                LEFT JOIN displays_groups ON displays.display_group = displays_groups.id
                LEFT JOIN layouts ON displays.layout = layouts.id
                LEFT JOIN layouts_ratios ON layouts.ratio = layouts_ratios.id
                LEFT JOIN layouts_resolutions ON layouts.resolution = layouts_resolutions.id
                LEFT JOIN partners ON displays.partner = partners.id
                WHERE displays.type=1 AND displays.status=1`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Places list Ok', data)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response

        case 'playlists.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }
            const displayId = params.id

            var query = `SELECT displays.id, displays.name, displays.description, displays.address, displays.geo, displays.type, 
                displays.code, displays.partner, displays.display_group, displays.token, displays.rate, 
                displays.layout, displays.created_at, displays.status, displays_groups.name AS group_name, 
                layouts.id AS layout_id, layouts.name AS layout_name, layouts.content AS layout_content
                FROM displays 
                LEFT JOIN displays_groups ON displays.display_group = displays_groups.id
                LEFT JOIN layouts ON displays.layout = layouts.id
                WHERE displays.id=?`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [displayId], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Places list Ok', data)
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
                    db.query("UPDATE displays SET status=? WHERE id=?", 
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

        case 'index.type':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Toggle status
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("UPDATE displays SET type=? WHERE id=?", 
                    [params.type, params.id], (err, data) => {
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

            // Display create
            // try {
                const idCreate = randomId(32)
                const nameCreate = params.name
                const descriptionCreate = params.description
                const partnerCreate = params.partner
                const groupCreate = params.group
                const layoutCreate = params.layout
                const geoCreate = params.geo ? JSON.stringify(params.geo) : null
                const addressCreate = params.address && params.address.length ? params.address.substring(0, 255) : null
                const typeCreate = params.type ? params.type : 0
                const rateCreate = params.rate

                const data = await new Promise((resolve, reject) => {
                    db.query("INSERT INTO displays (id, name, description, address, geo, type, code, partner, rate, display_group, layout, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'))", 
                    [idCreate, nameCreate, descriptionCreate, addressCreate, geoCreate, typeCreate, getDisplayId(10), partnerCreate, rateCreate, groupCreate, layoutCreate], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (data && data.affectedRows == 1) {
                    setResponse(200, 'Create display OK', null)
                    return response
                } 
              
            // } catch (e) {
            //     setResponse(204, 'Create display error', e)
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

            var query = `SELECT displays.id, displays.name, displays.description, displays.address, displays.geo, displays.type, displays.code, 
            displays.partner AS partner_id, displays.display_group, displays.token, displays.rate, 
            displays.layout, displays.created_at, displays.status, displays_groups.name AS group_name, 
            layouts.name AS layout_name, layouts.ratio AS layout_ratio, layouts.resolution AS layout_resolution, layouts.width AS layout_width, layouts.height AS layout_height,
            layouts_ratios.name AS ratio_name, layouts_ratios.width AS ratio_width, layouts_ratios.height AS ratio_height,
            layouts_resolutions.name AS resolution_name, layouts_resolutions.width AS resolution_width, layouts_resolutions.height AS resolution_height, 
            partners.name AS partner_name 
            FROM displays 
            LEFT JOIN displays_groups ON displays.display_group = displays_groups.id
            LEFT JOIN layouts ON displays.layout = layouts.id
            LEFT JOIN layouts_ratios ON layouts.ratio = layouts_ratios.id
            LEFT JOIN layouts_resolutions ON layouts.resolution = layouts_resolutions.id
            LEFT JOIN partners ON displays.partner = partners.id
            WHERE displays.id=?
            LIMIT 1`
            
            try {
                const dataGet = await new Promise((resolve, reject) => {
                    db.query(query, 
                        [idGet], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (dataGet && dataGet.length == 1 ) {
                    setResponse(200, 'Display get Ok', dataGet)
                    return response
                }
                setResponse(204, 'Display no data', null)
                
            } catch (error) {
                setResponse(400, 'Display get error', null)
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
                const groupSave = params.group
                const layoutSave = params.layout
                const geoSave = params.geo ? JSON.stringify(params.geo) : null
                const rateSave = params.rate

                const addressSave = params.address && params.address.length ? params.address.substring(0, 255) : null
                const typeSave = params.type ? params.type : 0
                
                const dataSave = await new Promise((resolve, reject) => {
                    db.query("UPDATE displays SET name=?, description=?, address=?, geo=?, type=?, display_group=?, layout=?, rate=? WHERE id=?", 
                    [nameSave, descriptionSave, addressSave, geoSave, typeSave, groupSave, layoutSave, rateSave, idSave], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (dataSave && dataSave.affectedRows == 1) {
                    setResponse(200, 'Update display OK', null)
                    return response
                } 
                   
            // } catch (e) {
            //     setResponse(204, 'Update display error', e)
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
            const layoutUpdate = params.item && params.item.name ? params.item.layout : null
            const addressUpdate = params.item && params.item.address ? params.item.address : null
            const rateUpdate = params.item && params.item.rate ? params.item.rate : null
            const geoUpdate = params.item && params.item.geo ? JSON.stringify(params.item.geo) : null

            const typeUpdate = params.item && params.item.type ? params.item.type : 0

            const data8 = await new Promise((resolve, reject) => {
                db.query("UPDATE displays SET name=?, description=?, address=?, geo=?, type=?, layout=?, rate=? WHERE id=?", 
                [nameUpdate, descriptionUpdate, addressUpdate, geoUpdate, typeUpdate, layoutUpdate, rateUpdate, idUpdate], (err, data) => {
                    if (err) {reject(err)} else {resolve(data)}
                })
            })  

            if (data8 && data8.affectedRows == 1) {
                setResponse(200, 'Update display OK', null)
                return response
            }

        } catch (e) {
            setResponse(204, 'Update display error', e)
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
                    db.query("DELETE FROM displays WHERE id=?", 
                    [idDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (dataDelete && dataDelete.affectedRows == 1) {
                    setResponse(200, 'Delete display OK', null)
                    return response
                }

            } catch (e) {
                setResponse(204, 'Delete display error', e)
            }
            return response 
       
        case 'layout.get':

            // Get layout by display code
            const codeGet = (params.code) ? params.code : null
            var query = `SELECT displays.id, displays.name, displays.description, displays.address, displays.geo, displays.type, displays.code, displays.partner, displays.layout, displays.created_at, displays.status, displays.rate, 
                layouts.id AS layout_id, layouts.name AS layout_name, layouts.description AS layout_description, layouts.ratio, layouts.resolution, layouts.width, layouts.height, layouts.content,
                layouts_ratios.name AS ratio_name, layouts_ratios.width AS ratio_width, layouts_ratios.height AS ratio_height,
                layouts_resolutions.name AS resolution_name, layouts_resolutions.width AS resolution_width, layouts_resolutions.height AS resolution_height
                FROM displays 
                LEFT JOIN layouts ON displays.layout = layouts.id
                LEFT JOIN layouts_ratios ON layouts.ratio = layouts_ratios.id 
                LEFT JOIN layouts_resolutions ON layouts.resolution = layouts_resolutions.id
                WHERE displays.code=? AND displays.status=1
                LIMIT 1`
            
            try {
                const dataGet = await new Promise((resolve, reject) => {
                    db.query(query, 
                        [codeGet], (err, data) => {
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

        default:
            setResponse(400, 'Action error', null)
            return response
    }
})