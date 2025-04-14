// models/OfertasCliente.js
module.exports = (sequelize, DataTypes) => {
    const OfertasCliente = sequelize.define('OfertasCliente', {
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
  
    return OfertasCliente;
  };
  