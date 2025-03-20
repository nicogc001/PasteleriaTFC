const { Sequelize } = require('sequelize');
require('dotenv').config();

const db = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
});

module.exports = db;
