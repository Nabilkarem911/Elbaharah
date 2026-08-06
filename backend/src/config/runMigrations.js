const path = require('path');
const fs = require('fs');
const sequelize = require('./database');

async function columnExists(tableName, columnName) {
  const [rows] = await sequelize.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = :table AND column_name = :column`,
    { replacements: { table: tableName, column: columnName } }
  );
  return rows.length > 0;
}

async function tableExists(tableName) {
  const [rows] = await sequelize.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = :table`,
    { replacements: { table: tableName } }
  );
  return rows.length > 0;
}

async function seedSequelizeMeta() {
  const hasMeta = await tableExists('SequelizeMeta');
  if (hasMeta) return;

  const migrationsDir = path.resolve(__dirname, '..', 'migrations');
  const allFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js')).sort();

  const newMigrations = [
    '20260101000024-add-enabled-pages-to-organizations.js',
    '20260101000025-add-permissions-to-users.js',
  ];

  const existingFiles = allFiles.filter(f => !newMigrations.includes(f));

  await sequelize.query('CREATE TABLE "SequelizeMeta" ("name" VARCHAR PRIMARY KEY)');
  for (const file of existingFiles) {
    await sequelize.query('INSERT INTO "SequelizeMeta" ("name") VALUES (:name)', {
      replacements: { name: file },
    });
  }
  console.log(`✅ Seeded SequelizeMeta with ${existingFiles.length} existing migrations (${newMigrations.length} pending)`);
}

async function runMigrations() {
  await seedSequelizeMeta();

  const migrationsDir = path.resolve(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js')).sort();

  const [executed] = await sequelize.query('SELECT name FROM "SequelizeMeta"');
  const executedNames = new Set(executed.map(r => r.name));

  const pending = files.filter(f => !executedNames.has(f));

  if (pending.length === 0) {
    console.log('✅ No pending migrations');
    return;
  }

  console.log(`📋 Running ${pending.length} pending migration(s)...`);

  for (const file of pending) {
    const migration = require(path.join(migrationsDir, file));
    try {
      await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
      await sequelize.query('INSERT INTO "SequelizeMeta" ("name") VALUES (:name)', {
        replacements: { name: file },
      });
      console.log(`  ✅ ${file}`);
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
      throw err;
    }
  }
  console.log('✅ All migrations completed');
}

module.exports = { runMigrations };
