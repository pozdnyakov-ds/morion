import mysql from "mysql2"

const config = useRuntimeConfig()

const db = mysql.createPool({
  host:     config.MYSQL_HOST,
  port:     config.MYSQL_PORT,
  database: config.MYSQL_DATABASE,
  user:     config.MYSQL_USER,
  password: config.MYSQL_PASSWORD,

  // host: "2.59.42.74",
  // port: "3306",
  // database: "d24",
  // user: "d24",
  // password: "d24531350",

  connectionLimit: 5,
  waitForConnections: true,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

export default db