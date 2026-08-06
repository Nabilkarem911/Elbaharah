'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [cols] = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='enabled_pages'`
    );
    if (cols.length === 0) {
      await queryInterface.addColumn('organizations', 'enabled_pages', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('organizations', 'enabled_pages');
  },
};
