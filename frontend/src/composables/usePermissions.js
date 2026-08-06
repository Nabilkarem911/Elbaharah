import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth.store';

const enabledPages = ref(null);
let loaded = false;

const PAGE_ROUTE_MAP = {
  'dashboard': '/dashboard',
  'daily-closing': '/financial-movement',
  'daily-report': '/daily-report',
  'pos-machines': '/pos-machines',
  'monthly-summary': '/monthly-summary',
  'fish-cost': '/fish-cost',
  'suppliers': '/suppliers',
  'purchases': '/purchases',
  'purchase-custody': '/purchase-custody',
  'inventory': '/inventory',
  'statistics': '/statistics',
  'fish-waste': '/fish-waste',
  'expenses': '/expenses',
  'other-sales': '/other-sales',
  'credit-sales': '/credit-sales',
  'credit-settlement': '/credit-settlement',
  'cancelled-invoices': '/cancelled-invoices',
  'reports': '/reports',
  'branches': '/branches',
  'users': '/users',
  'settings': '/settings',
};

const ROUTE_PAGE_MAP = Object.entries(PAGE_ROUTE_MAP).reduce((acc, [key, val]) => {
  acc[val] = key;
  return acc;
}, {});

export function resetPermissions() {
  enabledPages.value = null;
  loaded = false;
}

export function usePermissions() {
  const auth = useAuthStore();

  const userPages = computed(() => {
    if (auth.isSuperAdmin) return null;
    if (auth.isAdmin) return enabledPages.value;
    if (auth.user?.permissions && Array.isArray(auth.user.permissions) && auth.user.permissions.length > 0) {
      return auth.user.permissions.filter(p => enabledPages.value?.includes(p));
    }
    return enabledPages.value;
  });

  const canAccessPage = (pageKey) => {
    if (auth.isSuperAdmin) return true;
    if (!enabledPages.value) return true;
    if (!enabledPages.value.includes(pageKey)) return false;
    if (auth.isAdmin) return true;
    if (auth.user?.permissions && Array.isArray(auth.user.permissions) && auth.user.permissions.length > 0) {
      return auth.user.permissions.includes(pageKey);
    }
    return true;
  };

  const canAccessRoute = (routePath) => {
    const pageKey = ROUTE_PAGE_MAP[routePath];
    if (!pageKey) return true;
    return canAccessPage(pageKey);
  };

  const filterNavItems = (items) => {
    if (auth.isSuperAdmin) return items;
    if (!enabledPages.value) return items;
    return items.filter(item => {
      const pageKey = ROUTE_PAGE_MAP[item.path];
      if (!pageKey) return true;
      return canAccessPage(pageKey);
    });
  };

  return { enabledPages, userPages, canAccessPage, canAccessRoute, filterNavItems, PAGE_ROUTE_MAP };
}

export function loadEnabledPages() {
  if (loaded) return;
  loaded = true;
  const auth = useAuthStore();
  if (auth.isSuperAdmin) return;

  if (auth.user?.enabled_pages) {
    enabledPages.value = auth.user.enabled_pages;
    return;
  }

  import('../api').then(({ default: api }) => {
    api.get('/pages/available').then(({ data }) => {
      enabledPages.value = data.enabled_pages;
    }).catch(() => {
      enabledPages.value = null;
    });
  });
}
