require('dotenv').config();

module.exports = {
  database: process.env.DB_NAME || 'elbharah',
  username: process.env.DB_USER || 'elbharah',
  password: process.env.DB_PASSWORD || 'elbharah_dev_2026',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
};
