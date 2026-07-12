'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('daily_sale_channels', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      daily_sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'daily_sales', key: 'id' },
        onDelete: 'CASCADE',
      },
      sale_channel_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sale_channels', key: 'id' },
      },
      amount: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('daily_sale_channels');
  },
};
