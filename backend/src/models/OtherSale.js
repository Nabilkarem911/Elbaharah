const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OtherSale = sequelize.define('OtherSale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
      sale.total = parseFloat(sale.unit_price) * parseFloat(sale.quantity);
    },
  },
});

module.exports = OtherSale;
