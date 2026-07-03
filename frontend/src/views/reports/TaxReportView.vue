<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/reports" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <PageHeader title="تقرير الضريبة" subtitle="ضريبة القيمة المضافة" />
    </div>

    <div class="card p-4">
      <DateRangePicker v-model:start-date="filters.start" v-model:end-date="filters.end" @change="load" />
    </div>

    <div v-if="data" class="space-y-6">
      <div class="card p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Calculator class="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 class="font-bold text-primary-500">نسبة الضريبة: {{ data.summary.tax_rate }}%</h3>
            <p class="text-xs text-gray-500">ضريبة القيمة المضافة</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-3">
            <div class="flex justify-between p-3 bg-primary-50 rounded-xl">
              <span class="text-sm text-gray-600">المبيعات (شامل الضريبة)</span>
              <span class="font-bold text-primary-500 tabular-nums">{{ fmt(data.summary.total_sales) }}</span>
            </div>
            <div class="flex justify-between p-3 bg-primary-50 rounded-xl">
              <span class="text-sm text-gray-600">المبيعات (بدون ضريبة)</span>
              <span class="font-bold tabular-nums">{{ fmt(data.summary.sales_excluding_tax) }}</span>
            </div>
            <div class="flex justify-between p-3 bg-green-50 rounded-xl">
              <span class="text-sm text-gray-600">ضريبة المبيعات (الصادرة)</span>
              <span class="font-bold text-success tabular-nums">{{ fmt(data.summary.output_tax) }}</span>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between p-3 bg-red-50 rounded-xl">
              <span class="text-sm text-gray-600">المشتريات (شامل الضريبة)</span>
              <span class="font-bold text-danger tabular-nums">{{ fmt(data.summary.total_purchases) }}</span>
            </div>
            <div class="flex justify-between p-3 bg-red-50 rounded-xl">
              <span class="text-sm text-gray-600">المشتريات (بدون ضريبة)</span>
              <span class="font-bold tabular-nums">{{ fmt(data.summary.purchases_excluding_tax) }}</span>
            </div>
            <div class="flex justify-between p-3 bg-orange-50 rounded-xl">
              <span class="text-sm text-gray-600">ضريبة المشتريات (المستحقة)</span>
              <span class="font-bold text-orange-600 tabular-nums">{{ fmt(data.summary.input_tax) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-4 p-4 rounded-xl" :class="data.summary.net_tax >= 0 ? 'bg-green-100' : 'bg-red-100'">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-600">صافي الضريبة المستحقة للدفع</p>
              <p class="text-xs text-gray-400">ضريبة المبيعات - ضريبة المشتريات</p>
            </div>
            <p class="text-2xl font-bold tabular-nums" :class="data.summary.net_tax >= 0 ? 'text-success' : 'text-danger'">
              {{ fmt(data.summary.net_tax) }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="loading" class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ArrowRight, Calculator } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DateRangePicker from '../../components/DateRangePicker.vue';
import api from '../../api';

const data = ref(null);
const loading = ref(false);
const filters = reactive({ start: '', end: '' });

const fmt = (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

const load = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.start) params.start_date = filters.start;
    if (filters.end) params.end_date = filters.end;
    const { data: res } = await api.get('/reports/tax', { params });
    data.value = res;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>
