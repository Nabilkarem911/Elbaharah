const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseCustody = sequelize.define('PurchaseCustody', {
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
  type: {
    type: DataTypes.ENUM('feed', 'spend'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  transaction_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  balance_after: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'purchase_custody',
  hooks: {
    beforeCreate: async (record) => {
      const { Op } = require('sequelize');
      const last = await PurchaseCustody.findOne({
        where: {
          organization_id: record.organization_id || null,
          branch_id: record.branch_id || null,
        },
        order: [['id', 'DESC']],
      });
      const prevBalance = last ? parseFloat(last.balance_after) : 0;
      const amount = parseFloat(record.amount);
      record.balance_after = record.type === 'feed'
        ? prevBalance + amount
        : prevBalance - amount;
    },
  },
});

module.exports = PurchaseCustody;
