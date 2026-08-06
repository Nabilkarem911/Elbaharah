const ALL_PAGES = [
  { key: 'dashboard', label: 'الداشبورد', adminOnly: false },
  { key: 'daily-closing', label: 'الإقفال اليومي', adminOnly: false },
  { key: 'daily-report', label: 'التقرير اليومي', adminOnly: false },
  { key: 'pos-machines', label: 'الموازنات', adminOnly: false },
  { key: 'monthly-summary', label: 'الملخص الشهري', adminOnly: false },
  { key: 'fish-cost', label: 'تكلفة المنتج', adminOnly: false },
  { key: 'suppliers', label: 'الموردين', adminOnly: false },
  { key: 'purchases', label: 'المشتريات', adminOnly: false },
  { key: 'purchase-custody', label: 'عهدة مشتريات', adminOnly: false },
  { key: 'inventory', label: 'الجرد', adminOnly: false },
  { key: 'statistics', label: 'الإحصائيات', adminOnly: false },
  { key: 'fish-waste', label: 'هدر المنتج', adminOnly: false },
  { key: 'expenses', label: 'المصروفات', adminOnly: false },
  { key: 'other-sales', label: 'مبيعات أخرى', adminOnly: false },
  { key: 'credit-sales', label: 'مبيعات آجل', adminOnly: false },
  { key: 'credit-settlement', label: 'تسوية آجل', adminOnly: false },
  { key: 'cancelled-invoices', label: 'الفواتير الملغية', adminOnly: false },
  { key: 'reports', label: 'التقارير', adminOnly: false },
  { key: 'branches', label: 'الفروع', adminOnly: true },
  { key: 'users', label: 'المستخدمين', adminOnly: true },
  { key: 'settings', label: 'الإعدادات', adminOnly: true },
];

const PAGE_KEYS = ALL_PAGES.map(p => p.key);

const TEMPLATE_PAGES = {
  fish_restaurant: PAGE_KEYS,
  restaurant: PAGE_KEYS,
  honey_shop: PAGE_KEYS,
  retail: PAGE_KEYS,
  bakery: PAGE_KEYS,
  custom: PAGE_KEYS,
  simple: [
    'dashboard',
    'daily-closing',
    'expenses',
    'purchase-custody',
    'reports',
    'branches',
    'users',
  ],
};

function getDefaultPages(activityType) {
  return TEMPLATE_PAGES[activityType] || TEMPLATE_PAGES.custom;
}

function getEffectivePages(enabledPages, activityType) {
  if (enabledPages && Array.isArray(enabledPages) && enabledPages.length > 0) {
    return enabledPages;
  }
  return getDefaultPages(activityType);
}

module.exports = { ALL_PAGES, PAGE_KEYS, TEMPLATE_PAGES, getDefaultPages, getEffectivePages };
