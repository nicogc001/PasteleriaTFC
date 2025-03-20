const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Configuración de conexión a PostgreSQL en Render con SSL
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Evita problemas de certificado en Render
        }
    },
    logging: false // Evita mostrar consultas en la consola
});

module.exports = db;