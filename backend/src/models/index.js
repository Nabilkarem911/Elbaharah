const sequelize = require('../config/database');
const User = require('./User');
const Supplier = require('./Supplier');
const FishType = require('./FishType');
const Purchase = require('./Purchase');
const PurchaseItem = require('./PurchaseItem');
const DailySale = require('./DailySale');
const PosMachine = require('./PosMachine');
const PosTransaction = require('./PosTransaction');
const FishInventory = require('./FishInventory');
const ExpenseCategory = require('./ExpenseCategory');
const Expense = require('./Expense');
const OtherSale = require('./OtherSale');
const CreditAccount = require('./CreditAccount');
const CreditSale = require('./CreditSale');
const DeliveryPlatform = require('./DeliveryPlatform');
const SaleChannel = require('./SaleChannel');
const DailySaleChannel = require('./DailySaleChannel');
const DeliveryOrder = require('./DeliveryOrder');
const CancelledInvoice = require('./CancelledInvoice');
const Setting = require('./Setting');
const FishWaste = require('./FishWaste');

// Associations
// User
User.hasMany(Purchase, { foreignKey: 'created_by', as: 'purchases' });
User.hasMany(DailySale, { foreignKey: 'created_by', as: 'dailySales' });
User.hasMany(Expense, { foreignKey: 'created_by', as: 'expenses' });
User.hasMany(CancelledInvoice, { foreignKey: 'created_by', as: 'cancelledInvoices' });

// Supplier → Purchases
Supplier.hasMany(Purchase, { foreignKey: 'supplier_id', as: 'purchases' });
Purchase.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

// Purchase → PurchaseItems
Purchase.hasMany(PurchaseItem, { foreignKey: 'purchase_id', as: 'items', onDelete: 'CASCADE' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchase_id', as: 'purchase' });
PurchaseItem.belongsTo(FishType, { foreignKey: 'fish_type_id', as: 'fishType' });
FishType.hasMany(PurchaseItem, { foreignKey: 'fish_type_id', as: 'purchaseItems' });

// FishType → FishInventory
FishType.hasMany(FishInventory, { foreignKey: 'fish_type_id', as: 'inventories' });
FishInventory.belongsTo(FishType, { foreignKey: 'fish_type_id', as: 'fishType' });

// FishType → FishWaste
FishType.hasMany(FishWaste, { foreignKey: 'fish_type_id', as: 'wastes' });
FishWaste.belongsTo(FishType, { foreignKey: 'fish_type_id', as: 'fishType' });

// DailySale
DailySale.hasMany(PosTransaction, { foreignKey: 'daily_sale_id', as: 'posTransactions' });
PosTransaction.belongsTo(DailySale, { foreignKey: 'daily_sale_id', as: 'dailySale' });
PosTransaction.belongsTo(PosMachine, { foreignKey: 'pos_machine_id', as: 'posMachine' });
PosMachine.hasMany(PosTransaction, { foreignKey: 'pos_machine_id', as: 'transactions' });

// DailySale → DeliveryOrders
DailySale.hasMany(DeliveryOrder, { foreignKey: 'daily_sale_id', as: 'deliveryOrders' });
DeliveryOrder.belongsTo(DailySale, { foreignKey: 'daily_sale_id', as: 'dailySale' });
DeliveryOrder.belongsTo(DeliveryPlatform, { foreignKey: 'delivery_platform_id', as: 'platform' });
DeliveryPlatform.hasMany(DeliveryOrder, { foreignKey: 'delivery_platform_id', as: 'orders' });

// DailySale → DailySaleChannels
DailySale.hasMany(DailySaleChannel, { foreignKey: 'daily_sale_id', as: 'saleChannels', onDelete: 'CASCADE' });
DailySaleChannel.belongsTo(DailySale, { foreignKey: 'daily_sale_id', as: 'dailySale' });
DailySaleChannel.belongsTo(SaleChannel, { foreignKey: 'sale_channel_id', as: 'channel' });
SaleChannel.hasMany(DailySaleChannel, { foreignKey: 'sale_channel_id', as: 'dailySaleChannels' });

// ExpenseCategory → Expenses
ExpenseCategory.hasMany(Expense, { foreignKey: 'category_id', as: 'expenses' });
Expense.belongsTo(ExpenseCategory, { foreignKey: 'category_id', as: 'category' });

// CreditAccount → CreditSales
CreditAccount.hasMany(CreditSale, { foreignKey: 'credit_account_id', as: 'creditSales' });
CreditSale.belongsTo(CreditAccount, { foreignKey: 'credit_account_id', as: 'account' });

module.exports = {
  sequelize,
  User,
  Supplier,
  FishType,
  Purchase,
  PurchaseItem,
  DailySale,
  PosMachine,
  PosTransaction,
  FishInventory,
  ExpenseCategory,
  Expense,
  OtherSale,
  CreditAccount,
  CreditSale,
  DeliveryPlatform,
  SaleChannel,
  DailySaleChannel,
  DeliveryOrder,
  CancelledInvoice,
  Setting,
  FishWaste,
};
