'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [cols] = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='permissions'`
    );
    if (cols.length === 0) {
      await queryInterface.addColumn('users', 'permissions', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'permissions');
  },
};
