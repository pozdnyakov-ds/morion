import db from "../../config/database"
import checkAccessToken from "~/config/token"
import randomId from "../../config/misc"
import path from 'path'
import translit from '../../config/translit'

import { PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3client"
import { Buffer } from 'node:buffer'

const deleteAwsFolderFiles = async (key) => {
    const config = useRuntimeConfig()

    const listCommand = new ListObjectsV2Command({
        Bucket: config.S3_BUCKET,
        Prefix: key
    })
    let list = await s3.send(listCommand)

    if (list.KeyCount) {
         const deleteCommand = new DeleteObjectsCommand({
          Bucket: config.S3_BUCKET,
          Delete: {
            Objects: list.Contents.map((item) => ({ Key: item.Key })), 
            Quiet: false, 
          },
        });
        let deleted = await s3.send(deleteCommand); 

        if (deleted.Errors) {
          deleted.Errors.map((error) => console.log(`${error.Key} could not be deleted - ${error.Code}`));
        }
        return deleted.Deleted.length
    }
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const body = await readBody(event)
    const headers = getRequestHeaders(event)
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
        case 'index.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get partners list
            const scope = params.scope

            var query = ""
            switch (scope) {
            case 0: 
                query = "SELECT id, name, description, wallet, cost, income, scope, logo, created_at, status FROM partners WHERE 1"
                break
            case 1: 
                query = "SELECT id, name, description, wallet, cost, income, scope, logo, created_at, status FROM partners WHERE JSON_CONTAINS(scope, '1')"
                break    
            case 2: 
                query = "SELECT id, name, description, wallet, cost, income, scope, logo, created_at, status FROM partners WHERE JSON_CONTAINS(scope, '2')"
                break
            default:
                query = "SELECT id, name, description, wallet, cost, income, scope, logo, created_at, status FROM partners WHERE 1"
            }

            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Ok', data)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response

        case 'index.selflist':
                // Check access token
                if (!checkAccessToken(event)) {
                    setResponse(403, 'Invalid access token', null)
                    return response
                }

                const parent = params.parent
   
                var query = "SELECT id, name, description, wallet, cost, income, scope, logo, created_at, status FROM partners WHERE parent=?"
                try {
                    const data = await new Promise((resolve, reject) => {
                        db.query(query, 
                        [parent], (err, data) => {
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

            // Get partner
            const id = (params.id) ? params.id : null
            
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("SELECT id, name, description, contacts, scope, logo, tags, created_at, status FROM partners WHERE id=? LIMIT 1", 
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

        case 'index.create':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Create partner
            try {
                const id2 = randomId(32)
                let fileId = randomId(8)

                const contacts2 = JSON.stringify(params.contacts)
                const scope2 = JSON.stringify(params.scope)
                const parent2 = (params.parent) ? params.parent : null
                const tags2 = params.tags.substring(0, 255)

                const fileName = translit(params.filename)
                const type = params.type
                const size = params.size

                const imageBase64 = params.content
                const content = Buffer.from(imageBase64.split(',')[1], 'base64')
                
                const ext = path.extname(fileName)
                const pathName = path.basename(fileName, ext) + '-[' + fileId + ']' + ext

                // S3 Upload
                const config1  = {
                    Bucket: config.S3_BUCKET,
                    Key: `partners/${id2}/${pathName}`, 
                    Body: content,
                    ContentType: type,
                    ACL: 'public-read'
                } 
                
                const command = new PutObjectCommand(config1)
                const res = await s3.send(command)

                // Save to DB
                const logoData = JSON.stringify({
                    filename: pathName,
                    type: type,
                    size: size
                })
                const data = await new Promise((resolve, reject) => {
                    db.query("INSERT INTO partners (id, name, description, contacts, scope, parent, logo, tags, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'), 1)", 
                    [id2, params.name, params.description, contacts2, scope2, parent2, logoData, tags2], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (data && data.affectedRows != 1) {
                    setResponse(400, 'Create error', null)
                    return response
                }

                // Create s3 folder
                try {
                    const partner = id2
                    const content = 'Partner folder'
                    const config1  = {
                        Bucket: config.S3_BUCKET,
                        Key: `partners/${partner}/readme.txt`, 
                        Body: content,
                    }
    
                    const command = new PutObjectCommand(config1)
                    const res = await s3.send(command)
                    setResponse(200, 'Create partner OK', res)
    
                } catch (e) {
                    setResponse(204, 'Create partner error', e)
                }

            } catch (error) {
                setResponse(400, 'Create error', null)
            }
            return response

        case 'index.save':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Save partner
            try {
                //console.log("PARAMS: ", params)

                const imageBase64Save = params.content ? params.content : null
                var contentSave = null

                const partnerSave = params.id
                const contactsSave = JSON.stringify(params.contacts)
                const scopeSave = JSON.stringify(params.scope)
                const updateMediaSave = params.update_media
                const tagsSave = params.tags.substring(0, 255)

                var logo = null
                var fileIdSave = null
                var extSave = null
                var pathNameSave = null
                var logoDataSave = null

                if (imageBase64Save) {
                    logo = JSON.parse(params.logo)
                    fileIdSave = randomId(8)
                    extSave = path.extname(logo.filename)
                    pathNameSave = translit(path.basename(logo.filename, extSave)) + '-[' + fileIdSave + ']' + extSave
                    contentSave = imageBase64Save ? Buffer.from(imageBase64Save.split(',')[1], 'base64') : null
    
                    var logoDataSave = JSON.stringify({
                        filename: pathNameSave,
                        type: logo.type,
                        size: logo.size
                    })
                }
                
                if (contentSave) {
                    // S3 Delete Old file
                    var configSave  = {
                        Bucket: config.S3_BUCKET,
                        Key: `partners/${partnerSave}/${updateMediaSave}`
                    }
                    var commandSave = new DeleteObjectCommand(configSave)
                    var resSave = await s3.send(commandSave)

                    // S3 Upload
                    configSave  = {
                        Bucket: config.S3_BUCKET,
                        Key: `partners/${partnerSave}/${pathNameSave}`, 
                        Body: contentSave,
                        ContentType: logo.type,
                        ACL: 'public-read'
                    } 
                    commandSave = new PutObjectCommand(configSave)
                    resSave = await s3.send(commandSave)

                    //Save to DB
                    const data4 = await new Promise((resolve, reject) => {
                        db.query("UPDATE partners SET name=?, description=?, contacts=?, scope=?, parent=?, logo=?, tags=? WHERE id=?", 
                        [params.name, params.description, contactsSave, scopeSave, params.parent, logoDataSave, tagsSave, params.id], (err, data) => {
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
                        const data5 = await new Promise((resolve, reject) => {
                            db.query("UPDATE partners SET name=?, description=?, contacts=?, scope=?, tags=? WHERE id=?", 
                            [params.name, params.description, contactsSave, scopeSave, tagsSave, params.id], (err, data) => {
                                if (err) {reject(err)} else {resolve(data)}
                            })
                        })  
        
                        if (data5 && data5.affectedRows == 1) {
                            setResponse(200, 'Update partner OK', null)
                            return response
                        } 
        
                    } catch (error) {
                        setResponse(400, 'Update partner error', null)
                    }
                }

            } catch (error) {
                setResponse(400, 'Partner save error', null)
            }
            return response

        case 'index.status':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Save partner
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("UPDATE partners SET status=? WHERE id=?", 
                    [params.status, params.id], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (data && data.affectedRows != 1) {
                    setResponse(400, 'Partner update status error', null)
                    return response
                }
                setResponse(200, 'Ok', data)

            } catch (error) {
                setResponse(400, 'Partner update statu error', null)
            }
            return response   
            
        case 'index.delete':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Delete partner
            try {
                const idPatnerDelete = (params.id) ? params.id : null
                
                const data1 = await new Promise((resolve, reject) => {
                    db.query("DELETE FROM partners WHERE id=?", 
                    [idPatnerDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (data1 && data1.affectedRows != 1) {
                    setResponse(400, 'Delete error', null)
                    return response
                }

                // Delete partner users
                try {
                    const data2 = await new Promise((resolve, reject) => {
                        db.query("DELETE FROM users WHERE partner=?", 
                        [idPatnerDelete], (err, data) => {
                            if (err) {reject(err)} else {resolve(data)}
                        })
                    })
                    
                } catch (error) {
                    setResponse(400, 'Delete error', null)
                }

                // Partner s3 delete folder
                try {
                    const partner = idPatnerDelete
                    deleteAwsFolderFiles('partners/'+ partner)

                    setResponse(200, 'Delete partner OK', res)

                } catch (e) {
                    setResponse(204, 'Delete partner error', e)
                }

            } catch (error) {
                setResponse(400, 'Delete error', null)
            }
            return response

        case 'users.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            const partnerUserList = params.partner
            // Get users list
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("SELECT id, name, surname, password, email, contacts, scope, partner, created_at, status FROM users WHERE partner=?", 
                    [partnerUserList], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                setResponse(200, 'Ok', data)
            } catch (error) {
                setResponse(204, 'No Content', null)
            }
            return response

        case 'users.get':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get user
            const id1 = (params.id) ? params.id : null
            
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("SELECT id, name, surname, password, email, contacts, scope, partner, created_at, status FROM users WHERE id=? LIMIT 1", 
                    [id1], (err, data) => {
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

        case 'owner.get':
                // Check access token
                if (!checkAccessToken(event)) {
                    setResponse(403, 'Invalid access token', null)
                    return response
                }
    
                // Get user
                const partnerOwner = (params.partner) ? params.partner : null
                
                try {
                    const data = await new Promise((resolve, reject) => {
                        db.query(`SELECT id, name, surname, password, email, contacts, scope, partner, created_at, status 
                            FROM users 
                            WHERE partner=? AND scope='owner'
                            LIMIT 1`, 
                        [partnerOwner], (err, data) => {
                            if (err) {reject(err)} else {resolve(data)}
                        })
                    })
                    if (data && data.length == 1 ) {
                        setResponse(200, 'Ok', data)
                        return response
                    }
                    setResponse(400, 'Owner get error', null)
                    
                } catch (error) {
                    setResponse(400, 'Owner get error', null)
                }
                return response    

        case 'users.create':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Create user
            try {
                const id3 = randomId(32)
                const scope3 = JSON.stringify(params.scope)
                const contacts3 = JSON.stringify(params.contacts)

                const data3 = await new Promise((resolve, reject) => {
                    db.query("INSERT INTO users (id, name, surname, password, email, contacts, scope, partner, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'), ?)", 
                    [id3, params.name, params.surname, params.password, params.email, contacts3, scope3, params.partner, 1], (err, data3) => {
                        if (err) {reject(err)} else {resolve(data3)}
                    })
                })
                if (data3 && data3.affectedRows != 1) {
                    setResponse(400, 'Create error', null)
                    return response
                }
                setResponse(200, 'Ok', data3)

            } catch (error) {
                setResponse(400, 'Create error', error.code)
            }
            return response    
        
        case 'users.save':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Save user
            try {
                const scope1 = JSON.stringify(params.scope)
                const contacts1 = JSON.stringify(params.contacts)

                const data2 = await new Promise((resolve, reject) => {
                    db.query("UPDATE users SET name=?, surname=?, password=?, email=?, contacts=?, scope=? WHERE id=?", 
                    [params.name, params.surname, params.password, params.email, contacts1, scope1, params.id], (err, data2) => {
                        if (err) {reject(err)} else {resolve(data2)}
                    })
                })

                if (data2 && data2.affectedRows != 1) {
                    setResponse(400, 'Save error', null)
                    return response
                }
                setResponse(200, 'Ok', data2)

            } catch (error) {
                setResponse(400, 'Save error', null)
            }
            return response
        
        case 'users.delete':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Delete user
            try {
                const id = (params.id) ? params.id : null

                const data = await new Promise((resolve, reject) => {
                    db.query("DELETE FROM users WHERE id=?", 
                    [id], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (data && data.affectedRows != 1) {
                    setResponse(400, 'Delete error', null)
                    return response
                }
                setResponse(200, 'Ok', data)

            } catch (error) {
                setResponse(400, 'Delete error', null)
            }
            return response  
            
        case 'users.status':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Update user status 
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("UPDATE users SET status=? WHERE id=?", 
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
                setResponse(400, 'Update status error', null)
            }
            return response     

        default:
            setResponse(400, 'Update status error', null)
            return response
    }
})