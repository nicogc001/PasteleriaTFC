'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Pedidos', 'direccionId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Direccion', // O 'Direcciones' si así se llama tu tabla real
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Pedidos', 'direccionId');
  }
};
