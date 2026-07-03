require('dotenv').config();

const { sequelize } = require('./models');

const seeders = [
  {
    name: '01-admin',
    run: require('./seeders/01-admin.seeder'),
  },
  {
    name: '02-suppliers',
    run: require('./seeders/02-suppliers.seeder'),
  },
  {
    name: '03-fishTypes',
    run: require('./seeders/03-fishTypes.seeder'),
  },
  {
    name: '04-expenseCategories',
    run: require('./seeders/04-expenseCategories.seeder'),
  },
  {
    name: '05-system',
    run: require('./seeders/05-system.seeder'),
  },
];

const runSeeds = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('📦 Recreating all tables (force)...');
    await sequelize.sync({ force: true });
    console.log('✅ Models synced');

    for (const seeder of seeders) {
      console.log(`🌱 Running seeder: ${seeder.name}...`);
      await seeder.run.up();
      console.log(`✅ ${seeder.name} done`);
    }

    console.log('\n🎉 All seeders completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Login: admin / admin123');
    console.log('Login: manager / manager123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    if (err.errors) {
      err.errors.forEach(e => console.error(`   - ${e.path}: ${e.message}`));
    }
    process.exit(1);
  }
};

runSeeds();
