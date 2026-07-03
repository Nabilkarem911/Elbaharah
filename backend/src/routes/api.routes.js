const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const createCrud = require('../controllers/crud.factory');
const { Supplier, Purchase, PurchaseItem, FishType, DailySale, PosMachine, PosTransaction,
  ExpenseCategory, Expense, OtherSale, CreditAccount, CreditSale, DeliveryPlatform,
  SaleChannel, CancelledInvoice, FishInventory, User, Setting, DeliveryOrder, FishWaste, WasteReason } = require('../models');

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
router.post('/purchases', auth, role('admin', 'manager'), async (req, res, next) => {
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
router.put('/purchases/:id', auth, role('admin', 'manager'), async (req, res, next) => {
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
router.post('/expenses', auth, role('admin', 'manager'), expenseCtrl.create);
router.put('/expenses/:id', auth, role('admin', 'manager'), expenseCtrl.update);
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
router.post('/users', auth, role('admin'), userCtrl.create);
router.put('/users/:id', auth, role('admin'), userCtrl.update);
router.delete('/users/:id', auth, role('admin'), userCtrl.remove);

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

module.exports = router;
