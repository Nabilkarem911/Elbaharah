const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production'
  ? null
  : 'elbharah_jwt_secret_key_2026_dev');

if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is required in production');
  process.exit(1);
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

module.exports = { JWT_SECRET, JWT_EXPIRES_IN };
