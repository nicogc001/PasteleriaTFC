const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Pedidos = require('./Pedidos');
const Productos = require('./Productos');

const ProductosPedidos = db.define('ProductosPedidos', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    pedidoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Pedidos,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Productos,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'ProductosPedidos',
    timestamps: false
});

// Relaciones
Pedidos.hasMany(ProductosPedidos, { foreignKey: 'pedidoId', onDelete: 'CASCADE' });
ProductosPedidos.belongsTo(Pedidos, { foreignKey: 'pedidoId' });

Productos.hasMany(ProductosPedidos, { foreignKey: 'productoId', onDelete: 'CASCADE' });
ProductosPedidos.belongsTo(Productos, { foreignKey: 'productoId' });

module.exports = ProductosPedidos;