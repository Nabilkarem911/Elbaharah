const sequelize = require('./database');

async function runMigrations() {
  const [cols] = await sequelize.query(
    `SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema = 'public'
     AND ((table_name = 'organizations' AND column_name IN ('enabled_pages', 'subscription_start', 'subscription_end'))
          OR (table_name = 'users' AND column_name = 'permissions'))`
  );

  const existing = new Set(cols.map(r => `${r.table_name}.${r.column_name}`));

  if (!existing.has('organizations.enabled_pages')) {
    await sequelize.query('ALTER TABLE "organizations" ADD COLUMN "enabled_pages" JSON');
    console.log('✅ Added enabled_pages to organizations');
  } else {
    console.log('✅ organizations.enabled_pages already exists');
  }

  if (!existing.has('organizations.subscription_start')) {
    await sequelize.query('ALTER TABLE "organizations" ADD COLUMN "subscription_start" DATE');
    console.log('✅ Added subscription_start to organizations');
  } else {
    console.log('✅ organizations.subscription_start already exists');
  }

  if (!existing.has('organizations.subscription_end')) {
    await sequelize.query('ALTER TABLE "organizations" ADD COLUMN "subscription_end" DATE');
    console.log('✅ Added subscription_end to organizations');
  } else {
    console.log('✅ organizations.subscription_end already exists');
  }

  if (!existing.has('users.permissions')) {
    await sequelize.query('ALTER TABLE "users" ADD COLUMN "permissions" JSON');
    console.log('✅ Added permissions to users');
  } else {
    console.log('✅ users.permissions already exists');
  }

  // Add 'simple' to activity_type enum if missing
  const [enumValues] = await sequelize.query(
    `SELECT unnest(enum_range(NULL::enum_organizations_activity_type))::text AS val`
  );
  const hasSimple = enumValues.some(v => v.val === 'simple');
  if (!hasSimple) {
    await sequelize.query(`ALTER TYPE "enum_organizations_activity_type" ADD VALUE IF NOT EXISTS 'simple'`);
    console.log('✅ Added simple to activity_type enum');
  } else {
    console.log('✅ activity_type enum already has simple');
  }
}

module.exports = { runMigrations };
