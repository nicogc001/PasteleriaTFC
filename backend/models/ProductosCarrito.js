const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Carrito = require('./Carrito');
const Productos = require('./Productos'); 

const ProductosCarrito = db.define('ProductosCarrito', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    carritoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Carrito,
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
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: 'ProductosCarrito',
    timestamps: false
});

// Relaciones
Carrito.hasMany(ProductosCarrito, { foreignKey: 'carritoId', onDelete: 'CASCADE' });
ProductosCarrito.belongsTo(Carrito, { foreignKey: 'carritoId' });

Productos.hasMany(ProductosCarrito, { foreignKey: 'productoId', onDelete: 'CASCADE' });
ProductosCarrito.belongsTo(Productos, { foreignKey: 'productoId' });

module.exports = ProductosCarrito;
