'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('credit_accounts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      company_name: { type: Sequelize.STRING(100), allowNull: false },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      total_balance: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('credit_accounts');
  },
};
