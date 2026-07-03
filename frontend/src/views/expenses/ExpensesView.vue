<template>
  <div class="space-y-6">
    <PageHeader title="المصروفات" subtitle="50 تصنيف — بيان نفقات المطعم">
      <template #actions>
        <button @click="openModal()" class="btn-gold"><Plus class="w-4 h-4" /> مصروف جديد</button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard title="إجمالي المصروفات" :value="totalAmount" :icon="Receipt" color="danger" suffix=" ر.س" />
      <StatCard title="عدد المصروفات" :value="expenses.length" :icon="FileText" color="primary" />
      <StatCard title="أعلى تصنيف" :value="topCategory" :icon="TrendingUp" color="gold" />
    </div>

    <div class="card p-4 flex flex-wrap gap-3">
      <select v-model="filterCategory" class="input !py-1.5 text-sm w-auto">
        <option value="">كل التصنيفات</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.code }}. {{ c.name }}</option>
      </select>
    </div>

    <DataTable :data="filtered" :columns="columns">
      <template #cell-category="{ value }">
        <span class="font-medium">{{ value?.name || '—' }}</span>
      </template>
      <template #actions="{ row }">
        <button @click="openModal(row)" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400"><Pencil class="w-4 h-4" /></button>
        <button @click="confirmDelete(row)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 class="w-4 h-4" /></button>
      </template>
    </DataTable>

    <Modal :show="showModal" :title="editing ? 'تعديل مصروف' : 'مصروف جديد'" @close="closeModal">
      <div class="space-y-4">
        <div><label class="label">التصنيف</label>
          <select v-model="form.category_id" class="input">
            <option value="">اختر التصنيف</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.code }}. {{ c.name }}</option>
          </select>
        </div>
        <div><label class="label">المبلغ</label><input type="number" step="0.01" v-model="form.amount" class="input tabular-nums" /></div>
        <div><label class="label">التاريخ</label><input type="date" v-model="form.expense_date" class="input" /></div>
        <div><label class="label">طريقة الدفع</label>
          <select v-model="form.payment_method" class="input">
            <option value="cash">نقدي</option><option value="credit">آجل</option><option value="transfer">تحويل</option>
          </select>
        </div>
        <div><label class="label">الوصف</label><textarea v-model="form.description" class="input" rows="2"></textarea></div>
      </div>
      <template #footer>
        <button @click="closeModal" class="btn-ghost">إلغاء</button>
        <button @click="save" class="btn-gold">{{ editing ? 'حفظ' : 'إضافة' }}</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { Plus, Pencil, Trash2, Receipt, FileText, TrendingUp } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import StatCard from '../../components/StatCard.vue';
import Modal from '../../components/Modal.vue';
import api from '../../api';

const toast = inject('toast');

const columns = [
  { key: 'expense_date', label: 'التاريخ', sortable: true },
  { key: 'category', label: 'التصنيف' },
  { key: 'amount', label: 'المبلغ', type: 'currency', sortable: true },
  { key: 'payment_method', label: 'الدفع' },
  { key: 'description', label: 'الوصف' },
];

const expenses = ref([]);
const categories = ref([]);
const filterCategory = ref('');
const showModal = ref(false);
const editing = ref(false);
const form = reactive({ category_id: '', amount: 0, expense_date: new Date().toISOString().split('T')[0], payment_method: 'cash', description: '' });

const filtered = computed(() => !filterCategory.value ? expenses.value : expenses.value.filter(e => e.category_id == filterCategory.value));
const totalAmount = computed(() => expenses.value.reduce((s, e) => s + Number(e.amount), 0));
const topCategory = computed(() => {
  const map = {};
  expenses.value.forEach(e => { const n = e.category?.name || '—'; map[n] = (map[n] || 0) + Number(e.amount); });
  return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
});

const loadData = async () => {
  try {
    const [e, c] = await Promise.all([
      api.get('/expenses', { params: { limit: 500 } }),
      api.get('/expense-categories', { params: { limit: 100 } }),
    ]);
    expenses.value = e.data.data || e.data;
    categories.value = c.data.data || c.data;
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

const openModal = (row = null) => {
  if (row) { editing.value = true; Object.assign(form, row); }
  else { editing.value = false; Object.assign(form, { category_id: '', amount: 0, expense_date: new Date().toISOString().split('T')[0], payment_method: 'cash', description: '' }); }
  showModal.value = true;
};
const closeModal = () => { showModal.value = false; };

const save = async () => {
  try {
    if (editing.value) { await api.put(`/expenses/${form.id}`, form); toast('تم التعديل'); }
    else { await api.post('/expenses', form); toast('تم الإضافة'); }
    closeModal(); loadData();
  } catch (err) { toast('فشل', 'error'); }
};

const confirmDelete = async (row) => {
  if (!confirm('حذف هذا المصروف؟')) return;
  try { await api.delete(`/expenses/${row.id}`); toast('تم الحذف'); loadData(); }
  catch { toast('فشل', 'error'); }
};

onMounted(loadData);
</script>
