const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CancelledInvoice = sequelize.define('CancelledInvoice', {
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
  invoice_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  invoice_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  returned_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  responsible_person: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'cancelled_invoices',
});

module.exports = CancelledInvoice;
