'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('other_sales', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      sale_date: { type: Sequelize.DATEONLY, allowNull: false },
      item_name: { type: Sequelize.STRING(100), allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      quantity: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('other_sales');
  },
};
