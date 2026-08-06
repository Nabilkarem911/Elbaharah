const sequelize = require('./database');

async function runMigrations() {
  const [cols] = await sequelize.query(
    `SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema = 'public'
     AND ((table_name = 'organizations' AND column_name = 'enabled_pages')
          OR (table_name = 'users' AND column_name = 'permissions'))`
  );

  const existing = new Set(cols.map(r => `${r.table_name}.${r.column_name}`));

  if (!existing.has('organizations.enabled_pages')) {
    await sequelize.query('ALTER TABLE "organizations" ADD COLUMN "enabled_pages" JSON');
    console.log('✅ Added enabled_pages to organizations');
  } else {
    console.log('✅ organizations.enabled_pages already exists');
  }

  if (!existing.has('users.permissions')) {
    await sequelize.query('ALTER TABLE "users" ADD COLUMN "permissions" JSON');
    console.log('✅ Added permissions to users');
  } else {
    console.log('✅ users.permissions already exists');
  }
}

module.exports = { runMigrations };
