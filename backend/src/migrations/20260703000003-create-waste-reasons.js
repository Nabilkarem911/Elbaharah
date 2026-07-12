'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('waste_reasons', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.bulkInsert('waste_reasons', [
      { name: 'انتهاء الصلاحية', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'تلف', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'حرق', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'تساقط', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'جودة رديئة', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'خطأ في التجهيز', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'أخرى', is_active: true, created_at: new Date(), updated_at: new Date() },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('waste_reasons');
  },
};
