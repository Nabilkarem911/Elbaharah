'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('purchases', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      invoice_number: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'suppliers', key: 'id' },
      },
      purchase_date: { type: Sequelize.DATEONLY, allowNull: false },
      total_weight: { type: Sequelize.DECIMAL(10, 3), defaultValue: 0 },
      total_amount: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      payment_method: {
        type: Sequelize.ENUM('cash', 'credit', 'transfer'),
        defaultValue: 'cash',
      },
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
    await queryInterface.dropTable('purchases');
  },
};
