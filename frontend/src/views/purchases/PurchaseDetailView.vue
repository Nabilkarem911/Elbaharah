<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/purchases" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <h2 class="text-xl font-bold text-primary-500">تفاصيل الفاتورة</h2>
    </div>

    <div v-if="purchase" class="space-y-6">
      <div class="card p-5">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p class="text-xs text-gray-500">رقم الفاتورة</p><p class="font-bold text-primary-500">{{ purchase.invoice_number }}</p></div>
          <div><p class="text-xs text-gray-500">التاريخ</p><p class="font-bold text-primary-500">{{ purchase.purchase_date }}</p></div>
          <div><p class="text-xs text-gray-500">الدلال</p><p class="font-bold text-primary-500">{{ purchase.supplier?.name }}</p></div>
          <div><p class="text-xs text-gray-500">طريقة الدفع</p><p class="font-bold text-primary-500">{{ paymentLabel }}</p></div>
          <div><p class="text-xs text-gray-500">إجمالي الوزن</p><p class="font-bold text-primary-500 tabular-nums">{{ Number(purchase.total_weight).toFixed(3) }} كجم</p></div>
          <div><p class="text-xs text-gray-500">إجمالي المبلغ</p><p class="font-bold text-primary-500 tabular-nums">{{ Number(purchase.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }} ر.س</p></div>
        </div>
      </div>

      <DataTable :data="purchase.items || []" :columns="columns" title="الأقلام" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowRight } from 'lucide-vue-next';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const route = useRoute();
const purchase = ref(null);

const columns = [
  { key: 'fishType', label: 'نوع السمك' },
  { key: 'weight', label: 'الوزن', type: 'weight' },
  { key: 'price_per_kilo', label: 'سعر الكيلو', type: 'currency' },
  { key: 'total_price', label: 'الإجمالي', type: 'currency', sortable: true },
  { key: 'is_damaged', label: 'تالف' },
];

const paymentLabels = { cash: 'نقدي', credit: 'آجل', transfer: 'تحويل' };
const paymentLabel = computed(() => paymentLabels[purchase.value?.payment_method] || '');

onMounted(async () => {
  const { data } = await api.get(`/purchases/${route.params.id}`);
  purchase.value = data;
});
</script>
