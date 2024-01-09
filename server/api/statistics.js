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
        case 'view.create':
            try {
                const id = randomId(32)
                const partner = params.partner_id
                const owner = params.owner_id
                const order = params.order_id
                const display = params.display_id
                const playlist = params.playlist_id
                const media = params.media_id
                const type = params.type
                const budget = params.budget
                const rate = params.rate
                const status = params.status

                const request = `INSERT INTO statistics_views (id, partner_id, owner_id, order_id, display_id, playlist_id, media_id, type, status, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'))`
                const data = await new Promise((resolve, reject) => {
                    db.query(request, 
                    [id, partner, owner, order, display, playlist, media, type, status], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                // Уменьшить бюджет на стоимость показа
                if (budget && rate) {
                    //console.log("view.create budget")
                    const viewCost = rate / 1000
                    // console.log("BUDGET: ", order, budget, rate, viewCost)

                    const request2 = `UPDATE orders SET orders.budget = orders.budget - ? WHERE orders.id=?`
                    const data2 = await new Promise((resolve, reject) => {
                        db.query(request2, 
                        [viewCost, order], (err, data) => {
                            if (err) {reject(err)} else {resolve(data)}
                        })
                    })  

                    // if (data2 && data2.affectedRows == 1) {
                    //     setResponse(200, 'Campany budget has patched', null)
                    //     return response
                    // } 
                }

                // Начислить владельцу экрана (+ стоимость показа)
                if (budget && rate) {
                    //console.log("view.create budget")
                    const viewCost = rate / 1000
                    // console.log("BUDGET: ", order, budget, rate, viewCost)

                    const request2 = `UPDATE partners SET adv_income = adv_income + ? WHERE partners.id=?`
                    const data2 = await new Promise((resolve, reject) => {
                        db.query(request2, 
                        [viewCost, owner], (err, data) => {
                            if (err) {reject(err)} else {resolve(data)}
                        })
                    })  

                    if (data2 && data2.affectedRows == 1) {
                        setResponse(200, 'Budget has patched', null)
                        return response
                    } 
                }
              
            } catch (e) {
                setResponse(204, 'Budget patch error', e)
            }
            return response

        case 'owner.views':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get orders list
            const ownerId = params.owner_id
            const dateStart = params.date_start ? params.date_start : null
            const dateFinish = params.date_finish ? params.date_finish : null

            // var query = `SELECT statistics_views.partner_id, statistics_views.owner_id, statistics_views.order_id, statistics_views.display_id, 
            //     statistics_views.playlist_id, statistics_views.media_id, statistics_views.type, statistics_views.created_at, 
            //     media.filename, media.type,
            //     partners.name AS partner_name
            //     FROM statistics_views 
            //     LEFT JOIN partners ON statistics_views.owner_id = partners.id
            //     LEFT JOIN media ON statistics_views.media_id = media.id
            //     WHERE statistics_views.owner_id=?
            //     ORDER BY statistics_views.created_at DESC
            //     GROUP BY DATE(statistics_views.created_at)`
            var query = `SELECT 
                DATE(statistics_views.created_at) AS view_date,
                statistics_views.partner_id, 
                statistics_views.owner_id, 
                statistics_views.order_id, 
                statistics_views.display_id,
                statistics_views.playlist_id, 
                statistics_views.media_id, 
                statistics_views.type, 
                COUNT(*) AS view_count,
                media.filename, 
                media.type,
                partners.name AS partner_name
            FROM 
                statistics_views
            LEFT JOIN 
                partners ON statistics_views.owner_id = partners.id
            LEFT JOIN 
                media ON statistics_views.media_id = media.id
            WHERE 
                statistics_views.owner_id=?
            GROUP BY 
                view_date, 
                statistics_views.partner_id, 
                statistics_views.owner_id, 
                statistics_views.order_id, 
                statistics_views.display_id,
                statistics_views.playlist_id, 
                statistics_views.media_id, 
                statistics_views.type, 
                media.filename, 
                media.type,
                partners.name
            ORDER BY 
                view_date DESC`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [ownerId], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Statistics list Ok', data)
                return response

            } catch (error) {
                setResponse(204, 'Statistics list - No Content', null)
                return response
            }
            break    

        default:
            setResponse(400, 'Action error', null)
            return response
    }
})