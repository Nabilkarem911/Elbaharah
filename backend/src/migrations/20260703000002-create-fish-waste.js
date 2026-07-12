'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fish_waste', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      fish_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'fish_types', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      waste_date: { type: Sequelize.DATEONLY, allowNull: false },
      weight: { type: Sequelize.DECIMAL(10, 3), allowNull: false },
      cost_per_kilo: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      total_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      reason: { type: Sequelize.STRING(255), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('fish_waste');
  },
};
