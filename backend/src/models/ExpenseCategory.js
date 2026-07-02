const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExpenseCategory = sequelize.define('ExpenseCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'expense_categories',
});

module.exports = ExpenseCategory;
