<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-primary-500">الحركة المالية</h2>
        <p class="text-sm text-gray-500 mt-1">تسجيل وعرض المبيعات اليومية بكل قنوات البيع</p>
      </div>
      <div class="flex items-center gap-3">
        <ExportButton @export="handleExport" />
        <button @click="openModal()" class="btn-gold">
          <Plus class="w-4 h-4" />
          <span>سجل يومي جديد</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4">
      <DateRangePicker
        v-model:start-date="filters.startDate"
        v-model:end-date="filters.endDate"
        @change="loadData"
      />
    </div>

    <!-- Table -->
    <DataTable
      :data="sales"
      :columns="columns"
      :page="page"
      :per-page="perPage"
      :total="total"
      :total-pages="totalPages"
      @page-change="onPageChange"
    >
      <template #cell-surplus_deficit="{ value }">
        <span :class="value >= 0 ? 'text-success font-medium' : 'text-danger font-medium'" class="tabular-nums">
          {{ Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </span>
      </template>
      <template #cell-day_name="{ value }">
        <span class="badge-info">{{ value }}</span>
      </template>
      <template #actions="{ row }">
        <button @click="openModal(row)" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400">
          <Pencil class="w-4 h-4" />
        </button>
        <button @click="confirmDelete(row)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
          <Trash2 class="w-4 h-4" />
        </button>
      </template>
    </DataTable>

    <!-- Modal -->
    <Modal :show="showModal" :title="editing ? 'تعديل سجل' : 'سجل يومي جديد'" size="xl" @close="closeModal">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label">التاريخ</label>
          <input type="date" v-model="form.sale_date" class="input" />
        </div>
        <div>
          <label class="label">إجمالي المبيعات</label>
          <input type="number" step="0.01" v-model="form.total_sales" class="input tabular-nums" />
        </div>
        <div>
          <label class="label">مبيعات أخرى</label>
          <input type="number" step="0.01" v-model="form.other_sales" class="input tabular-nums" />
        </div>
        <div>
          <label class="label">مبيعات آجل</label>
          <input type="number" step="0.01" v-model="form.credit_sales" class="input tabular-nums" />
        </div>
        <div>
          <label class="label">الصندوق</label>
          <input type="number" step="0.01" v-model="form.cash_box" class="input tabular-nums" />
        </div>
        <div>
          <label class="label">تطبيق البحارة</label>
          <input type="number" step="0.01" v-model="form.app_elbharah" class="input tabular-nums" />
        </div>
        <div>
          <label class="label">هنقر ستيشن</label>
          <input type="number" step="0.01" v-model="form.hunger_station" class="input tabular-nums" />
        </div>
        <div>
          <label class="label">كيتا</label>
          <input type="number" step="0.01" v-model="form.keta" class="input tabular-nums" />
        </div>
        <div>
          <label class="label">تويو</label>
          <input type="number" step="0.01" v-model="form.toyo" class="input tabular-nums" />
        </div>
        <div>
          <label class="label">مدى</label>
          <input type="number" step="0.01" v-model="form.mada" class="input tabular-nums" />
        </div>
        <div>
          <label class="label">فيزا</label>
          <input type="number" step="0.01" v-model="form.visa" class="input tabular-nums" />
        </div>
        <div>
          <label class="label">ماستر كارد</label>
          <input type="number" step="0.01" v-model="form.mastercard" class="input tabular-nums" />
        </div>
        <div>
          <label class="label">مبيعات التوصيل</label>
          <input type="number" step="0.01" v-model="form.delivery_sales" class="input tabular-nums" />
        </div>
        <div>
          <label class="label">عدد طلبات التوصيل</label>
          <input type="number" v-model="form.delivery_orders_count" class="input tabular-nums" />
        </div>
        <div class="md:col-span-3">
          <label class="label">ملاحظات</label>
          <textarea v-model="form.notes" class="input" rows="2"></textarea>
        </div>
      </div>

      <!-- Calculated preview -->
      <div class="mt-4 grid grid-cols-3 gap-3 p-4 bg-primary-50 rounded-xl">
        <div class="text-center">
          <p class="text-xs text-gray-500">صافي المبيعات</p>
          <p class="font-bold text-primary-500 tabular-nums">{{ netSales.toFixed(2) }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">مبيعات الشبكة</p>
          <p class="font-bold text-primary-500 tabular-nums">{{ networkSales.toFixed(2) }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">فائض/عجز</p>
          <p class="font-bold tabular-nums" :class="surplusDeficit >= 0 ? 'text-success' : 'text-danger'">
            {{ surplusDeficit.toFixed(2) }}
          </p>
        </div>
      </div>

      <template #footer>
        <button @click="closeModal" class="btn-ghost">إلغاء</button>
        <button @click="save" class="btn-gold" :disabled="saving">
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <span>{{ editing ? 'حفظ التعديل' : 'حفظ' }}</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-vue-next';
import DataTable from '../../components/DataTable.vue';
import Modal from '../../components/Modal.vue';
import ExportButton from '../../components/ExportButton.vue';
import DateRangePicker from '../../components/DateRangePicker.vue';
import api from '../../api';

const toast = inject('toast');

const columns = [
  { key: 'sale_date', label: 'التاريخ', sortable: true },
  { key: 'day_name', label: 'اليوم' },
  { key: 'total_sales', label: 'إجمالي المبيعات', type: 'currency', sortable: true },
  { key: 'other_sales', label: 'مبيعات أخرى', type: 'currency' },
  { key: 'credit_sales', label: 'آجل', type: 'currency' },
  { key: 'cash_box', label: 'الصندوق', type: 'currency' },
  { key: 'app_elbharah', label: 'البحارة', type: 'currency' },
  { key: 'hunger_station', label: 'هنقر', type: 'currency' },
  { key: 'keta', label: 'كيتا', type: 'currency' },
  { key: 'toyo', label: 'تويو', type: 'currency' },
  { key: 'mada', label: 'مدى', type: 'currency' },
  { key: 'visa', label: 'فيزا', type: 'currency' },
  { key: 'mastercard', label: 'ماستر', type: 'currency' },
  { key: 'net_sales', label: 'الصافي', type: 'currency', sortable: true },
  { key: 'surplus_deficit', label: 'فائض/عجز', type: 'currency', sortable: true },
  { key: 'network_sales', label: 'الشبكة', type: 'currency' },
  { key: 'delivery_sales', label: 'توصيل', type: 'currency' },
  { key: 'delivery_orders_count', label: 'طلبات', type: 'number' },
];

const sales = ref([]);
const page = ref(1);
const perPage = ref(50);
const total = ref(0);
const totalPages = ref(0);
const filters = reactive({ startDate: '', endDate: '' });

const showModal = ref(false);
const editing = ref(false);
const saving = ref(false);
const form = reactive({});

const emptyForm = () => ({
  sale_date: new Date().toISOString().split('T')[0],
  total_sales: 0, other_sales: 0, credit_sales: 0,
  cash_box: 0, app_elbharah: 0, hunger_station: 0, keta: 0, toyo: 0,
  mada: 0, visa: 0, mastercard: 0,
  delivery_sales: 0, delivery_orders_count: 0, notes: '',
});

const netSales = computed(() =>
  Number(form.cash_box || 0) + Number(form.app_elbharah || 0) + Number(form.hunger_station || 0) +
  Number(form.keta || 0) + Number(form.toyo || 0) + Number(form.mada || 0) +
  Number(form.visa || 0) + Number(form.mastercard || 0)
);
const networkSales = computed(() => Number(form.mada || 0) + Number(form.visa || 0) + Number(form.mastercard || 0));
const surplusDeficit = computed(() => netSales.value - Number(form.total_sales || 0));

const loadData = async () => {
  try {
    const params = { page: page.value, limit: perPage.value };
    if (filters.startDate) params.sale_date_gte = filters.startDate;
    if (filters.endDate) params.sale_date_lte = filters.endDate;
    const { data } = await api.get('/sales', { params });
    sales.value = data.data;
    total.value = data.total;
    totalPages.value = data.totalPages;
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

const onPageChange = (p) => { page.value = p; loadData(); };

const openModal = (row = null) => {
  if (row) {
    editing.value = true;
    Object.assign(form, row);
  } else {
    editing.value = false;
    Object.assign(form, emptyForm());
  }
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; };

const save = async () => {
  saving.value = true;
  try {
    if (editing.value) {
      await api.put(`/sales/${form.id}`, form);
      toast('تم تعديل السجل بنجاح');
    } else {
      await api.post('/sales', form);
      toast('تم إضافة السجل بنجاح');
    }
    closeModal();
    loadData();
  } catch (err) {
    toast(err.response?.data?.error || 'فشل الحفظ', 'error');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (row) => {
  if (!confirm(`هل تريد حذف سجل ${row.sale_date}؟`)) return;
  try {
    await api.delete(`/sales/${row.id}`);
    toast('تم الحذف بنجاح');
    loadData();
  } catch (err) {
    toast('فشل الحذف', 'error');
  }
};

const handleExport = (type) => {
  toast(`تصدير ${type.toUpperCase()} — قيد التطوير`, 'info');
};

onMounted(loadData);
</script>
