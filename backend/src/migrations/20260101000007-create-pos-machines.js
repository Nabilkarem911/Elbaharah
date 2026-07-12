'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pos_machines', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      machine_number: { type: Sequelize.STRING(50), allowNull: false },
      terminal_id: { type: Sequelize.STRING(50), allowNull: true },
      bank: { type: Sequelize.STRING(100), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('pos_machines');
  },
};
