const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CreditSale = sequelize.define('CreditSale', {
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
  hooks: {
    afterCreate: async (sale, options) => {
      const { CreditAccount } = require('../models');
      const t = options.transaction;
      await CreditAccount.increment('total_balance', {
        by: parseFloat(sale.amount),
        where: { id: sale.credit_account_id },
        transaction: t,
      });
    },
    afterUpdate: async (sale, options) => {
      if (sale.changed('amount') || sale.changed('credit_account_id')) {
        const { CreditAccount } = require('../models');
        const t = options.transaction;
        if (sale.previous('credit_account_id') === sale.credit_account_id) {
          const diff = parseFloat(sale.amount) - parseFloat(sale.previous('amount'));
          await CreditAccount.increment('total_balance', {
            by: diff,
            where: { id: sale.credit_account_id },
            transaction: t,
          });
        } else {
          await CreditAccount.increment('total_balance', {
            by: -parseFloat(sale.previous('amount')),
            where: { id: sale.previous('credit_account_id') },
            transaction: t,
          });
          await CreditAccount.increment('total_balance', {
            by: parseFloat(sale.amount),
            where: { id: sale.credit_account_id },
            transaction: t,
          });
        }
      }
    },
    afterDestroy: async (sale, options) => {
      const { CreditAccount } = require('../models');
      const t = options.transaction;
      await CreditAccount.increment('total_balance', {
        by: -parseFloat(sale.amount),
        where: { id: sale.credit_account_id },
        transaction: t,
      });
    },
  },
});

module.exports = CreditSale;
