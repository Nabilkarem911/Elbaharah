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
        <button v-if="row.role !== 'admin'" @click="openPermissionsModal(row)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400" title="الصلاحيات"><ShieldCheck class="w-4 h-4" /></button>
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

    <!-- Permissions Modal -->
    <Modal :show="showPermissionsModal" :title="`صلاحيات: ${permissionsUser?.full_name || ''}`" size="lg" @close="showPermissionsModal = false">
      <div v-if="permissionsLoading" class="p-8 text-center text-gray-400">جاري التحميل...</div>
      <div v-else class="space-y-3">
        <p class="text-sm text-gray-500 mb-3">حدد الصفحات التي يمكن لهذا المستخدم الوصول إليها. اترك الكل فارغ للسماح بكل صفحات المنشأة.</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <label
            v-for="page in availablePages"
            :key="page.key"
            class="flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all"
            :class="selectedPermissions.includes(page.key)
              ? 'border-primary-300 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'"
          >
            <input
              type="checkbox"
              :value="page.key"
              v-model="selectedPermissions"
              class="w-4 h-4 rounded text-primary-500 focus:ring-primary-200"
            />
            <span class="text-sm font-medium text-gray-700">{{ page.label }}</span>
          </label>
        </div>
      </div>
      <template #footer>
        <button @click="showPermissionsModal = false" class="btn-ghost">إلغاء</button>
        <button @click="savePermissions" class="btn-gold" :disabled="savingPermissions">
          {{ savingPermissions ? 'جاري الحفظ...' : 'حفظ الصلاحيات' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue';
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-vue-next';
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

const showPermissionsModal = ref(false);
const permissionsUser = ref(null);
const availablePages = ref([]);
const selectedPermissions = ref([]);
const permissionsLoading = ref(false);
const savingPermissions = ref(false);

const openPermissionsModal = async (row) => {
  permissionsUser.value = row;
  showPermissionsModal.value = true;
  permissionsLoading.value = true;
  selectedPermissions.value = row.permissions || [];
  try {
    const { data } = await api.get('/pages/available');
    availablePages.value = data.pages || [];
  } catch (err) {
    toast('فشل تحميل الصفحات', 'error');
  } finally {
    permissionsLoading.value = false;
  }
};

const savePermissions = async () => {
  savingPermissions.value = true;
  try {
    await api.put(`/users/${permissionsUser.value.id}/permissions`, { permissions: selectedPermissions.value });
    toast('تم حفظ الصلاحيات بنجاح');
    showPermissionsModal.value = false;
    loadData();
  } catch (err) {
    toast(err.response?.data?.error || 'فشل حفظ الصلاحيات', 'error');
  } finally {
    savingPermissions.value = false;
  }
};

onMounted(loadData);
</script>
