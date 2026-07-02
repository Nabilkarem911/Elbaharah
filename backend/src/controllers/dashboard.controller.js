const { DailySale, Purchase, Expense, DeliveryOrder, Supplier, PurchaseItem, FishType } = require('../models');
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
