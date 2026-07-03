const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseItem = sequelize.define('PurchaseItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  purchase_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'purchases', key: 'id' },
    onDelete: 'CASCADE',
  },
  fish_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'fish_types', key: 'id' },
  },
  weight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    validate: { min: 0 },
  },
  price_per_kilo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  total_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  is_damaged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  damaged_weight: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'purchase_items',
});

module.exports = PurchaseItem;
