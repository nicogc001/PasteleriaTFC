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
}, {
    tableName: 'Pedidos',
    timestamps: false
});


// Relaciones
Usuario.hasMany(Pedido, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Pedido.belongsTo(Usuario, { foreignKey: 'usuarioId' });

module.exports = Pedido;
