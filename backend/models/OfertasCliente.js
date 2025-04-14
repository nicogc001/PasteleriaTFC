const { DataTypes } = require('sequelize');
const db = require('../config/db');

const OfertasCliente = db.define('OfertasCliente', {
  ofertaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Ofertas',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'OfertasCliente',
  timestamps: false
});

module.exports = OfertasCliente;
