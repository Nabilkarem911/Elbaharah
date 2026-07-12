const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SaleChannel = sequelize.define('SaleChannel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  key: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { notEmpty: true },
  },
  type: {
    type: DataTypes.ENUM('cash', 'app', 'pos', 'delivery'),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'sale_channels',
});

module.exports = SaleChannel;
