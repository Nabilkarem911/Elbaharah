const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OtherSale = sequelize.define('OtherSale', {
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
  sale_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  item_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true },
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
}, {
  tableName: 'other_sales',
  hooks: {
    beforeSave: (sale) => {
      const unitPrice = Number(sale.unit_price) || 0;
      const quantity = Number(sale.quantity) || 0;
      sale.total = unitPrice * quantity;
    },
  },
});

module.exports = OtherSale;
