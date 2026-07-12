'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('settings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      restaurant_name: { type: Sequelize.STRING(100), defaultValue: 'بيت الأسماك' },
      tax_rate: { type: Sequelize.DECIMAL(5, 2), defaultValue: 15.00 },
      currency: { type: Sequelize.STRING(10), defaultValue: 'SAR' },
      logo_url: { type: Sequelize.STRING(255), allowNull: true },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('settings');
  },
};
