<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-700">المنشآت</h1>
        <p class="text-sm text-slate-500 mt-1">إدارة جميع المنشآت المسجلة في النظام</p>
      </div>
      <button
        @click="showModal = true"
        class="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium text-sm"
      >
        <Plus class="w-5 h-5" />
        <span>إضافة منشأة</span>
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-5 border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Building2 class="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-slate-700">{{ organizations.length }}</p>
            <p class="text-xs text-slate-500">إجمالي المنشآت</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-5 border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle class="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-slate-700">{{ activeCount }}</p>
            <p class="text-xs text-slate-500">منشآت نشطة</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-5 border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <PauseCircle class="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-slate-700">{{ organizations.length - activeCount }}</p>
            <p class="text-xs text-slate-500">منشآت موقوفة</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-slate-400">
        <Loader2 class="w-8 h-8 animate-spin mx-auto mb-2" />
        جاري التحميل...
      </div>
      <div v-else-if="!organizations.length" class="p-12 text-center text-slate-400">
        <Building2 class="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>لا توجد منشآت بعد</p>
        <p class="text-sm mt-1">اضغط "إضافة منشأة" لإنشاء أول منشأة</p>
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">المنشأة</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">نوع النشاط</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">الفروع</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">العملة</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">الحالة</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="org in organizations" :key="org.id" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Building2 class="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p class="font-medium text-slate-700 text-sm">{{ org.name }}</p>
                  <p v-if="org.phone" class="text-xs text-slate-400">{{ org.phone }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                {{ activityLabel(org.activity_type) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span class="text-sm text-slate-600">{{ org.branches?.length || 0 }} فرع</span>
            </td>
            <td class="px-4 py-3">
              <span class="text-sm text-slate-600">{{ org.currency }}</span>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium"
                :class="org.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'"
              >
                {{ org.is_active ? 'نشط' : 'موقوف' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button
                  @click="$router.push(`/super-admin/organizations/${org.id}`)"
                  class="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors"
                  title="عرض"
                >
                  <Eye class="w-4 h-4" />
                </button>
                <button
                  @click="toggleOrg(org)"
                  class="p-2 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors"
                  :title="org.is_active ? 'إيقاف' : 'تفعيل'"
                >
                  <component :is="org.is_active ? PauseCircle : PlayCircle" class="w-4 h-4" />
                </button>
                <button
                  @click="deleteOrg(org)"
                  class="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  title="حذف"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <Modal :show="showModal" @close="showModal = false" title="إضافة منشأة جديدة" size="lg">
      <div class="space-y-4">
        <!-- Org info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">اسم المنشأة *</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
              placeholder="مثلاً: مطعم بشاميل"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">نوع النشاط *</label>
            <select
              v-model="form.activity_type"
              class="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
            >
              <option value="fish_restaurant">مطعم سمك</option>
              <option value="restaurant">مطعم عام</option>
              <option value="honey_shop">محل عسل</option>
              <option value="retail">محل تجزئة</option>
              <option value="bakery">مخبز</option>
              <option value="custom">مخصص</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">العملة</label>
            <input
              v-model="form.currency"
              type="text"
              class="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
              placeholder="SAR"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">الهاتف</label>
            <input
              v-model="form.phone"
              type="text"
              class="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
              placeholder="05xxxxxxxx"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">العنوان</label>
          <input
            v-model="form.address"
            type="text"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
            placeholder="المدينة، الحي، الشارع"
          />
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-100 pt-4">
          <h3 class="font-semibold text-slate-700 text-sm mb-3">حساب الأدمن</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1">اسم المستخدم *</label>
              <input
                v-model="form.admin_username"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                placeholder="admin"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1">الاسم الكامل *</label>
              <input
                v-model="form.admin_full_name"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                placeholder="أحمد محمد"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-slate-600 mb-1">كلمة المرور *</label>
              <input
                v-model="form.admin_password"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                placeholder="6 أحرف على الأقل"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          @click="showModal = false"
          class="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          إلغاء
        </button>
        <button
          @click="createOrg"
          :disabled="creating"
          class="px-4 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {{ creating ? 'جاري الإنشاء...' : 'إنشاء المنشأة' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import api from '../../api';
import Modal from '../../components/Modal.vue';
import {
  Plus, Building2, Eye, Trash2, CheckCircle, PauseCircle, PlayCircle,
  Loader2,
} from 'lucide-vue-next';

const showToast = inject('toast');
const organizations = ref([]);
const loading = ref(true);
const showModal = ref(false);
const creating = ref(false);

const form = reactive({
  name: '',
  activity_type: 'fish_restaurant',
  currency: 'SAR',
  phone: '',
  address: '',
  admin_username: '',
  admin_password: '',
  admin_full_name: '',
});

const activeCount = computed(() => organizations.value.filter(o => o.is_active).length);

const activityLabels = {
  fish_restaurant: 'مطعم سمك',
  restaurant: 'مطعم عام',
  honey_shop: 'محل عسل',
  retail: 'محل تجزئة',
  bakery: 'مخبز',
  custom: 'مخصص',
};

const activityLabel = (type) => activityLabels[type] || type;

const fetchOrganizations = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/super-admin');
    organizations.value = data;
  } catch (err) {
    showToast('فشل تحميل المنشآت', 'error');
  } finally {
    loading.value = false;
  }
};

const createOrg = async () => {
  if (!form.name || !form.admin_username || !form.admin_password || !form.admin_full_name) {
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }
  creating.value = true;
  try {
    await api.post('/super-admin', form);
    showToast('تم إنشاء المنشأة بنجاح');
    showModal.value = false;
    Object.assign(form, {
      name: '', activity_type: 'fish_restaurant', currency: 'SAR',
      phone: '', address: '', admin_username: '', admin_password: '', admin_full_name: '',
    });
    await fetchOrganizations();
  } catch (err) {
    showToast(err.response?.data?.error || 'فشل إنشاء المنشأة', 'error');
  } finally {
    creating.value = false;
  }
};

const toggleOrg = async (org) => {
  try {
    await api.patch(`/super-admin/${org.id}/toggle`);
    org.is_active = !org.is_active;
    showToast(org.is_active ? 'تم تفعيل المنشأة' : 'تم إيقاف المنشأة');
  } catch (err) {
    showToast('فشل تحديث الحالة', 'error');
  }
};

const deleteOrg = async (org) => {
  if (!confirm(`هل تريد حذف "${org.name}"؟ سيتم حذف جميع بياناتها.`)) return;
  try {
    await api.delete(`/super-admin/${org.id}`);
    showToast('تم حذف المنشأة');
    await fetchOrganizations();
  } catch (err) {
    showToast('فشل حذف المنشأة', 'error');
  }
};

onMounted(fetchOrganizations);
</script>
