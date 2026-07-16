'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. fish_types: drop single-column unique on name, add composite (name, organization_id)
    try {
      await queryInterface.removeConstraint('fish_types', 'fish_types_name_key40');
    } catch (e) {
      // Constraint name might differ, try generic
      try {
        await queryInterface.removeConstraint('fish_types', 'fish_types_name_key');
      } catch (e2) {
        // If neither exists, skip
      }
    }
    await queryInterface.addIndex('fish_types', ['name', 'organization_id'], {
      unique: true,
      name: 'fish_types_name_org_unique',
    });

    // 2. suppliers: drop single-column unique on code, add composite (code, organization_id)
    try {
      await queryInterface.removeConstraint('suppliers', 'suppliers_code_key');
    } catch (e) {
      // skip if doesn't exist
    }
    await queryInterface.addIndex('suppliers', ['code', 'organization_id'], {
      unique: true,
      name: 'suppliers_code_org_unique',
    });

    // 3. daily_sales: drop single-column unique on sale_date, add composite (sale_date, organization_id)
    try {
      await queryInterface.removeConstraint('daily_sales', 'daily_sales_sale_date_key');
    } catch (e) {
      // skip if doesn't exist
    }
    await queryInterface.addIndex('daily_sales', ['sale_date', 'organization_id'], {
      unique: true,
      name: 'daily_sales_date_org_unique',
    });

    // 4. purchases: drop single-column unique on invoice_number, add composite (invoice_number, organization_id)
    try {
      await queryInterface.removeConstraint('purchases', 'purchases_invoice_number_key');
    } catch (e) {
      // skip if doesn't exist
    }
    await queryInterface.addIndex('purchases', ['invoice_number', 'organization_id'], {
      unique: true,
      name: 'purchases_invoice_org_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert to single-column unique constraints
    try { await queryInterface.removeIndex('fish_types', 'fish_types_name_org_unique'); } catch (e) {}
    await queryInterface.addConstraint('fish_types', { fields: ['name'], type: 'unique', name: 'fish_types_name_key40' });

    try { await queryInterface.removeIndex('suppliers', 'suppliers_code_org_unique'); } catch (e) {}
    await queryInterface.addConstraint('suppliers', { fields: ['code'], type: 'unique', name: 'suppliers_code_key' });

    try { await queryInterface.removeIndex('daily_sales', 'daily_sales_date_org_unique'); } catch (e) {}
    await queryInterface.addConstraint('daily_sales', { fields: ['sale_date'], type: 'unique', name: 'daily_sales_sale_date_key' });

    try { await queryInterface.removeIndex('purchases', 'purchases_invoice_org_unique'); } catch (e) {}
    await queryInterface.addConstraint('purchases', { fields: ['invoice_number'], type: 'unique', name: 'purchases_invoice_number_key' });
  },
};
