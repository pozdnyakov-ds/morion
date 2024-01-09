import db from "../../config/database"
import checkAccessToken from "~/config/token"
import randomId from "../../config/misc"
import transporter from "../../config/nodemailer"

function getOrderId(length) {
    const chars = '0123456789'
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const headers = getRequestHeaders(event)
    const params = { ...body }
    const baseURL = 'https://display24.ru'

    var contacts = null
    var email = null
    
    const response = {
        code: 204,
        message: 'Base No Content',
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

            // Get orders list
            const partner = params.partner

            var query = `SELECT orders.id, orders.name, orders.description, orders.partner, orders.owner, orders.display_id, orders.playlist_id, orders.media_id, 
                orders.date_start, orders.date_finish, orders.budget, orders.created_at, orders.status,
                partners.name AS owner_name, displays.address AS display_address,
                media.filename, media.type, loops.name AS playlist_name
                FROM orders 
                LEFT JOIN partners ON orders.owner = partners.id
                LEFT JOIN displays ON orders.display_id = displays.id
                LEFT JOIN media ON orders.media_id = media.id
                LEFT JOIN loops ON orders.playlist_id = loops.id
                WHERE orders.partner=?
                ORDER BY orders.created_at DESC`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [partner], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Orders list Ok', data)
                return response

            } catch (error) {
                setResponse(204, 'Orders list No Content', null)
                return response
            }
            break

        case 'owner.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get orders list
            const owner = params.owner

            var query = `SELECT orders.id, orders.name, orders.description, orders.partner, orders.owner, orders.display_id, orders.playlist_id, orders.media_id, 
                orders.date_start, orders.date_finish, orders.budget, orders.created_at, orders.status,
                partners.name AS partner_name, displays.address AS display_address,
                media.filename, media.type, loops.name AS playlist_name
                FROM orders 
                LEFT JOIN partners ON orders.partner = partners.id
                LEFT JOIN displays ON orders.display_id = displays.id
                LEFT JOIN media ON orders.media_id = media.id
                LEFT JOIN loops ON orders.playlist_id = loops.id
                WHERE orders.owner=?
                ORDER BY orders.created_at DESC`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [owner], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Orders list Ok', data)
                return response

            } catch (error) {
                setResponse(204, 'Orders list No Content', null)
                return response
            }
            break    

        case 'send.invite':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            const idSend = params.owner
            const order_idSend = params.order_id

            // При отправке на одобрение кампании проверить на положительный баланс и вычесть из кошелька стоимость кампании
            var query = `SELECT orders.budget, partners.id AS partner_id, partners.wallet, partners.cost, partners.income, partners.adv, partners.adv_income
                    FROM orders
                    LEFT JOIN partners ON orders.partner = partners.id 
                    WHERE orders.id=?
                    LIMIT 1`
            try {
                const dataRun = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [order_idSend], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
            
                const val = parseFloat(dataRun[0].wallet) + parseFloat(dataRun[0].income) + parseFloat(dataRun[0].adv_income) - 
                    parseFloat(dataRun[0].cost) - parseFloat(dataRun[0].adv)
                const budget =  parseFloat(dataRun[0].budget)    

                // console.log("BALANCE: ", val, budget)
                if (budget > val) {
                    setResponse(201, 'Недостаточно средств на балансе', null)
                    return response

                } else {
                    // Вычесть из баланса стоимость кампании
                    const adv = dataRun[0].budget
                    const partnerRun = dataRun[0].partner_id 

                    const data = await new Promise((resolve, reject) => {
                        db.query("UPDATE partners SET adv = adv + ? WHERE id=?", 
                        [adv, partnerRun], (err, data) => {
                            if (err) {reject(err)} else {resolve(data)}
                        })
                    })

                    if (data && data.affectedRows != 1) {
                        setResponse(400, 'Update status error', null)
                        return response
                    }
                }
            } catch (e) {
                setResponse(204, 'No balance data', null)
                return response
            }

            // Get owner email
            var query = `SELECT contacts
                FROM partners 
                WHERE id=?`
            try {
                const dataSend = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [idSend], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                contacts = dataSend && dataSend[0] && dataSend[0].contacts ? dataSend && dataSend[0] && dataSend[0].contacts : null
                email = contacts && contacts.email ? contacts.email : null
                
            } catch (e) {
                console.log('204 - No Contacts')
                setResponse(204, 'No Contacts', null)
                return response
            }

            // Send owner invite
            try {
                var content = `<table style="border-collapse: collapse; width: 100%;"><tr>
                <td style="width: 1%; padding: 0; vertical-align: top;"><img src="https://cafecard.ru/dist/img/logo_d24_login.png"></td>
                <td style="padding: 20px 0 0 0; text-align: left; vertical-align: top;">
                    <b>Вам поступил запрос на размещение рекламного ролика на вашем экране:</b><br><br>
                    Перейдите в панель администратора и рассмотрите <a target=_blank href="${baseURL}/clients/orders">заявку</a>.
                </td></tr></table>`;
                
                const info = transporter.sendMail({
                    from: `Display24 <${config.MAIL_AUTH_USER}>`,
                    to: email,
                    subject: "Запрос на размещение ролика на вашем экране",
                    text: ``,
                    html: content,
                    sender: config.MAIL_AUTH_USER,
                    replyTo: config.MAIL_AUTH_USER,
                    dkim: {
                      domainName: config.MAIL_DOMAIN_NAME,
                      keySelector: config.MAIL_KEY_SELECTOR,
                      privateKey: config.MAIL_PRIVATE_KEY,
                    },
                },
                async function (error, info) {
                    var resp = false;
                    if (error) {
                        setResponse(400, 'Ошибка отправки Email', null)
                        return

                    } else {

                        // Change order status
                        try {
                            const data = await new Promise((resolve, reject) => {
                                db.query("UPDATE orders SET status=1 WHERE id=?", 
                                [order_idSend], (err, data) => {
                                    if (err) {reject(err)} else {resolve(data)}
                                })
                            })
                            if (data && data.changedRows != 1) {
                                setResponse(400, 'Update status error', null)
                                return response
                            }
                            setResponse(200, 'Email отправлен', null)

                        } catch (error) {
                            setResponse(400, 'Update status error', null)
                            return response
                        }
                    }
                })
                setResponse(200, 'Email отправлен', null)

            } catch (error) {
                setResponse(204, 'Email error', null)
            }
            return response
        
        case 'index.status':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            const idStatus = params.id
            const descriptionStatus = params.description
            const status = Number(params.status)

            // Toggle status
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("UPDATE orders SET description=?, status=? WHERE id=?", 
                    [descriptionStatus, status, idStatus], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (data && data.affectedRows != 1) {
                    setResponse(400, 'Update status error', null)
                    return response
                }

                // Отправить уведомление рекламодателю о смене статуса (только одобрение и отказ)
                if (status == 2 || status == 3) {

                    // Get partner email
                    var query = `SELECT partners.contacts
                        FROM orders
                        LEFT JOIN partners ON orders.partner = partners.id 
                        WHERE orders.id=?
                        LIMIT 1`
                    try {
                        const dataStatus = await new Promise((resolve, reject) => {
                            db.query(query, 
                            [idStatus], (err, data) => {
                                if (err) {reject(err)} else {resolve(data)}
                            })
                        })
                        contacts = dataStatus && dataStatus[0] && dataStatus[0].contacts ? dataStatus && dataStatus[0] && dataStatus[0].contacts : null
                        email = contacts && contacts.email ? contacts.email : null
                        
                    } catch (e) {
                        setResponse(204, 'No Contacts', null)
                        return response
                    }

                    // Send email
                    var content = `<table style="border-collapse: collapse; width: 100%;"><tr>
                        <td style="width: 1%; padding: 0; vertical-align: top;"><img src="https://cafecard.ru/dist/img/logo_d24_login.png"></td>
                        <td style="padding: 20px 0 0 0; text-align: left; vertical-align: top;">
                            <b>Уведомление о смене статуса заявки на размещение рекламного ролика:</b><br><br>
                            Перейдите в <a target=_blank href="${baseURL}/advertisers/orders">панель администратора</a>.
                        </td></tr></table>`;
                    
                    const info = transporter.sendMail({
                        from: `Display24 <${config.MAIL_AUTH_USER}>`,
                        to: email,
                        subject: "Уведомление о смене статуса заявки на размещение рекламного ролика",
                        text: ``,
                        html: content,
                        sender: config.MAIL_AUTH_USER,
                        replyTo: config.MAIL_AUTH_USER,
                        dkim: {
                        domainName: config.MAIL_DOMAIN_NAME,
                        keySelector: config.MAIL_KEY_SELECTOR,
                        privateKey: config.MAIL_PRIVATE_KEY,
                        },
                    },
                    async function (error, info) {
                        if (error) {
                            setResponse(400, 'Ошибка отправки Email', null)
                            return
                        }
                    })
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
            try {
                const idCreate          = randomId(32)
                const nameCreate        = getOrderId(8)
                const descriptionCreate = params.description
                const partnerCreate     = params.partner
                const ownerCreate       = params.owner
                const display_idCreate  = params.display_id
                const playlist_idCreate = params.playlist_id
                const media_idCreate    = params.media_id
                const date_startCreate  = params.date_start
                const date_finishCreate = params.date_finish
                const budgetCreate      = params.budget ? params.budget : 0
                const statusCreate      = 0

                const data = await new Promise((resolve, reject) => {
                    db.query("INSERT INTO orders (id, name, description, partner, owner, display_id, playlist_id, media_id, date_start, date_finish, budget, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'), ?)", 
                    [idCreate, nameCreate, descriptionCreate, partnerCreate, ownerCreate, display_idCreate, playlist_idCreate, media_idCreate, date_startCreate, date_finishCreate, budgetCreate, statusCreate], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (data && data.affectedRows == 1) {
                    setResponse(200, 'Create order OK', null)
                    return response
                } 
              
            } catch (e) {
                setResponse(204, 'Create display error', e)
                return response
            }
            break

        case 'device.list':
            // Get media data
            const playlistId = (params.playlist_id) ? params.playlist_id : null
            //console.log("PLAYLIST ID: ", playlistId)
            
            var query = `SELECT orders.id, orders.name, orders.description, orders.partner, orders.owner, orders.display_id, orders.playlist_id, orders.media_id, 
                orders.date_start, orders.date_finish, orders.budget, orders.created_at, orders.status,
                partners.name AS owner_name, 
                displays.address AS display_address, displays.rate, 
                media.filename, media.type, media.duration, loops.name AS playlist_name
                FROM orders 
                LEFT JOIN partners ON orders.owner = partners.id
                LEFT JOIN displays ON orders.display_id = displays.id
                LEFT JOIN media ON orders.media_id = media.id
                LEFT JOIN loops ON orders.playlist_id = loops.id
                WHERE orders.playlist_id=? AND orders.date_start <= NOW() AND orders.date_finish >= NOW() AND orders.status = 4`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [playlistId], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                //console.log("VIDEO DATA: ", data)
                setResponse(200, 'Orders list Ok', data)

            } catch (error) {
                setResponse(204, 'Orders list No Content', null)
            }
            return response    
         
        case 'index.delete':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            const idDelete = params.id

            // При удалении кампании вернуть неизрасходованные средства кампании на баланс клиента
            var query = `SELECT orders.budget, orders.partner
                FROM orders
                WHERE orders.id=?
                LIMIT 1`
            try {
                const dataDelete = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [idDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
            
                if (dataDelete && dataDelete[0].budget) {
                    
                    const budget = dataDelete[0].budget
                    const partnerRun = dataDelete[0].partner

                    const data = await new Promise((resolve, reject) => {
                        db.query("UPDATE partners SET adv = adv - ? WHERE id=?", 
                        [budget, partnerRun], (err, data) => {
                            if (err) {reject(err)} else {resolve(data)}
                        })
                    })

                    if (data && data.affectedRows != 1) {
                        setResponse(400, 'Update status error', null)
                        return response
                    }
                }
            } catch (e) {
                setResponse(204, 'No balance data', null)
                return response
            }

            // Order delete
            try {
                const dataDelete = await new Promise((resolve, reject) => {
                    db.query("DELETE FROM orders WHERE id=?", 
                    [idDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (dataDelete && dataDelete.affectedRows == 1) {
                    setResponse(200, 'Delete order OK', null)
                    return response
                }

            } catch (e) {
                setResponse(204, 'Delete order error', e)
            }
            return response 
               
        default:
            setResponse(400, 'Action error', null)
            return response
    }
})