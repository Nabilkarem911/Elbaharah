<template>
  <div class="space-y-6">
    <PageHeader title="الفروع" subtitle="إدارة فروع المنشأة">
      <template #actions>
        <button @click="openModal()" class="btn-gold"><Plus class="w-4 h-4" /> فرع جديد</button>
      </template>
    </PageHeader>

    <DataTable :data="branches" :columns="columns">
      <template #cell-is_main="{ value }">
        <span v-if="value" class="badge badge-gold">فرع رئيسي</span>
        <span v-else class="text-xs text-gray-400">فرع عادي</span>
      </template>
      <template #cell-is_active="{ value }">
        <span :class="value ? 'badge-success' : 'badge-danger'">{{ value ? 'نشط' : 'موقوف' }}</span>
      </template>
      <template #actions="{ row }">
        <button @click="openModal(row)" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400"><Pencil class="w-4 h-4" /></button>
        <button
          v-if="!row.is_main"
          @click="confirmDelete(row)"
          class="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
        ><Trash2 class="w-4 h-4" /></button>
      </template>
    </DataTable>

    <Modal :show="showModal" :title="editing ? 'تعديل فرع' : 'فرع جديد'" @close="closeModal">
      <div class="space-y-4">
        <div><label class="label">اسم الفرع</label><input v-model="form.name" class="input" placeholder="مثلاً: فرع جدة" /></div>
        <div><label class="label">الهاتف</label><input v-model="form.phone" class="input" placeholder="05xxxxxxxx" /></div>
        <div><label class="label">العنوان</label><input v-model="form.address" class="input" placeholder="المدينة، الحي" /></div>
        <div v-if="editing && !form.is_main"><label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="form.is_active" class="w-4 h-4 rounded border-gray-300 text-primary-500" />
          <span class="text-sm text-gray-600">نشط</span>
        </label></div>
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
  { key: 'name', label: 'اسم الفرع', sortable: true },
  { key: 'phone', label: 'الهاتف' },
  { key: 'address', label: 'العنوان' },
  { key: 'is_main', label: 'النوع' },
  { key: 'is_active', label: 'الحالة' },
];

const branches = ref([]);
const showModal = ref(false);
const editing = ref(false);
const form = reactive({ name: '', phone: '', address: '', is_active: true, is_main: false });

const loadData = async () => {
  try {
    const { data } = await api.get('/branches');
    branches.value = data;
  } catch (err) {
    toast('فشل تحميل الفروع', 'error');
  }
};

const openModal = (row = null) => {
  if (row) {
    editing.value = true;
    Object.assign(form, row);
  } else {
    editing.value = false;
    Object.assign(form, { name: '', phone: '', address: '', is_active: true, is_main: false });
  }
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; };

const save = async () => {
  if (!form.name) { toast('اسم الفرع مطلوب', 'error'); return; }
  try {
    if (editing.value) {
      await api.put(`/branches/${form.id}`, form);
      toast('تم التعديل');
    } else {
      await api.post('/branches', form);
      toast('تم إضافة الفرع');
    }
    closeModal();
    loadData();
  } catch (err) {
    toast(err.response?.data?.error || 'فشل', 'error');
  }
};

const confirmDelete = async (row) => {
  if (!confirm(`حذف فرع "${row.name}"؟`)) return;
  try {
    await api.delete(`/branches/${row.id}`);
    toast('تم الحذف');
    loadData();
  } catch (err) {
    toast(err.response?.data?.error || 'فشل', 'error');
  }
};

onMounted(loadData);
</script>
