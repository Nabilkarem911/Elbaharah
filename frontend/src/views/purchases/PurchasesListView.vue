<template>
  <div class="space-y-6">
    <PageHeader title="المشتريات" subtitle="فواتير شراء الأسماك من الدلالين">
      <template #actions>
        <router-link to="/purchases/new" class="btn-gold">
          <Plus class="w-4 h-4" /> فاتورة جديدة
        </router-link>
      </template>
    </PageHeader>

    <div class="card p-4 flex flex-wrap gap-3">
      <input type="date" v-model="filterDate" class="input !py-1.5 text-sm w-auto" @change="loadData" />
      <button @click="clearFilter" class="btn-ghost !py-1.5 text-sm" v-if="filterDate">مسح الفلتر</button>
    </div>

    <DataTable :data="filteredInvoices" :columns="columns" searchable>
      <template #cell-suppliers_count="{ value }">
        <span class="badge-info">{{ value }} مورد</span>
      </template>
      <template #cell-items_count="{ value }">
        <span class="badge-info">{{ value }} قلم</span>
      </template>
      <template #cell-payment_method="{ value }">
        <span class="badge-success">{{ paymentLabels[value] || value }}</span>
      </template>
      <template #actions="{ row }">
        <router-link :to="`/purchases/${row.first_purchase_id}`" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400">
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
import api from '../../api';

const toast = inject('toast');

const paymentLabels = { cash: 'نقدي', credit: 'آجل', transfer: 'تحويل' };

const columns = [
  { key: 'invoice_number', label: 'رقم الفاتورة', sortable: true },
  { key: 'purchase_date', label: 'التاريخ', sortable: true },
  { key: 'suppliers_count', label: 'الموردين' },
  { key: 'items_count', label: 'الأقلام' },
  { key: 'total_weight', label: 'الوزن', type: 'weight' },
  { key: 'total_amount', label: 'المبلغ', type: 'currency', sortable: true },
  { key: 'payment_method', label: 'الدفع' },
];

const invoices = ref([]);
const filterDate = ref('');

const filteredInvoices = computed(() => {
  if (!filterDate.value) return invoices.value;
  return invoices.value.filter(inv => inv.purchase_date === filterDate.value);
});

const clearFilter = () => { filterDate.value = ''; };

const loadData = async () => {
  try {
    const { data } = await api.get('/purchases/invoices');
    invoices.value = data.data || data;
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

onMounted(loadData);
</script>
