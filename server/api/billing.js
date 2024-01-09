import db from "../../config/database"
import randomId from "../../config/misc"

export default defineEventHandler(async (event) => {
    
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

    const params = new URLSearchParams(event.path.split("?")[1])
    const action = params.get("action")

    switch (action) {
        case 'rates.monitors':

            // Get displays list by rate == 0
            const rateId = 0

            try {
                var data = await new Promise((resolve, reject) => {
                    db.query(`SELECT displays.id, displays.partner, rates.name, displays.rate AS rate_id, rates.rate AS rate_value 
                        FROM displays
                        LEFT JOIN rates ON rates.id = displays.rate
                        LEFT JOIN partners ON partners.id = displays.partner 
                        WHERE displays.status=1 AND displays.rate=? AND partners.status=1 AND rates.status=1`, [rateId], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                const balance = new Map()
                // balance.set(null, 0)

                if (!data) { data = [] }

                data.forEach((item) => {
                    if (balance.get(item.partner)) {
                        const value = balance.get(item.partner) ? balance.get(item.partner) : 0
                        balance.set(item.partner, value*1.0 + item.rate_value*1.0)
                    } else {
                        balance.set(item.partner, item.rate_value)
                    }
                })

                if (balance.size == 0) {
                    setResponse(200, 'No data to update', null)
                    return response
                }

                // Update balance into DB
                const sql = `INSERT INTO partners (id, cost)
                VALUES ${[...balance.entries()].map(([userId, newBalance]) => `('${userId}', ${db.escape(newBalance)})`).join(', ')}
                ON DUPLICATE KEY UPDATE cost = cost + VALUES(cost)`

                var update = await new Promise((resolve, reject) => {
                    db.query(sql, [], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                // Fill transactions
                const sql2 = `INSERT INTO transactions (id, partner, type, amount, created_at)
                VALUES ${[...balance.entries()].map(([userId, newBalance]) => `('${randomId(32)}', '${userId}', 1, ${db.escape(newBalance)}, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'))`).join(', ')}`

                var update2 = await new Promise((resolve, reject) => {
                    db.query(sql2, [], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                setResponse(200, 'rates.monitors OK', update)
                return response

            } catch (error) {
                setResponse(204, 'rates.monitors ERROR or NO actions', null)
                return response
            }
            break

        case 'rates.partners':

            // Get displays list by rate == 0
            const rateId1 = 0

            try {
                var data1 = await new Promise((resolve, reject) => {
                    db.query(`SELECT displays.id, displays.partner, rates.name, displays.rate AS rate_id, 
                        rates.rate AS rate_value, rates.partner_rate AS partner_rate_value, partners.parent 
                        FROM displays
                        LEFT JOIN rates ON rates.id = displays.rate
                        LEFT JOIN partners ON partners.id = displays.partner 
                        WHERE displays.status=1 AND displays.rate=? AND partners.status=1 AND rates.status=1 AND partners.parent IS NOT NULL`, [rateId1], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                const income = new Map()

                if (!data1) { data1 = [] }

                data1.forEach((item) => {
                    if (income.get(item.parent)) {
                        const value = income.get(item.parent)
                        if (item.parent) income.set(item.parent, value*1.0 + item.rate_value / 100 * item.partner_rate_value)
                    } else {
                        if (item.parent) income.set(item.parent, item.rate_value / 100 * item.partner_rate_value)
                    }
                })

                if (income.size == 0) {
                    setResponse(200, 'No data to income', null)
                    return response
                }

                // Update income into DB
                const sql = `INSERT INTO partners (id, income)
                VALUES ${[...income.entries()].map(([userId, newIncome]) => `('${userId}', ${db.escape(newIncome)})`).join(', ')}
                ON DUPLICATE KEY UPDATE income = income + VALUES(income)`

                var update = await new Promise((resolve, reject) => {
                    db.query(sql, [], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                // Fill transactions
                const sql2 = `INSERT INTO transactions (id, partner, type, amount, created_at)
                VALUES ${[...income.entries()].map(([userId, newIncome]) => `('${randomId(32)}', '${userId}', 2, ${db.escape(newIncome)}, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'))`).join(', ')}`

                var update2 = await new Promise((resolve, reject) => {
                    db.query(sql2, [], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                setResponse(200, 'rates.partners OK', update)
                return response

            } catch (error) {
                setResponse(204, 'rates.partners ERROR or NO actions', null)
                return response
            }
            break    

        default:
            setResponse(400, 'Action error', null)
            return response
    }
})