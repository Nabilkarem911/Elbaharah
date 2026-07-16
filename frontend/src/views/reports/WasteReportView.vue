<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/reports" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <PageHeader :title="`تقرير ${L('product_waste', 'هدر الأسماك')}`" subtitle="تحليل الهدر حسب النوع والسبب" />
    </div>

    <div class="card p-4">
      <DateRangePicker v-model:start-date="filters.start" v-model:end-date="filters.end" @change="load" />
    </div>

    <div v-if="data" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-xs text-gray-500">إجمالي الوزن المهدر</p>
          <p class="text-xl font-bold text-danger tabular-nums">{{ Number(data.summary.total_weight).toFixed(3) }} كجم</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">إجمالي التكلفة</p>
          <p class="text-xl font-bold text-warning tabular-nums">{{ fmt(data.summary.total_cost) }} ر.س</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">عدد السجلات</p>
          <p class="text-xl font-bold text-primary-500">{{ data.summary.count }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500">{{ L('product_type', 'أنواع السمك') }}</p>
          <p class="text-xl font-bold text-primary-500">{{ data.summary.fish_types_count }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 class="font-bold text-primary-500 mb-3">الهدر حسب {{ L('product_type', 'نوع السمك') }}</h3>
          <DataTable :data="data.byFish" :columns="fishColumns" :per-page="20" />
        </div>
        <div>
          <h3 class="font-bold text-primary-500 mb-3">الهدر حسب السبب</h3>
          <DataTable :data="data.byReason" :columns="reasonColumns" :per-page="20" />
        </div>
      </div>

      <div>
        <h3 class="font-bold text-primary-500 mb-3">تفاصيل السجلات</h3>
        <DataTable :data="data.details" :columns="detailColumns" :per-page="20" searchable>
          <template #cell-fishType="{ value }">
            {{ value?.name || '—' }}
          </template>
        </DataTable>
      </div>
    </div>
    <div v-else-if="loading" class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ArrowRight } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import DateRangePicker from '../../components/DateRangePicker.vue';
import api from '../../api';
import { useOrgLabels } from '../../composables/useOrgLabels';

const { L } = useOrgLabels();

const data = ref(null);
const loading = ref(false);
const filters = reactive({ start: '', end: '' });

const fishColumns = computed(() => [
  { key: 'name', label: L('product_type', 'نوع السمك'), sortable: true },
  { key: 'total_weight', label: 'الوزن', type: 'weight', sortable: true },
  { key: 'total_cost', label: 'التكلفة', type: 'currency', sortable: true },
  { key: 'count', label: 'العدد', type: 'number' },
]);

const reasonColumns = [
  { key: 'reason', label: 'السبب', sortable: true },
  { key: 'total_weight', label: 'الوزن', type: 'weight', sortable: true },
  { key: 'total_cost', label: 'التكلفة', type: 'currency', sortable: true },
  { key: 'count', label: 'العدد', type: 'number' },
];

const detailColumns = computed(() => [
  { key: 'waste_date', label: 'التاريخ', sortable: true },
  { key: 'fishType', label: L('product_type', 'نوع السمك') },
  { key: 'weight', label: 'الوزن', type: 'weight', sortable: true },
  { key: 'total_cost', label: 'التكلفة', type: 'currency', sortable: true },
  { key: 'reason', label: 'السبب' },
]);

const fmt = (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

const load = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.start) params.start_date = filters.start;
    if (filters.end) params.end_date = filters.end;
    const { data: res } = await api.get('/reports/waste', { params });
    data.value = res;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>
