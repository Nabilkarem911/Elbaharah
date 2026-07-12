'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('expenses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'expense_categories', key: 'id' },
      },
      expense_date: { type: Sequelize.DATEONLY, allowNull: false },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      payment_method: {
        type: Sequelize.ENUM('cash', 'credit', 'transfer'),
        defaultValue: 'cash',
      },
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
    await queryInterface.dropTable('expenses');
  },
};
