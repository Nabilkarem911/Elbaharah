<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/purchases" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <h2 class="text-xl font-bold text-primary-500">تفاصيل الفاتورة</h2>
    </div>

    <div v-if="invoice" class="space-y-6">
      <div class="flex justify-end gap-2">
        <router-link :to="`/purchases/${invoice.first_purchase_id}/edit`" class="btn-gold">
          <Pencil class="w-4 h-4" />
          <span>تعديل</span>
        </router-link>
        <button @click="printInvoice" class="btn-outline">
          <Printer class="w-4 h-4" />
          <span>طباعة / PDF</span>
        </button>
      </div>

      <!-- Invoice header -->
      <div class="card p-5">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p class="text-xs text-gray-500">رقم الفاتورة</p><p class="font-bold text-primary-500">{{ invoice.invoice_number }}</p></div>
          <div><p class="text-xs text-gray-500">التاريخ</p><p class="font-bold text-primary-500">{{ invoice.purchase_date }}</p></div>
          <div><p class="text-xs text-gray-500">طريقة الدفع</p><p class="font-bold text-primary-500">{{ paymentLabel }}</p></div>
          <div><p class="text-xs text-gray-500">عدد الأقلام</p><p class="font-bold text-primary-500">{{ invoice.items.length }} قلم</p></div>
          <div><p class="text-xs text-gray-500">عدد الموردين</p><p class="font-bold text-primary-500">{{ supplierCount }}</p></div>
          <div><p class="text-xs text-gray-500">إجمالي الوزن</p><p class="font-bold text-primary-500 tabular-nums">{{ totalWeight.toFixed(3) }} كجم</p></div>
          <div><p class="text-xs text-gray-500">إجمالي المبلغ</p><p class="font-bold text-primary-500 tabular-nums">{{ totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }} ر.س</p></div>
        </div>
      </div>

      <!-- Items grouped by supplier -->
      <div v-for="group in groupedItems" :key="group.supplierName" class="card overflow-hidden">
        <div class="bg-gray-50 px-4 py-3 flex items-center justify-between">
          <h3 class="font-bold text-gray-700 flex items-center gap-2">
            <Users class="w-4 h-4" />
            {{ group.supplierName }}
          </h3>
          <span class="text-sm text-gray-500 tabular-nums">{{ group.items.length }} قلم — {{ group.total.toLocaleString('en-US', { minimumFractionDigits: 2 }) }} ر.س</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b">
                <th class="px-4 py-2.5 text-right font-medium text-gray-500">#</th>
                <th class="px-4 py-2.5 text-right font-medium text-gray-500">نوع السمك</th>
                <th class="px-4 py-2.5 text-right font-medium text-gray-500">الوزن (كجم)</th>
                <th class="px-4 py-2.5 text-right font-medium text-gray-500">سعر الكيلو</th>
                <th class="px-4 py-2.5 text-right font-medium text-gray-500">الإجمالي</th>
                <th class="px-4 py-2.5 text-right font-medium text-gray-500">تالف</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="(item, i) in group.items" :key="i" class="hover:bg-gray-50/30">
                <td class="px-4 py-2.5 text-center text-gray-400">{{ i + 1 }}</td>
                <td class="px-4 py-2.5 font-medium text-gray-700">{{ item.fish_name || '—' }}</td>
                <td class="px-4 py-2.5 tabular-nums">{{ Number(item.weight).toFixed(3) }}</td>
                <td class="px-4 py-2.5 tabular-nums">{{ Number(item.price_per_kilo).toFixed(2) }}</td>
                <td class="px-4 py-2.5 tabular-nums font-bold text-primary-500">{{ Number(item.total_price).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</td>
                <td class="px-4 py-2.5">
                  <span v-if="item.is_damaged" class="badge-danger">تالف ({{ Number(item.damaged_weight || 0).toFixed(3) }})</span>
                  <span v-else class="badge-success">سليم</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Grand total -->
      <div class="card p-4 bg-primary-50">
        <div class="flex items-center justify-between">
          <span class="font-bold text-gray-700">الإجمالي العام:</span>
          <div class="flex items-center gap-6">
            <span class="font-bold tabular-nums text-gray-700">{{ totalWeight.toFixed(3) }} كجم</span>
            <span class="font-bold tabular-nums text-primary-500 text-lg">{{ totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }} ر.س</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowRight, Printer, Pencil, Users } from 'lucide-vue-next';
import api from '../../api';

const toast = inject('toast');
const route = useRoute();
const invoice = ref(null);
const loading = ref(true);

const paymentLabels = { cash: 'نقدي', credit: 'آجل', transfer: 'تحويل' };
const paymentLabel = computed(() => paymentLabels[invoice.value?.payment_method] || '');

const totalWeight = computed(() => (invoice.value?.items || []).reduce((s, i) => s + Number(i.weight), 0));
const totalAmount = computed(() => (invoice.value?.items || []).reduce((s, i) => s + Number(i.total_price), 0));

const groupedItems = computed(() => {
  if (!invoice.value?.items) return [];
  const map = {};
  invoice.value.items.forEach(item => {
    const name = item.supplier_name || 'غير معروف';
    if (!map[name]) map[name] = { supplierName: name, items: [], total: 0 };
    map[name].items.push(item);
    map[name].total += Number(item.total_price);
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
});

const supplierCount = computed(() => groupedItems.value.length);

onMounted(async () => {
  try {
    const { data } = await api.get(`/purchases/invoice/${route.params.id}`);
    invoice.value = data;
  } catch (err) {
    toast('فشل تحميل الفاتورة', 'error');
  } finally {
    loading.value = false;
  }
});

const printInvoice = () => {
  const inv = invoice.value;
  if (!inv) return;

  const supplierGroups = groupedItems.value;
  const groupsHTML = supplierGroups.map(group => `
    <tr><td colspan="5" style="background:#f5f5f5;padding:8px;font-weight:bold;">${group.supplierName} — ${group.items.length} قلم</td></tr>
    ${group.items.map((item, i) => `
      <tr>
        <td style="border:1px solid #ddd;padding:6px;text-align:center;">${i + 1}</td>
        <td style="border:1px solid #ddd;padding:6px;">${item.fish_name || '—'}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:center;">${Number(item.weight).toFixed(3)}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:center;">${Number(item.price_per_kilo).toFixed(2)}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:center;">${Number(item.total_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('')}
  `).join('');

  const html = `
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>فاتورة شراء - ${inv.invoice_number}</title>
      <style>
        body { font-family: 'Cairo', Tahoma, sans-serif; padding: 30px; color: #071746; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #071746; padding-bottom: 15px; }
        .logo { font-size: 24px; font-weight: bold; }
        .info { text-align: left; font-size: 12px; color: #666; }
        .details { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; }
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
          <p>رقم: ${inv.invoice_number}</p>
          <p>التاريخ: ${inv.purchase_date}</p>
        </div>
      </div>
      <div class="details">
        <div><div class="label">طريقة الدفع</div><div class="value">${paymentLabel.value}</div></div>
        <div><div class="label">عدد الأقلام</div><div class="value">${inv.items.length}</div></div>
        <div><div class="label">عدد الموردين</div><div class="value">${supplierCount.value}</div></div>
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
        <tbody>${groupsHTML}</tbody>
      </table>
      <div class="total">
        <span>الإجمالي: ${totalWeight.value.toFixed(3)} كجم</span>
        <span>${totalAmount.value.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
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
