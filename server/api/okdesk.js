import db from "../../config/database"
import checkAccessToken from "~/config/token"
import transporter from "../../config/nodemailer"

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
                res = await fetch('https://morion.okdesk.ru/api/v1/companies/list?api_token=' + token + '&page[direction]=forward&page[size]=100&page[from_id]=' + step + '&category_ids[]=0&category_ids[]=2&category_ids[]=3&category_ids[]=4&category_ids[]=9', {
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
                const name = item.name ? item.name.replaceAll("'", "''") : ''
                const urcom = getParam(item.parameters, 'urcom')  
                const whois = getParam(item.parameters, 'whois')
                const fr = getParam(item.parameters, 'FR')
                const inn = getParam(item.parameters, 'inn')
                const active = item.active ? 1 : 0
                sqlData = sqlData + `(${id}, '${name}', '${urcom}', '${whois}', '${fr}', '${inn}', NOW(), ${active})`
                if (index < list.length - 1) {
                    sqlData = sqlData + ", "
                }
            })

            // Записать изменения в БД
            const data2 = await new Promise((resolve, reject) => {
                db.query(`INSERT INTO okdesk_companies  
                    (id, name, urcom, whois, fr, inn, last_update, active) 
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
                db.query(`SELECT id, name, urcom, whois, fr, inn, last_update, active
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
        
        do { 
            res = await fetch('https://morion.okdesk.ru/api/v1/issues/list?api_token=' + token2 + '&page[direction]=forward&page[size]=50&page[number]=' + page, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            data = await res.json();
            
            var min_okdesk_id = Number.MAX_SAFE_INTEGER
            data.forEach((item) => {
                if (item.id < min_okdesk_id) {
                    min_okdesk_id = item.id
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

            console.log("Кол-во новых записей в итерации и новых: ", page, data.length, list2.length)

        } while (data.length == 50 && min_okdesk_id > max_db_id && list2.length < 2000)

        console.log("Кол-во новых записей всего: ", list2.length)

        // Запросить расширенные данные по новым записям
        for (let i = 0; i < list2.length; i++) {
            const item = list2[i]

            res = await fetch(`https://morion.okdesk.ru/api/v1/issues/${item.id}?api_token=` + token2, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            data = await res.json()
            const spent_time = data && data.spent_time_total ? data.spent_time_total : 0
            console.log("Spent_time_total [" + i + "]: ", spent_time)

            // Задержка 1 сек для Окдеска
            setTimeout(function() {
                //...
            }, 1000);

            list2[i]['spent_time_total'] = spent_time
        }

        //console.log("READY: ", list2)

        // Подготовить данные для БД
        var sqlData = ""
        list2.forEach((item, index) => {
            const id = item.id
            const title = item.title ? item.title.replaceAll("'", "''") : ''
            const company_id = item.company && item.company.id ? item.company.id : ''
            const status = item.status && item.status.code ? item.status.code : ''
            const type = item.type && item.type.code ? item.type.code : ''
            const priority = item.priority && item.priority.code ? item.priority.code : ''
            const spent_time_total = item.spent_time_total ? item.spent_time_total : 0
            const created_at = item.created_at ? item.created_at : ''

            sqlData = sqlData + `(${id}, '${title}', '${company_id}', 
                '${status}', '${type}', '${priority}', ${spent_time_total}, '${created_at}', NOW())`
            if (index < list2.length - 1) {
                sqlData = sqlData + ", "
            }
        })

        // Записать заказы в БД
        if (list2.length > 0) {
            const data4 = await new Promise((resolve, reject) => {
                db.query(`INSERT INTO okdesk_orders  
                    (id, title, company_id, status, type, priority, spent_time_total, created_at, updated_at) 
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
            okdesk_orders.status, okdesk_orders.type, okdesk_orders.priority, okdesk_orders.spent_time_total, 
            okdesk_orders.created_at, okdesk_orders.updated_at, okdesk_orders.deleted, 
            okdesk_companies.name AS company_name 
            FROM okdesk_orders
            LEFT JOIN okdesk_companies ON okdesk_orders.company_id = okdesk_companies.id 
            WHERE okdesk_orders.title IS NOT NULL AND okdesk_companies.name IS NOT NULL
            ORDER BY okdesk_orders.created_at DESC`, 
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
        
    case 'company.send':
    // Check access token
    if (!checkAccessToken(event)) {
        setResponse(403, 'Invalid access token', null)
        return response
    }

    console.log("PARAMS: ", params)

    // Company send
    try {
        const idSend = params.id ? params.id : null
        const num = params.num ? params.num : '-'
        const date = params.date ? params.date : '-'
        const ul = params.ul ? params.ul : ''
        const inn = params.inn ? params.inn : ''
        const kpp = params.kpp ? params.kpp : ''
        const address = params.address ? params.address : ''
        const email = params.email ? params.email : null
        const whatsapp = params.whatsapp ? params.whatsapp : null
        const telegram = params.telegram ? params.telegram : null
        const type = params.type ? Number(params.type) : 0
        const items = params.items ? params.items : []

        var subject = ''
        switch(type) {
            case 0:
                subject = 'Проверка связи'
                break
            case 1:
                subject = 'Ежеквартальная оплата услуг технической поддержки'
                break
            case 2:
                subject = 'Замена фискального накопителя (ФН)'
                break
            case 3:
                subject = 'Оплата услуг технической поддержки'
                break
            default:
                subject = 'Проверка связи'
        }
        
        const dataSend = await new Promise((resolve, reject) => {
            db.query(`SELECT id, name
                FROM okdesk_companies 
                WHERE id=?`, 
            [idSend], (err, data) => {
                if (err) {reject(err)} else {resolve(data)}
            })
        })
        if (!dataSend) {
            setResponse(400, 'Company send error', null)
            return response
        }

        // Подготовить данные
        console.log("SQL company data: ", dataSend)

        var summary = 0.00
        var items_ready = ''

        items.forEach((item, index) => {
            const id = item.id ? item.id : '-'
            const name = item.name ? item.name : '-'
            const price = item.price ? (item.price).toFixed(2) : 0.00
            const quantity = item.quantity ? item.quantity : 0
            const summ = (price * quantity).toFixed(2)
            summary = +summary + +summ
            items_ready = items_ready + `<tr>
                <td style="width: 5%;  padding: 5px;">${index + 1}</td>
                <td style="width: 40%; padding: 5px;">${name}</td>
                <td style="width: 20%; padding: 5px;">${price}</td>
                <td style="width: 15%; padding: 5px;">${quantity}</td>
                <td style="width: 20%; padding: 5px;">${summ}</td>
            </tr>`
        })
        items_ready = items_ready + `<tr>
                <td colspan="4" style="padding: 5px; text-align: right;"><b>Итого, руб.<br>Без НДС</br></td>
                <td style="width: 20%; padding: 5px;"><b>${summary.toFixed(2)}<br>&nbsp;</b></td>
            </tr>`

        var content = `<table style="border-collapse: collapse; width: 100%;"><tr>
        <td style="width: 1%; padding: 0; vertical-align: top;"><img style="width: 150px;" src="https://cafecard.ru/dist/img/morion/logo_morion_login.png"></td>
        <td style="width: 20px;"></td>
        <td style="padding: 0 0 0 0; text-align: left; vertical-align: top;"><b>${subject}</b><br><br>
        
            <b>Счет №${num} от ${date} г.</b><br><br>

            <table style="border-collapse: collapse; width: 100%;">
                <tr><td style="width: 20%;">Юридическое лицо:</td>   <td>${ul}</td></tr>
                <tr><td>ИНН:</td>                <td>${inn}</td></tr>
                <tr><td>КПП:</td>                <td>${kpp}</td></tr>
                <tr><td>Юридический адрес:</td>  <td>${address}</td></tr>
            </table><br>

            <table style="border-collapse: collapse; width: 100%;">
            <tr>
                <td style="width: 5%;  background-color: #eee; font-weight: bold; padding: 5px;">#</td>
                <td style="width: 40%; background-color: #eee; font-weight: bold; padding: 5px;">Наименование</td>
                <td style="width: 20%; background-color: #eee; font-weight: bold; padding: 5px;">Цена, руб.</td>
                <td style="width: 15%; background-color: #eee; font-weight: bold; padding: 5px;">Кол-во</td>
                <td style="width: 20%; background-color: #eee; font-weight: bold; padding: 5px;">Всего, руб.</td>
            </tr>
            ${items_ready}
            </table><br>

        <b>Счет во вложении...</b>
        </td></tr></table>`;
        
        const info = transporter.sendMail({
            from: `Морион <${config.MAIL_AUTH_USER}>`,
            to: email,
            subject: subject,
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
        function (error, info) {
            var resp = false;
            if (error) {
                setResponse(400, 'Ошибка отправки Email', null)
                return;
            } else {
                setResponse(200, 'Email отправлен', null)
                return;
            }
        })
      setResponse(200, 'Company send OK', null)

    } catch (e) {
        setResponse(204, 'Restore order error', e)
    }
    return response      
            
    default:
        setResponse(204, 'No Content', null)
        return response
    }
})