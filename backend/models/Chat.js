// models/Chat.js
module.exports = (sequelize, DataTypes) => {
    const Chat = sequelize.define('Chat', {
      clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      empleadoId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      estado: {
        type: DataTypes.STRING,
        defaultValue: 'abierto'
      },
      creadoEn: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      actualizadoEn: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'Chats',
      timestamps: false
    });
  
    Chat.associate = (models) => {
      Chat.hasMany(models.Mensaje, { foreignKey: 'chatId', as: 'mensajes' });
      Chat.belongsTo(models.Usuario, { foreignKey: 'clienteId', as: 'cliente' });
      Chat.belongsTo(models.Usuario, { foreignKey: 'empleadoId', as: 'empleado' });
    };
  
    return Chat;
  };