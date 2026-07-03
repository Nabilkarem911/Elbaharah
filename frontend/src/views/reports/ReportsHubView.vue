<template>
  <div class="space-y-6">
    <PageHeader title="مركز التقارير" subtitle="تقارير شاملة بفلترة زمنية وتصدير" />

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="r in reportTypes"
        :key="r.key"
        class="card p-5 cursor-pointer hover:shadow-card-hover transition-all group"
        @click="generateReport(r.key)"
      >
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center" :class="r.bg">
            <component :is="r.icon" class="w-5 h-5" :class="r.color" />
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-primary-500 text-sm group-hover:text-primary-600">{{ r.title }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ r.desc }}</p>
          </div>
          <ChevronLeft class="w-4 h-4 text-gray-300 group-hover:text-primary-400" />
        </div>
      </div>
    </div>

    <div class="card p-5">
      <div class="flex items-center gap-3 mb-4">
        <Calendar class="w-5 h-5 text-primary-400" />
        <h3 class="font-bold text-primary-500">الفترة الزمنية</h3>
      </div>
      <DateRangePicker
        v-model:start-date="dateRange.start"
        v-model:end-date="dateRange.end"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, inject } from 'vue';
import { useRouter } from 'vue-router';
import {
  Wallet, Fish, Truck, Users, Receipt, TrendingUp, CreditCard, Clock, Calculator, ChevronLeft, Calendar,
} from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DateRangePicker from '../../components/DateRangePicker.vue';

const toast = inject('toast');
const router = useRouter();
const dateRange = reactive({ start: '', end: '' });

const reportTypes = [
  { key: 'sales', title: 'تقرير المبيعات', desc: 'مبيعات يومية/شهرية بالتفصيل', icon: Wallet, bg: 'bg-primary-50', color: 'text-primary-500' },
  { key: 'fish', title: 'تقرير الأسماك', desc: 'مشتريات، أسعار، أوزان', icon: Fish, bg: 'bg-gold/10', color: 'text-gold-dark' },
  { key: 'delivery', title: 'تقرير التوصيل', desc: 'مبيعات كل تطبيق', icon: Truck, bg: 'bg-blue-50', color: 'text-blue-600' },
  { key: 'suppliers', title: 'تقرير الدلالين', desc: 'حساب كل دلال', icon: Users, bg: 'bg-purple-50', color: 'text-purple-600' },
  { key: 'expenses', title: 'تقرير المصروفات', desc: 'مصروفات بالتصنيف', icon: Receipt, bg: 'bg-red-50', color: 'text-red-600' },
  { key: 'profit', title: 'تقرير الأرباح', desc: 'صافي الربح', icon: TrendingUp, bg: 'bg-green-50', color: 'text-success' },
  { key: 'pos', title: 'تقرير الموازنات', desc: 'حركة كل ماكينة', icon: CreditCard, bg: 'bg-indigo-50', color: 'text-indigo-600' },
  { key: 'credit', title: 'تقرير الآجل', desc: 'مستحقات ومسدد', icon: Clock, bg: 'bg-yellow-50', color: 'text-yellow-600' },
  { key: 'tax', title: 'تقرير الضريبة', desc: 'ضريبة القيمة المضافة', icon: Calculator, bg: 'bg-gray-100', color: 'text-gray-600' },
];

const generateReport = (key) => {
  const query = {};
  if (dateRange.start) query.start_date = dateRange.start;
  if (dateRange.end) query.end_date = dateRange.end;
  router.push({ path: `/reports/${key}`, query });
};
</script>
