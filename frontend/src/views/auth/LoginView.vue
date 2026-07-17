<template>
  <div class="min-h-screen flex" dir="rtl">
    <!-- Left: Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 right-10 w-72 h-72 rounded-full bg-gold blur-3xl"></div>
        <div class="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-primary-300 blur-3xl"></div>
        <div class="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-gold/50 blur-3xl"></div>
      </div>
      <div class="relative z-10 flex flex-col justify-center px-16 text-white">
        <div class="mb-8 flex items-center gap-4">
          <img src="/logo.png" alt="شعار النظام" class="w-20 h-20 rounded-2xl object-contain shadow-2xl bg-white/10 p-2" />
          <div>
            <h1 class="text-3xl font-bold">ERP البحارة</h1>
            <p class="text-gold text-sm font-medium mt-1">منصة إدارة المنشآت المتكاملة</p>
          </div>
        </div>
        <p class="text-lg text-primary-100 mb-10 leading-relaxed">
          نظام سحابي متكامل لإدارة منشآتك بكفاءة — مبيعات، مشتريات، مخزون، موردين، مصروفات، وتقارير شاملة في مكان واحد
        </p>
        <div class="space-y-4">
          <div v-for="feature in features" :key="feature" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <component :is="feature.icon" class="w-5 h-5 text-gold" />
            </div>
            <div>
              <span class="text-white font-medium text-sm">{{ feature.title }}</span>
              <p class="text-primary-200 text-xs mt-0.5">{{ feature.desc }}</p>
            </div>
          </div>
        </div>
        <div class="mt-12 pt-6 border-t border-white/10">
          <div class="flex items-center gap-6 text-primary-200">
            <div class="flex items-center gap-2">
              <Shield class="w-4 h-4 text-gold" />
              <span class="text-xs">آمن وموثوق</span>
            </div>
            <div class="flex items-center gap-2">
              <Cloud class="w-4 h-4 text-gold" />
              <span class="text-xs">سحابي 24/7</span>
            </div>
            <div class="flex items-center gap-2">
              <Smartphone class="w-4 h-4 text-gold" />
              <span class="text-xs">يعمل على كل الأجهزة</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Login Form -->
    <div class="flex-1 flex items-center justify-center p-6 bg-gray-50">
      <div class="w-full max-w-md">
        <!-- Mobile logo -->
        <div class="lg:hidden flex flex-col items-center mb-8">
          <img src="/logo.png" alt="شعار النظام" class="w-16 h-16 rounded-2xl object-contain mb-3 shadow-lg" />
          <h1 class="text-xl font-bold text-primary-500">ERP البحارة</h1>
          <p class="text-xs text-gold font-medium mt-1">منصة إدارة المنشآت المتكاملة</p>
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
              ERP البحارة — منصة إدارة المنشآت المتكاملة
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
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2,
  Wallet, ShoppingCart, BarChart3, FileText, Shield, Cloud, Smartphone,
  Building2, Package } from 'lucide-vue-next';

const router = useRouter();
const auth = useAuthStore();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);
const error = ref('');

const features = [
  { icon: Building2, title: 'إدارة متعددة المنشآت', desc: 'تحكم كامل في كل منشآتك من مكان واحد' },
  { icon: Wallet, title: 'حركة مالية يومية', desc: 'متابعة كل قنوات البيع والمصروفات' },
  { icon: ShoppingCart, title: 'مشتريات وموردين', desc: 'إدارة المشتريات والموردين بالتفصيل' },
  { icon: Package, title: 'مخزون وجرد شهري', desc: 'تتبع المخزون ورصيد بداية ونهاية الشهر' },
  { icon: BarChart3, title: 'إحصائيات وتقارير', desc: 'لوحات تحكم وتقارير شاملة' },
  { icon: FileText, title: 'تصدير احترافي', desc: 'تصدير التقارير PDF و Excel' },
];

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    const data = await auth.login(username.value, password.value);
    if (data.user.role === 'super_admin') {
      router.push('/super-admin');
    } else {
      router.push('/dashboard');
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'حدث خطأ — يرجى المحاولة مرة أخرى';
  } finally {
    loading.value = false;
  }
};
</script>
