<template>
  <div class="space-y-6">
    <PageHeader title="الملخص الشهري" subtitle="جرد الأسماك وبيان النفقات" />

    <div class="card p-4 flex items-center gap-3">
      <label class="text-sm font-medium text-primary-500">اختر الشهر:</label>
      <input type="month" v-model="selectedMonth" class="input !py-1.5 text-sm w-auto" @change="loadData" />
    </div>

    <!-- Fish Inventory -->
    <div>
      <h3 class="font-bold text-primary-500 text-base mb-3">جرد الأسماك</h3>
      <DataTable :data="inventory" :columns="inventoryColumns" />
    </div>

    <!-- Expenses -->
    <div>
      <h3 class="font-bold text-primary-500 text-base mb-3">بيان النفقات</h3>
      <DataTable :data="expenseSummary" :columns="expenseColumns" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const inventory = ref([]);
const expenseSummary = ref([]);

const inventoryColumns = [
  { key: 'fishType', label: 'نوع السمك' },
  { key: 'avg_price_per_kilo', label: 'متوسط السعر', type: 'currency' },
  { key: 'opening_balance_kg', label: 'رصيد أول المدة', type: 'weight' },
  { key: 'total_incoming_kg', label: 'الوارد', type: 'weight' },
  { key: 'waste_kg', label: 'الهدر', type: 'weight' },
  { key: 'closing_balance_kg', label: 'رصيد آخر المدة', type: 'weight' },
  { key: 'cogs', label: 'تكلفة البضاعة المباعة', type: 'currency' },
];

const expenseColumns = [
  { key: 'code', label: 'الرمز', sortable: true },
  { key: 'name', label: 'البيان' },
  { key: 'amount', label: 'المبلغ', type: 'currency', sortable: true },
];

const loadData = async () => {
  try {
    const month = selectedMonth.value + '-01';
    const { data } = await api.get(`/fish-inventory`, { params: { month_year: month, limit: 100 } });
    inventory.value = (data.data || data).map(i => ({ ...i, fishType: i.fishType?.name || '—' }));
  } catch {}
  try {
    const { data } = await api.get('/expenses', { params: { limit: 500 } });
    const map = {};
    (data.data || data).forEach(e => {
      const cat = e.category;
      if (cat) {
        if (!map[cat.id]) map[cat.id] = { code: cat.code, name: cat.name, amount: 0 };
        map[cat.id].amount += Number(e.amount);
      }
    });
    expenseSummary.value = Object.values(map).sort((a, b) => a.code - b.code);
  } catch {}
};

onMounted(loadData);
</script>
