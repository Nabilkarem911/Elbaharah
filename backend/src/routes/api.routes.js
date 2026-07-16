const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const createCrud = require('../controllers/crud.factory');
const { Supplier, Purchase, PurchaseItem, FishType, DailySale, PosMachine, PosTransaction,
  ExpenseCategory, Expense, OtherSale, CreditAccount, CreditSale, DeliveryPlatform,
  SaleChannel, CancelledInvoice, FishInventory, User, Setting, DeliveryOrder, FishWaste, WasteReason,
  Organization, Branch, DailySaleChannel, PurchaseCustody } = require('../models');

// Get current user's organization + branch info (for frontend labels)
router.get('/me/org', auth, async (req, res, next) => {
  try {
    if (!req.user.organization_id) {
      return res.json({ organization: null, branch: null, labels: {} });
    }
    const org = await Organization.findByPk(req.user.organization_id);
    const branch = req.user.branch_id ? await Branch.findByPk(req.user.branch_id) : null;
    res.json({
      organization: org,
      branch,
      labels: org?.labels || {},
    });
  } catch (err) { next(err); }
});

// Suppliers
const supplierCtrl = createCrud(Supplier, 'الدلال');
router.get('/suppliers', auth, supplierCtrl.list);
router.get('/suppliers/:id', auth, supplierCtrl.getById);
router.post('/suppliers', auth, role('admin', 'manager'), supplierCtrl.create);
router.put('/suppliers/:id', auth, role('admin', 'manager'), supplierCtrl.update);
router.delete('/suppliers/:id', auth, role('admin'), supplierCtrl.remove);

// Fish Types
const fishCtrl = createCrud(FishType, 'نوع السمك');
router.get('/fish-types', auth, fishCtrl.list);
router.post('/fish-types', auth, role('admin', 'manager'), fishCtrl.create);
router.put('/fish-types/:id', auth, role('admin', 'manager'), fishCtrl.update);
router.delete('/fish-types/:id', auth, role('admin'), fishCtrl.remove);

// Purchases
const purchaseCtrl = createCrud(Purchase, 'فاتورة الشراء', [
  { model: Supplier, as: 'supplier' },
  { model: PurchaseItem, as: 'items', include: [{ model: FishType, as: 'fishType' }] },
]);
router.get('/purchases', auth, purchaseCtrl.list);
router.get('/purchases/:id', auth, purchaseCtrl.getById);
router.post('/purchases', auth, role('admin', 'manager'), [
  body('invoice_number').trim().notEmpty().withMessage('رقم الفاتورة مطلوب'),
  body('supplier_id').isInt({ min: 1 }).withMessage('الدلال مطلوب'),
  body('purchase_date').notEmpty().withMessage('التاريخ مطلوب'),
  body('items').isArray({ min: 1 }).withMessage('يجب إضافة قلم واحد على الأقل'),
], validate, async (req, res, next) => {
  try {
    const { items, ...purchaseData } = req.body;
    purchaseData.created_by = req.user.id;
    const purchase = await Purchase.create(purchaseData);
    if (items && items.length) {
      for (const item of items) {
        item.purchase_id = purchase.id;
        await PurchaseItem.create(item);
      }
    }
    const totalWeight = items ? items.reduce((s, i) => s + parseFloat(i.weight || 0), 0) : 0;
    const totalAmount = items ? items.reduce((s, i) => s + parseFloat(i.total_price || 0), 0) : 0;
    await purchase.update({ total_weight: totalWeight, total_amount: totalAmount });
    res.status(201).json(purchase);
  } catch (err) { next(err); }
});
router.put('/purchases/:id', auth, role('admin', 'manager'), [
  body('invoice_number').trim().notEmpty().withMessage('رقم الفاتورة مطلوب'),
  body('supplier_id').isInt({ min: 1 }).withMessage('الدلال مطلوب'),
  body('purchase_date').notEmpty().withMessage('التاريخ مطلوب'),
], validate, async (req, res, next) => {
  try {
    const { items, ...purchaseData } = req.body;
    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) return res.status(404).json({ error: 'الفاتورة غير موجودة' });
    await purchase.update(purchaseData);
    if (items) {
      await PurchaseItem.destroy({ where: { purchase_id: purchase.id } });
      for (const item of items) {
        item.purchase_id = purchase.id;
        await PurchaseItem.create(item);
      }
      const totalWeight = items.reduce((s, i) => s + parseFloat(i.weight || 0), 0);
      const totalAmount = items.reduce((s, i) => s + parseFloat(i.total_price || 0), 0);
      await purchase.update({ total_weight: totalWeight, total_amount: totalAmount });
    }
    res.json(purchase);
  } catch (err) { next(err); }
});
router.delete('/purchases/:id', auth, role('admin'), purchaseCtrl.remove);

// Get next invoice number for purchases
router.get('/purchases/next-invoice', auth, async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const lastPurchase = await Purchase.findOne({
      where: { invoice_number: { [Op.like]: 'PUR-%' } },
      order: [['id', 'DESC']],
    });
    let nextNum = 1;
    if (lastPurchase && lastPurchase.invoice_number) {
      const match = lastPurchase.invoice_number.match(/PUR-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    res.json({ invoice_number: `PUR-${String(nextNum).padStart(4, '0')}` });
  } catch (err) { next(err); }
});

// Batch purchases — multiple rows in one request, each row = separate purchase with same invoice
router.post('/purchases/batch', auth, role('admin', 'manager'), async (req, res, next) => {
  try {
    const { rows, purchase_date, invoice_number, payment_method, notes } = req.body;
    if (!rows || !Array.isArray(rows) || !rows.length) {
      return res.status(400).json({ error: 'يجب إضافة صف واحد على الأقل' });
    }
    const results = [];
    for (const row of rows) {
      if (!row.supplier_id || !row.items || !row.items.length) continue;
      const purchase = await Purchase.create({
        invoice_number,
        supplier_id: row.supplier_id,
        purchase_date: purchase_date || new Date().toISOString().split('T')[0],
        payment_method: payment_method || 'cash',
        notes: notes || '',
        created_by: req.user.id,
        total_weight: row.items.reduce((s, i) => s + parseFloat(i.weight || 0), 0),
        total_amount: row.items.reduce((s, i) => s + parseFloat(i.total_price || 0), 0),
      });
      for (const item of row.items) {
        await PurchaseItem.create({
          ...item,
          purchase_id: purchase.id,
        });
      }
      results.push(purchase);
    }
    res.status(201).json({ created: results.length, purchases: results });
  } catch (err) { next(err); }
});

// List all invoices grouped by invoice_number
router.get('/purchases/invoices', auth, async (req, res, next) => {
  try {
    const { Op, literal } = require('sequelize');
    const purchases = await Purchase.findAll({
      include: [
        { model: Supplier, as: 'supplier' },
        { model: PurchaseItem, as: 'items', include: [{ model: FishType, as: 'fishType' }] },
      ],
      order: [['purchase_date', 'DESC'], ['id', 'DESC']],
    });

    const invoiceMap = {};
    purchases.forEach(p => {
      const invNum = p.invoice_number;
      if (!invoiceMap[invNum]) {
        invoiceMap[invNum] = {
          invoice_number: invNum,
          purchase_date: p.purchase_date,
          payment_method: p.payment_method,
          notes: p.notes,
          first_purchase_id: p.id,
          total_weight: 0,
          total_amount: 0,
          items_count: 0,
          suppliers: new Set(),
          items: [],
        };
      }
      invoiceMap[invNum].total_weight += parseFloat(p.total_weight || 0);
      invoiceMap[invNum].total_amount += parseFloat(p.total_amount || 0);
      invoiceMap[invNum].items_count += p.items.length;
      invoiceMap[invNum].suppliers.add(p.supplier ? p.supplier.name : 'غير معروف');
      p.items.forEach(item => {
        invoiceMap[invNum].items.push({
          fish_type_id: item.fish_type_id,
          fish_code: item.fishType ? item.fishType.code : '',
          fish_name: item.fishType ? item.fishType.name : 'غير معروف',
          supplier_id: p.supplier_id,
          supplier_name: p.supplier ? p.supplier.name : 'غير معروف',
          supplier_code: p.supplier ? p.supplier.code : '',
          weight: parseFloat(item.weight),
          price_per_kilo: parseFloat(item.price_per_kilo),
          total_price: parseFloat(item.total_price),
          is_damaged: item.is_damaged,
          damaged_weight: parseFloat(item.damaged_weight || 0),
        });
      });
    });

    const result = Object.values(invoiceMap).map(inv => ({
      ...inv,
      suppliers_count: inv.suppliers.size,
    }));

    res.json({ data: result });
  } catch (err) { next(err); }
});

// Get full invoice by first purchase id (aggregates all purchases with same invoice_number)
router.get('/purchases/invoice/:id', auth, async (req, res, next) => {
  try {
    const basePurchase = await Purchase.findByPk(req.params.id);
    if (!basePurchase) return res.status(404).json({ error: 'الفاتورة غير موجودة' });

    const purchases = await Purchase.findAll({
      where: { invoice_number: basePurchase.invoice_number },
      include: [
        { model: Supplier, as: 'supplier' },
        { model: PurchaseItem, as: 'items', include: [{ model: FishType, as: 'fishType' }] },
      ],
      order: [['id', 'ASC']],
    });

    const allItems = [];
    let totalWeight = 0;
    let totalAmount = 0;
    purchases.forEach(p => {
      p.items.forEach(item => {
        allItems.push({
          fish_type_id: item.fish_type_id,
          fish_code: item.fishType ? item.fishType.code : '',
          fish_name: item.fishType ? item.fishType.name : 'غير معروف',
          supplier_id: p.supplier_id,
          supplier_name: p.supplier ? p.supplier.name : 'غير معروف',
          supplier_code: p.supplier ? p.supplier.code : '',
          weight: parseFloat(item.weight),
          price_per_kilo: parseFloat(item.price_per_kilo),
          total_price: parseFloat(item.total_price),
          is_damaged: item.is_damaged,
          damaged_weight: parseFloat(item.damaged_weight || 0),
        });
        totalWeight += parseFloat(item.weight);
        totalAmount += parseFloat(item.total_price);
      });
    });

    res.json({
      invoice_number: basePurchase.invoice_number,
      purchase_date: basePurchase.purchase_date,
      payment_method: basePurchase.payment_method,
      notes: basePurchase.notes,
      first_purchase_id: basePurchase.id,
      total_weight: totalWeight,
      total_amount: totalAmount,
      items: allItems,
    });
  } catch (err) { next(err); }
});

// Delete entire invoice by invoice_number
router.delete('/purchases/invoice/:invoiceNumber', auth, role('admin', 'manager'), async (req, res, next) => {
  try {
    const purchases = await Purchase.findAll({
      where: { invoice_number: req.params.invoiceNumber },
    });
    if (!purchases.length) return res.status(404).json({ error: 'الفاتورة غير موجودة' });
    for (const p of purchases) {
      await PurchaseItem.destroy({ where: { purchase_id: p.id } });
      await p.destroy();
    }
    res.json({ message: 'تم حذف الفاتورة', deleted: purchases.length });
  } catch (err) { next(err); }
});

// Daily Sales
const saleCtrl = createCrud(DailySale, 'الحركة المالية');
router.get('/sales', auth, saleCtrl.list);
router.get('/sales/:id', auth, saleCtrl.getById);
router.post('/sales', auth, role('admin', 'manager', 'cashier'), saleCtrl.create);
router.put('/sales/:id', auth, role('admin', 'manager', 'cashier'), saleCtrl.update);
router.delete('/sales/:id', auth, role('admin', 'manager'), saleCtrl.remove);

// POS Machines
const posMachineCtrl = createCrud(PosMachine, 'ماكينة الدفع');
router.get('/pos/machines', auth, posMachineCtrl.list);
router.post('/pos/machines', auth, role('admin', 'manager'), posMachineCtrl.create);
router.put('/pos/machines/:id', auth, role('admin', 'manager'), posMachineCtrl.update);
router.delete('/pos/machines/:id', auth, role('admin'), posMachineCtrl.remove);

// POS Transactions
const posTxCtrl = createCrud(PosTransaction, 'حركة ماكينة', [{ model: PosMachine, as: 'posMachine' }]);
router.get('/pos/transactions', auth, posTxCtrl.list);
router.post('/pos/transactions', auth, role('admin', 'manager', 'cashier'), posTxCtrl.create);
router.put('/pos/transactions/:id', auth, role('admin', 'manager'), posTxCtrl.update);
router.delete('/pos/transactions/:id', auth, role('admin', 'manager'), posTxCtrl.remove);

// Expenses
const expenseCtrl = createCrud(Expense, 'مصروف', [{ model: ExpenseCategory, as: 'category' }]);
router.get('/expenses', auth, expenseCtrl.list);
router.post('/expenses', auth, role('admin', 'manager'), [
  body('category_id').isInt({ min: 1 }).withMessage('التصنيف مطلوب'),
  body('amount').isFloat({ min: 0.01 }).withMessage('المبلغ يجب أن يكون أكبر من صفر'),
  body('expense_date').notEmpty().withMessage('التاريخ مطلوب'),
], validate, expenseCtrl.create);
router.put('/expenses/:id', auth, role('admin', 'manager'), [
  body('category_id').isInt({ min: 1 }).withMessage('التصنيف مطلوب'),
  body('amount').isFloat({ min: 0.01 }).withMessage('المبلغ يجب أن يكون أكبر من صفر'),
  body('expense_date').notEmpty().withMessage('التاريخ مطلوب'),
], validate, expenseCtrl.update);
router.delete('/expenses/:id', auth, role('admin', 'manager'), expenseCtrl.remove);

// Expense Categories
const expCatCtrl = createCrud(ExpenseCategory, 'تصنيف المصروفات');
router.get('/expense-categories', auth, expCatCtrl.list);
router.post('/expense-categories', auth, role('admin', 'manager'), expCatCtrl.create);
router.put('/expense-categories/:id', auth, role('admin', 'manager'), expCatCtrl.update);
router.delete('/expense-categories/:id', auth, role('admin'), expCatCtrl.remove);

// Other Sales
const otherSaleCtrl = createCrud(OtherSale, 'مبيعة أخرى');
router.get('/other-sales', auth, otherSaleCtrl.list);
router.post('/other-sales', auth, role('admin', 'manager'), otherSaleCtrl.create);
router.put('/other-sales/:id', auth, role('admin', 'manager'), otherSaleCtrl.update);
router.delete('/other-sales/:id', auth, role('admin', 'manager'), otherSaleCtrl.remove);

// Credit Accounts
const creditAcctCtrl = createCrud(CreditAccount, 'حساب آجل');
router.get('/credit/accounts', auth, creditAcctCtrl.list);
router.post('/credit/accounts', auth, role('admin', 'manager'), creditAcctCtrl.create);
router.put('/credit/accounts/:id', auth, role('admin', 'manager'), creditAcctCtrl.update);
router.delete('/credit/accounts/:id', auth, role('admin'), creditAcctCtrl.remove);

// Credit Sales
const creditSaleCtrl = createCrud(CreditSale, 'مبيعة آجل', [{ model: CreditAccount, as: 'account' }]);
router.get('/credit/sales', auth, creditSaleCtrl.list);
router.post('/credit/sales', auth, role('admin', 'manager'), creditSaleCtrl.create);
router.put('/credit/sales/:id', auth, role('admin', 'manager'), creditSaleCtrl.update);
router.delete('/credit/sales/:id', auth, role('admin', 'manager'), creditSaleCtrl.remove);

// Credit Settlement — creates a paid CreditSale to properly trigger model hooks
router.post('/credit/accounts/:id/settle', auth, role('admin', 'manager'), async (req, res, next) => {
  try {
    const account = await CreditAccount.findByPk(req.params.id);
    if (!account) return res.status(404).json({ error: 'الحساب غير موجود' });

    const { payment_amount, payment_date } = req.body;
    if (!payment_amount || Number(payment_amount) <= 0) {
      return res.status(400).json({ error: 'المبلغ يجب أن يكون أكبر من صفر' });
    }

    const sale = await CreditSale.create({
      credit_account_id: account.id,
      invoice_number: `SETTLE-${Date.now()}`,
      amount: Number(payment_amount),
      is_paid: true,
      sale_date: payment_date || new Date().toISOString().split('T')[0],
      created_by: req.user.id,
    });

    await account.reload();

    res.status(201).json({ message: 'تم التسوية بنجاح', sale, account });
  } catch (err) {
    next(err);
  }
});

// Delivery Platforms
const deliveryPlatformCtrl = createCrud(DeliveryPlatform, 'تطبيق توصيل');
router.get('/delivery-platforms', auth, deliveryPlatformCtrl.list);
router.post('/delivery-platforms', auth, role('admin', 'manager'), deliveryPlatformCtrl.create);
router.put('/delivery-platforms/:id', auth, role('admin', 'manager'), deliveryPlatformCtrl.update);
router.delete('/delivery-platforms/:id', auth, role('admin'), deliveryPlatformCtrl.remove);

// Sale Channels
const saleChannelCtrl = createCrud(SaleChannel, 'قناة بيع');
router.get('/sale-channels', auth, saleChannelCtrl.list);
router.post('/sale-channels', auth, role('admin', 'manager'), saleChannelCtrl.create);
router.put('/sale-channels/:id', auth, role('admin', 'manager'), saleChannelCtrl.update);
router.delete('/sale-channels/:id', auth, role('admin'), saleChannelCtrl.remove);

// Daily Sale Channels (links daily sales to sale channels with amounts)
const dailySaleChannelCtrl = createCrud(DailySaleChannel, 'قناة بيع يومية', [
  { model: SaleChannel, as: 'channel' },
  { model: DailySale, as: 'dailySale' },
]);
router.get('/daily-sale-channels', auth, dailySaleChannelCtrl.list);
router.post('/daily-sale-channels', auth, role('admin', 'manager'), dailySaleChannelCtrl.create);
router.put('/daily-sale-channels/:id', auth, role('admin', 'manager'), dailySaleChannelCtrl.update);
router.delete('/daily-sale-channels/:id', auth, role('admin', 'manager'), dailySaleChannelCtrl.remove);

// Delivery Orders (tracks individual delivery platform orders per daily sale)
const deliveryOrderCtrl = createCrud(DeliveryOrder, 'طلب توصيل', [
  { model: DeliveryPlatform, as: 'platform' },
  { model: DailySale, as: 'dailySale' },
]);
router.get('/delivery-orders', auth, deliveryOrderCtrl.list);
router.post('/delivery-orders', auth, role('admin', 'manager'), deliveryOrderCtrl.create);
router.put('/delivery-orders/:id', auth, role('admin', 'manager'), deliveryOrderCtrl.update);
router.delete('/delivery-orders/:id', auth, role('admin', 'manager'), deliveryOrderCtrl.remove);

// Cancelled Invoices
const cancelledCtrl = createCrud(CancelledInvoice, 'فاتورة ملغية');
router.get('/cancelled-invoices', auth, cancelledCtrl.list);
router.post('/cancelled-invoices', auth, role('admin', 'manager'), cancelledCtrl.create);
router.put('/cancelled-invoices/:id', auth, role('admin', 'manager'), cancelledCtrl.update);
router.delete('/cancelled-invoices/:id', auth, role('admin', 'manager'), cancelledCtrl.remove);

// Fish Inventory
const inventoryCtrl = createCrud(FishInventory, 'جرد الأسماك', [{ model: FishType, as: 'fishType' }]);
router.get('/fish-inventory', auth, inventoryCtrl.list);
router.post('/fish-inventory', auth, role('admin', 'manager', 'accountant'), inventoryCtrl.create);
router.put('/fish-inventory/:id', auth, role('admin', 'manager', 'accountant'), inventoryCtrl.update);
router.delete('/fish-inventory/:id', auth, role('admin'), inventoryCtrl.remove);

// Users
const userCtrl = createCrud(User, 'مستخدم');
router.get('/users', auth, role('admin'), userCtrl.list);
router.post('/users', auth, role('admin'), [
  body('username').trim().isLength({ min: 3 }).withMessage('اسم المستخدم 3 أحرف على الأقل'),
  body('full_name').trim().notEmpty().withMessage('الاسم الكامل مطلوب'),
  body('password_hash').isLength({ min: 6 }).withMessage('كلمة المرور 6 أحرف على الأقل'),
  body('role').isIn(['admin', 'manager', 'cashier', 'accountant']).withMessage('دور غير صحيح'),
], validate, async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.user.organization_id) data.organization_id = req.user.organization_id;
    if (!data.branch_id && req.user.branch_id) data.branch_id = req.user.branch_id;
    const item = await User.create(data);
    res.status(201).json(item);
  } catch (err) { next(err); }
});
router.put('/users/:id', auth, role('admin'), [
  body('full_name').trim().notEmpty().withMessage('الاسم الكامل مطلوب'),
  body('role').isIn(['admin', 'manager', 'cashier', 'accountant']).withMessage('دور غير صحيح'),
], validate, async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.organization_id) where.organization_id = req.user.organization_id;
    const item = await User.findOne({ where });
    if (!item) return res.status(404).json({ error: 'مستخدم غير موجود' });
    const updates = { ...req.body };
    if (!updates.password_hash) delete updates.password_hash;
    await item.update(updates);
    res.json(item);
  } catch (err) { next(err); }
});
router.delete('/users/:id', auth, role('admin'), userCtrl.remove);

// Branches (org admin manages their own branches)
router.get('/branches', auth, role('admin'), async (req, res, next) => {
  try {
    const where = {};
    if (req.user.organization_id) where.organization_id = req.user.organization_id;
    const branches = await Branch.findAll({
      where,
      order: [['is_main', 'DESC'], ['id', 'ASC']],
    });
    res.json(branches);
  } catch (err) { next(err); }
});
router.post('/branches', auth, role('admin'), [
  body('name').trim().notEmpty().withMessage('اسم الفرع مطلوب'),
], validate, async (req, res, next) => {
  try {
    if (!req.user.organization_id) return res.status(400).json({ error: 'لا توجد منشأة مرتبطة' });
    const branch = await Branch.create({
      organization_id: req.user.organization_id,
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
    });
    res.status(201).json(branch);
  } catch (err) { next(err); }
});
router.put('/branches/:id', auth, role('admin'), [
  body('name').trim().notEmpty().withMessage('اسم الفرع مطلوب'),
], validate, async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.organization_id) where.organization_id = req.user.organization_id;
    const branch = await Branch.findOne({ where });
    if (!branch) return res.status(404).json({ error: 'الفرع غير موجود' });
    await branch.update({ name: req.body.name, phone: req.body.phone, address: req.body.address, is_active: req.body.is_active });
    res.json(branch);
  } catch (err) { next(err); }
});
router.delete('/branches/:id', auth, role('admin'), async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.organization_id) where.organization_id = req.user.organization_id;
    const branch = await Branch.findOne({ where });
    if (!branch) return res.status(404).json({ error: 'الفرع غير موجود' });
    if (branch.is_main) return res.status(400).json({ error: 'لا يمكن حذف الفرع الرئيسي' });
    await branch.destroy();
    res.json({ message: 'تم حذف الفرع بنجاح' });
  } catch (err) { next(err); }
});

// Settings
const settingCtrl = createCrud(Setting, 'إعدادات');
router.get('/settings', auth, settingCtrl.list);
router.put('/settings', auth, role('admin'), async (req, res, next) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      const newSetting = await Setting.create(req.body);
      return res.json(newSetting);
    }
    await setting.update(req.body);
    res.json(setting);
  } catch (err) { next(err); }
});

// Fish Waste
const fishWasteCtrl = createCrud(FishWaste, 'هدر السمك', [{ model: FishType, as: 'fishType' }]);
router.get('/fish-waste', auth, fishWasteCtrl.list);
router.get('/fish-waste/:id', auth, fishWasteCtrl.getById);
router.post('/fish-waste', auth, role('admin', 'manager'), fishWasteCtrl.create);
router.put('/fish-waste/:id', auth, role('admin', 'manager'), fishWasteCtrl.update);
router.delete('/fish-waste/:id', auth, role('admin', 'manager'), fishWasteCtrl.remove);

// Fish Waste - avg cost for a fish type (current month)
router.get('/fish-waste/avg-cost/:fishTypeId', auth, async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const items = await PurchaseItem.findAll({
      where: { fish_type_id: req.params.fishTypeId },
      include: [{ model: Purchase, as: 'purchase', where: { purchase_date: { [require('sequelize').Op.between]: [start, end] } }, required: true }],
    });
    if (!items.length) return res.json({ avg_cost: 0, count: 0 });
    const totalWeight = items.reduce((s, i) => s + parseFloat(i.weight), 0);
    const totalAmount = items.reduce((s, i) => s + parseFloat(i.total_price), 0);
    const avg = totalWeight > 0 ? totalAmount / totalWeight : 0;
    res.json({ avg_cost: avg, count: items.length, total_weight: totalWeight, total_amount: totalAmount });
  } catch (err) { next(err); }
});

// Waste Reasons
const wasteReasonCtrl = createCrud(WasteReason, 'سبب الهدر');
router.get('/waste-reasons', auth, wasteReasonCtrl.list);
router.post('/waste-reasons', auth, role('admin', 'manager'), wasteReasonCtrl.create);
router.put('/waste-reasons/:id', auth, role('admin', 'manager'), wasteReasonCtrl.update);
router.delete('/waste-reasons/:id', auth, role('admin'), wasteReasonCtrl.remove);

// Purchase Custody (عهدة مشتريات)

// Fish Inventory — Opening Balance + Monthly Closing
router.get('/fish-inventory', auth, async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const where = {};
    if (req.query.month) {
      where.month_year = req.query.month;
    }
    const records = await FishInventory.findAll({
      where,
      include: [{ model: FishType, as: 'fishType' }],
      order: [['month_year', 'DESC'], ['fish_type_id', 'ASC']],
    });
    res.json({ data: records });
  } catch (err) { next(err); }
});

router.post('/fish-inventory/opening', auth, role('admin', 'manager'), async (req, res, next) => {
  try {
    const { month_year, items } = req.body;
    if (!month_year || !items || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'البيانات غير مكتملة' });
    }
    const results = [];
    for (const item of items) {
      if (!item.fish_type_id) continue;
      const [record, created] = await FishInventory.findOrCreate({
        where: { fish_type_id: item.fish_type_id, month_year },
        defaults: {
          fish_type_id: item.fish_type_id,
          month_year,
          opening_balance_kg: Number(item.opening_balance_kg || 0),
          opening_balance_cost: Number(item.opening_balance_cost || 0),
          opening_balance_value: Number(item.opening_balance_value || 0),
        },
      });
      if (!created) {
        await record.update({
          opening_balance_kg: Number(item.opening_balance_kg || 0),
          opening_balance_cost: Number(item.opening_balance_cost || 0),
          opening_balance_value: Number(item.opening_balance_value || 0),
        });
      }
      results.push(record);
    }
    res.status(201).json({ saved: results.length });
  } catch (err) { next(err); }
});

router.post('/fish-inventory/closing', auth, role('admin', 'manager'), async (req, res, next) => {
  try {
    const { month_year, items } = req.body;
    if (!month_year || !items || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'البيانات غير مكتملة' });
    }
    const results = [];
    for (const item of items) {
      if (!item.fish_type_id) continue;
      const [record, created] = await FishInventory.findOrCreate({
        where: { fish_type_id: item.fish_type_id, month_year },
        defaults: {
          fish_type_id: item.fish_type_id,
          month_year,
          closing_balance_kg: Number(item.closing_balance_kg || 0),
          closing_balance_cost: Number(item.closing_balance_cost || 0),
        },
      });
      if (!created) {
        await record.update({
          closing_balance_kg: Number(item.closing_balance_kg || 0),
          closing_balance_cost: Number(item.closing_balance_cost || 0),
        });
      }
      results.push(record);
    }
    res.status(201).json({ saved: results.length });
  } catch (err) { next(err); }
});

// Purchase Custody (عهدة مشتريات)
router.get('/purchase-custody', auth, async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const where = {};
    if (req.query.startDate && req.query.endDate) {
      where.transaction_date = { [Op.between]: [req.query.startDate, req.query.endDate] };
    }
    const records = await PurchaseCustody.findAll({
      where,
      order: [['transaction_date', 'DESC'], ['id', 'DESC']],
    });
    const last = records[0];
    const currentBalance = last ? parseFloat(last.balance_after) : 0;
    res.json({ data: records, currentBalance });
  } catch (err) { next(err); }
});

router.post('/purchase-custody', auth, role('admin', 'manager'), [
  body('type').isIn(['feed', 'spend']).withMessage('النوع مطلوب'),
  body('amount').isFloat({ min: 0.01 }).withMessage('المبلغ مطلوب'),
  body('transaction_date').notEmpty().withMessage('التاريخ مطلوب'),
], validate, async (req, res, next) => {
  try {
    const record = await PurchaseCustody.create({
      ...req.body,
      created_by: req.user.id,
    });
    res.status(201).json(record);
  } catch (err) { next(err); }
});

router.delete('/purchase-custody/:id', auth, role('admin', 'manager'), async (req, res, next) => {
  try {
    const record = await PurchaseCustody.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'السجل غير موجود' });
    await record.destroy();
    res.json({ message: 'تم الحذف' });
  } catch (err) { next(err); }
});

module.exports = router;
