const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryOrder = sequelize.define('DeliveryOrder', {
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
  daily_sale_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'daily_sales', key: 'id' },
  },
  delivery_platform_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'delivery_platforms', key: 'id' },
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'delivery_orders',
});

module.exports = DeliveryOrder;
