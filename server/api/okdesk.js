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

    function getParam(data, param) {
        var value = null
        data.forEach((item) => {
            if (item.code == param) {
                value = item.value
                if (typeof value === 'string') {value = value.replaceAll("'", "''")}
            }
        })
        return value
    }

    switch (params.action) {
        case 'get.companies':

            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get companies list
            const token = process.env.OKDESK_TOKEN
            const list = []
            var res = null
            var data = null
            var step = 0

            do { 
                res = await fetch('https://morion.okdesk.ru/api/v1/companies/list?api_token=' + token + '&page[direction]=forward&page[size]=100&page[from_id]=' + step, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                data = await res.json();
                data.forEach((item) => {
                    list.push(item)
                })

                step = step + data.length

                // Задержка 1 сек для Окдеска
                setTimeout(function() {
                    //... 
                }, 1000);

            } while (data.length == 100)

            console.log("Новых записей: ", list.length)

            // Подготовить данные для БД
            var sqlData = ""
            list.forEach((item, index) => {
                const id = item.id
                if (index > 200) return
                const name = item.name ? item.name.replaceAll("'", "''") : ''
                const urcom = getParam(item.parameters, 'urcom')  
                const whois = getParam(item.parameters, 'whois')
                const fr = getParam(item.parameters, 'FR')
                const active = item.active ? 1 : 0
                sqlData = sqlData + `(${id}, '${name}', '${urcom}', '${whois}', '${fr}', NOW(), ${active})`
                if (index < 200) {
                    sqlData = sqlData + ", "
                }
            })

            // Записать изменения в БД
            const data2 = await new Promise((resolve, reject) => {
                db.query(`INSERT INTO okdesk_companies  
                    (id, name, urcom, whois, fr, last_update, active) 
                    VALUES ${sqlData}
                    ON DUPLICATE KEY UPDATE
                    last_update=NOW()`, 
                [], (err, data) => {
                    if (err) {reject(err)} else {resolve(data)}
                })
            })
            if (!data2) {
                setResponse(400, 'Companies list error', null)
                return response
            }

            // Выбрать ВСЕ компании из БД
            const data6 = await new Promise((resolve, reject) => {
                db.query(`SELECT id, name, urcom, whois, fr, last_update, active
                    FROM okdesk_companies
                    WHERE deleted=0
                    ORDER BY name`, 
                [], (err, data) => {
                    if (err) {reject(err)} else {resolve(data)}
                })
            })
            if (!data6) {
                setResponse(400, 'Get list error', null)
                return response
            }

            setResponse(200, 'Ok', data6)
            return response
            
        case 'get.orders':

        // Check access token
        if (!checkAccessToken(event)) {
            setResponse(403, 'Invalid access token', null)
            return response
        }

        // Получить Max_db_id
        const data3 = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM okdesk_orders 
            WHERE id = (SELECT MAX(ID) FROM okdesk_orders)
            LIMIT 1`, 
            [], (err, data) => {
                if (err) {reject(err)} else {resolve(data)}
            })
        })
        if (!data3) {
            setResponse(400, 'DB error', null)
            return response
        }
        const max_db_id = data3 && data3[0] && data3[0].id ? data3[0].id : 0
        console.log("max_db_id: ", max_db_id)

        // Get orders list with (id < max_db_id)
        const token2 = process.env.OKDESK_TOKEN
        const list2 = []
        var res = null
        var data = null
        var page = 1
        var max_okdesk_id = 0

        do { 
            res = await fetch('https://morion.okdesk.ru/api/v1/issues/list?api_token=' + token2 + '&page[direction]=forward&page[size]=50&page[number]=' + page, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            data = await res.json();
            
            data.forEach((item) => {
                if (item.id > max_okdesk_id) {
                    max_okdesk_id = item.id
                }
                if (item.id > max_db_id) {
                    list2.push(item)
                }
            })

            page++

            // Задержка 1 сек для Окдеска
            setTimeout(function() {
                //...
            }, 1000);

            console.log("Кол-во новых записей в итерации и новых: ", data.length, list2.length)

        } while (data.length == 50 && list2.length < (max_okdesk_id - max_db_id) && list2.length < 5000)

        console.log("Кол-во новых записей всего: ", list2.length)
        console.log("max_okdesk_id: ", max_okdesk_id)
        const count = max_okdesk_id - max_db_id 
        console.log("Кол-во новых записей как разница: ", count)

        // Подготовить данные для БД
        var sqlData = ""
        list2.forEach((item, index) => {
            const id = item.id
            const title = item.title ? item.title.replaceAll("'", "''") : ''
            const company_id = item.company && item.company.id ? item.company.id : ''
            const status = item.status && item.status.code ? item.status.code : ''
            const type = item.type && item.type.code ? item.type.code : ''
            const priority = item.priority && item.priority.code ? item.priority.code : ''
            const created_at = item.created_at ? item.created_at : ''

            sqlData = sqlData + `(${id}, '${title}', '${company_id}', 
                '${status}', '${type}', '${priority}', '${created_at}', NOW())`
            if (index < list2.length - 1) {
                sqlData = sqlData + ", "
            }
        })

        // Записать заказы в БД
        if (count > 0) {
            const data4 = await new Promise((resolve, reject) => {
                db.query(`INSERT INTO okdesk_orders  
                    (id, title, company_id, status, type, priority, created_at, updated_at) 
                    VALUES ${sqlData}
                    ON DUPLICATE KEY UPDATE
                    updated_at=NOW()`, 
                [], (err, data) => {
                    if (err) {reject(err)} else {resolve(data)}
                })
            })
            if (!data4) {
                setResponse(400, 'Save error', null)
                return response
            }
        }

        // Выбрать ВСЕ заказы из БД
        const data5 = await new Promise((resolve, reject) => {
            db.query(`SELECT okdesk_orders.id, okdesk_orders.title, okdesk_orders.company_id, 
                okdesk_orders.status, okdesk_orders.type, okdesk_orders.priority, okdesk_orders.created_at, 
                okdesk_orders.updated_at, okdesk_orders.deleted,
                okdesk_companies.name AS company_name
                FROM okdesk_orders
                LEFT JOIN okdesk_companies ON okdesk_orders.company_id = okdesk_companies.id
                WHERE 1
                ORDER BY created_at DESC`, 
            [], (err, data) => {
                if (err) {reject(err)} else {resolve(data)}
            })
        })
        if (!data5) {
            setResponse(400, 'Save error', null)
            return response
        }

        setResponse(200, 'Ok', data5)
        return response
        
    case 'order.delete':
        // Check access token
        if (!checkAccessToken(event)) {
            setResponse(403, 'Invalid access token', null)
            return response
        }

        // Order delete
        try {
            const idOrderDelete = params.id
            
            const dataOrderDelete = await new Promise((resolve, reject) => {
                db.query("UPDATE okdesk_orders SET deleted=1 WHERE id=?", 
                [idOrderDelete], (err, data) => {
                    if (err) {reject(err)} else {resolve(data)}
                })
            })

            if (dataOrderDelete && dataOrderDelete.affectedRows == 1) {
                setResponse(200, 'Delete order OK', null)
                return response
            }

        } catch (e) {
            setResponse(204, 'Delete order error', e)
        }
        return response

    case 'order.restore':
        // Check access token
        if (!checkAccessToken(event)) {
            setResponse(403, 'Invalid access token', null)
            return response
        }

        // Order delete
        try {
            const idOrderDelete = params.id
            
            const dataOrderDelete = await new Promise((resolve, reject) => {
                db.query("UPDATE okdesk_orders SET deleted=0 WHERE id=?", 
                [idOrderDelete], (err, data) => {
                    if (err) {reject(err)} else {resolve(data)}
                })
            })

            if (dataOrderDelete && dataOrderDelete.affectedRows == 1) {
                setResponse(200, 'Restore order OK', null)
                return response
            }

        } catch (e) {
            setResponse(204, 'Restore order error', e)
        }
        return response    
            
    default:
        setResponse(204, 'No Content', null)
        return response
    }
})