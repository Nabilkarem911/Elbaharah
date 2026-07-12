'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('organizations', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      activity_type: {
        type: Sequelize.ENUM('fish_restaurant', 'restaurant', 'honey_shop', 'retail', 'bakery', 'custom'),
        allowNull: false,
        defaultValue: 'custom',
      },
      logo_url: { type: Sequelize.STRING(255), allowNull: true },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      currency: { type: Sequelize.STRING(10), defaultValue: 'SAR' },
      tax_rate: { type: Sequelize.DECIMAL(5, 2), defaultValue: 15.00 },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      labels: { type: Sequelize.JSON, defaultValue: {} },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('organizations');
  },
};
