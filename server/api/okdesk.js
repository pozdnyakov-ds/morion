import db from "../../config/database"
import checkAccessToken from "~/config/token"
import send_email from "../../config/send_email"
import pdf from 'html-pdf'
import numberToWordsRu from "number-to-words-ru";

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

        // Company send
        // try {
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
            
            // const dataSend = await new Promise((resolve, reject) => {
            //     db.query(`SELECT id, name
            //         FROM okdesk_companies 
            //         WHERE id=?`, 
            //     [idSend], (err, data) => {
            //         if (err) {reject(err)} else {resolve(data)}
            //     })
            // })
            // if (!dataSend) {
            //     setResponse(400, 'Company send error', null)
            //     return response
            // }

            // Подготовить данные: 
            const htmlHeader = `<html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
                <style type="text/css">
                * {font-family: arial;font-size: 14px;line-height: 14px;}
                table {margin: 0 0 15px 0;width: 100%;border-collapse: collapse;border-spacing: 0;}		
                table th {padding: 5px;font-weight: bold;}        
                table td {padding: 5px;}	
                .header {margin: 0 0 0 0;padding: 0 0 15px 0;font-size: 12px;line-height: 12px;text-align: center;}
                h1 {margin: 0 0 10px 0;padding: 10px 0;border-bottom: 2px solid #000;font-weight: bold;font-size: 20px;}
                    
                /* Реквизиты банка */
                .details td {padding: 3px 2px;border: 1px solid #000000;font-size: 12px;line-height: 12px;vertical-align: top;}
            
                /* Поставщик/Покупатель */
                .contract th {padding: 3px 0;vertical-align: top;text-align: left;font-size: 13px;line-height: 15px;}	
                .contract td {padding: 3px 0;}		
            
                /* Наименование товара, работ, услуг */
                .list thead, .list tbody  {border: 2px solid #000;}
                .list thead th {padding: 4px 0;border: 1px solid #000;vertical-align: middle;text-align: center;}	
                .list tbody td {padding: 0 2px;border: 1px solid #000;vertical-align: middle;font-size: 11px;line-height: 13px;}	
                .list tfoot th {padding: 3px 2px;border: none;text-align: right;}	
            
                /* Сумма */
                .total {margin: 0 0 20px 0;padding: 0 0 10px 0;border-bottom: 2px solid #000;}	
                .total p {margin: 0;padding: 0;}
                    
                /* Руководитель, бухгалтер */
                .sign {position: relative;}
                .sign table {width: 60%;}
                .sign th {padding: 40px 0 0 0;text-align: left;}
                .sign td {padding: 40px 0 0 0;border-bottom: 1px solid #000;text-align: right;font-size: 12px;}
                .sign-1 {position: absolute;left: 149px; top: 20px;}	
                .sign-2 {position: absolute;left: 149px; top: 75px;}	
                .printing {position: absolute;left: 271px; top: -20px;}
                </style>
            </head>
            <body>
                <p class="header">
                    Внимание! Оплата данного счета означает согласие с условиями поставки товара.
                    Уведомление об оплате обязательно, в противном случае не гарантируется наличие
                    товара на складе. Товар отпускается по факту прихода денег на р/с Поставщика,
                    самовывозом, при наличии доверенности и паспорта.
                </p>
            
                <table class="details">
                    <tbody>
                        <tr>
                            <td colspan="2" style="border-bottom: none;">${config.MORION_BANK_NAME}</td>
                            <td>БИК</td>
                            <td style="border-bottom: none;">${config.MORION_BANK_BIC}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border-top: none; font-size: 10px;">Банк получателя</td>
                            <td>Сч. №</td>
                            <td style="border-top: none;">${config.MORION_ACCOUNT}</td>
                        </tr>
                        <tr>
                            <td width="25%">ИНН ${config.MORION_INN}</td>
                            <td width="30%">КПП ${config.MORION_KPP}</td>
                            <td width="10%" rowspan="3">Сч. №</td>
                            <td width="35%" rowspan="3">${config.MORION_BANK_ACCOUNT}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border-bottom: none;">${config.MORION_UL}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border-top: none; font-size: 10px;">Получатель</td>
                        </tr>
                    </tbody>
                </table>
            
                <h1>Счет на оплату № ${num} от ${date} г.</h1>
            
                <table class="contract">
                    <tbody>
                        <tr>
                            <td width="15%">Поставщик:</td>
                            <th width="85%">${config.MORION_UL}, ИНН ${config.MORION_INN}, КПП ${config.MORION_KPP}, ${config.MORION_ADDRESS}</th>
                        </tr>
                        <tr>
                            <td>Покупатель:</td>
                            <th>ООО "Покупатель", ИНН 0000000000, КПП 000000000, 119019, Москва г, Новый Арбат, дом № 10
                            </th>
                        </tr>
                    </tbody>
                </table>
            
                <table class="list">
                    <thead>
                        <tr>
                            <th width="5%">№</th>
                            <th width="54%">Наименование товара, работ, услуг</th>
                            <th width="8%">Коли-<br>чество</th>
                            <th width="5%">Ед.<br>изм.</th>
                            <th width="14%">Цена</th>
                            <th width="14%">Сумма</th>
                        </tr>
                    </thead>
                    <tbody>`;

            var htmlPositions = ''
            var summary = 0.00
            var count = 0

            items.forEach((item, index) => {
                const id = item.id ? item.id : '-'
                const name = item.name ? item.name : '-'
                const unit = item.unit ? item.unit : '-'
                const price = item.price ? (item.price).toFixed(2) : 0.00
                const quantity = item.quantity ? item.quantity : 0
                const summ = (price * quantity).toFixed(2)
                summary = +summary + +summ
                count++
                htmlPositions = htmlPositions + `<tr>
                    <td align="center">${index + 1}</td>
                    <td align="left">${name}</td>
                    <td align="center">${quantity}</td>
                    <td align="center">${unit}</td>
                    <td align="right">${price}</td>
                    <td align="right">${summ}</td>
                </tr>`
            })

            const summary_string = numberToWordsRu.convert(summary, {
                currency: "rub",
                convertNumbertToWords: {
                  integer: true,
                  fractional: false
                }
            });

            const htmlFooter = `</tbody>
                    <tfoot>
                        <tr>
                            <th colspan="5">Итого:</th>
                            <th>${summary.toFixed(2)}</th>
                        </tr>
                        <tr>
                            <th colspan="5">Без НДС:</th>
                            <th>&nbsp;</th>
                        </tr>
                        <tr>
                            <th colspan="5">Всего к оплате:</th>
                            <th>${summary.toFixed(2)}</th>
                        </tr>
                    </tfoot>
                </table>
                
                <div class="total">
                    <p>Всего наименований ${count}, на сумму ${summary.toFixed(2)} руб.</p>
                    <p><strong>${summary_string}</strong></p>
                </div>
                
                <div class="sign">
                    <img class="sign-1" style="width: 100px;" src="https://cafecard.ru/dist/img/morion/bill/facsimile_1.png">
                    <img class="sign-2" style="width: 100px;" src="https://cafecard.ru/dist/img/morion/bill/facsimile_2.png">
                    <img class="printing" style="width: 180px;" src="https://cafecard.ru/dist/img/morion/bill/sign.png">
                    <table>
                        <tbody>
                            <tr>
                                <th width="30%">Руководитель</th>
                                <td width="70%">Иванов А.А.</td>
                            </tr>
                            <tr>
                                <th>Бухгалтер</th>
                                <td>Сидоров Б.Б.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </body>
            </html>`;
            const html = htmlHeader + htmlPositions + htmlFooter;
            const options = {
                "border": {
                    "top": "0.5in",
                    "right": "0.5in",
                    "bottom": "0.5in",
                    "left": "0.75in"
                }
            }

            async function generatePDF(html, options, file) {
                try {
                    const result = await new Promise((resolve, reject) => {
                        pdf.create(html, options).toFile(file, (err, res) => {
                            if (err) reject(err);
                            else resolve(res);
                        });
                    });
                    console.log('PDF generated successfully:', result);

                    setResponse(200, 'PDF send OK', null);
                    return response;

                } catch (e) {
                    console.log('Create PDF error: ', e);
                    setResponse(400, 'Create PDF error', null);
                    return response;
                }
            }

            const file = config.PDF_FILENAME

            try {
                // Создать PDF
                await generatePDF(html, options, file);

                // Отправить письмо
                const send_data = await send_email(idSend, subject, file, num, date, ul, inn, kpp, 
                    address, email, whatsapp, telegram, type, items)
                
                console.log("SEND RESULT CODE: ", send_data)

                if (send_data && send_data.code == 200) {
                    setResponse(200, 'Email send OK', null)

                } else {
                    setResponse(400, 'Email send error', null)
                }

            } catch (e) {
                console.log("Create PDF error: ", e);
                setResponse(400, 'Create PDF error', null)
            }

        // } catch (e) {
        //     setResponse(204, 'Common send error', e)
        // }
        return response     
            
    default:
        setResponse(204, 'No Content', null)
        return response
    }
})