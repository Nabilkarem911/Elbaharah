<template>
  <div class="space-y-6">
    <!-- Notifications -->
    <div v-if="alerts.length" class="space-y-3">
      <router-link
        v-for="alert in alerts"
        :key="alert.type"
        :to="alert.link"
        class="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow"
      >
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          :class="alert.color === 'danger' ? 'bg-red-50' : 'bg-yellow-50'"
        >
          <component :is="alert.icon === 'clock' ? Clock : alert.icon === 'package' ? Package : AlertCircle"
            class="w-5 h-5"
            :class="alert.color === 'danger' ? 'text-danger' : 'text-yellow-600'"
          />
        </div>
        <div class="flex-1">
          <p class="font-bold text-sm" :class="alert.color === 'danger' ? 'text-danger' : 'text-yellow-600'">{{ alert.title }}</p>
          <p class="text-xs text-gray-500">{{ alert.message }}</p>
        </div>
        <ChevronLeft class="w-4 h-4 text-gray-400" />
      </router-link>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="مبيعات اليوم"
        :value="todayData.total_sales"
        :icon="Wallet"
        color="primary"
        suffix=" ر.س"
      />
      <StatCard
        title="مشتريات اليوم"
        :value="todayData.total_purchases"
        :icon="ShoppingCart"
        color="gold"
        suffix=" ر.س"
      />
      <StatCard
        title="مصروفات اليوم"
        :value="todayData.total_expenses"
        :icon="Receipt"
        color="danger"
        suffix=" ر.س"
      />
      <StatCard
        title="صافي ربح اليوم"
        :value="todayData.net_profit"
        :icon="TrendingUp"
        :color="todayData.net_profit >= 0 ? 'success' : 'danger'"
        suffix=" ر.س"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="إجمالي مبيعات الشهر"
        :value="monthData.total_sales"
        :icon="BarChart3"
        color="info"
        suffix=" ر.س"
      />
      <StatCard
        title="إجمالي مشتريات الشهر"
        :value="monthData.total_purchases"
        :icon="Fish"
        color="gold"
        suffix=" ر.س"
      />
      <StatCard
        title="طلبات التوصيل اليوم"
        :value="todayData.delivery_orders"
        :icon="Truck"
        color="info"
      />
      <StatCard
        title="الصندوق"
        :value="todayData.cash_box"
        :icon="Wallet"
        color="primary"
        suffix=" ر.س"
      />
    </div>

    <!-- Insights Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <Trophy class="w-5 h-5 text-gold-dark" />
          </div>
          <div>
            <p class="text-xs text-gray-500">أفضل يوم مبيعات</p>
            <p class="font-bold text-primary-500 tabular-nums">{{ insights.best_day ? Number(insights.best_day.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' ر.س' : '—' }}</p>
            <p class="text-xs text-gray-400">{{ insights.best_day?.date || '' }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Fish class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-xs text-gray-500">أكثر نوع سمك</p>
            <p class="font-bold text-primary-500">{{ insights.top_fish?.name || '—' }}</p>
            <p class="text-xs text-gray-400">{{ insights.top_fish ? Number(insights.top_fish.weight).toFixed(3) + ' كجم' : '' }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Users class="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p class="text-xs text-gray-500">أكثر دلال</p>
            <p class="font-bold text-primary-500">{{ insights.top_supplier?.name || '—' }}</p>
            <p class="text-xs text-gray-400">{{ insights.top_supplier ? Number(insights.top_supplier.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' ر.س' : '' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Indicator -->
    <div class="card p-5">
      <h3 class="font-bold text-primary-500 text-base mb-4">مؤشر الأداء — مقارنة بالشهر السابق</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">المبيعات</span>
            <span class="text-sm font-bold tabular-nums" :class="insights.performance.sales_growth >= 0 ? 'text-success' : 'text-danger'">
              {{ insights.performance.sales_growth >= 0 ? '▲' : '▼' }} {{ Math.abs(insights.performance.sales_growth).toFixed(1) }}%
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex-1">
              <p class="text-xs text-gray-400">الشهر الحالي</p>
              <p class="font-bold text-primary-500 tabular-nums">{{ Number(insights.performance.current_sales).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
            </div>
            <div class="flex-1">
              <p class="text-xs text-gray-400">الشهر السابق</p>
              <p class="font-bold text-gray-500 tabular-nums">{{ Number(insights.performance.previous_sales).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
            </div>
          </div>
          <div class="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500"
              :class="insights.performance.sales_growth >= 0 ? 'bg-success' : 'bg-danger'"
              :style="{ width: Math.min(Math.abs(insights.performance.sales_growth), 100) + '%' }"
            />
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">المشتريات</span>
            <span class="text-sm font-bold tabular-nums" :class="insights.performance.purchases_growth >= 0 ? 'text-success' : 'text-danger'">
              {{ insights.performance.purchases_growth >= 0 ? '▲' : '▼' }} {{ Math.abs(insights.performance.purchases_growth).toFixed(1) }}%
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex-1">
              <p class="text-xs text-gray-400">الشهر الحالي</p>
              <p class="font-bold text-primary-500 tabular-nums">{{ Number(insights.performance.current_purchases).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
            </div>
            <div class="flex-1">
              <p class="text-xs text-gray-400">الشهر السابق</p>
              <p class="font-bold text-gray-500 tabular-nums">{{ Number(insights.performance.previous_purchases).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
            </div>
          </div>
          <div class="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500"
              :class="insights.performance.purchases_growth >= 0 ? 'bg-success' : 'bg-danger'"
              :style="{ width: Math.min(Math.abs(insights.performance.purchases_growth), 100) + '%' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="المبيعات اليومية خلال الشهر">
        <Line :data="salesChartData" :options="chartOptions" />
      </ChartCard>
      <ChartCard title="توزيع المبيعات حسب القناة">
        <Doughnut :data="channelChartData" :options="doughnutOptions" />
      </ChartCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="أعلى 5 دلالين بالمشتريات">
        <Bar :data="suppliersChartData" :options="chartOptions" />
      </ChartCard>
      <div class="card p-5">
        <h3 class="font-bold text-primary-500 text-base mb-4">آخر الفواتير</h3>
        <div class="space-y-2">
          <div v-if="!recentPurchases.length" class="text-center py-8 text-gray-400">
            <Inbox class="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p class="text-sm">لا توجد فواتير</p>
          </div>
          <div
            v-for="p in recentPurchases"
            :key="p.id"
            class="flex items-center justify-between p-3 rounded-xl hover:bg-primary-50/50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                <FileText class="w-4 h-4 text-gold-dark" />
              </div>
              <div>
                <p class="text-sm font-medium text-primary-500">{{ p.invoice_number }}</p>
                <p class="text-xs text-gray-500">{{ p.supplier?.name || '—' }} · {{ p.purchase_date }}</p>
              </div>
            </div>
            <span class="text-sm font-bold text-primary-500 tabular-nums">{{ Number(p.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }} ر.س</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import { Line, Doughnut, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Wallet, ShoppingCart, Receipt, TrendingUp, BarChart3, Fish, Truck, FileText, Inbox, Trophy, Users, Clock, Package, AlertCircle, ChevronLeft } from 'lucide-vue-next';
import StatCard from '../../components/StatCard.vue';
import ChartCard from '../../components/ChartCard.vue';
import api from '../../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler);

const todayData = ref({ total_sales: 0, total_purchases: 0, total_expenses: 0, net_profit: 0, delivery_orders: 0, cash_box: 0 });
const monthData = ref({ total_sales: 0, total_purchases: 0, total_expenses: 0, net_profit: 0, days_count: 0 });
const chartData = ref({ salesChart: [], channelTotals: {}, top5Suppliers: [] });
const recentPurchases = ref([]);
const insights = ref({ best_day: null, top_fish: null, top_supplier: null, performance: { current_sales: 0, previous_sales: 0, sales_growth: 0, current_purchases: 0, previous_purchases: 0, purchases_growth: 0 } });
const alerts = ref([]);

const toast = inject('toast');

onMounted(async () => {
  try {
    const [today, month, charts, purchases, ins, notif] = await Promise.all([
      api.get('/dashboard/today'),
      api.get('/dashboard/month'),
      api.get('/dashboard/charts'),
      api.get('/purchases', { params: { limit: 5 } }),
      api.get('/dashboard/insights'),
      api.get('/dashboard/notifications'),
    ]);
    todayData.value = today.data;
    monthData.value = month.data;
    chartData.value = charts.data;
    recentPurchases.value = purchases.data.data || [];
    insights.value = ins.data;
    alerts.value = notif.data.alerts;
  } catch (err) {
    toast('فشل تحميل الداشبورد', 'error');
  }
});

const chartColors = ['#071746', '#D4A843', '#16A34A', '#DC2626', '#2563EB', '#7C3AED', '#EA580C', '#0891B2'];

const salesChartData = computed(() => ({
  labels: chartData.value.salesChart.map(d => d.date?.slice(5) || ''),
  datasets: [{
    label: 'المبيعات',
    data: chartData.value.salesChart.map(d => d.total),
    borderColor: '#071746',
    backgroundColor: 'rgba(7, 23, 70, 0.1)',
    fill: true,
    tension: 0.3,
  }],
}));

const channelChartData = computed(() => {
  const c = chartData.value.channelTotals || {};
  const labels = ['الصندوق', 'تطبيق البحارة', 'هنقر ستيشن', 'كيتا', 'تويو', 'مدى', 'فيزا', 'ماستر'];
  const keys = ['cash_box', 'app_elbharah', 'hunger_station', 'keta', 'toyo', 'mada', 'visa', 'mastercard'];
  return {
    labels,
    datasets: [{
      data: keys.map(k => c[k] || 0),
      backgroundColor: chartColors,
      borderWidth: 0,
    }],
  };
});

const suppliersChartData = computed(() => ({
  labels: chartData.value.top5Suppliers.map(s => s.name),
  datasets: [{
    data: chartData.value.top5Suppliers.map(s => s.total),
    backgroundColor: '#D4A843',
    borderRadius: 8,
  }],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
    x: { grid: { display: false } },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } },
  },
};
</script>
