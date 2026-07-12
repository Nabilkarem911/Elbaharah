'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fish_inventory', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      fish_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'fish_types', key: 'id' },
      },
      month_year: { type: Sequelize.DATEONLY, allowNull: false },
      avg_price_per_kilo: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      price_per_kilo: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      opening_balance_kg: { type: Sequelize.DECIMAL(10, 3), defaultValue: 0 },
      opening_balance_cost: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      opening_balance_value: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      incoming_fish_value: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      total_month_cost: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      total_incoming_kg: { type: Sequelize.DECIMAL(10, 3), defaultValue: 0 },
      incoming_fish_kg: { type: Sequelize.DECIMAL(10, 3), defaultValue: 0 },
      waste_kg: { type: Sequelize.DECIMAL(10, 3), defaultValue: 0 },
      waste_cost: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      closing_balance_kg: { type: Sequelize.DECIMAL(10, 3), defaultValue: 0 },
      closing_balance_cost: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      cogs: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      incoming_quantity: { type: Sequelize.DECIMAL(10, 3), defaultValue: 0 },
      purchase_price: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      balance_match: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('fish_inventory');
  },
};
