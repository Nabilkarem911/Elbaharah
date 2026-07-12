<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/reports" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <PageHeader title="تقرير الآجل" subtitle="مستحقات ومسدد" />
    </div>

    <div class="card p-4">
      <DateRangePicker v-model:start-date="filters.start" v-model:end-date="filters.end" @change="load" />
    </div>

    <div v-if="data" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-xs text-gray-500">إجمالي المستحق</p>
          <p class="text-xl font-bold text-primary-500 tabular-nums">{{ fmt(data.summary.total_due) }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">المسدد</p>
          <p class="text-xl font-bold text-success tabular-nums">{{ fmt(data.summary.total_paid) }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">غير المسدد</p>
          <p class="text-xl font-bold text-danger tabular-nums">{{ fmt(data.summary.total_unpaid) }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">إجمالي الأرصدة</p>
          <p class="text-xl font-bold tabular-nums">{{ fmt(data.summary.total_balance) }}</p>
        </div>
      </div>

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
  { key: 'company_name', label: 'الشركة', sortable: true },
  { key: 'phone', label: 'الهاتف' },
  { key: 'sales_count', label: 'عدد العمليات', type: 'number' },
  { key: 'period_due', label: 'المستحق', type: 'currency', sortable: true },
  { key: 'period_paid', label: 'المسدد', type: 'currency', sortable: true },
  { key: 'period_unpaid', label: 'غير المسدد', type: 'currency', sortable: true },
  { key: 'current_balance', label: 'الرصيد الحالي', type: 'currency', sortable: true },
];

const fmt = (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

const load = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.start) params.start_date = filters.start;
    if (filters.end) params.end_date = filters.end;
    const { data: res } = await api.get('/reports/credit', { params });
    data.value = res;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>
