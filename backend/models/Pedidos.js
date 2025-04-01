const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Usuario = require('./Usuario');

const Pedido = db.define('Pedido', {
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
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  estado: { 
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pendiente_pago'
  },
  metodoPago: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipoEntrega: {
    type: DataTypes.STRING, 
    allowNull: false
  },
  tienda: {
    type: DataTypes.STRING,
    allowNull: true 
  },

  // Aprobaciones
  aprobadorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Usuario,
      key: 'id'
    }
  },
  aprobadoPorEmpleado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  segundoAprobadorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Usuario,
      key: 'id'
    }
  },
  aprobadoPorAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fechaEntrega: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
}, {
  tableName: 'Pedidos',
  timestamps: false
});

// Relaciones
Usuario.hasMany(Pedido, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Pedido.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// ✅ Relaciones para aprobadores
Usuario.hasMany(Pedido, { foreignKey: 'aprobadorId', as: 'AprobacionesEmpleado' });
Usuario.hasMany(Pedido, { foreignKey: 'segundoAprobadorId', as: 'AprobacionesAdmin' });

Pedido.belongsTo(Usuario, { foreignKey: 'aprobadorId', as: 'AprobadorEmpleado' });
Pedido.belongsTo(Usuario, { foreignKey: 'segundoAprobadorId', as: 'AprobadorAdmin' });

module.exports = Pedido;
