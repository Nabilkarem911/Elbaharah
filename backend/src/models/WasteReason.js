const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WasteReason = sequelize.define('WasteReason', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'waste_reasons',
});

module.exports = WasteReason;
