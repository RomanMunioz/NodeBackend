// src/db.js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  port: process.env.MYSQL_ADDON_PORT || 3306,
  ssl: {
    rejectUnauthorized: false,
  },
});
console.log("HOST:", process.env.MYSQL_ADDON_HOST);
console.log("USER:", process.env.MYSQL_ADDON_USER);
console.log("DB:", process.env.MYSQL_ADDON_DB); 
console.log("PORT:", process.env.MYSQL_ADDON_PORT);

export default pool;

