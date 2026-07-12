<template>
  <div class="space-y-6">
    <PageHeader title="الفواتير الملغية" subtitle="الفواتير المرتجعة وأسبابها">
      <template #actions>
        <button @click="openModal()" class="btn-gold"><Plus class="w-4 h-4" /> فاتورة ملغية</button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard title="عدد الفواتير الملغية" :value="invoices.length" :icon="FileX" color="danger" />
      <StatCard title="إجمالي المبالغ" :value="totalAmount" :icon="Receipt" color="danger" suffix=" ر.س" />
      <StatCard title="إجمالي المرتجع" :value="totalReturned" :icon="Undo" color="warning" suffix=" ر.س" />
    </div>

    <DataTable :data="invoices" :columns="columns">
      <template #actions="{ row }">
        <button @click="openModal(row)" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400"><Pencil class="w-4 h-4" /></button>
        <button @click="confirmDelete(row)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 class="w-4 h-4" /></button>
      </template>
    </DataTable>

    <Modal :show="showModal" :title="editing ? 'تعديل' : 'فاتورة ملغية جديدة'" @close="closeModal">
      <div class="space-y-4">
        <div><label class="label">التاريخ</label><input type="date" v-model="form.invoice_date" class="input" /></div>
        <div><label class="label">رقم الفاتورة</label><input v-model="form.invoice_number" class="input" /></div>
        <div><label class="label">مبلغ الفاتورة</label><input type="number" step="0.01" v-model="form.invoice_amount" class="input tabular-nums" /></div>
        <div><label class="label">المبلغ المرتجع</label><input type="number" step="0.01" v-model="form.returned_amount" class="input tabular-nums" /></div>
        <div><label class="label">المتسبب</label><input v-model="form.responsible_person" class="input" /></div>
        <div><label class="label">شرح لسبب المشكلة</label><textarea v-model="form.reason" class="input" rows="3"></textarea></div>
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
import { Plus, Pencil, Trash2, FileX, Receipt, Undo } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import StatCard from '../../components/StatCard.vue';
import Modal from '../../components/Modal.vue';
import api from '../../api';

const toast = inject('toast');

const columns = [
  { key: 'invoice_date', label: 'التاريخ', sortable: true },
  { key: 'invoice_number', label: 'رقم الفاتورة', sortable: true },
  { key: 'invoice_amount', label: 'مبلغ الفاتورة', type: 'currency', sortable: true },
  { key: 'returned_amount', label: 'المبلغ المرتجع', type: 'currency' },
  { key: 'responsible_person', label: 'المتسبب' },
  { key: 'reason', label: 'شرح السبب' },
];

const invoices = ref([]);
const showModal = ref(false);
const editing = ref(false);
const form = reactive({ invoice_date: new Date().toISOString().split('T')[0], invoice_number: '', invoice_amount: 0, returned_amount: 0, responsible_person: '', reason: '' });

const totalAmount = computed(() => invoices.value.reduce((s, i) => s + Number(i.invoice_amount), 0));
const totalReturned = computed(() => invoices.value.reduce((s, i) => s + Number(i.returned_amount), 0));

const loadData = async () => {
  try {
    const { data } = await api.get('/cancelled-invoices', { params: { limit: 500 } });
    invoices.value = data.data || data;
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

const openModal = (row = null) => {
  if (row) { editing.value = true; Object.assign(form, row); }
  else { editing.value = false; Object.assign(form, { invoice_date: new Date().toISOString().split('T')[0], invoice_number: '', invoice_amount: 0, returned_amount: 0, responsible_person: '', reason: '' }); }
  showModal.value = true;
};
const closeModal = () => { showModal.value = false; };

const save = async () => {
  try {
    if (editing.value) { await api.put(`/cancelled-invoices/${form.id}`, form); toast('تم التعديل'); }
    else { await api.post('/cancelled-invoices', form); toast('تم الإضافة'); }
    closeModal(); loadData();
  } catch (err) { toast('فشل', 'error'); }
};

const confirmDelete = async (row) => {
  if (!confirm('حذف هذا السجل؟')) return;
  try { await api.delete(`/cancelled-invoices/${row.id}`); toast('تم الحذف'); loadData(); }
  catch { toast('فشل', 'error'); }
};

onMounted(loadData);
</script>
