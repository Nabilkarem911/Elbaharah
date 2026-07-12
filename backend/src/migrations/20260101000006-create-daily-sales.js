'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('daily_sales', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      sale_date: { type: Sequelize.DATEONLY, allowNull: false, unique: true },
      day_name: { type: Sequelize.STRING(10), allowNull: true },
      total_sales: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      other_sales: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      credit_sales: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      cash_box: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      app_elbharah: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      hunger_station: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      keta: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      toyo: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      mada: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      visa: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      mastercard: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      bank_transfer: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      net_sales: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      recorded_sales: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      surplus_deficit: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      network_sales: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      delivery_sales: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      delivery_orders_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('daily_sales');
  },
};
