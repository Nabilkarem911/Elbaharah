<template>
  <div class="space-y-6">
    <PageHeader title="الدلالين" subtitle="إدارة موردي الأسماك">
      <template #actions>
        <button @click="openModal()" class="btn-gold">
          <Plus class="w-4 h-4" /> دلال جديد
        </button>
      </template>
    </PageHeader>

    <div class="card p-4">
      <div class="relative max-w-sm">
        <Search class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="search" class="input !pr-9 text-sm" placeholder="بحث بالاسم أو الرمز..." />
      </div>
    </div>

    <DataTable :data="filteredSuppliers" :columns="columns">
      <template #cell-is_active="{ value }">
        <span :class="value ? 'badge-success' : 'badge-danger'">{{ value ? 'نشط' : 'موقوف' }}</span>
      </template>
      <template #actions="{ row }">
        <router-link :to="`/suppliers/${row.id}`" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400">
          <Eye class="w-4 h-4" />
        </router-link>
        <button @click="openModal(row)" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400">
          <Pencil class="w-4 h-4" />
        </button>
        <button @click="confirmDelete(row)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
          <Trash2 class="w-4 h-4" />
        </button>
      </template>
    </DataTable>

    <Modal :show="showModal" :title="editing ? 'تعديل دلال' : 'دلال جديد'" @close="closeModal">
      <div class="space-y-4">
        <div><label class="label">الاسم</label><input v-model="form.name" class="input" /></div>
        <div><label class="label">الرمز</label><input v-model="form.code" class="input" /></div>
        <div><label class="label">الهاتف</label><input v-model="form.phone" class="input" /></div>
        <div><label class="label">ملاحظات</label><textarea v-model="form.notes" class="input" rows="2"></textarea></div>
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
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import Modal from '../../components/Modal.vue';
import api from '../../api';

const toast = inject('toast');

const columns = [
  { key: 'code', label: 'الرمز', sortable: true },
  { key: 'name', label: 'الاسم', sortable: true },
  { key: 'phone', label: 'الهاتف' },
  { key: 'balance', label: 'الرصيد', type: 'currency' },
  { key: 'is_active', label: 'الحالة' },
];

const suppliers = ref([]);
const search = ref('');
const showModal = ref(false);
const editing = ref(false);
const form = reactive({ name: '', code: '', phone: '', notes: '' });

const filteredSuppliers = computed(() =>
  suppliers.value.filter(s =>
    !search.value ||
    s.name?.includes(search.value) ||
    s.code?.includes(search.value)
  )
);

const loadData = async () => {
  try {
    const { data } = await api.get('/suppliers', { params: { limit: 500 } });
    suppliers.value = data.data || data;
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

const openModal = (row = null) => {
  if (row) { editing.value = true; Object.assign(form, row); }
  else { editing.value = false; Object.assign(form, { name: '', code: '', phone: '', notes: '' }); }
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; };

const save = async () => {
  try {
    if (editing.value) {
      await api.put(`/suppliers/${form.id}`, form);
      toast('تم التعديل بنجاح');
    } else {
      await api.post('/suppliers', form);
      toast('تم الإضافة بنجاح');
    }
    closeModal();
    loadData();
  } catch (err) {
    toast(err.response?.data?.error || 'فشل', 'error');
  }
};

const confirmDelete = async (row) => {
  if (!confirm(`حذف الدلال ${row.name}؟`)) return;
  try {
    await api.delete(`/suppliers/${row.id}`);
    toast('تم الحذف');
    loadData();
  } catch (err) {
    toast('لا يمكن الحذف — مرتبط بفواتير', 'error');
  }
};

onMounted(loadData);
</script>
