<template>
  <div class="space-y-6">
    <PageHeader title="الإحصائيات" subtitle="تجميع الأقلام والوزن والأسعار" />

    <div class="card p-4 flex flex-wrap items-center gap-3">
      <DateRangePicker
        v-model:start-date="filterStartDate"
        v-model:end-date="filterEndDate"
      />
      <select v-model="filterSupplier" class="input !py-1.5 text-sm w-auto">
        <option value="">كل الدلالين</option>
        <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <select v-model="filterFish" class="input !py-1.5 text-sm w-auto">
        <option value="">كل الأنواع</option>
        <option v-for="f in fishTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
      </select>
    </div>

    <DataTable :data="stats" :columns="columns" />
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import DateRangePicker from '../../components/DateRangePicker.vue';
import api from '../../api';

const toast = inject('toast');

const columns = [
  { key: 'supplier', label: 'الدلال' },
  { key: 'purchase_date', label: 'التاريخ', sortable: true },
  { key: 'fishType', label: 'نوع السمك' },
  { key: 'count', label: 'عدد الأقلام', type: 'number', sortable: true },
  { key: 'totalWeight', label: 'إجمالي الوزن', type: 'weight', sortable: true },
  { key: 'totalPrice', label: 'إجمالي القيمة', type: 'currency', sortable: true },
  { key: 'avgPrice', label: 'متوسط السعر', type: 'currency' },
  { key: 'avgWeight', label: 'متوسط الوزن', type: 'weight' },
];

const items = ref([]);
const suppliers = ref([]);
const fishTypes = ref([]);
const filterSupplier = ref('');
const filterFish = ref('');
const filterStartDate = ref('');
const filterEndDate = ref('');

const stats = computed(() => {
  let filtered = items.value;
  if (filterSupplier.value) filtered = filtered.filter(i => i.supplier_id == filterSupplier.value);
  if (filterFish.value) filtered = filtered.filter(i => i.fish_type_id == filterFish.value);
  if (filterStartDate.value) filtered = filtered.filter(i => i.purchase_date >= filterStartDate.value);
  if (filterEndDate.value) filtered = filtered.filter(i => i.purchase_date <= filterEndDate.value);

  const map = {};
  filtered.forEach(i => {
    const key = `${i.supplier_id}-${i.purchase_date}-${i.fish_type_id}`;
    if (!map[key]) {
      map[key] = {
        supplier: i.supplier, purchase_date: i.purchase_date, fishType: i.fishType,
        count: 0, totalWeight: 0, totalPrice: 0,
      };
    }
    map[key].count++;
    map[key].totalWeight += Number(i.weight);
    map[key].totalPrice += Number(i.total_price);
  });

  return Object.values(map).map(s => ({
    ...s,
    avgPrice: s.totalWeight > 0 ? s.totalPrice / s.totalWeight : 0,
    avgWeight: s.count > 0 ? s.totalWeight / s.count : 0,
  }));
});

onMounted(async () => {
  try {
    const [p, s, f] = await Promise.all([
      api.get('/purchases', { params: { limit: 500 } }),
      api.get('/suppliers', { params: { limit: 500 } }),
      api.get('/fish-types', { params: { limit: 500 } }),
    ]);
    const purchases = p.data.data || p.data;
    items.value = purchases.flatMap(p =>
      (p.items || []).map(i => ({
        ...i, purchase_date: p.purchase_date, supplier_id: p.supplier_id,
        supplier: p.supplier?.name, fishType: i.fishType?.name,
      }))
    );
    suppliers.value = s.data.data || s.data;
    fishTypes.value = f.data.data || f.data;
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
});
</script>
