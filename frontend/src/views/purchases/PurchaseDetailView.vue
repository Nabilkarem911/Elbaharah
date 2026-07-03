<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/purchases" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <h2 class="text-xl font-bold text-primary-500">تفاصيل الفاتورة</h2>
    </div>

    <div v-if="purchase" class="space-y-6">
      <div class="flex justify-end gap-2">
        <button @click="printInvoice" class="btn-outline">
          <Printer class="w-4 h-4" />
          <span>طباعة / PDF</span>
        </button>
      </div>
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
import { ref, computed, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowRight, Printer } from 'lucide-vue-next';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const toast = inject('toast');
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
  try {
    const { data } = await api.get(`/purchases/${route.params.id}`);
    purchase.value = data;
  } catch (err) {
    toast('فشل تحميل الفاتورة', 'error');
  }
});

const printInvoice = () => {
  const p = purchase.value;
  if (!p) return;
  const itemsHTML = (p.items || []).map((item, i) => `
    <tr>
      <td style="border:1px solid #ddd;padding:6px;text-align:center;">${i + 1}</td>
      <td style="border:1px solid #ddd;padding:6px;">${item.fishType?.name || '—'}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:center;">${Number(item.weight).toFixed(3)}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:center;">${Number(item.price_per_kilo).toFixed(2)}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:center;">${Number(item.total_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');
  const html = `
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>فاتورة شراء - ${p.invoice_number}</title>
      <style>
        body { font-family: 'Cairo', Tahoma, sans-serif; padding: 30px; color: #071746; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #071746; padding-bottom: 15px; }
        .logo { font-size: 24px; font-weight: bold; }
        .info { text-align: left; font-size: 12px; color: #666; }
        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .details div { padding: 8px 12px; background: #f5f5f5; border-radius: 8px; }
        .details .label { font-size: 11px; color: #888; margin-bottom: 2px; }
        .details .value { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #071746; color: white; padding: 8px; font-size: 12px; }
        td { font-size: 12px; }
        .total { display: flex; justify-content: space-between; padding: 12px 20px; background: #071746; color: white; border-radius: 8px; font-size: 16px; font-weight: bold; }
        @media print { body { padding: 10px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">بيت الأسماك</div>
        <div class="info">
          <p>فاتورة شراء</p>
          <p>رقم: ${p.invoice_number}</p>
          <p>التاريخ: ${p.purchase_date}</p>
        </div>
      </div>
      <div class="details">
        <div><div class="label">الدلال</div><div class="value">${p.supplier?.name || '—'}</div></div>
        <div><div class="label">طريقة الدفع</div><div class="value">${paymentLabel.value}</div></div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:40px;">#</th>
            <th>نوع السمك</th>
            <th style="width:100px;">الوزن (كجم)</th>
            <th style="width:100px;">سعر الكيلو</th>
            <th style="width:120px;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>
      <div class="total">
        <span>الإجمالي: ${Number(p.total_weight).toFixed(3)} كجم</span>
        <span>${Number(p.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
      </div>
    </body>
    </html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
    setTimeout(() => w.close(), 500);
  }, 300);
};
</script>
