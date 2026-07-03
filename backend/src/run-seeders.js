require('dotenv').config();

const { sequelize } = require('./models');
const { User, Supplier, FishType, ExpenseCategory, PosMachine, SaleChannel, DeliveryPlatform, Setting } = require('./models');

const seeders = [
  {
    name: '01-admin',
    clean: async () => { await User.destroy({ where: { username: ['admin', 'manager'] } }); },
    up: require('./seeders/01-admin.seeder'),
  },
  {
    name: '02-suppliers',
    clean: async () => { await Supplier.destroy({ where: {}, truncate: true, cascade: false }); },
    up: require('./seeders/02-suppliers.seeder'),
  },
  {
    name: '03-fishTypes',
    clean: async () => { await FishType.destroy({ where: {}, truncate: true, cascade: false }); },
    up: require('./seeders/03-fishTypes.seeder'),
  },
  {
    name: '04-expenseCategories',
    clean: async () => { await ExpenseCategory.destroy({ where: {}, truncate: true, cascade: false }); },
    up: require('./seeders/04-expenseCategories.seeder'),
  },
  {
    name: '05-system',
    clean: async () => {
      await Promise.all([
        PosMachine.destroy({ where: {}, truncate: true, cascade: false }),
        SaleChannel.destroy({ where: {}, truncate: true, cascade: false }),
        DeliveryPlatform.destroy({ where: {}, truncate: true, cascade: false }),
        Setting.destroy({ where: {}, truncate: true, cascade: false }),
      ]);
    },
    up: require('./seeders/05-system.seeder'),
  },
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
      console.log(`🧹 Cleaning: ${seeder.name}...`);
      await seeder.clean();
      console.log(`🌱 Running seeder: ${seeder.name}...`);
      await seeder.up();
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
