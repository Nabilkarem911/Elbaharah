'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('purchase_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      purchase_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'purchases', key: 'id' },
        onDelete: 'CASCADE',
      },
      fish_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'fish_types', key: 'id' },
      },
      weight: { type: Sequelize.DECIMAL(10, 3), allowNull: false },
      price_per_kilo: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      is_damaged: { type: Sequelize.BOOLEAN, defaultValue: false },
      damaged_weight: { type: Sequelize.DECIMAL(10, 3), defaultValue: 0 },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('purchase_items');
  },
};
