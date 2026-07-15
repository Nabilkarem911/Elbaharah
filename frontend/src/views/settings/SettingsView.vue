<template>
  <div class="space-y-6">
    <PageHeader title="الإعدادات" subtitle="إدارة الأنواع، الدلالين، الأجهزة، التطبيقات، التصنيفات" />

    <!-- Tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
        :class="activeTab === tab.key ? 'bg-primary-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-primary-50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Fish Types -->
    <div v-if="activeTab === 'fish'" class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="fishForm.code" class="input max-w-[100px]" placeholder="الرمز" type="number" />
        <input v-model="fishForm.name" class="input max-w-xs" placeholder="اسم النوع" />
        <input v-model="fishForm.name_en" class="input max-w-xs" placeholder="الاسم الإنجليزي" />
        <button v-if="!editingFish" @click="saveFish" class="btn-gold"><Plus class="w-4 h-4" /> إضافة</button>
        <button v-else @click="updateFish" class="btn-gold"><Loader2 v-if="savingFish" class="w-4 h-4 animate-spin" /> حفظ التعديل</button>
        <button v-if="editingFish" @click="cancelEditFish" class="btn-ghost">إلغاء</button>
      </div>
      <DataTable :data="fishTypes" :columns="fishColumns">
        <template #cell-is_active="{ value }">
          <span :class="value ? 'badge-success' : 'badge-danger'">{{ value ? 'نشط' : 'موقوف' }}</span>
        </template>
        <template #actions="{ row }">
          <button @click="editFish(row)" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400"><Pencil class="w-4 h-4" /></button>
          <button @click="toggleActive(row, 'fish-types')" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400"><Power class="w-4 h-4" /></button>
          <button @click="deleteItem(row, 'fish-types')" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 class="w-4 h-4" /></button>
        </template>
      </DataTable>
    </div>

    <!-- POS Machines -->
    <div v-if="activeTab === 'pos'" class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="posForm.machine_number" class="input max-w-xs" placeholder="رقم الجهاز" type="number" />
        <input v-model="posForm.terminal_id" class="input max-w-xs" placeholder="رقم الترمنال" />
        <input v-model="posForm.bank" class="input max-w-xs" placeholder="البنك" />
        <button v-if="!editingPos" @click="savePos" class="btn-gold"><Plus class="w-4 h-4" /> إضافة</button>
        <button v-else @click="updatePos" class="btn-gold"><Loader2 v-if="savingPos" class="w-4 h-4 animate-spin" /> حفظ التعديل</button>
        <button v-if="editingPos" @click="cancelEditPos" class="btn-ghost">إلغاء</button>
      </div>
      <DataTable :data="posMachines" :columns="posColumns">
        <template #cell-is_active="{ value }">
          <span :class="value ? 'badge-success' : 'badge-danger'">{{ value ? 'نشط' : 'موقوف' }}</span>
        </template>
        <template #actions="{ row }">
          <button @click="editPos(row)" class="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400"><Pencil class="w-4 h-4" /></button>
          <button @click="deleteItem(row, 'pos/machines')" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 class="w-4 h-4" /></button>
        </template>
      </DataTable>
    </div>

    <!-- Delivery Platforms -->
    <div v-if="activeTab === 'delivery'" class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="delForm.name" class="input max-w-xs" placeholder="اسم التطبيق" />
        <input v-model="delForm.key" class="input max-w-xs" placeholder="المفتاح (إنجليزي)" />
        <button @click="saveDelivery" class="btn-gold"><Plus class="w-4 h-4" /> إضافة</button>
      </div>
      <DataTable :data="deliveryPlatforms" :columns="delColumns">
        <template #cell-is_active="{ value }">
          <span :class="value ? 'badge-success' : 'badge-danger'">{{ value ? 'نشط' : 'موقوف' }}</span>
        </template>
        <template #actions="{ row }">
          <button @click="deleteItem(row, 'delivery-platforms')" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 class="w-4 h-4" /></button>
        </template>
      </DataTable>
    </div>

    <!-- Expense Categories -->
    <div v-if="activeTab === 'expenses'" class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="expForm.code" class="input max-w-xs" placeholder="الرمز" type="number" />
        <input v-model="expForm.name" class="input max-w-xs" placeholder="اسم التصنيف" />
        <button @click="saveExpCat" class="btn-gold"><Plus class="w-4 h-4" /> إضافة</button>
      </div>
      <DataTable :data="expenseCategories" :columns="expColumns">
        <template #cell-is_active="{ value }">
          <span :class="value ? 'badge-success' : 'badge-danger'">{{ value ? 'نشط' : 'موقوف' }}</span>
        </template>
        <template #actions="{ row }">
          <button @click="deleteItem(row, 'expense-categories')" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 class="w-4 h-4" /></button>
        </template>
      </DataTable>
    </div>

    <!-- Sale Channels -->
    <div v-if="activeTab === 'channels'" class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="chForm.key" class="input max-w-xs" placeholder="المفتاح" />
        <input v-model="chForm.name" class="input max-w-xs" placeholder="الاسم" />
        <select v-model="chForm.type" class="input max-w-xs">
          <option value="cash">نقدي</option>
          <option value="app">تطبيق</option>
          <option value="pos">ماكينة</option>
          <option value="delivery">توصيل</option>
        </select>
        <button @click="saveChannel" class="btn-gold"><Plus class="w-4 h-4" /> إضافة</button>
      </div>
      <DataTable :data="saleChannels" :columns="chColumns">
        <template #cell-is_active="{ value }">
          <span :class="value ? 'badge-success' : 'badge-danger'">{{ value ? 'نشط' : 'موقوف' }}</span>
        </template>
        <template #actions="{ row }">
          <button @click="deleteItem(row, 'sale-channels')" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 class="w-4 h-4" /></button>
        </template>
      </DataTable>
    </div>

    <!-- General Settings -->
    <div v-if="activeTab === 'general'" class="card p-6 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="label">اسم المطعم</label><input v-model="settings.restaurant_name" class="input" /></div>
        <div><label class="label">رقم الهاتف</label><input v-model="settings.phone" class="input" /></div>
        <div><label class="label">نسبة الضريبة %</label><input type="number" step="0.01" v-model="settings.tax_rate" class="input tabular-nums" /></div>
        <div><label class="label">العملة</label><input v-model="settings.currency" class="input" /></div>
        <div class="md:col-span-2"><label class="label">العنوان</label><textarea v-model="settings.address" class="input" rows="2"></textarea></div>
      </div>
      <div class="flex justify-end">
        <button @click="saveSettings" class="btn-gold">حفظ الإعدادات</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue';
import { Plus, Trash2, Power, Pencil, Loader2 } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const toast = inject('toast');

const tabs = [
  { key: 'fish', label: 'أنواع السمك' },
  { key: 'pos', label: 'أجهزة الدفع' },
  { key: 'delivery', label: 'تطبيقات التوصيل' },
  { key: 'expenses', label: 'تصنيفات المصروفات' },
  { key: 'channels', label: 'قنوات البيع' },
  { key: 'general', label: 'إعدادات عامة' },
];
const activeTab = ref('fish');

const fishTypes = ref([]);
const posMachines = ref([]);
const deliveryPlatforms = ref([]);
const expenseCategories = ref([]);
const saleChannels = ref([]);
const settings = reactive({ restaurant_name: '', phone: '', tax_rate: 15, currency: 'SAR', address: '' });

const fishForm = reactive({ code: '', name: '', name_en: '' });
const editingFish = ref(false);
const editingFishId = ref(null);
const savingFish = ref(false);
const posForm = reactive({ machine_number: '', terminal_id: '', bank: '' });
const editingPos = ref(false);
const editingPosId = ref(null);
const savingPos = ref(false);
const delForm = reactive({ name: '', key: '' });
const expForm = reactive({ code: '', name: '' });
const chForm = reactive({ key: '', name: '', type: 'cash' });

const fishColumns = [
  { key: 'code', label: 'الرمز', sortable: true },
  { key: 'name', label: 'الاسم', sortable: true },
  { key: 'name_en', label: 'الإنجليزي' },
  { key: 'is_active', label: 'الحالة' },
];
const posColumns = [
  { key: 'machine_number', label: 'رقم الجهاز', sortable: true },
  { key: 'terminal_id', label: 'الترمنال' },
  { key: 'bank', label: 'البنك' },
  { key: 'is_active', label: 'الحالة' },
];
const delColumns = [
  { key: 'name', label: 'الاسم', sortable: true },
  { key: 'key', label: 'المفتاح' },
  { key: 'is_active', label: 'الحالة' },
];
const expColumns = [
  { key: 'code', label: 'الرمز', sortable: true },
  { key: 'name', label: 'الاسم', sortable: true },
  { key: 'is_active', label: 'الحالة' },
];
const chColumns = [
  { key: 'key', label: 'المفتاح' },
  { key: 'name', label: 'الاسم', sortable: true },
  { key: 'type', label: 'النوع' },
  { key: 'is_active', label: 'الحالة' },
];

const loadAll = async () => {
  try {
    const [f, p, d, e, c, s] = await Promise.all([
      api.get('/fish-types', { params: { limit: 500 } }),
      api.get('/pos/machines', { params: { limit: 100 } }),
      api.get('/delivery-platforms', { params: { limit: 100 } }),
      api.get('/expense-categories', { params: { limit: 100 } }),
      api.get('/sale-channels', { params: { limit: 100 } }),
      api.get('/settings', { params: { limit: 1 } }),
    ]);
    fishTypes.value = f.data.data || f.data;
    posMachines.value = p.data.data || p.data;
    deliveryPlatforms.value = d.data.data || d.data;
    expenseCategories.value = e.data.data || e.data;
    saleChannels.value = c.data.data || c.data;
    const sData = Array.isArray(s.data) ? s.data[0] : s.data;
    if (sData) Object.assign(settings, sData);
  } catch (err) {
    toast('فشل تحميل الإعدادات', 'error');
  }
};

const saveFish = async () => {
  if (!fishForm.name) return;
  try { await api.post('/fish-types', fishForm); toast('تم الإضافة'); Object.assign(fishForm, { code: '', name: '', name_en: '' }); loadAll(); }
  catch (err) { toast(err.response?.data?.error || 'فشل', 'error'); }
};
const editFish = (row) => {
  editingFish.value = true;
  editingFishId.value = row.id;
  Object.assign(fishForm, { code: row.code || '', name: row.name, name_en: row.name_en || '' });
};
const cancelEditFish = () => {
  editingFish.value = false;
  editingFishId.value = null;
  Object.assign(fishForm, { code: '', name: '', name_en: '' });
};
const updateFish = async () => {
  if (!fishForm.name) return;
  savingFish.value = true;
  try {
    await api.put(`/fish-types/${editingFishId.value}`, fishForm);
    toast('تم تعديل النوع');
    cancelEditFish();
    loadAll();
  } catch (err) {
    toast(err.response?.data?.error || 'فشل', 'error');
  } finally {
    savingFish.value = false;
  }
};
const savePos = async () => {
  if (!posForm.machine_number) return;
  try { await api.post('/pos/machines', posForm); toast('تم الإضافة'); Object.assign(posForm, { machine_number: '', terminal_id: '', bank: '' }); loadAll(); }
  catch (err) { toast(err.response?.data?.error || 'فشل', 'error'); }
};
const editPos = (row) => {
  editingPos.value = true;
  editingPosId.value = row.id;
  Object.assign(posForm, { machine_number: row.machine_number, terminal_id: row.terminal_id, bank: row.bank });
};
const cancelEditPos = () => {
  editingPos.value = false;
  editingPosId.value = null;
  Object.assign(posForm, { machine_number: '', terminal_id: '', bank: '' });
};
const updatePos = async () => {
  if (!posForm.machine_number) return;
  savingPos.value = true;
  try {
    await api.put(`/pos/machines/${editingPosId.value}`, posForm);
    toast('تم تعديل الجهاز');
    cancelEditPos();
    loadAll();
  } catch (err) {
    toast(err.response?.data?.error || 'فشل', 'error');
  } finally {
    savingPos.value = false;
  }
};
const saveDelivery = async () => {
  if (!delForm.name) return;
  try { await api.post('/delivery-platforms', delForm); toast('تم الإضافة'); Object.assign(delForm, { name: '', key: '' }); loadAll(); }
  catch (err) { toast(err.response?.data?.error || 'فشل', 'error'); }
};
const saveExpCat = async () => {
  if (!expForm.name) return;
  try { await api.post('/expense-categories', expForm); toast('تم الإضافة'); Object.assign(expForm, { code: '', name: '' }); loadAll(); }
  catch (err) { toast(err.response?.data?.error || 'فشل', 'error'); }
};
const saveChannel = async () => {
  if (!chForm.name) return;
  try { await api.post('/sale-channels', chForm); toast('تم الإضافة'); Object.assign(chForm, { key: '', name: '', type: 'cash' }); loadAll(); }
  catch (err) { toast(err.response?.data?.error || 'فشل', 'error'); }
};
const saveSettings = async () => {
  try { await api.put('/settings', settings); toast('تم حفظ الإعدادات'); }
  catch { toast('فشل', 'error'); }
};

const toggleActive = async (row, endpoint) => {
  try { await api.put(`/${endpoint}/${row.id}`, { is_active: !row.is_active }); toast('تم التبديل'); loadAll(); }
  catch { toast('فشل', 'error'); }
};

const deleteItem = async (row, endpoint) => {
  if (!confirm('هل تريد الحذف؟')) return;
  try { await api.delete(`/${endpoint}/${row.id}`); toast('تم الحذف'); loadAll(); }
  catch { toast('لا يمكن الحذف — مرتبط ببيانات', 'error'); }
};

onMounted(loadAll);
</script>
