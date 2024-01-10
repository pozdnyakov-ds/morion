import db from "../../config/database"
import checkAccessToken from "~/config/token"

const getToken = async () => {
    
    // Взять из БД сохраненный refresh_token
    var tokens = null;
    try {
        tokens = await new Promise((resolve, reject) => {
            db.query(`SELECT access_token, refresh_token 
                FROM access
                WHERE status=1
                LIMIT 1`, [], (err, data) => {
                    if (err) { reject(err)} else {resolve(data) }
                });
        })

    } catch (e) {
        return null;
    }
       
    if (tokens && tokens[0] && tokens[0].access_token && tokens[0].refresh_token) {
        
        // Принудительно обновить токены
        const data = {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: tokens[0].refresh_token,
            redirect_uri: process.env.REDIRECT_URI
        };
        const response = await fetch('https://moriontech.amocrm.ru/oauth2/access_token', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const body = await response.json();

        if (!body || !body.access_token || !body.refresh_token) {
            return null;
        }
        const token = body.access_token
        
        // Записать новые токены в БД
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(`UPDATE access
                    SET access_token=?, refresh_token=?, status=? 
                    WHERE status=1`, [body.access_token, body.refresh_token, 1], (err, data) => {
                        if (err) { reject(err)} else {resolve(data) }
                    });
            })
            if (!result) { 
                return null;
            }
    
        } catch (e) {
            return null;
        }
        return token;

    } else {
        return null;
    }    
};

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

    switch (params.action) {
        case 'get.tokens':

            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get index list
            const code = (params.code) ? params.code : '';
            var res = null

            try {
                const data = {
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: process.env.REDIRECT_URI
                };
                const body = await fetch('https://moriontech.amocrm.ru/oauth2/access_token', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });
                res = await body.json()

            } catch (e) {
                setResponse(204, 'No Content', e)
            }

            if (!res || !res.access_token || !res.refresh_token) {
                setResponse(204, 'Get tokens error', null)
                return response
            }

            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(`UPDATE access
                    SET access_token=?, refresh_token=?, status=? 
                    WHERE status=1`, 
                    [res.access_token, res.refresh_token, 1], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Ok', data)

            } catch (e) {
                setResponse(204, 'No Content', e)
            }
            return response

        case 'get.list':

            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get clients list
            const token = await getToken();
        
            const res2 = await fetch('https://moriontech.amocrm.ru/api/v4/companies?type=json&entity=companies', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    }
                });
            const body = await res2.json();
            //console.log("BODY: ", body)

            const _embedded = body && body._embedded ? body._embedded : null;
            const companies = _embedded && _embedded.companies ? _embedded.companies : [];
            const list = [];
        
            companies.forEach((item) => {
                var isSave = false;
                const custom_fields_values = item.custom_fields_values ? item.custom_fields_values : []
                custom_fields_values.forEach((field) => {
                    if (Number(field.field_id) == 1311991 && field.values[0].value === true) {
                        isSave = true;
                    }
                })
                if (isSave) {
                    list.push(item);
                }
            });
            setResponse(200, 'Ok', list)
            return response    
            
        default:
            setResponse(204, 'No Content', null)
            return response
    }
})