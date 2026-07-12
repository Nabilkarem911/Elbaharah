'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('delivery_orders', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      daily_sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'daily_sales', key: 'id' },
      },
      delivery_platform_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'delivery_platforms', key: 'id' },
      },
      order_number: { type: Sequelize.STRING(50), allowNull: true },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      order_date: { type: Sequelize.DATEONLY, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('delivery_orders');
  },
};
