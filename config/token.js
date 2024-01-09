import jwt from "jsonwebtoken"

const config = useRuntimeConfig()

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

const checkAccessToken = async(event) => {
    try {
        const body = await readBody(event)
        const headers = Object.fromEntries(Array.from(event.headers.entries()));
        const params = {...body}

        const accessToken = headers.authorization.split(' ')[1]

        if (!accessToken) {
            setResponse(401, 'Access token not provided', null)
            return false
        }
        const decoded = jwt.verify(accessToken, config.JWT_SECRET)
        return true

    } catch(e) {
        if (e instanceof jwt.TokenExpiredError) {
            setResponse(403, 'Token has expired', null)
            return false
        } else {
            setResponse(403, 'Invalid access token', null)
            return false
        }
    }
}

export default checkAccessToken