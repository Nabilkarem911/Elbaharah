<template>
  <div class="min-h-screen bg-gray-50 flex" dir="rtl">
    <!-- Sidebar -->
    <aside
      class="fixed lg:static inset-y-0 right-0 z-40 w-64 bg-primary-500 text-white transform transition-transform duration-300 lg:translate-x-0"
      :class="mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center gap-3 px-5 py-5 border-b border-primary-400/30">
          <img src="/logo.png" alt="شعار" class="w-12 h-12 rounded-xl object-contain flex-shrink-0" />
          <div>
            <h1 class="font-bold text-base leading-tight">بيت الأسماك</h1>
            <p class="text-xs text-primary-200">نظام الإدارة</p>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
            :class="isActive(item.path)
              ? 'bg-gold text-primary-700 shadow-sm'
              : 'text-primary-100 hover:bg-primary-400/30 hover:text-white'"
            @click="closeMobileSidebar"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span>{{ item.label }}</span>
            <span v-if="item.badge" class="mr-auto px-1.5 py-0.5 rounded-full text-[10px] bg-gold/20 text-gold">
              {{ item.badge }}
            </span>
          </router-link>
        </nav>

        <!-- User -->
        <div class="px-3 py-4 border-t border-primary-400/30">
          <div class="flex items-center gap-3 px-3 py-2 rounded-xl bg-primary-400/20">
            <div class="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
              <User class="w-5 h-5 text-gold" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ auth.user?.full_name }}</p>
              <p class="text-xs text-primary-200">{{ roleLabel }}</p>
            </div>
            <button @click="logout" class="p-1.5 rounded-lg hover:bg-primary-400/30 transition-colors">
              <LogOut class="w-4 h-4 text-primary-200" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div
      v-if="mobileSidebarOpen"
      class="fixed inset-0 z-30 bg-primary-900/40 backdrop-blur-sm lg:hidden"
      @click="closeMobileSidebar"
    />

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Impersonation bar -->
      <div
        v-if="auth.isImpersonating"
        class="bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-sm"
      >
        <div class="flex items-center gap-2">
          <ShieldAlert class="w-4 h-4" />
          <span>أنت تعمل كأدمن منشأة: {{ auth.user?.full_name }}</span>
        </div>
        <button
          @click="backToSuperAdmin"
          class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-medium"
        >
          <ArrowRight class="w-4 h-4" />
          <span>العودة للوحة التحكم</span>
        </button>
      </div>

      <!-- Navbar -->
      <header class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <button @click="toggleMobileSidebar" class="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu class="w-5 h-5 text-primary-500" />
          </button>
          <h2 class="font-bold text-primary-500 text-base lg:text-lg">{{ pageTitle }}</h2>
        </div>
        <div class="flex items-center gap-2">
          <!-- Branch switcher -->
          <select
            v-if="branches.length > 1"
            v-model="currentBranchId"
            @change="switchBranch"
            class="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-500 text-sm font-medium border-0 outline-none cursor-pointer"
          >
            <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50">
            <Calendar class="w-4 h-4 text-primary-400" />
            <span class="text-sm text-primary-500 font-medium">{{ todayLabel }}</span>
          </div>
          <div class="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center">
            <Bell class="w-4 h-4 text-primary-400" />
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 p-4 lg:p-6 overflow-x-hidden">
        <router-view />
      </main>
    </div>

    <!-- Toast -->
    <ToastNotification
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup>
import { computed, reactive, provide, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { useUiStore } from '../stores/ui.store';
import api from '../api';
import {
  LayoutDashboard, Wallet, CreditCard, ClipboardList, Fish as FishIcon,
  Users, ShoppingCart, BarChart3, Receipt, FileX, FileText, Settings, User,
  LogOut, Menu, Bell, Calendar, Store, CreditCard as CreditIcon, DollarSign, Trash2,
  GitBranch, ShieldAlert, ArrowRight,
} from 'lucide-vue-next';
import ToastNotification from '../components/ToastNotification.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const { mobileSidebarOpen } = storeToRefs(ui);
const { toggleMobileSidebar, closeMobileSidebar } = ui;

const orgLabels = ref({});
const orgName = ref('');
const branches = ref([]);
const currentBranchId = ref(auth.user?.branch_id || null);

const fetchOrgInfo = async () => {
  try {
    const { data } = await api.get('/me/org');
    orgLabels.value = data.labels || {};
    orgName.value = data.organization?.name || '';
    if (data.organization?.branches) {
      branches.value = data.organization.branches;
    }
  } catch (e) {
    // ignore — use defaults
  }
};

const L = (key, fallback) => orgLabels.value[key] || fallback;

const navItems = computed(() => {
  const items = [
    { path: '/dashboard', label: 'الداشبورد', icon: LayoutDashboard },
    { path: '/daily-report', label: 'التقرير اليومي', icon: ClipboardList },
    { path: '/financial-movement', label: 'الحركة المالية', icon: Wallet },
    { path: '/pos-machines', label: 'الموازنات', icon: CreditCard },
    { path: '/monthly-summary', label: 'الملخص الشهري', icon: ClipboardList },
    { path: '/fish-cost', label: L('product_cost', 'تكلفة السمك'), icon: FishIcon },
    { path: '/suppliers', label: L('suppliers', 'الدلالين'), icon: Users },
    { path: '/purchases', label: 'المشتريات', icon: ShoppingCart },
    { path: '/purchase-custody', label: 'عهدة مشتريات', icon: Wallet },
    { path: '/inventory', label: 'الجرد', icon: FishIcon },
    { path: '/statistics', label: 'الإحصائيات', icon: BarChart3 },
    { path: '/fish-waste', label: L('product_waste', 'هدر الأسماك'), icon: Trash2 },
    { path: '/expenses', label: 'المصروفات', icon: Receipt },
    { path: '/other-sales', label: 'مبيعات أخرى', icon: Store },
    { path: '/credit-sales', label: 'مبيعات آجل', icon: CreditIcon },
    { path: '/credit-settlement', label: 'تسوية آجل', icon: DollarSign },
    { path: '/cancelled-invoices', label: 'الفواتير الملغية', icon: FileX },
    { path: '/reports', label: 'التقارير', icon: FileText },
  ];
  if (auth.isAdmin) {
    items.push({ path: '/users', label: 'المستخدمين', icon: User });
    items.push({ path: '/settings', label: 'الإعدادات', icon: Settings });
  }
  return items;
});

const isActive = (path) => route.path === path || route.path.startsWith(path + '/');

const pageTitle = computed(() => {
  const item = navItems.value.find(i => isActive(i.path));
  return item?.label || orgName.value || 'النظام';
});

const roleLabel = computed(() => ({
  super_admin: 'مدير عام',
  admin: 'مدير عام',
  manager: 'محاسب',
  cashier: 'كاشير',
  accountant: 'محاسب',
}[auth.user?.role] || ''));

const todayLabel = computed(() => {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const d = new Date();
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
});

const logout = () => {
  auth.logout();
  router.push('/login');
};

const backToSuperAdmin = () => {
  auth.restoreSuperAdmin();
  router.push('/super-admin/organizations');
};

const switchBranch = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.branch_id = currentBranchId.value;
  localStorage.setItem('user', JSON.stringify(user));
  auth.user = user;
  window.location.reload();
};

// Toast system
const toast = reactive({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => { toast.show = false; }, 3000);
};
provide('toast', showToast);

onMounted(fetchOrgInfo);
</script>
