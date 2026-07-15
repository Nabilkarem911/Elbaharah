import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/super-admin',
    component: () => import('../layouts/SuperAdminLayout.vue'),
    meta: { auth: true, superAdmin: true },
    children: [
      { path: '', redirect: '/super-admin/organizations' },
      { path: 'organizations', name: 'sa-organizations', component: () => import('../views/super-admin/OrganizationsView.vue') },
      { path: 'organizations/:id', name: 'sa-organization-detail', component: () => import('../views/super-admin/OrganizationDetailView.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('../layouts/DashboardLayout.vue'),
    meta: { auth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: () => import('../views/dashboard/DashboardView.vue') },
      { path: 'financial-movement', name: 'financial', component: () => import('../views/financial/FinancialMovementView.vue') },
      { path: 'pos-machines', name: 'pos', component: () => import('../views/pos/PosMachinesView.vue') },
      { path: 'monthly-summary', name: 'monthly-summary', component: () => import('../views/monthly-summary/MonthlySummaryView.vue') },
      { path: 'fish-cost', name: 'fish-cost', component: () => import('../views/fish-cost/FishCostView.vue') },
      { path: 'suppliers', name: 'suppliers', component: () => import('../views/suppliers/SuppliersListView.vue') },
      { path: 'suppliers/:id', name: 'supplier-detail', component: () => import('../views/suppliers/SupplierDetailView.vue') },
      { path: 'purchases', name: 'purchases', component: () => import('../views/purchases/PurchasesListView.vue') },
      { path: 'purchase-custody', name: 'purchase-custody', component: () => import('../views/purchases/PurchaseCustodyView.vue') },
      { path: 'inventory', name: 'inventory', component: () => import('../views/inventory/InventoryView.vue') },
      { path: 'purchases/new', name: 'purchase-new', component: () => import('../views/purchases/PurchaseFormView.vue') },
      { path: 'purchases/:id/edit', name: 'purchase-edit', component: () => import('../views/purchases/PurchaseFormView.vue') },
      { path: 'purchases/:id', name: 'purchase-detail', component: () => import('../views/purchases/PurchaseDetailView.vue') },
      { path: 'fish-waste', name: 'fish-waste', component: () => import('../views/waste/FishWasteView.vue') },
      { path: 'statistics', name: 'statistics', component: () => import('../views/statistics/StatisticsView.vue') },
      { path: 'expenses', name: 'expenses', component: () => import('../views/expenses/ExpensesView.vue') },
      { path: 'other-sales', name: 'other-sales', component: () => import('../views/other-sales/OtherSalesView.vue') },
      { path: 'credit-sales', name: 'credit-sales', component: () => import('../views/credit/CreditSalesView.vue') },
      { path: 'credit-settlement', name: 'credit-settlement', component: () => import('../views/credit/CreditSettlementView.vue') },
      { path: 'cancelled-invoices', name: 'cancelled-invoices', component: () => import('../views/cancelled/CancelledInvoicesView.vue') },
      { path: 'reports', name: 'reports', component: () => import('../views/reports/ReportsHubView.vue') },
      { path: 'daily-report', name: 'daily-report', component: () => import('../views/reports/DailyReportView.vue') },
      { path: 'reports/sales', name: 'report-sales', component: () => import('../views/reports/SalesReportView.vue') },
      { path: 'reports/fish', name: 'report-fish', component: () => import('../views/reports/FishReportView.vue') },
      { path: 'reports/delivery', name: 'report-delivery', component: () => import('../views/reports/DeliveryReportView.vue') },
      { path: 'reports/suppliers', name: 'report-suppliers', component: () => import('../views/reports/SuppliersReportView.vue') },
      { path: 'reports/expenses', name: 'report-expenses', component: () => import('../views/reports/ExpensesReportView.vue') },
      { path: 'reports/profit', name: 'report-profit', component: () => import('../views/reports/ProfitReportView.vue') },
      { path: 'reports/pos', name: 'report-pos', component: () => import('../views/reports/PosReportView.vue') },
      { path: 'reports/waste', name: 'report-waste', component: () => import('../views/reports/WasteReportView.vue') },
      { path: 'reports/tax', name: 'report-tax', component: () => import('../views/reports/TaxReportView.vue') },
      { path: 'users', name: 'users', component: () => import('../views/users/UsersListView.vue') },
      { path: 'settings', name: 'settings', component: () => import('../views/settings/SettingsView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.auth && !auth.isAuthenticated) {
    return next('/login');
  }
  if (to.meta.guest && auth.isAuthenticated) {
    if (auth.isSuperAdmin) return next('/super-admin');
    return next('/dashboard');
  }
  if (to.meta.superAdmin && !auth.isSuperAdmin) {
    return next('/dashboard');
  }
  if (auth.isSuperAdmin && !to.path.startsWith('/super-admin') && !to.path.startsWith('/login')) {
    return next('/super-admin');
  }
  next();
});

export default router;
