<template>
  <div class="space-y-6">
    <PageHeader title="تكلفة السمك" subtitle="تتبع أسعار وأنواع الأسماك من كل دلال" />

    <div class="card p-4 flex flex-wrap gap-3">
      <select v-model="filterFish" class="input !py-1.5 text-sm w-auto">
        <option value="">كل الأنواع</option>
        <option v-for="f in fishTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
      </select>
      <select v-model="filterSupplier" class="input !py-1.5 text-sm w-auto">
        <option value="">كل الدلالين</option>
        <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </div>

    <DataTable :data="filteredItems" :columns="columns" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const columns = [
  { key: 'purchase_date', label: 'التاريخ', sortable: true },
  { key: 'fishType', label: 'نوع السمك' },
  { key: 'supplier', label: 'الدلال' },
  { key: 'weight', label: 'الوزن', type: 'weight', sortable: true },
  { key: 'price_per_kilo', label: 'سعر الكيلو', type: 'currency', sortable: true },
  { key: 'total_price', label: 'الإجمالي', type: 'currency', sortable: true },
];

const items = ref([]);
const fishTypes = ref([]);
const suppliers = ref([]);
const filterFish = ref('');
const filterSupplier = ref('');

const filteredItems = computed(() => {
  let r = items.value;
  if (filterFish.value) r = r.filter(i => i.fish_type_id == filterFish.value);
  if (filterSupplier.value) r = r.filter(i => i.supplier_id == filterSupplier.value);
  return r;
});

onMounted(async () => {
  const [p, f, s] = await Promise.all([
    api.get('/purchases', { params: { limit: 500 } }),
    api.get('/fish-types', { params: { limit: 500 } }),
    api.get('/suppliers', { params: { limit: 500 } }),
  ]);
  const purchases = p.data.data || p.data;
  items.value = purchases.flatMap(p =>
    (p.items || []).map(i => ({
      ...i,
      purchase_date: p.purchase_date,
      supplier_id: p.supplier_id,
      supplier: p.supplier?.name,
      fishType: i.fishType?.name,
    }))
  );
  fishTypes.value = f.data.data || f.data;
  suppliers.value = s.data.data || s.data;
});
</script>
