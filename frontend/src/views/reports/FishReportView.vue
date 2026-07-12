<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/reports" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <PageHeader title="تقرير الأسماك" subtitle="مشتريات، أسعار، أوزان" />
    </div>

    <div class="card p-4">
      <DateRangePicker v-model:start-date="filters.start" v-model:end-date="filters.end" @change="load" />
    </div>

    <div v-if="data" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-xs text-gray-500">إجمالي الوزن</p>
          <p class="text-xl font-bold text-primary-500 tabular-nums">{{ Number(data.summary.total_weight).toFixed(3) }} كجم</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">إجمالي المبلغ</p>
          <p class="text-xl font-bold text-primary-500 tabular-nums">{{ fmt(data.summary.total_amount) }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">عدد الأنواع</p>
          <p class="text-xl font-bold tabular-nums">{{ data.summary.fish_types_count }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">عدد الفواتير</p>
          <p class="text-xl font-bold tabular-nums">{{ data.summary.purchases_count }}</p>
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
  { key: 'name', label: 'نوع السمك', sortable: true },
  { key: 'total_weight', label: 'إجمالي الوزن', type: 'weight', sortable: true },
  { key: 'total_amount', label: 'إجمالي المبلغ', type: 'currency', sortable: true },
  { key: 'avg_price', label: 'متوسط سعر الكيلو', type: 'currency', sortable: true },
  { key: 'purchases_count', label: 'عدد الفواتير', type: 'number' },
];

const fmt = (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

const load = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.start) params.start_date = filters.start;
    if (filters.end) params.end_date = filters.end;
    const { data: res } = await api.get('/reports/fish', { params });
    data.value = res;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>
