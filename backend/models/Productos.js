const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Producto = db.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Productos',
  timestamps: false
});

// Asociaciones
Producto.associate = (models) => {
  Producto.hasMany(models.HistorialStock, {
    foreignKey: 'productoId',
    as: 'historial'
  });

  // línea para enlazar con Ofertas
  Producto.hasMany(models.Ofertas, {
    foreignKey: 'productoId',
    as: 'ofertas'
  });
};

module.exports = Producto;
