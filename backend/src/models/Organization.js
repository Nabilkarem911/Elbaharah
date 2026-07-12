const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  activity_type: {
    type: DataTypes.ENUM('fish_restaurant', 'restaurant', 'honey_shop', 'retail', 'bakery', 'custom'),
    allowNull: false,
    defaultValue: 'custom',
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
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'SAR',
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 15.00,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  labels: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'organizations',
});

module.exports = Organization;
