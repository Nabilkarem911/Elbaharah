'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add organization_id to child tables that are missing it
    const tables = [
      'credit_sales',
      'delivery_orders',
      'pos_transactions',
      'daily_sale_channels',
      'purchase_items',
    ];

    for (const table of tables) {
      const tableDesc = await queryInterface.describeTable(table);
      if (!tableDesc.organization_id) {
        await queryInterface.addColumn(table, 'organization_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'organizations', key: 'id' },
        });
      }
    }

    // Backfill organization_id from parent tables
    await queryInterface.sequelize.query(`
      UPDATE credit_sales cs
      SET organization_id = (SELECT organization_id FROM credit_accounts ca WHERE ca.id = cs.credit_account_id)
      WHERE cs.organization_id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE delivery_orders dor
      SET organization_id = (SELECT organization_id FROM daily_sales ds WHERE ds.id = dor.daily_sale_id)
      WHERE dor.organization_id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE pos_transactions pt
      SET organization_id = COALESCE(
        (SELECT organization_id FROM daily_sales ds WHERE ds.id = pt.daily_sale_id),
        (SELECT organization_id FROM pos_machines pm WHERE pm.id = pt.pos_machine_id)
      )
      WHERE pt.organization_id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE daily_sale_channels dsc
      SET organization_id = (SELECT organization_id FROM daily_sales ds WHERE ds.id = dsc.daily_sale_id)
      WHERE dsc.organization_id IS NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE purchase_items pi
      SET organization_id = (SELECT organization_id FROM purchases p WHERE p.id = pi.purchase_id)
      WHERE pi.organization_id IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'credit_sales',
      'delivery_orders',
      'pos_transactions',
      'daily_sale_channels',
      'purchase_items',
    ];

    for (const table of tables) {
      await queryInterface.removeColumn(table, 'organization_id');
    }
  },
};
