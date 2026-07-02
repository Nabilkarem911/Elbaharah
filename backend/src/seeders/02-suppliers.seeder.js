const { Supplier } = require('../models');

module.exports = {
  up: async () => {
    const suppliers = [
      { code: 'S01', name: 'بن وازن', phone: '', balance: 0, is_active: true },
      { code: 'S02', name: 'عاشور', phone: '', balance: 0, is_active: true },
      { code: 'S03', name: 'جازان', phone: '', balance: 0, is_active: true },
      { code: 'S04', name: 'طلال', phone: '', balance: 0, is_active: true },
      { code: 'S05', name: 'عبدالله ثويمر', phone: '', balance: 0, is_active: true },
      { code: 'S06', name: 'جدة', phone: '', balance: 0, is_active: true },
      { code: 'S07', name: 'عبدالمنعم', phone: '', balance: 0, is_active: true },
      { code: 'S08', name: 'حمدان', phone: '', balance: 0, is_active: true },
      { code: 'S09', name: 'عميد البحارة', phone: '', balance: 0, is_active: true },
      { code: 'S10', name: 'عطيوي الرفاعي', phone: '', balance: 0, is_active: true },
      { code: 'S11', name: 'مستورة', phone: '', balance: 0, is_active: true },
      { code: 'S12', name: 'البنقلة', phone: '', balance: 0, is_active: true },
      { code: 'S13', name: 'الشريف', phone: '', balance: 0, is_active: true },
      { code: 'S14', name: 'البرك', phone: '', balance: 0, is_active: true },
      { code: 'S15', name: 'رامي - مستورة', phone: '', balance: 0, is_active: true },
      { code: 'S16', name: 'معاذ الجباري', phone: '', balance: 0, is_active: true },
    ];
    await Supplier.bulkCreate(suppliers);
  },
  down: async () => {
    await Supplier.destroy({ where: {}, truncate: true });
  },
};
