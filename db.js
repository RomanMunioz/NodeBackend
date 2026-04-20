// src/db.js
import mysql from "mysql2/promise";

const pool = mysql.createPool(process.env.MYSQL_ADDON_URI);
export default pool;

