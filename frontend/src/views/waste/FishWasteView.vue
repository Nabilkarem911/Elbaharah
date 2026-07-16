<template>
  <div class="space-y-6">
    <PageHeader :title="L('product_waste', 'هدر الأسماك')" subtitle="تسجيل الهدر والتالف وحساب الخسائر">
      <template #actions>
        <ExportButton :data="wastes" :columns="exportColumns" filename="هدر" :title="L('product_waste', 'هدر الأسماك')" />
        <button @click="openReasonModal()" class="btn-outline"><Settings class="w-4 h-4" /> إدارة الأسباب</button>
        <button @click="openModal()" class="btn-gold"><Plus class="w-4 h-4" /> تسجيل هدر</button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard title="إجمالي الوزن المهدر" :value="totalWeight.toFixed(3)" :icon="Fish" color="danger" suffix=" كجم" />
      <StatCard title="إجمالي تكلفة الهدر" :value="totalCost" :icon="TrendingDown" color="warning" suffix=" ر.س" />
      <StatCard title="عدد السجلات" :value="wastes.length" :icon="FileText" color="primary" />
    </div>

    <div class="card p-4 flex flex-wrap items-center gap-3">
      <DateRangePicker
        v-model:start-date="filterStartDate"
        v-model:end-date="filterEndDate"
      />
      <select v-model="filterFish" class="input !py-1.5 text-sm w-auto">
        <option value="">كل الأنواع</option>
        <option v-for="f in fishTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
      </select>
    </div>

    <DataTable :data="filteredWastes" :columns="columns" searchable>
      <template #cell-fishType="{ value }">
        <span class="font-medium">{{ value?.name || '—' }}</span>
      </template>
      <template #actions="{ row }">
        <button @click="openModal(row)" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400"><Pencil class="w-4 h-4" /></button>
        <button @click="confirmDelete(row)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 class="w-4 h-4" /></button>
      </template>
    </DataTable>

    <Modal :show="showModal" :title="editing ? 'تعديل هدر' : 'تسجيل هدر'" @close="closeModal">
      <div class="space-y-4">
        <div>
          <label class="label">{{ L('product_type', 'نوع السمك') }}</label>
          <select v-model="form.fish_type_id" class="input" @change="onFishChange">
            <option value="">اختر النوع</option>
            <option v-for="f in fishTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">الوزن (كجم)</label>
            <input type="number" step="0.001" v-model="form.weight" class="input tabular-nums" @input="calcTotal" />
          </div>
          <div>
            <label class="label">تكلفة الكيلو (ر.س) — تلقائي</label>
            <div class="relative">
              <input type="number" step="0.01" v-model="form.cost_per_kilo" class="input tabular-nums bg-gray-50" @input="calcTotal" />
              <Loader2 v-if="costLoading" class="w-4 h-4 animate-spin absolute left-3 top-3 text-gray-400" />
            </div>
            <p v-if="avgInfo" class="text-xs text-gray-500 mt-1">متوسط شراء الشهر: {{ Number(avgInfo.avg_cost).toFixed(2) }} ر.س ({{ avgInfo.count }} قلم)</p>
          </div>
        </div>
        <div>
          <label class="label">التكلفة الإجمالية</label>
          <input type="number" step="0.01" :value="form.total_cost" class="input tabular-nums bg-gray-50" readonly />
        </div>
        <div>
          <label class="label">التاريخ</label>
          <input type="date" v-model="form.waste_date" class="input" />
        </div>
        <div>
          <label class="label">سبب الهدر</label>
          <select v-model="form.reason" class="input">
            <option value="">اختر السبب</option>
            <option v-for="r in wasteReasons" :key="r.id" :value="r.name">{{ r.name }}</option>
          </select>
        </div>
        <div>
          <label class="label">ملاحظات</label>
          <textarea v-model="form.notes" class="input" rows="2"></textarea>
        </div>
      </div>
      <template #footer>
        <button @click="closeModal" class="btn-ghost">إلغاء</button>
        <button @click="save" class="btn-gold" :disabled="saving">
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <span>{{ editing ? 'حفظ التعديل' : 'تسجيل' }}</span>
        </button>
      </template>
    </Modal>

    <!-- Reasons Management Modal -->
    <Modal :show="showReasonModal" title="إدارة أسباب الهدر" @close="showReasonModal = false">
      <div class="space-y-3">
        <div class="flex gap-2">
          <input v-model="newReason" class="input" placeholder="اسم السبب الجديد" @keyup.enter="addReason" />
          <button @click="addReason" class="btn-gold !px-3"><Plus class="w-4 h-4" /></button>
        </div>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div v-for="r in wasteReasons" :key="r.id" class="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <span class="text-sm font-medium">{{ r.name }}</span>
            <button @click="deleteReason(r)" class="p-1 rounded-lg hover:bg-red-50 text-red-400"><Trash2 class="w-4 h-4" /></button>
          </div>
          <p v-if="!wasteReasons.length" class="text-center text-gray-400 py-4">لا توجد أسباب</p>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { Plus, Pencil, Trash2, Loader2, Fish, TrendingDown, FileText, Settings } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import StatCard from '../../components/StatCard.vue';
import Modal from '../../components/Modal.vue';
import ExportButton from '../../components/ExportButton.vue';
import DateRangePicker from '../../components/DateRangePicker.vue';
import api from '../../api';
import { useOrgLabels } from '../../composables/useOrgLabels';

const toast = inject('toast');
const { L } = useOrgLabels();

const columns = computed(() => [
  { key: 'waste_date', label: 'التاريخ', sortable: true },
  { key: 'fishType', label: L('product_type', 'نوع السمك') },
  { key: 'weight', label: 'الوزن', type: 'weight', sortable: true },
  { key: 'cost_per_kilo', label: 'تكلفة الكيلو', type: 'currency' },
  { key: 'total_cost', label: 'الإجمالي', type: 'currency', sortable: true },
  { key: 'reason', label: 'السبب' },
]);

const exportColumns = computed(() => [
  { key: 'waste_date', label: 'التاريخ' },
  { key: 'fish_type_name', label: L('product_type', 'نوع السمك') },
  { key: 'weight', label: 'الوزن' },
  { key: 'cost_per_kilo', label: 'تكلفة الكيلو' },
  { key: 'total_cost', label: 'الإجمالي' },
  { key: 'reason', label: 'السبب' },
  { key: 'notes', label: 'ملاحظات' },
]);

const wastes = ref([]);
const fishTypes = ref([]);
const wasteReasons = ref([]);
const filterFish = ref('');
const filterStartDate = ref('');
const filterEndDate = ref('');
const showModal = ref(false);
const showReasonModal = ref(false);
const editing = ref(false);
const saving = ref(false);
const costLoading = ref(false);
const avgInfo = ref(null);
const newReason = ref('');
const form = reactive({ fish_type_id: '', weight: 0, cost_per_kilo: 0, total_cost: 0, waste_date: new Date().toISOString().split('T')[0], reason: '', notes: '' });

const filteredWastes = computed(() => {
  let filtered = wastes.value;
  if (filterFish.value) filtered = filtered.filter(w => w.fish_type_id == filterFish.value);
  if (filterStartDate.value) filtered = filtered.filter(w => w.waste_date >= filterStartDate.value);
  if (filterEndDate.value) filtered = filtered.filter(w => w.waste_date <= filterEndDate.value);
  return filtered;
});

const totalWeight = computed(() => filteredWastes.value.reduce((s, w) => s + Number(w.weight), 0));
const totalCost = computed(() => filteredWastes.value.reduce((s, w) => s + Number(w.total_cost), 0));

const calcTotal = () => {
  form.total_cost = (Number(form.weight || 0) * Number(form.cost_per_kilo || 0)).toFixed(2);
};

const loadData = async () => {
  try {
    const [w, f, r] = await Promise.all([
      api.get('/fish-waste', { params: { limit: 500 } }),
      api.get('/fish-types', { params: { limit: 500 } }),
      api.get('/waste-reasons', { params: { limit: 100 } }),
    ]);
    wastes.value = w.data.data || w.data;
    fishTypes.value = f.data.data || f.data;
    wasteReasons.value = r.data.data || r.data;
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

const onFishChange = async () => {
  if (!form.fish_type_id) { avgInfo.value = null; form.cost_per_kilo = 0; calcTotal(); return; }
  costLoading.value = true;
  try {
    const { data } = await api.get(`/fish-waste/avg-cost/${form.fish_type_id}`);
    avgInfo.value = data;
    form.cost_per_kilo = Number(data.avg_cost).toFixed(2);
    calcTotal();
  } catch { toast('فشل حساب التكلفة', 'error'); }
  finally { costLoading.value = false; }
};

const openReasonModal = () => { showReasonModal.value = true; newReason.value = ''; };

const addReason = async () => {
  if (!newReason.value.trim()) return;
  try {
    await api.post('/waste-reasons', { name: newReason.value.trim() });
    newReason.value = '';
    const { data } = await api.get('/waste-reasons', { params: { limit: 100 } });
    wasteReasons.value = data.data || data;
    toast('تم إضافة السبب');
  } catch (err) {
    toast(err.response?.data?.error || 'فشل الإضافة', 'error');
  }
};

const deleteReason = async (r) => {
  try {
    await api.delete(`/waste-reasons/${r.id}`);
    wasteReasons.value = wasteReasons.value.filter(x => x.id !== r.id);
    toast('تم الحذف');
  } catch { toast('فشل', 'error'); }
};

const openModal = (row = null) => {
  if (row) {
    editing.value = true;
    Object.assign(form, { ...row, total_cost: Number(row.total_cost).toFixed(2) });
  } else {
    editing.value = false;
    Object.assign(form, { fish_type_id: '', weight: 0, cost_per_kilo: 0, total_cost: 0, waste_date: new Date().toISOString().split('T')[0], reason: '', notes: '' });
  }
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; };

const save = async () => {
  if (!form.fish_type_id || !form.weight) { toast('أدخل النوع والوزن', 'error'); return; }
  saving.value = true;
  try {
    calcTotal();
    if (editing.value) {
      await api.put(`/fish-waste/${form.id}`, form);
      toast('تم تعديل الهدر');
    } else {
      await api.post('/fish-waste', form);
      toast('تم تسجيل الهدر');
    }
    closeModal();
    loadData();
  } catch (err) {
    toast('فشل الحفظ', 'error');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (row) => {
  if (!confirm('حذف هذا السجل؟')) return;
  try { await api.delete(`/fish-waste/${row.id}`); toast('تم الحذف'); loadData(); }
  catch { toast('فشل', 'error'); }
};

onMounted(loadData);
</script>
