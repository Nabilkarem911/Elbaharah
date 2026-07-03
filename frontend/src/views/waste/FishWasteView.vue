<template>
  <div class="space-y-6">
    <PageHeader title="هدر الأسماك" subtitle="تسجيل الهدر والتالف وحساب الخسائر">
      <template #actions>
        <ExportButton :data="wastes" :columns="exportColumns" filename="هدر_الأسماك" title="هدر الأسماك" />
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
          <label class="label">نوع السمك</label>
          <select v-model="form.fish_type_id" class="input">
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
            <label class="label">تكلفة الكيلو (ر.س)</label>
            <input type="number" step="0.01" v-model="form.cost_per_kilo" class="input tabular-nums" @input="calcTotal" />
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
            <option value="انتهاء الصلاحية">انتهاء الصلاحية</option>
            <option value="تلف">تلف</option>
            <option value="حرق">حرق</option>
            <option value="تساقط">تساقط</option>
            <option value="جودة رديئة">جودة رديئة</option>
            <option value="خطأ في التجهيز">خطأ في التجهيز</option>
            <option value="أخرى">أخرى</option>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { Plus, Pencil, Trash2, Loader2, Fish, TrendingDown, FileText } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import StatCard from '../../components/StatCard.vue';
import Modal from '../../components/Modal.vue';
import ExportButton from '../../components/ExportButton.vue';
import DateRangePicker from '../../components/DateRangePicker.vue';
import api from '../../api';

const toast = inject('toast');

const columns = [
  { key: 'waste_date', label: 'التاريخ', sortable: true },
  { key: 'fishType', label: 'نوع السمك' },
  { key: 'weight', label: 'الوزن', type: 'weight', sortable: true },
  { key: 'cost_per_kilo', label: 'تكلفة الكيلو', type: 'currency' },
  { key: 'total_cost', label: 'الإجمالي', type: 'currency', sortable: true },
  { key: 'reason', label: 'السبب' },
];

const exportColumns = [
  { key: 'waste_date', label: 'التاريخ' },
  { key: 'fish_type_name', label: 'نوع السمك' },
  { key: 'weight', label: 'الوزن' },
  { key: 'cost_per_kilo', label: 'تكلفة الكيلو' },
  { key: 'total_cost', label: 'الإجمالي' },
  { key: 'reason', label: 'السبب' },
  { key: 'notes', label: 'ملاحظات' },
];

const wastes = ref([]);
const fishTypes = ref([]);
const filterFish = ref('');
const filterStartDate = ref('');
const filterEndDate = ref('');
const showModal = ref(false);
const editing = ref(false);
const saving = ref(false);
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
    const [w, f] = await Promise.all([
      api.get('/fish-waste', { params: { limit: 500 } }),
      api.get('/fish-types', { params: { limit: 500 } }),
    ]);
    wastes.value = w.data.data || w.data;
    fishTypes.value = f.data.data || f.data;
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
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
