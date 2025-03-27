const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Usuario = require('./Usuario'); // Relación con empleados

const RegistroHorarios = db.define('RegistroHorarios', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    empleadoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    horaEntrada: {
        type: DataTypes.TIME,
        allowNull: false
    },
    horaSalida: {
        type: DataTypes.TIME,
        allowNull: true // Puede ser nulo hasta que salga
    }
}, {
    tableName: 'RegistroHorarios',
    timestamps: false
});

// Relaciones
RegistroHorarios.belongsTo(Usuario, { foreignKey: 'empleadoId' });
Usuario.hasMany(RegistroHorarios, { foreignKey: 'empleadoId' });

module.exports = RegistroHorarios;
