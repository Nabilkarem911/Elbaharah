const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FishWaste = sequelize.define('FishWaste', {
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
  fish_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'fish_types', key: 'id' },
  },
  waste_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  weight: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    validate: { min: 0 },
  },
  cost_per_kilo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  total_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'fish_waste',
  hooks: {
    beforeSave: (w) => {
      w.total_cost = parseFloat(w.weight) * parseFloat(w.cost_per_kilo);
    },
  },
});

module.exports = FishWaste;
