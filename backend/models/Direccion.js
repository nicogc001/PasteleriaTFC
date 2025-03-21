const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Usuario = require('./Usuario');

const Direccion = db.define('Direccion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  calle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  provincia: {
    type: DataTypes.STRING,
    allowNull: false
  },
  localidad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'Direcciones',
  timestamps: false
});

Usuario.hasMany(Direccion, { foreignKey: 'usuarioId' });
Direccion.belongsTo(Usuario, { foreignKey: 'usuarioId' });

module.exports = Direccion;
