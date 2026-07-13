const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CreditAccount = sequelize.define('CreditAccount', {
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
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'branches', key: 'id' },
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
