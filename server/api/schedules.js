import db from "../../config/database"
import checkAccessToken from "~/config/token"
import randomId from "../../config/misc"
import path from 'path'
import translit from '../../config/translit'

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3client"
import { Buffer } from 'node:buffer'

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
        case 'index.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get partners list
            const partner = params.partner

            var query = "SELECT id, name, description, partner, content, created_at, status FROM schedules WHERE partner=?"
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [partner], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Ok', data)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response

        case 'index.active':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get partners list
            const partnerActive = params.partner

            var query = "SELECT id, name, description, partner, content, created_at, status FROM schedules WHERE partner=? AND status=1"
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [partnerActive], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Ok', data)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response    

        case 'index.get':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get partners list
            const idGet = params.id

            var query = `SELECT id, name, description, partner, content, created_at, status 
                FROM schedules 
                WHERE id=?
                LIMIT 1`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [idGet], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Ok', data)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response

        case 'index.status':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Toggle status
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("UPDATE schedules SET status=? WHERE id=?", 
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
                setResponse(400, 'Update statu error', null)
            }
            return response 

        case 'index.create':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Scheduler create
            // try {
                let idCreate = randomId(32)

                const name = params.name
                const description = params.description
                const partner2 = params.partner
                const contentCreate = JSON.stringify(params.content)
                
                const data = await new Promise((resolve, reject) => {
                    db.query("INSERT INTO schedules (id, name, description, partner, content, created_at) VALUES (?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'))", 
                    [idCreate, name, description, partner2, contentCreate], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (data && data.affectedRows == 1) {
                    setResponse(200, 'Create Scheduler OK', null)
                    return response
                } 
              
            // } catch (e) {
            //     setResponse(204, 'Create Scheduler error', e)
            // }
            return response

        case 'index.save':  
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Schedule save
            // try {
                const idSave = params.id
                const nameSave = params.name
                const descriptionSave = params.description

                console.log("API SAVE: ", idSave, nameSave, descriptionSave)
                
                const dataSave = await new Promise((resolve, reject) => {
                    db.query("UPDATE schedules SET name=?, description=? WHERE id=?", 
                    [nameSave, descriptionSave, idSave], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (dataSave && dataSave.affectedRows == 1) {
                    setResponse(200, 'Update schedule OK', null)
                    return response
                } 
                   
            // } catch (e) {
            //     setResponse(204, 'Update schedule error', e)
            // }

            return response

    case 'index.update':
        // Check access token
        if (!checkAccessToken(event)) {
            setResponse(403, 'Invalid access token', null)
            return response
        }

        // Scheduler update
        try {
            //console.log("Scheduler API: ", params.item)
            
            const idUpdate = params.id ? params.id : null
            const contentUpdate = params.content ? JSON.stringify(params.content) : null

            const data9 = await new Promise((resolve, reject) => {
                db.query("UPDATE schedules SET content=? WHERE id=?", 
                [contentUpdate, idUpdate], (err, data) => {
                    if (err) {reject(err)} else {resolve(data)}
                })
            })

            if (data9 && data9.affectedRows == 1) {
                setResponse(200, 'Update scheduler OK', null)
                return response
            }

        } catch (e) {
            setResponse(204, 'Update scheduler error', e)
        }
        return response
          
        case 'index.delete':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Scheduler delete
            try {
                const idDelete = params.id
                
                const dataDelete = await new Promise((resolve, reject) => {
                    db.query("DELETE FROM schedules WHERE id=?", 
                    [idDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (dataDelete && dataDelete.affectedRows == 1) {
                    setResponse(200, 'Delete Scheduler OK', null)
                    return response
                }

            } catch (e) {
                setResponse(204, 'Delete Schedule error', e)
            }
            return response 

        default:
            setResponse(400, 'Action error', null)
            return response
    }
})