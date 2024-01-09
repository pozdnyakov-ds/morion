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

            var query = `SELECT loops.id, loops.name, loops.description, loops.start, loops.finish, loops.media, loops.duration, loops.partner, 
                loops.schedule, loops.tags, loops.created_at, loops.status,
                schedules.name AS schedule_name 
                FROM loops 
                LEFT JOIN schedules ON schedules.id = loops.schedule
                WHERE loops.partner=?`
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

        case 'schedules.list':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get schedules list
            const list = params.list ? JSON.parse(params.list) : []
            if (list.length < 1) {
                setResponse(204, 'No Content', null)
                return response
            }

            const listString = "'" + list.join("','") + "'"
            //console.log("listString: ", listString)

            
            var query = `SELECT loops.id AS loop_id, loops.name AS loop_name, loops.duration, loops.media AS loop_media, loops.duration AS loop_duration,
                schedules.id AS schedule_id, schedules.name AS schedule_name, schedules.description AS schedule_description, schedules.partner AS schedule_partner, 
                schedules.content AS schedule_content, schedules.created_at AS schedule_created_at
                FROM loops 
                LEFT JOIN schedules ON schedules.id = loops.schedule
                WHERE loops.id IN (${listString}) AND schedules.status = 1`
            try {
                const dataSch = await new Promise((resolve, reject) => {
                    db.query(query, 
                    [], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                //console.log("SCH: ", dataSch)
                setResponse(200, 'Ok', dataSch)

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

            var query = `SELECT loops.id, loops.name, loops.description, loops.start, loops.finish, loops.media, loops.duration, loops.partner, 
            loops.schedule, loops.tags, loops.created_at, loops.status,
            schedules.name AS schedule_name 
            FROM loops 
            LEFT JOIN schedules ON schedules.id = loops.schedule
            WHERE loops.partner=? AND loops.status=1`
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

        case 'index.status':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Toggle status
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query("UPDATE loops SET status=? WHERE id=?", 
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

            // Loop create
            // try {
                let idCreate = randomId(32)

                const name = params.name
                const description = params.description
                const partner2 = params.partner
                const scheduleCreate = params.schedule
                const mediaCreate = JSON.stringify(params.media)
                
                const data = await new Promise((resolve, reject) => {
                    db.query("INSERT INTO loops (id, name, description, partner, schedule, media, created_at) VALUES (?, ?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow'))", 
                    [idCreate, name, description, partner2, scheduleCreate, mediaCreate], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (data && data.affectedRows == 1) {
                    setResponse(200, 'Create loop OK', null)
                    return response
                } 
              
            // } catch (e) {
            //     setResponse(204, 'Create loop error', e)
            // }
            return response

        case 'index.get':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Get loop
            const idGet = (params.id) ? params.id : null
            
            try {
                const data = await new Promise((resolve, reject) => {
                    db.query(`SELECT loops.id, loops.name, loops.description, loops.start, loops.finish, loops.media, loops.duration, loops.partner, 
                        loops.schedule, loops.tags, loops.created_at, loops.status,
                        schedules.name AS schedule_name, schedules.content AS schedule_content
                        FROM loops 
                        LEFT JOIN schedules ON schedules.id = loops.schedule
                        WHERE loops.id=? 
                        LIMIT 1`, 
                    [idGet], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (data && data.length == 1 ) {
                    setResponse(200, 'Ok', data)
                    return response
                }
                setResponse(400, 'Loop get error', null)
                
            } catch (error) {
                setResponse(400, 'Loop get error', null)
            }
            return response

        case 'index.save':  
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // File save
            // try {
                const id3 = params.id
                const nameSave = params.name
                const descriptionSave = params.description
                const scheduleSave = params.schedule ? params.schedule : null
                const partner3 = params.partner

                const fileId = randomId(8)
                const ext = path.extname(params.filename)
                const pathName = translit(path.basename(params.filename, ext)) + '-[' + fileId + ']' + ext
                
                const type = params.type
                const size = params.size
                const duration = params.duration ? params.duration : 0

                const imageBase64 = params.content
                const content3 = imageBase64 ? Buffer.from(imageBase64.split(',')[1], 'base64') : null

                if (content3) {
                    // Get old file data
                    const data3 = await new Promise((resolve, reject) => {
                        db.query("SELECT filename FROM loops WHERE id=? LIMIT 1", 
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
                        db.query("UPDATE loops SET name=?, description=?, filename=?, type=?, size=?, duration=?, created_at=CONVERT_TZ(NOW(), 'UTC', 'Europe/Moscow') WHERE id=?", 
                        [nameSave, descriptionSave, pathName, type, size, duration, id3], (err, data) => {
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
                            db.query("UPDATE loops SET name=?, description=? WHERE id=?", 
                            [nameSave, descriptionSave, id3], (err, data) => {
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

            // } catch (e) {
            //     setResponse(204, 'Update file error', e)
            // }

            return response

        case 'media.save':  
        // Check access token
        if (!checkAccessToken(event)) {
            setResponse(403, 'Invalid access token', null)
            return response
        }

        // Save media list
        // try {
            const idSave = params.id
            var media = params.media
            var oldMedia = []

            if (media && media.length) {

                // Get old loop data
                const dataGet = await new Promise((resolve, reject) => {
                    db.query("SELECT media FROM loops WHERE id=? LIMIT 1", 
                    [idSave], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (!dataGet || (dataGet && dataGet.length == 0)) {
                    setResponse(204, 'No data', null)
                    return response
                }
                oldMedia = dataGet[0].media ? dataGet[0].media : []

                // Compose ready data
                media.forEach((item) => {
                    oldMedia.push(item)
                })

                var countDuration = 0.0
                oldMedia.forEach((el) => {
                    countDuration = countDuration + (el.duration * 1.0)
                })

                // Save to DB
                const mediaToSave = oldMedia && oldMedia.length ? JSON.stringify(oldMedia) : JSON.stringify([])
                const data5 = await new Promise((resolve, reject) => {
                    db.query("UPDATE loops SET media=?, duration=? WHERE id=?", 
                    [mediaToSave, countDuration, idSave], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (data5 && data5.affectedRows == 1) {
                    setResponse(200, 'Update loop data OK', null)
                    return response
                }

            } else {
                setResponse(204, 'No data to update loop', null)
                return response
            } 
    
        // } catch (error) {
        //     setResponse(400, 'Update loop content error', null)
        // }

        return response

    case 'index.update':
        // Check access token
        if (!checkAccessToken(event)) {
            setResponse(403, 'Invalid access token', null)
            return response
        }

        // Loop update
        try {
            //console.log("LOOP API: ", params.item)
            
            const idUpdate = params.item && params.item.id ? params.item.id : null
            const itemName = params.item && params.item.name ? params.item.name : null
            const itemDescription = params.item && params.item.description ? params.item.description : null
            const itemSchedule = params.item && params.item.schedule ? params.item.schedule : null

            const data8 = await new Promise((resolve, reject) => {
                db.query("UPDATE loops SET name=?, description=?, schedule=? WHERE id=?", 
                [itemName, itemDescription, itemSchedule, idUpdate], (err, data) => {
                    if (err) {reject(err)} else {resolve(data)}
                })
            })  

            if (data8 && data8.affectedRows == 1) {
                setResponse(200, 'Update loop OK', null)
                return response
            }

        } catch (e) {
            setResponse(204, 'Update loop error', e)
        }
        return response
          
        case 'index.delete':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Loop delete
            try {
                const idDelete = params.id
                
                const dataDeleteLoop = await new Promise((resolve, reject) => {
                    db.query("DELETE FROM loops WHERE id=?", 
                    [idDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })

                if (dataDeleteLoop && dataDeleteLoop.affectedRows == 1) {
                    setResponse(200, 'Delete loop OK', null)
                    return response
                }

            } catch (e) {
                setResponse(204, 'Delete loop error', e)
            }
            return response 

        case 'media.duration':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Loop media duration update
            try {
                const idLoopUpdate = params.loop
                const idMediaUpdate = params.media
                const mediaDuration = params.duration

                // console.log("SAVE DURATION: ", idLoopUpdate, idMediaUpdate, mediaDuration)

                // Get old loop data
                const dataGetUpdate = await new Promise((resolve, reject) => {
                    db.query("SELECT media FROM loops WHERE id=? LIMIT 1", 
                    [idLoopUpdate], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (!dataGetUpdate || (dataGetUpdate && dataGetUpdate.length == 0)) {
                    setResponse(204, 'No data', null)
                    return response
                }
                const media = (dataGetUpdate[0] && dataGetUpdate[0].media) ? dataGetUpdate[0].media : []
                // console.log("DURATION: ", media)

                // Save duration + count duration
                var countDuration = 0
                if (media && media.length) {
                    media.forEach((item, index) => {
                        if (item.media_id == idMediaUpdate) {
                            item.duration = mediaDuration * 1.0
                        } 
                        countDuration = countDuration + (item.duration * 1.0)
                    })
                }

                const readyData = JSON.stringify(media)
                // console.log("DURATION NEW: ", media)

                const data7 = await new Promise((resolve, reject) => {
                    db.query("UPDATE loops SET media=?, duration=? WHERE id=?", 
                    [readyData, countDuration, idLoopUpdate], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (data7 && data7.affectedRows == 1) {
                    setResponse(200, 'Update loop media duration OK', null)
                    return response
                }

            } catch (e) {
                setResponse(204, 'Update loop media duration error', e)
            }
            return response

        case 'media.delete':
            // Check access token
            if (!checkAccessToken(event)) {
                setResponse(403, 'Invalid access token', null)
                return response
            }

            // Loop media delete
            try {
                const idLoopDelete = params.loop
                const idMediaDelete = params.id
                // console.log("API DELETE ID: ", idLoopDelete, idMediaDelete)

                // Get old loop data
                const dataGetDelete = await new Promise((resolve, reject) => {
                    db.query("SELECT media FROM loops WHERE id=? LIMIT 1", 
                    [idLoopDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })
                if (!dataGetDelete || (dataGetDelete && dataGetDelete.length == 0)) {
                    setResponse(204, 'No data', null)
                    return response
                }
                const oldMedia = dataGetDelete[0] && dataGetDelete[0].media ? dataGetDelete[0].media : []
                // console.log("OLD MEDIA: ", dataGetDelete[0])

                // Build new data
                const media = []
                var countDuration = 0
                if (oldMedia && oldMedia.length) {
                    oldMedia.forEach((item) => {
                        if (item.media_id != idMediaDelete) {
                            media.push(item)
                            countDuration = countDuration + item.duration
                        }
                    })
                }

                const readyData = JSON.stringify(media)
                const data6 = await new Promise((resolve, reject) => {
                    db.query("UPDATE loops SET media=?, duration=? WHERE id=?", 
                    [readyData, countDuration, idLoopDelete], (err, data) => {
                        if (err) {reject(err)} else {resolve(data)}
                    })
                })  

                if (data6 && data6.affectedRows == 1) {
                    setResponse(200, 'Delete loop media OK', null)
                    return response
                }

            } catch (e) {
                setResponse(204, 'Delete loop media error', e)
            }
            return response     

        default:
            setResponse(400, 'Action error', null)
            return response
    }
})