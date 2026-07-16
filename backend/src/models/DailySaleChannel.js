const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailySaleChannel = sequelize.define('DailySaleChannel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  organization_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'organizations', key: 'id' },
  },
  daily_sale_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'daily_sales', key: 'id' },
    onDelete: 'CASCADE',
  },
  sale_channel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'sale_channels', key: 'id' },
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'daily_sale_channels',
});

module.exports = DailySaleChannel;
