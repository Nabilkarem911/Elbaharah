<template>
  <div class="space-y-6">
    <PageHeader title="التقرير اليومي" subtitle="ملخص شامل: المبيعات، الأسماك، الدلالين — الأمس / اليوم / الشهر">
      <template #actions>
        <button @click="printReport" class="btn-outline"><Printer class="w-4 h-4" /> طباعة</button>
        <button @click="load" class="btn-ghost"><RefreshCw class="w-4 h-4" /> تحديث</button>
      </template>
    </PageHeader>

    <div v-if="loading" class="text-center py-12 text-gray-400">جاري التحميل...</div>

    <div v-else-if="report" class="space-y-6" id="print-area">
      <!-- Section 1: Sales Summary -->
      <div class="card overflow-hidden">
        <div class="bg-primary-500 text-white px-5 py-3 flex items-center gap-2">
          <Wallet class="w-5 h-5" />
          <h2 class="font-bold">ملخص المبيعات</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b">
                <th class="px-3 py-2.5 text-right font-bold text-gray-600 whitespace-nowrap">الفترة</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">مبيعات الجهاز</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">تطبيق البحارة</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">هنقر ستيشن</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">كيتا</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">مبيعات أخرى</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">مبيعات الآجل</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">الفواتير الملغاة</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">العهدة</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">الصندوق</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">مبيعات الشبكة</th>
                <th class="px-3 py-2.5 text-right font-bold text-primary-500 whitespace-nowrap">إجمالي المبيعات</th>
                <th class="px-3 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">الفائض / العجز</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="p in periods" :key="p.key" :class="p.key === 'today' ? 'bg-primary-50/40' : ''">
                <td class="px-3 py-2.5 font-bold text-gray-700 whitespace-nowrap">
                  {{ p.label }}
                  <span class="block text-xs text-gray-400 font-normal">{{ p.date }}</span>
                </td>
                <td class="px-3 py-2.5 tabular-nums">{{ fmt(p.sales.total_sales) }}</td>
                <td class="px-3 py-2.5 tabular-nums">{{ fmt(p.sales.app_elbharah) }}</td>
                <td class="px-3 py-2.5 tabular-nums">{{ fmt(p.sales.hunger_station) }}</td>
                <td class="px-3 py-2.5 tabular-nums">{{ fmt(p.sales.keta) }}</td>
                <td class="px-3 py-2.5 tabular-nums">{{ fmt(p.sales.other_sales_total) }}</td>
                <td class="px-3 py-2.5 tabular-nums">{{ fmt(p.sales.credit_sales) }}</td>
                <td class="px-3 py-2.5 tabular-nums text-red-500">{{ fmt(p.sales.cancelled) }}</td>
                <td class="px-3 py-2.5 tabular-nums text-amber-600">{{ fmt(p.sales.custody) }}</td>
                <td class="px-3 py-2.5 tabular-nums font-medium">{{ fmt(p.sales.cash_box) }}</td>
                <td class="px-3 py-2.5 tabular-nums">{{ fmt(p.sales.network_sales) }}</td>
                <td class="px-3 py-2.5 tabular-nums font-bold text-primary-500">{{ fmt(p.sales.net_sales) }}</td>
                <td class="px-3 py-2.5 tabular-nums font-bold" :class="p.sales.surplus_deficit >= 0 ? 'text-success' : 'text-danger'">
                  {{ p.sales.surplus_deficit >= 0 ? '+' : '' }}{{ fmt(p.sales.surplus_deficit) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 2: Fish Purchases -->
      <div class="card overflow-hidden">
        <div class="bg-primary-500 text-white px-5 py-3 flex items-center gap-2">
          <Fish class="w-5 h-5" />
          <h2 class="font-bold">تفاصيل الأسماك (مشتريات)</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b">
                <th class="px-3 py-2.5 text-right font-bold text-gray-600 whitespace-nowrap sticky right-0 bg-gray-50">الفترة</th>
                <th class="px-3 py-2.5 text-center font-medium text-gray-500 whitespace-nowrap" v-for="ft in allFishNames" :key="ft">{{ ft }}</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <template v-for="p in periods" :key="p.key">
                <tr :class="p.key === 'today' ? 'bg-primary-50/40' : ''">
                  <td class="px-3 py-2 font-bold text-gray-700 whitespace-nowrap sticky right-0" :class="p.key === 'today' ? 'bg-primary-50/40' : 'bg-white'">
                    {{ p.label }} — الكمية
                  </td>
                  <td v-for="ft in allFishNames" :key="ft" class="px-3 py-2 text-center tabular-nums text-gray-600">
                    {{ getFishValue(p.fish, ft, 'weight') }}
                  </td>
                </tr>
                <tr :class="p.key === 'today' ? 'bg-primary-50/40' : ''">
                  <td class="px-3 py-2 font-medium text-gray-500 whitespace-nowrap sticky right-0" :class="p.key === 'today' ? 'bg-primary-50/40' : 'bg-white'">
                    {{ p.label }} — السعر
                  </td>
                  <td v-for="ft in allFishNames" :key="ft" class="px-3 py-2 text-center tabular-nums font-medium">
                    {{ getFishValue(p.fish, ft, 'total_price') }}
                  </td>
                </tr>
                <tr :class="p.key === 'today' ? 'bg-primary-50/40' : 'border-b-2 border-gray-200'">
                  <td class="px-3 py-2 text-xs text-gray-400 whitespace-nowrap sticky right-0" :class="p.key === 'today' ? 'bg-primary-50/40' : 'bg-white'">
                    {{ p.label }} — سعر الكيلو
                  </td>
                  <td v-for="ft in allFishNames" :key="ft" class="px-3 py-2 text-center tabular-nums text-xs text-gray-400">
                    {{ getFishValue(p.fish, ft, 'price_per_kilo') }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 3: Suppliers + Purchases Total -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div v-for="p in periods" :key="p.key" class="card overflow-hidden">
          <div class="px-4 py-3 flex items-center justify-between" :class="p.key === 'today' ? 'bg-primary-50' : 'bg-gray-50'">
            <h3 class="font-bold text-gray-700 flex items-center gap-2">
              <Users class="w-4 h-4" />
              {{ p.label }} — الدلالين
            </h3>
            <span class="text-xs text-gray-400">{{ p.date }}</span>
          </div>
          <div v-if="p.suppliers.length" class="divide-y">
            <div v-for="s in p.suppliers" :key="s.name" class="flex items-center justify-between px-4 py-2.5">
              <div>
                <p class="text-sm font-medium text-gray-700">{{ s.name }}</p>
                <p class="text-xs text-gray-400">{{ s.count }} فاتورة</p>
              </div>
              <p class="font-bold tabular-nums text-primary-500">{{ fmt(s.total) }}</p>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-400 text-sm">لا توجد مشتريات</div>
          <div class="border-t px-4 py-3 flex items-center justify-between bg-gray-50">
            <span class="text-sm font-bold text-gray-600">إجمالي المشتريات</span>
            <span class="font-bold tabular-nums text-danger">{{ fmt(p.purchases_total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Wallet, Fish, Users, Printer, RefreshCw } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import api from '../../api';

const report = ref(null);
const loading = ref(false);

const periods = computed(() => {
  if (!report.value) return [];
  const p = report.value.periods;
  return [
    { key: 'yesterday', label: 'الأمس', date: p.yesterday.date, sales: p.yesterday.sales, fish: p.yesterday.fish, suppliers: p.yesterday.suppliers, purchases_total: p.yesterday.purchases_total },
    { key: 'today', label: 'اليوم', date: p.today.date, sales: p.today.sales, fish: p.today.fish, suppliers: p.today.suppliers, purchases_total: p.today.purchases_total },
    { key: 'month', label: 'الشهر', date: p.month.date, sales: p.month.sales, fish: p.month.fish, suppliers: p.month.suppliers, purchases_total: p.month.purchases_total },
  ];
});

const allFishNames = computed(() => {
  if (!report.value) return [];
  const names = new Set();
  ['today', 'yesterday', 'month'].forEach(k => {
    report.value.periods[k].fish.forEach(f => names.add(f.name));
  });
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'ar'));
});

const fmt = (v) => {
  const n = Number(v || 0);
  if (n === 0) return '-';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getFishValue = (fishList, name, field) => {
  const f = fishList.find(x => x.name === name);
  if (!f) return '-';
  const val = Number(f[field] || 0);
  if (val === 0) return '-';
  if (field === 'weight') return val.toFixed(2);
  if (field === 'price_per_kilo') return val.toFixed(2);
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const printReport = () => {
  window.print();
};

const load = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/dashboard/daily-report');
    report.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>

<style scoped>
@media print {
  body * { visibility: hidden; }
  #print-area, #print-area * { visibility: visible; }
  #print-area { position: absolute; left: 0; top: 0; width: 100%; }
  .card { box-shadow: none !important; border: 1px solid #ddd !important; }
}
</style>
