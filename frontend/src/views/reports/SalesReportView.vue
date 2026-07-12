<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/reports" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <PageHeader title="تقرير المبيعات" subtitle="مبيعات يومية/شهرية بالتفصيل" />
    </div>

    <div class="card p-4">
      <DateRangePicker v-model:start-date="filters.start" v-model:end-date="filters.end" @change="load" />
    </div>

    <div v-if="data" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-xs text-gray-500">إجمالي المبيعات</p>
          <p class="text-xl font-bold text-primary-500 tabular-nums">{{ fmt(data.summary.total_sales) }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">صافي المبيعات</p>
          <p class="text-xl font-bold text-success tabular-nums">{{ fmt(data.summary.net_sales) }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">الصندوق</p>
          <p class="text-xl font-bold tabular-nums">{{ fmt(data.summary.cash_box) }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">مبيعات الشبكة</p>
          <p class="text-xl font-bold tabular-nums">{{ fmt(data.summary.network_sales) }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">آجل</p>
          <p class="text-xl font-bold tabular-nums">{{ fmt(data.summary.credit_sales) }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">تحويل بنكي</p>
          <p class="text-xl font-bold tabular-nums">{{ fmt(data.summary.bank_transfer) }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">توصيل</p>
          <p class="text-xl font-bold tabular-nums">{{ fmt(data.summary.delivery_sales) }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">فائض/عجز</p>
          <p class="text-xl font-bold tabular-nums" :class="data.summary.surplus_deficit >= 0 ? 'text-success' : 'text-danger'">{{ fmt(data.summary.surplus_deficit) }}</p>
        </div>
      </div>

      <!-- Details Table -->
      <DataTable :data="data.details" :columns="columns" :per-page="20" />
    </div>
    <div v-else-if="loading" class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ArrowRight } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import DateRangePicker from '../../components/DateRangePicker.vue';
import api from '../../api';

const data = ref(null);
const loading = ref(false);
const filters = reactive({ start: '', end: '' });

const columns = [
  { key: 'sale_date', label: 'التاريخ', sortable: true },
  { key: 'day_name', label: 'اليوم' },
  { key: 'total_sales', label: 'إجمالي', type: 'currency', sortable: true },
  { key: 'cash_box', label: 'صندوق', type: 'currency' },
  { key: 'credit_sales', label: 'آجل', type: 'currency' },
  { key: 'network_sales', label: 'شبكة', type: 'currency' },
  { key: 'bank_transfer', label: 'تحويل', type: 'currency' },
  { key: 'delivery_sales', label: 'توصيل', type: 'currency' },
  { key: 'net_sales', label: 'الصافي', type: 'currency', sortable: true },
  { key: 'surplus_deficit', label: 'فائض/عجز', type: 'currency', sortable: true },
];

const fmt = (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

const load = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.start) params.start_date = filters.start;
    if (filters.end) params.end_date = filters.end;
    const { data: res } = await api.get('/reports/sales', { params });
    data.value = res;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>
