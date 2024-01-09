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
        case 'transactions.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get partners list
            const partner = params.partner
            // console.log("PARTNER: ", partner)

            var query = `SELECT id, type, amount, created_at
                FROM transactions 
                WHERE partner=?
                ORDER BY created_at DESC`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [partner], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Transactions list Ok', data)
            } catch (error) {
                setResponse(204, 'Transactions no content', null)
            }
            return response

        case 'balance.get':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get group
            const idBalanceGet = (params.id) ? params.id : null
            var query = `SELECT id, wallet, cost, income, adv, adv_income, created_at
                FROM partners 
                WHERE id=? LIMIT 1`
            
            try {
                const dataGet = await new Promise((resolve, reject) => {
                    db.query(query, 
                        [idBalanceGet], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (dataGet && dataGet.length == 1 ) {
                    setResponse(200, 'Group get Ok', dataGet)
                    return response
                }
                setResponse(204, 'Balance no data', null)
                
            } catch (error) {
                setResponse(400, 'Balance get error', null)
            }
            return response

        case 'details.get':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get group
            const partnerDetailsGet = (params.partner) ? params.partner : null

            var query = `SELECT id, details
                FROM partners 
                WHERE id=? 
                LIMIT 1`
            
            try {
                const dataDetailsGet = await new Promise((resolve, reject) => {
                    db.query(query, 
                        [partnerDetailsGet], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (dataDetailsGet && dataDetailsGet.length == 1 ) {
                    setResponse(200, 'Details get Ok', dataDetailsGet)
                    return response
                }
                setResponse(204, 'Details no data', null)
                
            } catch (error) {
                setResponse(400, 'Details get error', null)
            }
            return response
            
        case 'details.save':  
        // Check access token
        if (!checkAccessToken(event)) {
            setResponse(403, 'Invalid access token', null)
            return response
        }

        // Layout save
        // try {
            const partnerDetailsSave = params.partner
            const detailsSave = params.details
                        
            const dataDetailsSave = await new Promise((resolve, reject) => {
                db.query("UPDATE partners SET details=? WHERE id=?", 
                [detailsSave, partnerDetailsSave], (err, data) => {
                    if (err) {reject(err)} else {resolve(data)}
                })
            })  

            if (dataDetailsSave && dataDetailsSave.affectedRows == 1) {
                setResponse(200, 'Update details OK', null)
                return response
            } 
                
        // } catch (e) {
        //     setResponse(204, 'Update details error', e)
        // }

        return response    

        case 'rates.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get rates list
            var query = `SELECT id, name, description, rate, partner_rate, created_at, status
                FROM rates 
                WHERE 1`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Rates list Ok', data)
            } catch (error) {
                setResponse(204, 'Rates no content', null)
            }
            return response
            
        case 'rates.create':
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
                const rateCreate = params.rate
                const partnerRateCreate = params.partner_rate
              
                const data = await new Promise((resolve, reject) => {
                    db.query("INSERT INTO rates (id, name, description, rate, partner_rate, created_at) VALUES (?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'))", 
                    [idCreate, nameCreate, descriptionCreate, rateCreate, partnerRateCreate], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (data && data.affectedRows == 1) {
                    setResponse(200, 'Create rate OK', null)
                    return response
                } 
                
            // } catch (e) {
            //     setResponse(204, 'Create rate error', e)
            // }
            return response

        case 'rates.get':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get layout
            const idGet = (params.id) ? params.id : null
            var query = `SELECT rates.id, rates.name, rates.description, rates.rate, rates.partner_rate, rates.created_at, rates.status
                FROM rates 
                WHERE rates.id=? 
                LIMIT 1`
            // try {
                const dataGet = await new Promise((resolve, reject) => {
                    db.query(query, 
                        [idGet], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (dataGet && dataGet.length == 1 ) {
                    setResponse(200, 'Rate get Ok', dataGet)
                    return response
                }
                setResponse(204, 'Rate no data', null)
                
            // } catch (error) {
            //     setResponse(400, 'Rate get error', null)
            // }
            return response    
            
        case 'rates.status':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Toggle status
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("UPDATE rates SET status=? WHERE id=?", 
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
            
        case 'rates.save':  
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
            const rateSave = params.rate
            const partnerRateSave = params.partner_rate
                        
            const dataSave = await new Promise((resolve, reject) => {
                db.query("UPDATE rates SET name=?, description=?, rate=?, partner_rate=? WHERE id=?", 
                [nameSave, descriptionSave, rateSave, partnerRateSave, idSave], (err, data) => {
                    if (err) {reject(err)} else {resolve(data)}
                })
            })  

            if (dataSave && dataSave.affectedRows == 1) {
                setResponse(200, 'Update rate OK', null)
                return response
            } 
                
        // } catch (e) {
        //     setResponse(204, 'Update rate error', e)
        // }

        return response    

        case 'rates.delete':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Loop delete
            try {
                const idDelete = params.id
                
                const dataDelete = await new Promise((resolve, reject) => {
                    db.query("DELETE FROM rates WHERE id=?", 
                    [idDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (dataDelete && dataDelete.affectedRows == 1) {
                    setResponse(200, 'Delete rate OK', null)
                    return response
                }

            } catch (e) {
                setResponse(204, 'Delete rate error', e)
            }
            return response     
       
        default:
            setResponse(400, 'Action error', null)
            return response
    }
})