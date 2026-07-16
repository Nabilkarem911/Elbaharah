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
    afterCreate: async (sale) => {
      const { CreditAccount } = require('../models');
      const account = await CreditAccount.findByPk(sale.credit_account_id);
      if (account) {
        account.total_balance = parseFloat(account.total_balance) + parseFloat(sale.amount);
        await account.save();
      }
    },
    afterUpdate: async (sale) => {
      if (sale.changed('amount') || sale.changed('credit_account_id')) {
        const { CreditAccount } = require('../models');
        if (sale.previous('credit_account_id') === sale.credit_account_id) {
          const account = await CreditAccount.findByPk(sale.credit_account_id);
          if (account) {
            const diff = parseFloat(sale.amount) - parseFloat(sale.previous('amount'));
            account.total_balance = parseFloat(account.total_balance) + diff;
            await account.save();
          }
        } else {
          const oldAcc = await CreditAccount.findByPk(sale.previous('credit_account_id'));
          if (oldAcc) {
            oldAcc.total_balance = parseFloat(oldAcc.total_balance) - parseFloat(sale.previous('amount'));
            await oldAcc.save();
          }
          const newAcc = await CreditAccount.findByPk(sale.credit_account_id);
          if (newAcc) {
            newAcc.total_balance = parseFloat(newAcc.total_balance) + parseFloat(sale.amount);
            await newAcc.save();
          }
        }
      }
    },
    afterDestroy: async (sale) => {
      const { CreditAccount } = require('../models');
      const account = await CreditAccount.findByPk(sale.credit_account_id);
      if (account) {
        account.total_balance = parseFloat(account.total_balance) - parseFloat(sale.amount);
        await account.save();
      }
    },
  },
});

module.exports = CreditSale;
