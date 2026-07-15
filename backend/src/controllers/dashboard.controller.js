const { DailySale, Purchase, Expense, DeliveryOrder, Supplier, PurchaseItem, FishType,
  CreditSale, CreditAccount, FishInventory, Setting, CancelledInvoice, OtherSale } = require('../models');
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

exports.dailyReport = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Helper: aggregate a daily sale row
    const emptySale = {
      total_sales: 0, app_elbharah: 0, hunger_station: 0, keta: 0, toyo: 0,
      other_sales: 0, credit_sales: 0, cash_box: 0, custody: 0, network_sales: 0,
      net_sales: 0, surplus_deficit: 0, mada: 0, visa: 0, mastercard: 0, bank_transfer: 0,
    };

    const todaySale = await DailySale.findOne({ where: { sale_date: todayStr } });
    const yesterdaySale = await DailySale.findOne({ where: { sale_date: yesterdayStr } });
    const monthSales = await DailySale.findAll({ where: { sale_date: { [Op.between]: [monthStart, monthEnd] } } });

    const sumSales = (sales) => {
      if (Array.isArray(sales)) {
        return sales.reduce((acc, s) => {
          Object.keys(emptySale).forEach(k => { acc[k] += parseFloat(s[k] || 0); });
          return acc;
        }, { ...emptySale });
      }
      if (!sales) return { ...emptySale };
      const r = { ...emptySale };
      Object.keys(emptySale).forEach(k => { r[k] = parseFloat(sales[k] || 0); });
      return r;
    };

    const todaySales = sumSales(todaySale);
    const yesterdaySales = sumSales(yesterdaySale);
    const monthSalesAgg = sumSales(monthSales);

    // Cancelled invoices
    const todayCancelled = await CancelledInvoice.findAll({ where: { invoice_date: todayStr } });
    const yesterdayCancelled = await CancelledInvoice.findAll({ where: { invoice_date: yesterdayStr } });
    const monthCancelled = await CancelledInvoice.findAll({ where: { invoice_date: { [Op.between]: [monthStart, monthEnd] } } });

    const sumCancelled = (arr) => arr.reduce((s, c) => s + parseFloat(c.invoice_amount), 0);
    todaySales.cancelled = sumCancelled(todayCancelled);
    yesterdaySales.cancelled = sumCancelled(yesterdayCancelled);
    monthSalesAgg.cancelled = sumCancelled(monthCancelled);

    // Other sales
    const todayOther = await OtherSale.findAll({ where: { sale_date: todayStr } });
    const yesterdayOther = await OtherSale.findAll({ where: { sale_date: yesterdayStr } });
    const monthOther = await OtherSale.findAll({ where: { sale_date: { [Op.between]: [monthStart, monthEnd] } } });
    const sumOther = (arr) => arr.reduce((s, o) => s + parseFloat(o.total), 0);
    todaySales.other_sales_total = sumOther(todayOther);
    yesterdaySales.other_sales_total = sumOther(yesterdayOther);
    monthSalesAgg.other_sales_total = sumOther(monthOther);

    // Fish purchases by type
    const getFishData = async (startDate, endDate) => {
      const purchases = await Purchase.findAll({
        where: { purchase_date: { [Op.between]: [startDate, endDate] } },
        include: [{ model: PurchaseItem, as: 'items', include: [{ model: FishType, as: 'fishType' }] }],
      });
      const fishMap = {};
      purchases.forEach(p => {
        p.items.forEach(item => {
          const id = item.fish_type_id;
          const name = item.fishType ? item.fishType.name : 'غير معروف';
          if (!fishMap[id]) fishMap[id] = { id, name, weight: 0, total_price: 0 };
          fishMap[id].weight += parseFloat(item.weight);
          fishMap[id].total_price += parseFloat(item.total_price);
        });
      });
      const fishList = Object.values(fishMap).map(f => ({
        ...f,
        price_per_kilo: f.weight > 0 ? f.total_price / f.weight : 0,
      })).sort((a, b) => b.total_price - a.total_price);
      return fishList;
    };

    const todayFish = await getFishData(todayStr, todayStr);
    const yesterdayFish = await getFishData(yesterdayStr, yesterdayStr);
    const monthFish = await getFishData(monthStart, monthEnd);

    // All fish types (for column headers)
    const allFishTypes = await FishType.findAll({ order: [['name', 'ASC']] });

    // Suppliers summary
    const getSupplierData = async (startDate, endDate) => {
      const purchases = await Purchase.findAll({
        where: { purchase_date: { [Op.between]: [startDate, endDate] } },
        include: [{ model: Supplier, as: 'supplier' }],
      });
      const supplierMap = {};
      purchases.forEach(p => {
        const name = p.supplier ? p.supplier.name : 'غير معروف';
        if (!supplierMap[name]) supplierMap[name] = { name, total: 0, count: 0 };
        supplierMap[name].total += parseFloat(p.total_amount);
        supplierMap[name].count += 1;
      });
      return Object.values(supplierMap).sort((a, b) => b.total - a.total);
    };

    const todaySuppliers = await getSupplierData(todayStr, todayStr);
    const yesterdaySuppliers = await getSupplierData(yesterdayStr, yesterdayStr);
    const monthSuppliers = await getSupplierData(monthStart, monthEnd);

    // Purchase totals
    const getPurchaseTotal = async (startDate, endDate) => {
      const purchases = await Purchase.findAll({ where: { purchase_date: { [Op.between]: [startDate, endDate] } } });
      return purchases.reduce((s, p) => s + parseFloat(p.total_amount), 0);
    };

    res.json({
      periods: {
        today: { date: todayStr, sales: todaySales, fish: todayFish, suppliers: todaySuppliers, purchases_total: await getPurchaseTotal(todayStr, todayStr) },
        yesterday: { date: yesterdayStr, sales: yesterdaySales, fish: yesterdayFish, suppliers: yesterdaySuppliers, purchases_total: await getPurchaseTotal(yesterdayStr, yesterdayStr) },
        month: { date: `${monthStart} ~ ${monthEnd}`, sales: monthSalesAgg, fish: monthFish, suppliers: monthSuppliers, purchases_total: await getPurchaseTotal(monthStart, monthEnd) },
      },
      fishTypes: allFishTypes.map(f => ({ id: f.id, name: f.name })),
    });
  } catch (err) {
    next(err);
  }
};
