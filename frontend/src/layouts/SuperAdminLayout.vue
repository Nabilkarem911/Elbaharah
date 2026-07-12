<template>
  <div class="min-h-screen bg-gray-50 flex" dir="rtl">
    <!-- Sidebar -->
    <aside
      class="fixed lg:static inset-y-0 right-0 z-40 w-64 bg-slate-800 text-white transform transition-transform duration-300 lg:translate-x-0"
      :class="mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
          <div class="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <Shield class="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 class="font-bold text-base leading-tight">لوحة التحكم</h1>
            <p class="text-xs text-slate-400">المدير العام</p>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            :class="isActive(item.path)
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'"
            @click="mobileSidebarOpen = false"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <!-- User -->
        <div class="px-3 py-4 border-t border-slate-700">
          <div class="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-700/50">
            <div class="w-9 h-9 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <User class="w-5 h-5 text-indigo-300" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ auth.user?.full_name }}</p>
              <p class="text-xs text-slate-400">super admin</p>
            </div>
            <button @click="logout" class="p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
              <LogOut class="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div
      v-if="mobileSidebarOpen"
      class="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
      @click="mobileSidebarOpen = false"
    />

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
        <div class="flex items-center gap-3">
          <button @click="mobileSidebarOpen = !mobileSidebarOpen" class="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu class="w-5 h-5 text-slate-600" />
          </button>
          <h2 class="font-bold text-slate-700 text-base lg:text-lg">{{ pageTitle }}</h2>
        </div>
      </header>

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
import { computed, reactive, provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { Shield, Building2, User, LogOut, Menu } from 'lucide-vue-next';
import ToastNotification from '../components/ToastNotification.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const mobileSidebarOpen = ref(false);

const navItems = [
  { path: '/super-admin/organizations', label: 'المنشآت', icon: Building2 },
];

const isActive = (path) => route.path === path || route.path.startsWith(path + '/');

const pageTitle = computed(() => {
  const item = navItems.find(i => isActive(i.path));
  return item?.label || 'لوحة التحكم';
});

const logout = () => {
  auth.logout();
  router.push('/login');
};

const toast = reactive({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => { toast.show = false; }, 3000);
};
provide('toast', showToast);
</script>
