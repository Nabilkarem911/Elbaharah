<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/reports" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <PageHeader title="تقرير المصروفات" subtitle="مصروفات بالتصنيف" />
    </div>

    <div class="card p-4">
      <DateRangePicker v-model:start-date="filters.start" v-model:end-date="filters.end" @change="load" />
    </div>

    <div v-if="data" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="card p-4">
          <p class="text-xs text-gray-500">إجمالي المصروفات</p>
          <p class="text-xl font-bold text-danger tabular-nums">{{ fmt(data.summary.total) }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">عدد المصروفات</p>
          <p class="text-xl font-bold tabular-nums">{{ data.summary.count }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">عدد التصنيفات</p>
          <p class="text-xl font-bold tabular-nums">{{ data.summary.categories_count }}</p>
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
  { key: 'name', label: 'التصنيف', sortable: true },
  { key: 'count', label: 'عدد المصروفات', type: 'number', sortable: true },
  { key: 'total', label: 'الإجمالي', type: 'currency', sortable: true },
  { key: 'by_method.cash', label: 'نقدي', type: 'currency' },
  { key: 'by_method.credit', label: 'آجل', type: 'currency' },
  { key: 'by_method.transfer', label: 'تحويل', type: 'currency' },
];

const fmt = (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

const load = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.start) params.start_date = filters.start;
    if (filters.end) params.end_date = filters.end;
    const { data: res } = await api.get('/reports/expenses', { params });
    data.value = res;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>
