const path = require('path');
const Umzug = require('umzug');
const sequelize = require('./database');

const umzug = new Umzug({
  migrations: {
    path: path.resolve(__dirname, '..', 'migrations'),
    params: [
      sequelize.getQueryInterface(),
      sequelize.constructor,
    ],
  },
  storage: 'sequelize',
  storageOptions: { sequelize },
  logger: console,
});

async function runMigrations() {
  const pending = await umzug.pending();
  if (pending.length === 0) {
    console.log('✅ No pending migrations');
    return;
  }
  console.log(`📋 Running ${pending.length} pending migration(s)...`);
  await umzug.up();
  console.log('✅ All migrations completed');
}

module.exports = { runMigrations, umzug };
