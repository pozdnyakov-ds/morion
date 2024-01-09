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

            var query = `SELECT id, name, description, filename, type, size, duration, partner, created_at, status 
                FROM media 
                WHERE partner=?
                ORDER BY name`
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

            var query = `SELECT id, name, description, filename, type, size, duration, partner, created_at, status 
                FROM media 
                WHERE partner=? AND status=?
                ORDER BY name`
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [partnerActive, 1, 1], (err, data) => {
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
                    db.query("UPDATE media SET status=? WHERE id=?", 
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

            // File create
            try {
                let idCreate = randomId(32)
                let fileId = randomId(8)

                const name = params.name
                const description = params.description
                const fileName = translit(params.filename)
                const type = params.type
                const size = params.size
                const duration = params.duration ? params.duration : 0
                const partner2 = params.partner

                const imageBase64 = params.content
                const content = Buffer.from(imageBase64.split(',')[1], 'base64')
                
                const ext = path.extname(fileName)
                const pathName = path.basename(fileName, ext) + '-[' + fileId + ']' + ext
                const pathNameThumb = path.basename(fileName, ext) + '-[' + fileId + ']-thumb.jpg'

                // S3 Upload
                const config1  = {
                    Bucket: config.S3_BUCKET,
                    Key: `partners/${partner2}/${pathName}`, 
                    Body: content,
                    ContentType: type,
                    ACL: 'public-read'
                } 
                const command = new PutObjectCommand(config1)
                const res = await s3.send(command)
                setResponse(200, 'Create file OK', res)

                try {
                    const data = await new Promise((resolve, reject) => {
                        db.query("INSERT INTO media (id, name, description, filename, type, size, duration, partner, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'), 1)", 
                        [idCreate, name, description, pathName, type, size, duration, partner2], (err, data) => {
                            if (err) {reject(err)} else {resolve(data)}
                        })
                    })  
    
                    if (data && data.affectedRows == 1) {
                        setResponse(200, 'Create file OK', null)
                        return response
                    } 
    
                } catch (error) {
                    setResponse(400, 'Create file error', null)
                }

            } catch (e) {
                setResponse(204, 'Create file error', e)
            }
            return response

        case 'index.get':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get partner
            const id = (params.id) ? params.id : null
            
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("SELECT id, name, description, filename, type, size, duration, partner, created_at, status FROM media WHERE id=? LIMIT 1", 
                    [id], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (data && data.length == 1 ) {
                    setResponse(200, 'Ok', data)
                    return response
                }
                setResponse(400, 'Partner get error', null)
                
            } catch (error) {
                setResponse(400, 'Partner get error', null)
            }
            return response

        case 'index.save':  //block [3]
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // File save
            try {
                const id3 = params.id
                const name = params.name
                const description = params.description   
                const partner3 = params.partner

                const fileId = randomId(8)
                const ext = path.extname(params.filename)
                const pathName = translit(path.basename(params.filename, ext)) + '-[' + fileId + ']' + ext
                const pathNameThumb = translit(path.basename(params.filename, ext)) + '-[' + fileId + ']-thumb.jpg'
                
                const type = params.type
                const size = params.size
                const duration = params.duration ? params.duration : 0

                const imageBase64 = params.content
                const content3 = imageBase64 ? Buffer.from(imageBase64.split(',')[1], 'base64') : null

                if (content3) {
                    // Get old file data
                    const data3 = await new Promise((resolve, reject) => {
                        db.query("SELECT filename FROM media WHERE id=? LIMIT 1", 
                        [id3], (err, data) => {
                            if (err) {reject(err)} else {resolve(data)}
                        })
                    })
                    if (!data3 || (data3 && data3.length == 0)) {
                        setResponse(204, 'No data', null)
                        return response
                    }
                    const filename3 = data3[0].filename

                    // S3 Delete Old file
                    const config3  = {
                        Bucket: config.S3_BUCKET,
                        Key: `partners/${partner3}/${filename3}`
                    }
                    const command3 = new DeleteObjectCommand(config3)
                    const res3 = await s3.send(command3)

                    // S3 Upload
                    const config4  = {
                        Bucket: config.S3_BUCKET,
                        Key: `partners/${partner3}/${pathName}`, 
                        Body: content3,
                        ContentType: type,
                        ACL: 'public-read'
                    } 
                    const command4 = new PutObjectCommand(config4)
                    const res4 = await s3.send(command4)

                    // Save to DB
                    const data4 = await new Promise((resolve, reject) => {
                        db.query("UPDATE media SET name=?, description=?, filename=?, type=?, size=?, duration=?, created_at=CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow') WHERE id=?", 
                        [name, description, pathName, type, size, duration, id3], (err, data) => {
                            if (err) {reject(err)} else {resolve(data)}
                        })
                    })  
    
                    if (data4 && data4.affectedRows == 1) {
                        setResponse(200, 'Update file OK', null)
                        return response
                    }

                } else {
                    // Save to DB
                    try {
                        const data4 = await new Promise((resolve, reject) => {
                            db.query("UPDATE media SET name=?, description=? WHERE id=?", 
                            [name, description, id3], (err, data) => {
                                if (err) {reject(err)} else {resolve(data)}
                            })
                        })  
        
                        if (data4 && data4.affectedRows == 1) {
                            setResponse(200, 'Update file content OK', null)
                            return response
                        } 
        
                    } catch (error) {
                        setResponse(400, 'Update file content error', null)
                    }
                }

            } catch (e) {
                setResponse(204, 'Update file error', e)
            }

            return response
          
        case 'index.delete':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // File delete
            try {
                const idDelete = params.id
                const data = await new Promise((resolve, reject) => {
                    db.query("SELECT filename, partner FROM media WHERE id=? LIMIT 1", 
                    [idDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (data && data.length == 0 ) {
                    setResponse(204, 'No data', null)
                    return response
                }
                
                const partner = data[0].partner
                const name = data[0].filename
                const config5  = {
                    Bucket: config.S3_BUCKET,
                    Key: `partners/${partner}/${name}`
                }

                const command = new DeleteObjectCommand(config5)
                const res = await s3.send(command)

                try {
                    const dataDeletePartner = await new Promise((resolve, reject) => {
                        db.query("DELETE FROM media WHERE id=?", 
                        [idDelete], (err, data) => {
                            if (err) {reject(err)} else {resolve(data)}
                        })
                    })
    
                    if (dataDeletePartner && dataDeletePartner.affectedRows == 1) {
                        setResponse(200, 'Delete media OK', null)
                        return response
                    }
    
                } catch (error) {
                    setResponse(400, 'Delete media error', null)
                }

            } catch (e) {
                setResponse(204, 'Delete media error', e)
            }
            return response 

        default:
            setResponse(400, 'Update status error', null)
            return response
    }
})