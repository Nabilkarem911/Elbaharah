const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PosMachine = sequelize.define('PosMachine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  organization_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'organizations', key: 'id' },
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'branches', key: 'id' },
  },
  machine_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  terminal_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  bank: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'pos_machines',
});

module.exports = PosMachine;
