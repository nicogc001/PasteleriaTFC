const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Usuario = require('./Usuario'); // Relación con empleados

const RegistroHorario = db.define('RegistroHorario', {
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
    tableName: 'RegistroHorario',
    timestamps: false
});

// Relaciones
Usuario.hasMany(RegistroHorario, { foreignKey: 'empleadoId', onDelete: 'CASCADE' });
RegistroHorario.belongsTo(Usuario, { foreignKey: 'empleadoId' });

module.exports = RegistroHorario;
