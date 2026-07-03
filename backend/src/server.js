require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { sequelize, User } = require('./models');
const errorHandler = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const apiRoutes = require('./routes/api.routes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/routes', (req, res) => {
  const routes = [];
  function walk(stack, prefix) {
    if (!prefix) prefix = '';
    for (const layer of stack) {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
        routes.push(methods.join(',') + ' ' + prefix + layer.route.path);
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        let p = prefix;
        if (layer.path) p = prefix + layer.path;
        walk(layer.handle.stack, p);
      }
    }
  }
  walk(app._router.stack);
  res.json({ routes });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');

    const userCount = await User.count();
    if (userCount === 0) {
      console.log('🌱 No users found, running seeders...');
      const seeders = [
        require('./seeders/01-admin.seeder'),
        require('./seeders/02-suppliers.seeder'),
        require('./seeders/03-fishTypes.seeder'),
        require('./seeders/04-expenseCategories.seeder'),
        require('./seeders/05-system.seeder'),
      ];
      for (const seeder of seeders) {
        await seeder.up();
      }
      console.log('✅ Seeders completed');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Login: admin / admin123');
      console.log('Login: manager / manager123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('✅ Users already exist, skipping seeders');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
};

start();
