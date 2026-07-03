const { DailySale, Purchase, Expense, DeliveryOrder, Supplier, PurchaseItem, FishType,
  CreditSale, CreditAccount, FishInventory, Setting } = require('../models');
const { Op } = require('sequelize');

exports.today = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sale = await DailySale.findOne({ where: { sale_date: today } });
    const purchases = await Purchase.findAll({
      where: { purchase_date: today },
      include: [{ model: PurchaseItem, as: 'items' }],
    });
    const expenses = await Expense.findAll({ where: { expense_date: today } });
    const totalPurchases = purchases.reduce((sum, p) => sum + parseFloat(p.total_amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalSales = sale ? parseFloat(sale.net_sales) : 0;
    const deliveryCount = sale ? sale.delivery_orders_count : 0;
    res.json({
      total_sales: totalSales,
      total_purchases: totalPurchases,
      total_expenses: totalExpenses,
      net_profit: totalSales - totalPurchases - totalExpenses,
      delivery_orders: deliveryCount,
      cash_box: sale ? parseFloat(sale.cash_box) : 0,
    });
  } catch (err) {
    next(err);
  }
};

exports.month = async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    const sales = await DailySale.findAll({
      where: { sale_date: { [Op.between]: [startStr, endStr] } },
    });
    const purchases = await Purchase.findAll({
      where: { purchase_date: { [Op.between]: [startStr, endStr] } },
    });
    const expenses = await Expense.findAll({
      where: { expense_date: { [Op.between]: [startStr, endStr] } },
    });
    const totalSales = sales.reduce((s, d) => s + parseFloat(d.net_sales), 0);
    const totalPurchases = purchases.reduce((s, p) => s + parseFloat(p.total_amount), 0);
    const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
    res.json({
      total_sales: totalSales,
      total_purchases: totalPurchases,
      total_expenses: totalExpenses,
      net_profit: totalSales - totalPurchases - totalExpenses,
      days_count: sales.length,
    });
  } catch (err) {
    next(err);
  }
};

exports.charts = async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const sales = await DailySale.findAll({
      where: { sale_date: { [Op.between]: [startStr, endStr] } },
      order: [['sale_date', 'ASC']],
    });

    const salesChart = sales.map(s => ({
      date: s.sale_date,
      total: parseFloat(s.net_sales),
    }));

    const channelTotals = {
      cash_box: 0, app_elbharah: 0, hunger_station: 0, keta: 0, toyo: 0,
      mada: 0, visa: 0, mastercard: 0,
    };
    sales.forEach(s => {
      channelTotals.cash_box += parseFloat(s.cash_box);
      channelTotals.app_elbharah += parseFloat(s.app_elbharah);
      channelTotals.hunger_station += parseFloat(s.hunger_station);
      channelTotals.keta += parseFloat(s.keta);
      channelTotals.toyo += parseFloat(s.toyo);
      channelTotals.mada += parseFloat(s.mada);
      channelTotals.visa += parseFloat(s.visa);
      channelTotals.mastercard += parseFloat(s.mastercard);
    });

    const topSuppliers = await Purchase.findAll({
      where: { purchase_date: { [Op.between]: [startStr, endStr] } },
      include: [{ model: Supplier, as: 'supplier' }],
    });
    const supplierMap = {};
    topSuppliers.forEach(p => {
      const name = p.supplier ? p.supplier.name : 'غير معروف';
      supplierMap[name] = (supplierMap[name] || 0) + parseFloat(p.total_amount);
    });
    const top5 = Object.entries(supplierMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));

    res.json({ salesChart, channelTotals, top5Suppliers: top5 });
  } catch (err) {
    next(err);
  }
};

exports.insights = async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevStartStr = prevStart.toISOString().split('T')[0];
    const prevEndStr = prevEnd.toISOString().split('T')[0];

    const sales = await DailySale.findAll({ where: { sale_date: { [Op.between]: [startStr, endStr] } } });
    const prevSales = await DailySale.findAll({ where: { sale_date: { [Op.between]: [prevStartStr, prevEndStr] } } });

    const purchases = await Purchase.findAll({
      where: { purchase_date: { [Op.between]: [startStr, endStr] } },
      include: [{ model: Supplier, as: 'supplier' }, { model: PurchaseItem, as: 'items', include: [{ model: FishType, as: 'fishType' }] }],
    });

    const totalSales = sales.reduce((s, d) => s + parseFloat(d.net_sales), 0);
    const prevTotalSales = prevSales.reduce((s, d) => s + parseFloat(d.net_sales), 0);
    const totalPurchases = purchases.reduce((s, p) => s + parseFloat(p.total_amount), 0);

    const prevPurchases = await Purchase.findAll({ where: { purchase_date: { [Op.between]: [prevStartStr, prevEndStr] } } });
    const prevTotalPurchases = prevPurchases.reduce((s, p) => s + parseFloat(p.total_amount), 0);

    const salesGrowth = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 : 0;
    const purchasesGrowth = prevTotalPurchases > 0 ? ((totalPurchases - prevTotalPurchases) / prevTotalPurchases) * 100 : 0;

    const bestDay = sales.length > 0
      ? sales.reduce((best, d) => parseFloat(d.net_sales) > parseFloat(best.net_sales) ? d : best)
      : null;

    const fishMap = {};
    purchases.forEach(p => {
      p.items.forEach(item => {
        const name = item.fishType ? item.fishType.name : 'غير معروف';
        fishMap[name] = (fishMap[name] || 0) + parseFloat(item.weight);
      });
    });
    const topFish = Object.entries(fishMap).sort((a, b) => b[1] - a[1])[0];

    const supplierMap = {};
    purchases.forEach(p => {
      const name = p.supplier ? p.supplier.name : 'غير معروف';
      supplierMap[name] = (supplierMap[name] || 0) + parseFloat(p.total_amount);
    });
    const topSupplier = Object.entries(supplierMap).sort((a, b) => b[1] - a[1])[0];

    res.json({
      best_day: bestDay ? { date: bestDay.sale_date, amount: parseFloat(bestDay.net_sales) } : null,
      top_fish: topFish ? { name: topFish[0], weight: topFish[1] } : null,
      top_supplier: topSupplier ? { name: topSupplier[0], amount: topSupplier[1] } : null,
      performance: {
        current_sales: totalSales,
        previous_sales: prevTotalSales,
        sales_growth: salesGrowth,
        current_purchases: totalPurchases,
        previous_purchases: prevTotalPurchases,
        purchases_growth: purchasesGrowth,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.notifications = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const alerts = [];

    const overdueSales = await CreditSale.findAll({
      where: { is_paid: false, due_date: { [Op.lt]: today } },
      include: [{ model: CreditAccount, as: 'account' }],
    });
    if (overdueSales.length > 0) {
      alerts.push({
        type: 'overdue',
        icon: 'clock',
        color: 'danger',
        title: 'ديون متأخرة',
        message: `${overdueSales.length} دين متأخر عن تاريخ السداد`,
        total: overdueSales.reduce((s, x) => s + parseFloat(x.amount), 0),
        link: '/credit-sales',
      });
    }

    const unpaidAccounts = await CreditAccount.findAll({ where: { total_balance: { [Op.gt]: 0 } } });
    const setting = await Setting.findOne();
    const creditLimit = setting ? parseFloat(setting.credit_limit || 0) : 0;
    if (creditLimit > 0) {
      const overLimit = unpaidAccounts.filter(a => parseFloat(a.total_balance) > creditLimit);
      if (overLimit.length > 0) {
        alerts.push({
          type: 'credit_limit',
          icon: 'alert-circle',
          color: 'warning',
          title: 'تجاوز حد الائتمان',
          message: `${overLimit.length} حساب تجاوز حد الائتمان`,
          link: '/credit-sales',
        });
      }
    }

    const lowInventory = await FishInventory.findAll({
      where: { closing_balance_kg: { [Op.lt]: 10 } },
      include: [{ model: FishType, as: 'fishType' }],
    });
    if (lowInventory.length > 0) {
      alerts.push({
        type: 'low_inventory',
        icon: 'package',
        color: 'warning',
        title: 'نقص في المخزون',
        message: `${lowInventory.length} نوع سمك المخزون فيه أقل من 10 كجم`,
        link: '/fish-cost',
      });
    }

    res.json({ alerts });
  } catch (err) {
    next(err);
  }
};
