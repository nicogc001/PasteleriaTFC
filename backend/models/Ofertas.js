const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Productos = require('./Productos');

const Ofertas = db.define('Ofertas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Productos',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  descuento: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fechaFin: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'Ofertas',
  timestamps: false
});

// Relaciones
Productos.hasMany(Ofertas, {
  foreignKey: 'productoId',
  onDelete: 'CASCADE'
});

Ofertas.belongsTo(Productos, {
  foreignKey: 'productoId',
  as: 'producto' // esto permite acceder como oferta.producto
});

module.exports = Ofertas;
