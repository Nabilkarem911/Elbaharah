const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PosTransaction = sequelize.define('PosTransaction', {
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
  pos_machine_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'pos_machines', key: 'id' },
  },
  daily_sale_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'daily_sales', key: 'id' },
  },
  transaction_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  card_type: {
    type: DataTypes.ENUM('mada', 'visa', 'visa_plus', 'mastercard', 'mastercard_plus'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  fee_percentage: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0,
  },
  amount_after_fee: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
}, {
  tableName: 'pos_transactions',
  hooks: {
    beforeSave: (tx) => {
      const amount = Number(tx.amount) || 0;
      const fee = Number(tx.fee_percentage) || 0;
      tx.amount_after_fee = amount * (1 - fee / 100);
    },
  },
});

module.exports = PosTransaction;
