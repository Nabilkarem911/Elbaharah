<template>
  <div class="space-y-6">
    <!-- Back -->
    <button
      @click="$router.push('/super-admin/organizations')"
      class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
    >
      <ArrowRight class="w-4 h-4" />
      <span>العودة للمنشآت</span>
    </button>

    <div v-if="loading" class="p-12 text-center text-slate-400">
      <Loader2 class="w-8 h-8 animate-spin mx-auto mb-2" />
      جاري التحميل...
    </div>

    <template v-else-if="org">
      <!-- Org header -->
      <div class="bg-white rounded-2xl p-6 border border-gray-100">
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <Building2 class="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-700">{{ org.name }}</h1>
              <div class="flex items-center gap-2 mt-1">
                <span class="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                  {{ activityLabel(org.activity_type) }}
                </span>
                <span
                  class="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-medium"
                  :class="org.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'"
                >
                  {{ org.is_active ? 'نشط' : 'موقوف' }}
                </span>
              </div>
              <p v-if="org.phone" class="text-sm text-slate-400 mt-1">{{ org.phone }}</p>
              <p v-if="org.address" class="text-sm text-slate-400">{{ org.address }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="toggleOrg"
              class="px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              :class="org.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'"
            >
              {{ org.is_active ? 'إيقاف' : 'تفعيل' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-5 border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <GitBranch class="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-700">{{ org.branches?.length || 0 }}</p>
              <p class="text-xs text-slate-500">الفروع</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users class="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-700">{{ org.users?.length || 0 }}</p>
              <p class="text-xs text-slate-500">المستخدمين</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Coins class="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-700">{{ org.currency }}</p>
              <p class="text-xs text-slate-500">العملة</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Branches -->
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-slate-700">الفروع</h3>
          <button
            @click="showBranchModal = true"
            class="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
          >
            <Plus class="w-4 h-4" />
            <span>إضافة فرع</span>
          </button>
        </div>
        <div v-if="!org.branches?.length" class="p-8 text-center text-slate-400 text-sm">
          لا توجد فروع
        </div>
        <table v-else class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">اسم الفرع</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">الهاتف</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">النوع</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">الحالة</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="branch in org.branches" :key="branch.id" class="hover:bg-gray-50/50">
              <td class="px-4 py-3 text-sm font-medium text-slate-700">{{ branch.name }}</td>
              <td class="px-4 py-3 text-sm text-slate-500">{{ branch.phone || '—' }}</td>
              <td class="px-4 py-3">
                <span v-if="branch.is_main" class="inline-flex px-2 py-0.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600">
                  فرع رئيسي
                </span>
                <span v-else class="text-xs text-slate-400">فرع عادي</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex px-2 py-0.5 rounded-lg text-xs font-medium"
                  :class="branch.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'"
                >
                  {{ branch.is_active ? 'نشط' : 'موقوف' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button
                  v-if="!branch.is_main"
                  @click="deleteBranch(branch)"
                  class="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Users -->
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-slate-700">المستخدمين</h3>
        </div>
        <div v-if="!org.users?.length" class="p-8 text-center text-slate-400 text-sm">
          لا يوجد مستخدمين
        </div>
        <table v-else class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">الاسم</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">اسم المستخدم</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">الدور</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">الحالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in org.users" :key="user.id" class="hover:bg-gray-50/50">
              <td class="px-4 py-3 text-sm font-medium text-slate-700">{{ user.full_name }}</td>
              <td class="px-4 py-3 text-sm text-slate-500">{{ user.username }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                  {{ roleLabel(user.role) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex px-2 py-0.5 rounded-lg text-xs font-medium"
                  :class="user.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'"
                >
                  {{ user.is_active ? 'نشط' : 'موقوف' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Branch Modal -->
    <Modal :show="showBranchModal" @close="showBranchModal = false" title="إضافة فرع جديد" size="md">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">اسم الفرع *</label>
          <input
            v-model="branchForm.name"
            type="text"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
            placeholder="مثلاً: فرع جدة"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">الهاتف</label>
          <input
            v-model="branchForm.phone"
            type="text"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
            placeholder="05xxxxxxxx"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">العنوان</label>
          <input
            v-model="branchForm.address"
            type="text"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
            placeholder="المدينة، الحي"
          />
        </div>
      </div>
      <template #footer>
        <button
          @click="showBranchModal = false"
          class="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          إلغاء
        </button>
        <button
          @click="createBranch"
          class="px-4 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm font-medium"
        >
          إضافة
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../api';
import Modal from '../../components/Modal.vue';
import {
  Building2, Plus, Trash2, ArrowRight, Loader2, GitBranch, Users, Coins,
} from 'lucide-vue-next';

const route = useRoute();
const showToast = inject('toast');
const org = ref(null);
const loading = ref(true);
const showBranchModal = ref(false);

const branchForm = reactive({ name: '', phone: '', address: '' });

const activityLabels = {
  fish_restaurant: 'مطعم سمك',
  restaurant: 'مطعم عام',
  honey_shop: 'محل عسل',
  retail: 'محل تجزئة',
  bakery: 'مخبز',
  custom: 'مخصص',
};

const roleLabels = {
  super_admin: 'مدير عام',
  admin: 'أدمن',
  manager: 'مدير',
  cashier: 'كاشير',
  accountant: 'محاسب',
};

const activityLabel = (type) => activityLabels[type] || type;
const roleLabel = (role) => roleLabels[role] || role;

const fetchOrg = async () => {
  loading.value = true;
  try {
    const { data } = await api.get(`/super-admin/${route.params.id}`);
    org.value = data;
  } catch (err) {
    showToast('فشل تحميل بيانات المنشأة', 'error');
  } finally {
    loading.value = false;
  }
};

const toggleOrg = async () => {
  try {
    await api.patch(`/super-admin/${org.value.id}/toggle`);
    org.value.is_active = !org.value.is_active;
    showToast(org.value.is_active ? 'تم تفعيل المنشأة' : 'تم إيقاف المنشأة');
  } catch (err) {
    showToast('فشل تحديث الحالة', 'error');
  }
};

const createBranch = async () => {
  if (!branchForm.name) {
    showToast('اسم الفرع مطلوب', 'error');
    return;
  }
  try {
    const { data } = await api.post(`/super-admin/${org.value.id}/branches`, branchForm);
    org.value.branches.push(data);
    showToast('تم إضافة الفرع');
    showBranchModal.value = false;
    Object.assign(branchForm, { name: '', phone: '', address: '' });
  } catch (err) {
    showToast(err.response?.data?.error || 'فشل إضافة الفرع', 'error');
  }
};

const deleteBranch = async (branch) => {
  if (!confirm(`هل تريد حذف فرع "${branch.name}"؟`)) return;
  try {
    await api.delete(`/super-admin/${org.value.id}/branches/${branch.id}`);
    org.value.branches = org.value.branches.filter(b => b.id !== branch.id);
    showToast('تم حذف الفرع');
  } catch (err) {
    showToast(err.response?.data?.error || 'فشل حذف الفرع', 'error');
  }
};

onMounted(fetchOrg);
</script>
