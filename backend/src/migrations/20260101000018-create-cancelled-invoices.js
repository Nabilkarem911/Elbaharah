'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cancelled_invoices', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      invoice_date: { type: Sequelize.DATEONLY, allowNull: false },
      invoice_number: { type: Sequelize.STRING(50), allowNull: false },
      invoice_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      returned_amount: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      responsible_person: { type: Sequelize.STRING(100), allowNull: true },
      reason: { type: Sequelize.TEXT, allowNull: true },
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
    await queryInterface.dropTable('cancelled_invoices');
  },
};
