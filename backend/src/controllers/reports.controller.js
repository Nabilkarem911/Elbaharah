const {
  DailySale, Purchase, PurchaseItem, FishType, Supplier, Expense, ExpenseCategory,
  PosMachine, PosTransaction, CreditSale, CreditAccount, DeliveryOrder, DeliveryPlatform,
  OtherSale, Setting,
} = require('../models');
const { Op } = require('sequelize');

const getDateRange = (req) => {
  const { start_date, end_date } = req.query;
  const end = end_date || new Date().toISOString().split('T')[0];
  const start = start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  return { start, end };
};

// 1. Sales Report
exports.sales = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(req);
    const sales = await DailySale.findAll({
      where: { sale_date: { [Op.between]: [start, end] } },
      order: [['sale_date', 'ASC']],
    });
    const summary = {
      total_sales: sales.reduce((s, d) => s + parseFloat(d.total_sales), 0),
      net_sales: sales.reduce((s, d) => s + parseFloat(d.net_sales), 0),
      cash_box: sales.reduce((s, d) => s + parseFloat(d.cash_box), 0),
      credit_sales: sales.reduce((s, d) => s + parseFloat(d.credit_sales), 0),
      other_sales: sales.reduce((s, d) => s + parseFloat(d.other_sales), 0),
      delivery_sales: sales.reduce((s, d) => s + parseFloat(d.delivery_sales), 0),
      network_sales: sales.reduce((s, d) => s + parseFloat(d.network_sales), 0),
      bank_transfer: sales.reduce((s, d) => s + parseFloat(d.bank_transfer || 0), 0),
      surplus_deficit: sales.reduce((s, d) => s + parseFloat(d.surplus_deficit), 0),
      days_count: sales.length,
    };
    res.json({ summary, details: sales });
  } catch (err) { next(err); }
};

// 2. Fish Report
exports.fish = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(req);
    const purchases = await Purchase.findAll({
      where: { purchase_date: { [Op.between]: [start, end] } },
      include: [{ model: Supplier, as: 'supplier' }, { model: PurchaseItem, as: 'items', include: [{ model: FishType, as: 'fishType' }] }],
      order: [['purchase_date', 'ASC']],
    });
    const fishMap = {};
    purchases.forEach(p => {
      p.items.forEach(item => {
        const name = item.fishType ? item.fishType.name : 'غير معروف';
        if (!fishMap[name]) fishMap[name] = { name, total_weight: 0, total_amount: 0, avg_price: 0, purchases_count: 0 };
        fishMap[name].total_weight += parseFloat(item.weight);
        fishMap[name].total_amount += parseFloat(item.total_price);
        fishMap[name].purchases_count += 1;
      });
    });
    const fishStats = Object.values(fishMap).map(f => {
      f.avg_price = f.total_weight > 0 ? f.total_amount / f.total_weight : 0;
      return f;
    }).sort((a, b) => b.total_amount - a.total_amount);
    const summary = {
      total_weight: fishStats.reduce((s, f) => s + f.total_weight, 0),
      total_amount: fishStats.reduce((s, f) => s + f.total_amount, 0),
      fish_types_count: fishStats.length,
      purchases_count: purchases.length,
    };
    res.json({ summary, details: fishStats, purchases });
  } catch (err) { next(err); }
};

// 3. Delivery Report
exports.delivery = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(req);
    const platforms = await DeliveryPlatform.findAll();
    const orders = await DeliveryOrder.findAll({
      where: { order_date: { [Op.between]: [start, end] } },
      include: [{ model: DeliveryPlatform, as: 'platform' }],
      order: [['order_date', 'ASC']],
    });
    const platformMap = {};
    platforms.forEach(p => {
      platformMap[p.name] = { name: p.name, key: p.key, orders_count: 0, total_amount: 0 };
    });
    orders.forEach(o => {
      const name = o.platform ? o.platform.name : 'غير معروف';
      if (!platformMap[name]) platformMap[name] = { name, orders_count: 0, total_amount: 0 };
      platformMap[name].orders_count += 1;
      platformMap[name].total_amount += parseFloat(o.amount);
    });
    const sales = await DailySale.findAll({
      where: { sale_date: { [Op.between]: [start, end] } },
    });
    const channelTotals = {};
    platforms.forEach(p => {
      channelTotals[p.key] = sales.reduce((s, d) => s + parseFloat(d[p.key] || 0), 0);
    });
    const summary = {
      total_orders: orders.length,
      total_amount: orders.reduce((s, o) => s + parseFloat(o.amount), 0),
      delivery_sales: sales.reduce((s, d) => s + parseFloat(d.delivery_sales), 0),
    };
    res.json({ summary, platforms: Object.values(platformMap), channelTotals, orders });
  } catch (err) { next(err); }
};

// 4. Suppliers Report
exports.suppliers = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(req);
    const purchases = await Purchase.findAll({
      where: { purchase_date: { [Op.between]: [start, end] } },
      include: [{ model: Supplier, as: 'supplier' }],
    });
    const supplierMap = {};
    purchases.forEach(p => {
      const name = p.supplier ? p.supplier.name : 'غير معروف';
      const id = p.supplier_id;
      if (!supplierMap[id]) supplierMap[id] = { id, name, total_amount: 0, total_weight: 0, purchases_count: 0, by_method: { cash: 0, credit: 0, transfer: 0 } };
      supplierMap[id].total_amount += parseFloat(p.total_amount);
      supplierMap[id].total_weight += parseFloat(p.total_weight);
      supplierMap[id].purchases_count += 1;
      supplierMap[id].by_method[p.payment_method] = (supplierMap[id].by_method[p.payment_method] || 0) + parseFloat(p.total_amount);
    });
    const details = Object.values(supplierMap).sort((a, b) => b.total_amount - a.total_amount);
    const summary = {
      total_amount: details.reduce((s, d) => s + d.total_amount, 0),
      total_weight: details.reduce((s, d) => s + d.total_weight, 0),
      suppliers_count: details.length,
      purchases_count: purchases.length,
    };
    res.json({ summary, details });
  } catch (err) { next(err); }
};

// 5. Expenses Report
exports.expenses = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(req);
    const expenses = await Expense.findAll({
      where: { expense_date: { [Op.between]: [start, end] } },
      include: [{ model: ExpenseCategory, as: 'category' }],
      order: [['expense_date', 'ASC']],
    });
    const catMap = {};
    expenses.forEach(e => {
      const name = e.category ? e.category.name : 'غير مصنف';
      if (!catMap[name]) catMap[name] = { name, total: 0, count: 0, by_method: { cash: 0, credit: 0, transfer: 0 } };
      catMap[name].total += parseFloat(e.amount);
      catMap[name].count += 1;
      catMap[name].by_method[e.payment_method] = (catMap[name].by_method[e.payment_method] || 0) + parseFloat(e.amount);
    });
    const details = Object.values(catMap).sort((a, b) => b.total - a.total);
    const summary = {
      total: expenses.reduce((s, e) => s + parseFloat(e.amount), 0),
      count: expenses.length,
      categories_count: details.length,
    };
    res.json({ summary, details, expenses });
  } catch (err) { next(err); }
};

// 6. Profit Report
exports.profit = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(req);
    const sales = await DailySale.findAll({ where: { sale_date: { [Op.between]: [start, end] } } });
    const purchases = await Purchase.findAll({ where: { purchase_date: { [Op.between]: [start, end] } } });
    const expenses = await Expense.findAll({ where: { expense_date: { [Op.between]: [start, end] } } });
    const otherSales = await OtherSale.findAll({ where: { sale_date: { [Op.between]: [start, end] } } });

    const totalSales = sales.reduce((s, d) => s + parseFloat(d.net_sales), 0);
    const totalOtherSales = otherSales.reduce((s, o) => s + parseFloat(o.total), 0);
    const totalPurchases = purchases.reduce((s, p) => s + parseFloat(p.total_amount), 0);
    const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
    const grossProfit = totalSales + totalOtherSales - totalPurchases;
    const netProfit = grossProfit - totalExpenses;

    const daily = {};
    sales.forEach(d => {
      const date = d.sale_date;
      if (!daily[date]) daily[date] = { date, sales: 0, purchases: 0, expenses: 0, profit: 0 };
      daily[date].sales += parseFloat(d.net_sales);
    });
    purchases.forEach(p => {
      const date = p.purchase_date;
      if (!daily[date]) daily[date] = { date, sales: 0, purchases: 0, expenses: 0, profit: 0 };
      daily[date].purchases += parseFloat(p.total_amount);
    });
    expenses.forEach(e => {
      const date = e.expense_date;
      if (!daily[date]) daily[date] = { date, sales: 0, purchases: 0, expenses: 0, profit: 0 };
      daily[date].expenses += parseFloat(e.amount);
    });
    Object.values(daily).forEach(d => { d.profit = d.sales - d.purchases - d.expenses; });

    res.json({
      summary: {
        total_sales: totalSales,
        total_other_sales: totalOtherSales,
        total_purchases: totalPurchases,
        total_expenses: totalExpenses,
        gross_profit: grossProfit,
        net_profit: netProfit,
        days_count: sales.length,
      },
      daily: Object.values(daily).sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (err) { next(err); }
};

// 7. POS Machines Report
exports.pos = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(req);
    const machines = await PosMachine.findAll();
    const transactions = await PosTransaction.findAll({
      where: { transaction_date: { [Op.between]: [start, end] } },
      include: [{ model: PosMachine, as: 'posMachine' }],
      order: [['transaction_date', 'ASC']],
    });
    const machineMap = {};
    machines.forEach(m => {
      machineMap[m.id] = {
        id: m.id, machine_number: m.machine_number, terminal_id: m.terminal_id, bank: m.bank,
        total_amount: 0, total_after_fee: 0, total_fees: 0, transactions_count: 0,
        by_card: { mada: 0, visa: 0, visa_plus: 0, mastercard: 0, mastercard_plus: 0 },
      };
    });
    transactions.forEach(t => {
      const mid = t.pos_machine_id;
      if (!machineMap[mid]) machineMap[mid] = {
        id: mid, machine_number: 'غير معروف', terminal_id: '', bank: '',
        total_amount: 0, total_after_fee: 0, total_fees: 0, transactions_count: 0,
        by_card: { mada: 0, visa: 0, visa_plus: 0, mastercard: 0, mastercard_plus: 0 },
      };
      machineMap[mid].total_amount += parseFloat(t.amount);
      machineMap[mid].total_after_fee += parseFloat(t.amount_after_fee);
      machineMap[mid].total_fees += parseFloat(t.amount) - parseFloat(t.amount_after_fee);
      machineMap[mid].transactions_count += 1;
      machineMap[mid].by_card[t.card_type] = (machineMap[mid].by_card[t.card_type] || 0) + parseFloat(t.amount);
    });
    const details = Object.values(machineMap).sort((a, b) => b.total_amount - a.total_amount);
    const summary = {
      total_amount: details.reduce((s, d) => s + d.total_amount, 0),
      total_after_fee: details.reduce((s, d) => s + d.total_after_fee, 0),
      total_fees: details.reduce((s, d) => s + d.total_fees, 0),
      transactions_count: transactions.length,
      machines_count: details.filter(d => d.transactions_count > 0).length,
    };
    res.json({ summary, details, transactions });
  } catch (err) { next(err); }
};

// 8. Credit Report
exports.credit = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(req);
    const accounts = await CreditAccount.findAll({
      include: [{ model: CreditSale, as: 'creditSales' }],
    });
    const sales = await CreditSale.findAll({
      where: { sale_date: { [Op.between]: [start, end] } },
      include: [{ model: CreditAccount, as: 'account' }],
      order: [['sale_date', 'ASC']],
    });
    const accountMap = accounts.map(a => {
      const acctSales = sales.filter(s => s.credit_account_id === a.id);
      const totalDue = acctSales.reduce((s, x) => s + parseFloat(x.amount), 0);
      const totalPaid = acctSales.filter(s => s.is_paid).reduce((s, x) => s + parseFloat(x.amount), 0);
      const totalUnpaid = acctSales.filter(s => !s.is_paid).reduce((s, x) => s + parseFloat(x.amount), 0);
      return {
        id: a.id, company_name: a.company_name, phone: a.phone,
        current_balance: parseFloat(a.total_balance),
        period_due: totalDue, period_paid: totalPaid, period_unpaid: totalUnpaid,
        sales_count: acctSales.length,
      };
    }).sort((a, b) => b.period_unpaid - a.period_unpaid);
    const summary = {
      total_due: sales.reduce((s, x) => s + parseFloat(x.amount), 0),
      total_paid: sales.filter(s => s.is_paid).reduce((s, x) => s + parseFloat(x.amount), 0),
      total_unpaid: sales.filter(s => !s.is_paid).reduce((s, x) => s + parseFloat(x.amount), 0),
      total_balance: accounts.reduce((s, a) => s + parseFloat(a.total_balance), 0),
      accounts_count: accounts.length,
    };
    res.json({ summary, details: accountMap, sales });
  } catch (err) { next(err); }
};

// 9. Tax Report
exports.tax = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(req);
    const setting = await Setting.findOne();
    const taxRate = setting ? parseFloat(setting.tax_rate) : 15;
    const sales = await DailySale.findAll({ where: { sale_date: { [Op.between]: [start, end] } } });
    const purchases = await Purchase.findAll({ where: { purchase_date: { [Op.between]: [start, end] } } });
    const expenses = await Expense.findAll({ where: { expense_date: { [Op.between]: [start, end] } } });

    const totalSales = sales.reduce((s, d) => s + parseFloat(d.net_sales), 0);
    const totalPurchases = purchases.reduce((s, p) => s + parseFloat(p.total_amount), 0);
    const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

    const outputTax = totalSales * (taxRate / (100 + taxRate));
    const inputTax = totalPurchases * (taxRate / (100 + taxRate));
    const netTax = outputTax - inputTax;

    res.json({
      summary: {
        tax_rate: taxRate,
        total_sales: totalSales,
        total_purchases: totalPurchases,
        total_expenses: totalExpenses,
        output_tax: outputTax,
        input_tax: inputTax,
        net_tax: netTax,
        sales_excluding_tax: totalSales - outputTax,
        purchases_excluding_tax: totalPurchases - inputTax,
      },
    });
  } catch (err) { next(err); }
};
