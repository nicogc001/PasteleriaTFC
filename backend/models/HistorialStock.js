const { DataTypes } = require('sequelize');
const db = require('../config/db');

const HistorialStock = db.define('HistorialStock', {
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
  stockAnterior: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stockNuevo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  diferencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'HistorialStock',
  timestamps: false
});

// Asociación
HistorialStock.associate = (models) => {
  HistorialStock.belongsTo(models.Productos, {
    foreignKey: 'productoId',
    as: 'producto'
  });
};

module.exports = HistorialStock;
