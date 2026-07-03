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
      { path: 'purchases/new', name: 'purchase-new', component: () => import('../views/purchases/PurchaseFormView.vue') },
      { path: 'purchases/:id/edit', name: 'purchase-edit', component: () => import('../views/purchases/PurchaseFormView.vue') },
      { path: 'purchases/:id', name: 'purchase-detail', component: () => import('../views/purchases/PurchaseDetailView.vue') },
      { path: 'statistics', name: 'statistics', component: () => import('../views/statistics/StatisticsView.vue') },
      { path: 'expenses', name: 'expenses', component: () => import('../views/expenses/ExpensesView.vue') },
      { path: 'other-sales', name: 'other-sales', component: () => import('../views/other-sales/OtherSalesView.vue') },
      { path: 'credit-sales', name: 'credit-sales', component: () => import('../views/credit/CreditSalesView.vue') },
      { path: 'credit-settlement', name: 'credit-settlement', component: () => import('../views/credit/CreditSettlementView.vue') },
      { path: 'cancelled-invoices', name: 'cancelled-invoices', component: () => import('../views/cancelled/CancelledInvoicesView.vue') },
      { path: 'reports', name: 'reports', component: () => import('../views/reports/ReportsHubView.vue') },
      { path: 'reports/sales', name: 'report-sales', component: () => import('../views/reports/SalesReportView.vue') },
      { path: 'reports/fish', name: 'report-fish', component: () => import('../views/reports/FishReportView.vue') },
      { path: 'reports/delivery', name: 'report-delivery', component: () => import('../views/reports/DeliveryReportView.vue') },
      { path: 'reports/suppliers', name: 'report-suppliers', component: () => import('../views/reports/SuppliersReportView.vue') },
      { path: 'reports/expenses', name: 'report-expenses', component: () => import('../views/reports/ExpensesReportView.vue') },
      { path: 'reports/profit', name: 'report-profit', component: () => import('../views/reports/ProfitReportView.vue') },
      { path: 'reports/pos', name: 'report-pos', component: () => import('../views/reports/PosReportView.vue') },
      { path: 'reports/credit', name: 'report-credit', component: () => import('../views/reports/CreditReportView.vue') },
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
    return next('/dashboard');
  }
  next();
});

export default router;
