require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool
  .getConnection()
  .then((connection) => {
    console.log("Successfully connected to MySQL database pool!");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to the database pool:", err.message);

    process.exit(1);
  });

module.exports = pool;
