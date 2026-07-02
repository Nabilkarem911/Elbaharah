const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FishInventory = sequelize.define('FishInventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fish_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'fish_types', key: 'id' },
  },
  month_year: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  avg_price_per_kilo: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  price_per_kilo: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  opening_balance_kg: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  opening_balance_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  opening_balance_value: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  incoming_fish_value: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total_month_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total_incoming_kg: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  incoming_fish_kg: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  waste_kg: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  waste_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  closing_balance_kg: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  closing_balance_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  cogs: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  incoming_quantity: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  purchase_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  balance_match: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'fish_inventory',
});

module.exports = FishInventory;
