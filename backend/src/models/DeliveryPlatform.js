const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryPlatform = sequelize.define('DeliveryPlatform', {
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
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { notEmpty: true },
  },
  key: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'delivery_platforms',
});

module.exports = DeliveryPlatform;
