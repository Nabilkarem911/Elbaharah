const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailySale = sequelize.define('DailySale', {
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
  day_name: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  total_sales: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  other_sales: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  credit_sales: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  cash_box: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  app_elbharah: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  hunger_station: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  keta: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  toyo: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  mada: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  visa: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  mastercard: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  bank_transfer: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  net_sales: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  recorded_sales: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  surplus_deficit: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  network_sales: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  delivery_sales: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  delivery_orders_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'daily_sales',
  hooks: {
    beforeSave: (sale) => {
      sale.net_sales =
        parseFloat(sale.cash_box || 0) +
        parseFloat(sale.app_elbharah || 0) +
        parseFloat(sale.hunger_station || 0) +
        parseFloat(sale.keta || 0) +
        parseFloat(sale.toyo || 0) +
        parseFloat(sale.mada || 0) +
        parseFloat(sale.visa || 0) +
        parseFloat(sale.mastercard || 0) +
        parseFloat(sale.bank_transfer || 0);
      sale.surplus_deficit = parseFloat(sale.net_sales) - parseFloat(sale.total_sales || 0);
      sale.network_sales =
        parseFloat(sale.mada || 0) +
        parseFloat(sale.visa || 0) +
        parseFloat(sale.mastercard || 0) +
        parseFloat(sale.bank_transfer || 0);
      if (!sale.day_name && sale.sale_date) {
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const d = new Date(sale.sale_date);
        sale.day_name = days[d.getDay()];
      }
    },
  },
});

module.exports = DailySale;
