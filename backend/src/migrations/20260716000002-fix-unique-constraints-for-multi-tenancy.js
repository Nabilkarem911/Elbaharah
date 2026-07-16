'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const indexExists = async (tableName, indexName) => {
      const indexes = await queryInterface.showIndex(tableName);
      return indexes.some(idx => idx.name === indexName);
    };

    const constraintExists = async (tableName, constraintName) => {
      const [results] = await queryInterface.sequelize.query(
        `SELECT conname FROM pg_constraint WHERE conname = '${constraintName}'`
      );
      return results.length > 0;
    };

    // 1. fish_types
    for (const cname of ['fish_types_name_key40', 'fish_types_name_key']) {
      if (await constraintExists('fish_types', cname)) {
        await queryInterface.removeConstraint('fish_types', cname);
        console.log(`Dropped constraint ${cname}`);
      }
    }
    if (!(await indexExists('fish_types', 'fish_types_name_org_unique'))) {
      await queryInterface.addIndex('fish_types', ['name', 'organization_id'], {
        unique: true,
        name: 'fish_types_name_org_unique',
      });
      console.log('Created index fish_types_name_org_unique');
    }

    // 2. suppliers
    for (const cname of ['suppliers_code_key', 'suppliers_code']) {
      if (await constraintExists('suppliers', cname)) {
        await queryInterface.removeConstraint('suppliers', cname);
        console.log(`Dropped constraint ${cname}`);
      }
    }
    if (!(await indexExists('suppliers', 'suppliers_code_org_unique'))) {
      await queryInterface.addIndex('suppliers', ['code', 'organization_id'], {
        unique: true,
        name: 'suppliers_code_org_unique',
      });
      console.log('Created index suppliers_code_org_unique');
    }

    // 3. daily_sales
    for (const cname of ['daily_sales_sale_date_key', 'daily_sales_sale_date']) {
      if (await constraintExists('daily_sales', cname)) {
        await queryInterface.removeConstraint('daily_sales', cname);
        console.log(`Dropped constraint ${cname}`);
      }
    }
    if (!(await indexExists('daily_sales', 'daily_sales_date_org_unique'))) {
      await queryInterface.addIndex('daily_sales', ['sale_date', 'organization_id'], {
        unique: true,
        name: 'daily_sales_date_org_unique',
      });
      console.log('Created index daily_sales_date_org_unique');
    }

    // 4. purchases
    for (const cname of ['purchases_invoice_number_key', 'purchases_invoice_number']) {
      if (await constraintExists('purchases', cname)) {
        await queryInterface.removeConstraint('purchases', cname);
        console.log(`Dropped constraint ${cname}`);
      }
    }
    if (!(await indexExists('purchases', 'purchases_invoice_org_unique'))) {
      await queryInterface.addIndex('purchases', ['invoice_number', 'organization_id'], {
        unique: true,
        name: 'purchases_invoice_org_unique',
      });
      console.log('Created index purchases_invoice_org_unique');
    }
  },

  async down(queryInterface, Sequelize) {
    try { await queryInterface.removeIndex('fish_types', 'fish_types_name_org_unique'); } catch (e) {}
    try { await queryInterface.removeIndex('suppliers', 'suppliers_code_org_unique'); } catch (e) {}
    try { await queryInterface.removeIndex('daily_sales', 'daily_sales_date_org_unique'); } catch (e) {}
    try { await queryInterface.removeIndex('purchases', 'purchases_invoice_org_unique'); } catch (e) {}
  },
};
