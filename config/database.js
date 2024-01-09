import mysql from "mysql2"

const config = useRuntimeConfig()

const db = mysql.createPool({
  host:     config.MYSQL_HOST,
  port:     config.MYSQL_PORT,
  database: config.MYSQL_DATABASE,
  user:     config.MYSQL_USER,
  password: config.MYSQL_PASSWORD,

  connectionLimit: 5,
  waitForConnections: true,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

export default db