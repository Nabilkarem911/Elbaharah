const { FishType } = require('../models');

module.exports = {
  up: async () => {
    const fishTypes = [
      { name: 'شعور', name_en: 'Shaor', is_active: true },
      { name: 'شريفي', name_en: 'Shareefi', is_active: true },
      { name: 'وريق', name_en: 'Wariq', is_active: true },
      { name: 'قمر', name_en: 'Qamar', is_active: true },
      { name: 'هامور', name_en: 'Hamour', is_active: true },
      { name: 'ناجل', name_en: 'Najil', is_active: true },
      { name: 'ترباني', name_en: 'Tarbani', is_active: true },
      { name: 'فرهودي', name_en: 'Farhoodi', is_active: true },
      { name: 'خضاري', name_en: 'Khadari', is_active: true },
      { name: 'صيادية فارس', name_en: 'Sayadiyah Fares', is_active: true },
      { name: 'سيجان', name_en: 'Sejan', is_active: true },
      { name: 'خرمي', name_en: 'Kharimi', is_active: true },
      { name: 'أبو عين', name_en: 'Abu Ain', is_active: true },
      { name: 'نجار', name_en: 'Najjar', is_active: true },
      { name: 'بغاة', name_en: 'Baghah', is_active: true },
      { name: 'كنعد', name_en: 'Kanad', is_active: true },
      { name: 'عمار', name_en: 'Ammar', is_active: true },
      { name: 'صقور', name_en: 'Saqoor', is_active: true },
      { name: 'زبيدي', name_en: 'Zubaidi', is_active: true },
    ];
    await FishType.bulkCreate(fishTypes);
  },
  down: async () => {
    await FishType.destroy({ where: {}, truncate: true });
  },
};
