const { User } = require('../models');

module.exports = {
  up: async () => {
    await User.create({
      username: 'admin',
      password_hash: 'admin123',
      full_name: 'المدير العام',
      role: 'admin',
      is_active: true,
    });
    await User.create({
      username: 'manager',
      password_hash: 'manager123',
      full_name: 'المحاسب',
      role: 'manager',
      is_active: true,
    });
  },
  down: async () => {
    await User.destroy({ where: { username: ['admin', 'manager'] } });
  },
};
