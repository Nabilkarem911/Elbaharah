'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pos_transactions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      pos_machine_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'pos_machines', key: 'id' },
      },
      daily_sale_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'daily_sales', key: 'id' },
      },
      transaction_date: { type: Sequelize.DATEONLY, allowNull: false },
      card_type: { type: Sequelize.STRING(20), allowNull: false },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      fee_percentage: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
      amount_after_fee: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('pos_transactions');
  },
};
