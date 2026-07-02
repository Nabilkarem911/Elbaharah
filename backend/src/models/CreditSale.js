const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CreditSale = sequelize.define('CreditSale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  credit_account_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'credit_accounts', key: 'id' },
  },
  sale_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  is_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paid_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'credit_sales',
});

module.exports = CreditSale;
