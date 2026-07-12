<template>
  <div class="space-y-6">
    <PageHeader title="المشتريات" subtitle="فواتير شراء الأسماك من الدلالين">
      <template #actions>
        <ExportButton :data="filteredPurchases" :columns="exportColumns" filename="المشتريات" title="فواتير المشتريات" />
        <router-link to="/purchases/new" class="btn-gold">
          <Plus class="w-4 h-4" /> فاتورة جديدة
        </router-link>
      </template>
    </PageHeader>

    <div class="card p-4 flex flex-wrap gap-3">
      <select v-model="filterSupplier" class="input !py-1.5 text-sm w-auto">
        <option value="">كل الدلالين</option>
        <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </div>

    <DataTable :data="filteredPurchases" :columns="columns" searchable>
      <template #cell-supplier="{ value }">
        <span class="font-medium">{{ value?.name || '—' }}</span>
      </template>
      <template #actions="{ row }">
        <router-link :to="`/purchases/${row.id}`" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400">
          <Eye class="w-4 h-4" />
        </router-link>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import { Plus, Eye } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import ExportButton from '../../components/ExportButton.vue';
import api from '../../api';

const toast = inject('toast');

const columns = [
  { key: 'invoice_number', label: 'رقم الفاتورة', sortable: true },
  { key: 'purchase_date', label: 'التاريخ', sortable: true },
  { key: 'supplier', label: 'الدلال' },
  { key: 'total_weight', label: 'الوزن', type: 'weight' },
  { key: 'total_amount', label: 'المبلغ', type: 'currency', sortable: true },
  { key: 'payment_method', label: 'الدفع' },
];

const exportColumns = [
  { key: 'invoice_number', label: 'رقم الفاتورة' },
  { key: 'purchase_date', label: 'التاريخ' },
  { key: 'supplier_name', label: 'الدلال' },
  { key: 'total_weight', label: 'الوزن' },
  { key: 'total_amount', label: 'المبلغ' },
  { key: 'payment_method', label: 'الدفع' },
];

const purchases = ref([]);
const suppliers = ref([]);
const filterSupplier = ref('');

const filteredPurchases = computed(() =>
  !filterSupplier.value ? purchases.value : purchases.value.filter(p => p.supplier_id == filterSupplier.value)
);

onMounted(async () => {
  try {
    const [p, s] = await Promise.all([
      api.get('/purchases', { params: { limit: 500 } }),
      api.get('/suppliers', { params: { limit: 500 } }),
    ]);
    purchases.value = p.data.data || p.data;
    suppliers.value = s.data.data || s.data;
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
});
</script>
