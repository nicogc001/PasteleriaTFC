const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

// ✅ Crear conexión con MySQL usando variables de entorno
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ✅ Manejo de errores en la conexión a la base de datos
pool.getConnection()
    .then(conn => {
        console.log("✅ Conexión a la base de datos establecida correctamente");
        conn.release();
    })
    .catch(err => {
        console.error("❌ Error conectando a la base de datos:", err);
    });

module.exports = pool;
