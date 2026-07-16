const sequelize = require('./src/models').sequelize;

(async () => {
  try {
    const qi = sequelize.getQueryInterface();
    const Sequelize = sequelize.Sequelize;

    console.log('Running migration 1: add-org-id-to-child-tables');
    const m1 = require('./src/migrations/20260716000001-add-org-id-to-child-tables');
    await m1.up(qi, Sequelize);
    console.log('Migration 1 done');

    console.log('Running migration 2: fix-unique-constraints');
    const m2 = require('./src/migrations/20260716000002-fix-unique-constraints-for-multi-tenancy');
    await m2.up(qi, Sequelize);
    console.log('Migration 2 done');

    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
})();
