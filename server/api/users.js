import db from "../../config/database"
import transporter from "../../config/nodemailer"
import jwt from "jsonwebtoken"
import recaptchaCheck from "~/config/recaptcha"
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

    switch (params.action) {
        case 'users.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get users list
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("SELECT id, name, surname, scope FROM users WHERE status=?", [params.status], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Ok', data)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response

        case 'user.login':
            // Check recaptcha
            if (!recaptchaCheck(params.token_recaptcha)) {
                setResponse(422, 'Recaptcha error', null)
                return response
            }

            // Check login
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(`SELECT users.id, users.name, users.surname, users.email, users.partner, users.scope,
                            partners.name AS partner_name, partners.scope AS partner_scope 
                            FROM users 
                            LEFT JOIN partners ON users.partner = partners.id
                            WHERE users.email=? AND users.password=? AND users.status=? 
                            LIMIT 1`, [params.email, params.password, 1], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                let user = data[0]
                const readyData = {...user}
                readyData['accessToken'] = jwt.sign({ id: user.id, scope: user.scope }, config.JWT_SECRET, { expiresIn: config.JWT_ACCESS_TOKEN_EXPIRATION })

                // Save access token
                const saveToken = await new Promise((resolve, reject) => {
                    db.query("UPDATE users SET token_access=? WHERE email=?", [readyData['accessToken'], params.email], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (saveToken && saveToken.affectedRows != 1) {
                    setResponse(400, 'Token save error', null)
                    return response
                }

                // Set expiration date for Access Token
                var accessTokenExpDate = new Date()
                accessTokenExpDate.setDate(accessTokenExpDate.getDate() + Number(config.JWT_ACCESS_TOKEN_EXPIRATION_DAYS))
                readyData['accessTokenExpDate'] = accessTokenExpDate

                setResponse(200, 'Ok', readyData)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response  

        case 'user.forgot':
            // Check recaptcha
            if (!recaptchaCheck(params.token_recaptcha)) {
                setResponse(422, 'Recaptcha error', null)
                return response
            } 

            // Check forgot
            try {
                // Check email
                const data = await new Promise((resolve, reject) => {
                    db.query("SELECT name, email FROM users WHERE email=?", [params.email], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (data && data.length == 0) {
                    setResponse(401, 'No such user', null)
                    return response
                }

                var emailToken = jwt.sign(
                    { email: params.email },
                    config.MAIL_TOKEN_SECRET,
                    { expiresIn: "1d" }
                );

                const baseURL = config.NODE_ENV === "development"
                    ? "https://localhost:3000"
                    : "https://display24.ru"

                // Write token_email
                const forgotRes = await new Promise((resolve, reject) => {
                    db.query("UPDATE users SET token_email=? WHERE email=?", [emailToken, params.email], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (forgotRes && forgotRes.affectedRows != 1) {
                    setResponse(400, 'Token error', null)
                    return response
                }

                console.log(baseURL, params.email, emailToken)
                var content = `<table style="border-collapse: collapse; width: 100%;"><tr>
                <td style="width: 1%; padding: 0; vertical-align: top;"><img src="https://cafecard.ru/dist/img/logo_d24_login.png"></td>
                <td style="padding: 20px 0 0 0; text-align: left; vertical-align: top;"><b>Ссылка для сброса пароля:</b> 
                <a target=_blank href="${baseURL}/login/reset?email=${params.email}&token=${emailToken}">Подтвердить</a><br>
                Если вы не отправляли этот запрос, то просто закройте и удалите это письмо.</td></tr></table>`;
                
                const info = transporter.sendMail({
                    from: `Display24 <${config.MAIL_AUTH_USER}>`,
                    to: params.email,
                    subject: "Подтверждение сброса пароля на проекте Display24.ru",
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
                
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response

        case 'user.reset':
            // Check recaptcha
            if (!recaptchaCheck(params.token_recaptcha)) {
                setResponse(422, 'Recaptcha error', null)
                return response
            }

            // Check reset
            try {
                const resetRes = await new Promise((resolve, reject) => {
                    db.query("UPDATE users SET password=?, token_email=? WHERE email=? AND token_email=?", [params.password, '', params.email, params.token_email], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                //console.log("resetRes: ", resetRes)
                if (resetRes && resetRes.affectedRows != 1) {
                    setResponse(400, 'Email reset error', null)
                    return response
                } else {
                    setResponse(200, 'Email reset Ok', null)
                    return response
                }
                
            } catch (error) {
                setResponse(400, 'Email reset error', null)
            }
            return response 
        
        case 'users.refresh':
            // Refresh token
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("SELECT id, scope FROM users WHERE token_access=? LIMIT 1", [params.token_refresh], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (!data || data.length == 0) {
                    setResponse(401, 'No such user', null)
                    return response
                }

                const user = {...data[0]}
                const accessToken = jwt.sign({ id: user.id, scope: user.scope }, config.JWT_SECRET, { expiresIn: config.JWT_ACCESS_TOKEN_EXPIRATION })

                const updateTokens = await new Promise((resolve, reject) => {
                    db.query("UPDATE users SET token_access=? WHERE token_access=?", [accessToken, params.token_refresh], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                
                if (updateTokens && updateTokens.affectedRows != 1) {
                    setResponse(400, 'Update token error', null)
                    return response
                } else {
                    setResponse(200, 'Update token Ok', {accessToken})
                    return response
                }
            } catch (error) {
                setResponse(400, 'System error', null)
            }
            return response    

        case 'users.logout':
            // Logout
            try {
                const logout = await new Promise((resolve, reject) => {
                    db.query("UPDATE users SET token_access=? WHERE token_access=?", [null, params.token_refresh], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (logout && logout.affectedRows != 1) {
                    setResponse(400, 'Logout error', null)
                    return response
                } else {
                    setResponse(200, 'Logout Ok', null)
                    return response
                }
            } catch (error) {
                setResponse(400, 'Logout error', null)
            }
            return response    

        default:
            setResponse(204, 'No Content', null)
            return response
    }

})