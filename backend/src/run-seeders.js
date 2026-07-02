require('dotenv').config();

const { sequelize } = require('./models');

const seeders = [
  require('./seeders/01-admin.seeder'),
  require('./seeders/02-suppliers.seeder'),
  require('./seeders/03-fishTypes.seeder'),
  require('./seeders/04-expenseCategories.seeder'),
  require('./seeders/05-system.seeder'),
];

const runSeeds = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('📦 Syncing models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');

    for (const seeder of seeders) {
      console.log(`🌱 Running seeder: ${seeder.up.name || 'seeder'}...`);
      await seeder.up();
      console.log('✅ Done');
    }

    console.log('\n🎉 All seeders completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Login: admin / admin123');
    console.log('Login: manager / manager123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

runSeeds();
