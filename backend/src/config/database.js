const { Sequelize } = require('sequelize');
const pg = require('pg');
require('dotenv').config();

const dbConfig = {
  database: process.env.DB_NAME || 'elbharah',
  username: process.env.DB_USER || 'elbharah',
  password: process.env.DB_PASSWORD || 'elbharah_dev_2026',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  dialectModule: pg,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

module.exports = sequelize;
module.exports.config = dbConfig;
