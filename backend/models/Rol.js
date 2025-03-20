const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Rol = db.define('Rol', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    permisos: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'Roles',
    timestamps: false
});

module.exports = Rol;
