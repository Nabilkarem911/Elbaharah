<template>
  <div class="space-y-6">
    <PageHeader title="مبيعات أخرى" subtitle="مبيعات خارج قائمة المطعم">
      <template #actions>
        <button @click="openModal()" class="btn-gold"><Plus class="w-4 h-4" /> مبيعة جديدة</button>
      </template>
    </PageHeader>

    <DataTable :data="sales" :columns="columns">
      <template #actions="{ row }">
        <button @click="openModal(row)" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400"><Pencil class="w-4 h-4" /></button>
        <button @click="confirmDelete(row)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 class="w-4 h-4" /></button>
      </template>
    </DataTable>

    <Modal :show="showModal" :title="editing ? 'تعديل' : 'مبيعة أخرى'" @close="closeModal">
      <div class="space-y-4">
        <div><label class="label">التاريخ</label><input type="date" v-model="form.sale_date" class="input" /></div>
        <div><label class="label">الصنف</label><input v-model="form.item_name" class="input" /></div>
        <div><label class="label">سعر الوحدة</label><input type="number" step="0.01" v-model="form.unit_price" class="input tabular-nums" /></div>
        <div><label class="label">الكمية</label><input type="number" step="0.01" v-model="form.quantity" class="input tabular-nums" /></div>
        <div class="p-3 bg-primary-50 rounded-xl text-sm">الإجمالي: <span class="font-bold tabular-nums">{{ (Number(form.unit_price) * Number(form.quantity)).toFixed(2) }} ر.س</span></div>
      </div>
      <template #footer>
        <button @click="closeModal" class="btn-ghost">إلغاء</button>
        <button @click="save" class="btn-gold">{{ editing ? 'حفظ' : 'إضافة' }}</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue';
import { Plus, Pencil, Trash2 } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import Modal from '../../components/Modal.vue';
import api from '../../api';

const toast = inject('toast');
const columns = [
  { key: 'sale_date', label: 'التاريخ', sortable: true },
  { key: 'item_name', label: 'الصنف' },
  { key: 'unit_price', label: 'سعر الوحدة', type: 'currency' },
  { key: 'quantity', label: 'الكمية', type: 'number' },
  { key: 'total', label: 'الإجمالي', type: 'currency', sortable: true },
];

const sales = ref([]);
const showModal = ref(false);
const editing = ref(false);
const form = reactive({ sale_date: new Date().toISOString().split('T')[0], item_name: '', unit_price: 0, quantity: 1 });

const loadData = async () => {
  const { data } = await api.get('/other-sales', { params: { limit: 500 } });
  sales.value = data.data || data;
};

const openModal = (row = null) => {
  if (row) { editing.value = true; Object.assign(form, row); }
  else { editing.value = false; Object.assign(form, { sale_date: new Date().toISOString().split('T')[0], item_name: '', unit_price: 0, quantity: 1 }); }
  showModal.value = true;
};
const closeModal = () => { showModal.value = false; };

const save = async () => {
  try {
    if (editing.value) { await api.put(`/other-sales/${form.id}`, form); toast('تم التعديل'); }
    else { await api.post('/other-sales', form); toast('تم الإضافة'); }
    closeModal(); loadData();
  } catch { toast('فشل', 'error'); }
};

const confirmDelete = async (row) => {
  if (!confirm('حذف؟')) return;
  try { await api.delete(`/other-sales/${row.id}`); toast('تم الحذف'); loadData(); }
  catch { toast('فشل', 'error'); }
};

onMounted(loadData);
</script>
