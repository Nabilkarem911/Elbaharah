'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('credit_sales', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      credit_account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'credit_accounts', key: 'id' },
      },
      sale_date: { type: Sequelize.DATEONLY, allowNull: false },
      due_date: { type: Sequelize.DATEONLY, allowNull: true },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      is_paid: { type: Sequelize.BOOLEAN, defaultValue: false },
      paid_date: { type: Sequelize.DATEONLY, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('credit_sales');
  },
};
