<template>
  <div class="min-h-screen flex" dir="rtl">
    <!-- Left: Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-primary-500 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 right-10 w-72 h-72 rounded-full bg-gold blur-3xl"></div>
        <div class="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-primary-300 blur-3xl"></div>
      </div>
      <div class="relative z-10 flex flex-col justify-center px-16 text-white">
        <div class="mb-6">
          <img src="/logo.png" alt="شعار أسماك البحارة" class="w-20 h-20 rounded-2xl object-contain shadow-lg" />
        </div>
        <h1 class="text-4xl font-bold mb-3">أسماك البحارة</h1>
        <p class="text-lg text-primary-200 mb-8 leading-relaxed">
          نظام إدارة متكامل لمطعم الأسماك — مبيعات، مشتريات، دلالين، مصروفات، تقارير شاملة
        </p>
        <div class="space-y-3">
          <div v-for="feature in features" :key="feature" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <component :is="feature.icon" class="w-4 h-4 text-gold" />
            </div>
            <span class="text-primary-100 text-sm">{{ feature.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Login Form -->
    <div class="flex-1 flex items-center justify-center p-6 bg-gray-50">
      <div class="w-full max-w-md">
        <!-- Mobile logo -->
        <div class="lg:hidden flex flex-col items-center mb-8">
          <img src="/logo.png" alt="شعار" class="w-16 h-16 rounded-2xl object-contain mb-3 shadow-lg" />
          <h1 class="text-xl font-bold text-primary-500">أسماك البحارة</h1>
        </div>

        <div class="card p-8">
          <h2 class="text-2xl font-bold text-primary-500 mb-2">تسجيل الدخول</h2>
          <p class="text-sm text-gray-500 mb-6">أدخل بياناتك للوصول إلى لوحة التحكم</p>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="label">اسم المستخدم</label>
              <div class="relative">
                <User class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="username"
                  type="text"
                  class="input !pr-10"
                  placeholder="أدخل اسم المستخدم"
                  :disabled="loading"
                />
              </div>
            </div>

            <div>
              <label class="label">كلمة المرور</label>
              <div class="relative">
                <Lock class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input !pr-10 !pl-10"
                  placeholder="أدخل كلمة المرور"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="rememberMe" class="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
                <span class="text-sm text-gray-600">تذكرني</span>
              </label>
            </div>

            <div v-if="error" class="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
              <AlertCircle class="w-4 h-4 flex-shrink-0" />
              <span>{{ error }}</span>
            </div>

            <button
              type="submit"
              class="btn-gold w-full !py-3 text-base"
              :disabled="loading"
            >
              <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
              <span>{{ loading ? 'جاري الدخول...' : 'دخول' }}</span>
            </button>
          </form>

          <div class="mt-6 pt-6 border-t border-gray-100">
            <p class="text-xs text-gray-400 text-center">
              بيانات تجريبية — admin / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { Fish, User, Lock, Eye, EyeOff, AlertCircle, Loader2,
  Wallet, ShoppingCart, BarChart3, FileText } from 'lucide-vue-next';

const router = useRouter();
const auth = useAuthStore();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);
const error = ref('');

const features = [
  { icon: Wallet, text: 'حركة مالية يومية بكل قنوات البيع' },
  { icon: ShoppingCart, text: 'مشتريات الأسماك من الدلالين بالتفصيل' },
  { icon: BarChart3, text: 'إحصائيات وتقارير شاملة' },
  { icon: FileText, text: 'تصدير احترافي PDF و Excel' },
];

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(username.value, password.value);
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error || 'حدث خطأ — يرجى المحاولة مرة أخرى';
  } finally {
    loading.value = false;
  }
};
</script>
