const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FishType = sequelize.define('FishType', {
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
  code: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { notEmpty: true },
  },
  name_en: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'fish_types',
});

module.exports = FishType;
