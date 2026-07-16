<template>
  <div class="space-y-6">
    <PageHeader title="المستخدمين" subtitle="إدارة الحسابات والصلاحيات">
      <template #actions>
        <button @click="openModal()" class="btn-gold"><Plus class="w-4 h-4" /> مستخدم جديد</button>
      </template>
    </PageHeader>

    <DataTable :data="users" :columns="columns">
      <template #cell-role="{ value }">
        <span class="badge" :class="roleBadge(value)">{{ roleLabel(value) }}</span>
      </template>
      <template #cell-branch_name="{ value }">
        <span class="text-sm text-gray-600">{{ value || '—' }}</span>
      </template>
      <template #cell-is_active="{ value }">
        <span :class="value ? 'badge-success' : 'badge-danger'">{{ value ? 'نشط' : 'موقوف' }}</span>
      </template>
      <template #actions="{ row }">
        <button @click="openModal(row)" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400"><Pencil class="w-4 h-4" /></button>
        <button @click="confirmDelete(row)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 class="w-4 h-4" /></button>
      </template>
    </DataTable>

    <Modal :show="showModal" :title="editing ? 'تعديل مستخدم' : 'مستخدم جديد'" @close="closeModal">
      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label class="label">اسم المستخدم</label><input v-model="form.username" class="input" :disabled="editing" /></div>
          <div><label class="label">رقم الهاتف</label><input v-model="form.phone" class="input" placeholder="05xxxxxxxx" /></div>
        </div>
        <div><label class="label">الاسم الكامل</label><input v-model="form.full_name" class="input" /></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label class="label">كلمة المرور</label><input type="password" v-model="form.password_hash" class="input" :placeholder="editing ? 'اتركها فارغة لعدم التغيير' : ''" /></div>
          <div><label class="label">الدور</label>
            <select v-model="form.role" class="input">
              <option value="admin">مدير عام</option>
              <option value="manager">محاسب</option>
              <option value="cashier">كاشير</option>
              <option value="accountant">محاسب</option>
            </select>
          </div>
        </div>
        <div v-if="branches.length > 0">
          <label class="label">الفرع</label>
          <select v-model="form.branch_id" class="input">
            <option :value="null">— بدون فرع محدد —</option>
            <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>
        <div><label class="flex items-center gap-2 cursor-pointer">
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
  { key: 'username', label: 'اسم المستخدم', sortable: true },
  { key: 'phone', label: 'الهاتف' },
  { key: 'full_name', label: 'الاسم الكامل', sortable: true },
  { key: 'branch_name', label: 'الفرع' },
  { key: 'role', label: 'الدور' },
  { key: 'is_active', label: 'الحالة' },
  { key: 'last_login', label: 'آخر دخول' },
];

const users = ref([]);
const branches = ref([]);
const showModal = ref(false);
const editing = ref(false);
const form = reactive({ username: '', phone: '', full_name: '', password_hash: '', role: 'cashier', branch_id: null, is_active: true });

const roleLabels = { admin: 'مدير عام', manager: 'محاسب', cashier: 'كاشير', accountant: 'محاسب' };
const roleLabel = (v) => roleLabels[v] || v;
const roleBadge = (v) => ({ admin: 'badge-gold', manager: 'badge-info', cashier: 'badge-success', accountant: 'badge-info' }[v] || 'badge-info');

const loadData = async () => {
  try {
    const [usersRes, branchesRes] = await Promise.all([
      api.get('/users', { params: { limit: 100 } }),
      api.get('/branches'),
    ]);
    users.value = (usersRes.data.data || usersRes.data).map(u => ({
      ...u,
      branch_name: branchesRes.data.find(b => b.id === u.branch_id)?.name || '',
    }));
    branches.value = branchesRes.data;
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

const openModal = (row = null) => {
  if (row) { editing.value = true; Object.assign(form, row); form.password_hash = ''; }
  else { editing.value = false; Object.assign(form, { username: '', phone: '', full_name: '', password_hash: '', role: 'cashier', branch_id: null, is_active: true }); }
  showModal.value = true;
};
const closeModal = () => { showModal.value = false; };

const save = async () => {
  try {
    const payload = { ...form };
    if (editing.value && !payload.password_hash) delete payload.password_hash;
    if (editing.value) { await api.put(`/users/${form.id}`, payload); toast('تم التعديل'); }
    else { await api.post('/users', payload); toast('تم الإضافة'); }
    closeModal(); loadData();
  } catch (err) { toast(err.response?.data?.error || 'فشل', 'error'); }
};

const confirmDelete = async (row) => {
  if (!confirm(`حذف المستخدم ${row.username}؟`)) return;
  try { await api.delete(`/users/${row.id}`); toast('تم الحذف'); loadData(); }
  catch { toast('فشل', 'error'); }
};

onMounted(loadData);
</script>
