const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
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
  restaurant_name: {
    type: DataTypes.STRING(100),
    defaultValue: 'بيت الأسماك',
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 15.00,
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'SAR',
  },
  logo_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'settings',
});

module.exports = Setting;
