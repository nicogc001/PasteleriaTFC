const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Usuario = require('./Usuario');

const Carrito = db.define('Carrito', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'Carritos',
    timestamps: false
});

// Relación con Usuario
Usuario.hasOne(Carrito, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Carrito.belongsTo(Usuario, { foreignKey: 'usuarioId' });

module.exports = Carrito;
