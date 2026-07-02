<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/suppliers" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <h2 class="text-xl font-bold text-primary-500">{{ supplier?.name || 'تفاصيل الدلال' }}</h2>
    </div>

    <!-- Info card -->
    <div class="card p-5" v-if="supplier">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><p class="text-xs text-gray-500">الرمز</p><p class="font-bold text-primary-500">{{ supplier.code }}</p></div>
        <div><p class="text-xs text-gray-500">الهاتف</p><p class="font-bold text-primary-500">{{ supplier.phone || '—' }}</p></div>
        <div><p class="text-xs text-gray-500">الرصيد</p><p class="font-bold text-primary-500 tabular-nums">{{ Number(supplier.balance).toLocaleString('en-US') }} ر.س</p></div>
        <div><p class="text-xs text-gray-500">الحالة</p><span :class="supplier.is_active ? 'badge-success' : 'badge-danger'">{{ supplier.is_active ? 'نشط' : 'موقوف' }}</span></div>
      </div>
    </div>

    <!-- Purchases -->
    <DataTable :data="purchases" :columns="columns" title="فواتير الشراء">
      <template #actions="{ row }">
        <router-link :to="`/purchases/${row.id}`" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400">
          <Eye class="w-4 h-4" />
        </router-link>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowRight, Eye } from 'lucide-vue-next';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const route = useRoute();
const supplier = ref(null);
const purchases = ref([]);

const columns = [
  { key: 'invoice_number', label: 'رقم الفاتورة', sortable: true },
  { key: 'purchase_date', label: 'التاريخ', sortable: true },
  { key: 'total_weight', label: 'الوزن', type: 'weight' },
  { key: 'total_amount', label: 'المبلغ', type: 'currency', sortable: true },
  { key: 'payment_method', label: 'الدفع' },
];

onMounted(async () => {
  const { data } = await api.get(`/suppliers/${route.params.id}`);
  supplier.value = data;
  const { data: pData } = await api.get('/purchases', { params: { supplier_id: route.params.id, limit: 500 } });
  purchases.value = pData.data || pData;
});
</script>
