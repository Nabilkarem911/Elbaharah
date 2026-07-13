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
const reportsRoutes = require('./routes/reports.routes');
const superAdminRoutes = require('./routes/superAdmin.routes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? null : '*');
app.use(cors({
  origin: corsOrigin === '*' ? true : (corsOrigin || false),
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

let dbReady = false;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: dbReady ? 'connected' : 'connecting', timestamp: new Date().toISOString() });
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
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', apiRoutes);
app.use('/api/reports', reportsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectWithRetry();
});

async function connectWithRetry(attempt = 1) {
  try {
    console.log(`🔄 DB connection attempt ${attempt}...`);
    await sequelize.authenticate();
    console.log('✅ Database connected');
    const syncOptions = { alter: true };
    await sequelize.sync(syncOptions);
    console.log('✅ Models synced');
    dbReady = true;

    const superAdmin = await User.findOne({ where: { role: 'super_admin' } });
    if (!superAdmin) {
      console.log('🌱 No super admin found, creating one...');
      await User.create({
        username: 'superadmin',
        password_hash: 'superadmin123',
        full_name: 'المدير العام',
        role: 'super_admin',
      });
      console.log('✅ Super admin created');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Login: superadmin / superadmin123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('✅ Super admin already exists');
    }
  } catch (err) {
    console.error(`❌ DB attempt ${attempt} failed: ${err.message}`);
    const delay = Math.min(attempt * 3000, 15000);
    console.log(`⏳ Retrying in ${delay / 1000}s...`);
    setTimeout(() => connectWithRetry(attempt + 1), delay);
  }
}
