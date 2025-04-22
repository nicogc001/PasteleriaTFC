// models/Mensaje.js
module.exports = (sequelize, DataTypes) => {
    const Mensaje = sequelize.define('Mensaje', {
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      de: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      para: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contenido: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      leido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'Mensajes',
      timestamps: false
    });
  
    Mensaje.associate = (models) => {
      Mensaje.belongsTo(models.Chat, { foreignKey: 'chatId', as: 'chat' });
    };
  
    return Mensaje;
  };