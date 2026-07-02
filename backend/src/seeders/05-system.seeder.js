const { PosMachine, SaleChannel, DeliveryPlatform, Setting } = require('../models');

module.exports = {
  up: async () => {
    // POS Machines
    await PosMachine.bulkCreate([
      { machine_number: 1, terminal_id: '1556888604081089', bank: 'البنك الأهلي', is_active: true },
      { machine_number: 2, terminal_id: '1556962604081090', bank: 'بنك الراجحي', is_active: true },
      { machine_number: 3, terminal_id: '1556992204081091', bank: 'بنك الرياض', is_active: true },
    ]);

    // Sale Channels
    await SaleChannel.bulkCreate([
      { key: 'cash_box', name: 'الصندوق', type: 'cash', icon: 'wallet', is_active: true },
      { key: 'app_elbharah', name: 'تطبيق البحارة', type: 'app', icon: 'fish', is_active: true },
      { key: 'hunger_station', name: 'هنقر ستيشن', type: 'app', icon: 'utensils', is_active: true },
      { key: 'keta', name: 'كيتا', type: 'app', icon: 'shopping-bag', is_active: true },
      { key: 'toyo', name: 'تويو', type: 'app', icon: 'truck', is_active: true },
      { key: 'mada', name: 'مدى', type: 'pos', icon: 'credit-card', is_active: true },
      { key: 'visa', name: 'فيزا', type: 'pos', icon: 'credit-card', is_active: true },
      { key: 'mastercard', name: 'ماستر كارد', type: 'pos', icon: 'credit-card', is_active: true },
    ]);

    // Delivery Platforms
    await DeliveryPlatform.bulkCreate([
      { name: 'تطبيق البحارة', key: 'app_elbharah', icon: 'fish', is_active: true },
      { name: 'هنقر ستيشن', key: 'hunger_station', icon: 'utensils', is_active: true },
      { name: 'كيتا', key: 'keta', icon: 'shopping-bag', is_active: true },
      { name: 'تويو', key: 'toyo', icon: 'truck', is_active: true },
    ]);

    // Settings
    await Setting.create({
      restaurant_name: 'بيت الأسماك',
      tax_rate: 15.00,
      currency: 'SAR',
      phone: '',
      address: '',
    });
  },
  down: async () => {
    await Promise.all([
      PosMachine.destroy({ where: {}, truncate: true }),
      SaleChannel.destroy({ where: {}, truncate: true }),
      DeliveryPlatform.destroy({ where: {}, truncate: true }),
      Setting.destroy({ where: {}, truncate: true }),
    ]);
  },
};
