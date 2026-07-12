const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CreditAccount = sequelize.define('CreditAccount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  company_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  total_balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
}, {
  tableName: 'credit_accounts',
});

module.exports = CreditAccount;
