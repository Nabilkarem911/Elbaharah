<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-primary-500">عهدة المشتريات</h2>
        <p class="text-sm text-gray-500 mt-1">تغذية وصرف وسجل عهدة مسؤول المشتريات</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="openModal('feed')" class="btn-outline">
          <Plus class="w-4 h-4" /> تغذية
        </button>
        <button @click="openModal('spend')" class="btn-gold">
          <Minus class="w-4 h-4" /> صرف
        </button>
      </div>
    </div>

    <!-- Current Balance -->
    <div class="card p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">الرصيد الحالي</p>
          <p class="text-3xl font-bold tabular-nums" :class="currentBalance >= 0 ? 'text-success' : 'text-danger'">
            {{ Number(currentBalance).toLocaleString('en-US', { minimumFractionDigits: 2 }) }} ر.س
          </p>
        </div>
        <div class="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
          <Wallet class="w-8 h-8 text-primary-400" />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4">
      <DateRangePicker
        v-model:start-date="filters.startDate"
        v-model:end-date="filters.endDate"
        @change="loadData"
      />
    </div>

    <!-- Log Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b">
              <th class="px-4 py-3 text-right font-bold text-gray-600">التاريخ</th>
              <th class="px-4 py-3 text-right font-medium text-gray-500">النوع</th>
              <th class="px-4 py-3 text-right font-medium text-gray-500">المبلغ</th>
              <th class="px-4 py-3 text-right font-medium text-gray-500">الوصف</th>
              <th class="px-4 py-3 text-right font-medium text-gray-500">الرصيد بعد</th>
              <th class="px-4 py-3 text-center font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="r in records" :key="r.id" class="hover:bg-gray-50/30">
              <td class="px-4 py-3 tabular-nums">{{ r.transaction_date }}</td>
              <td class="px-4 py-3">
                <span v-if="r.type === 'feed'" class="badge-success">تغذية</span>
                <span v-else class="badge-danger">صرف</span>
              </td>
              <td class="px-4 py-3 tabular-nums font-medium" :class="r.type === 'feed' ? 'text-success' : 'text-danger'">
                {{ r.type === 'feed' ? '+' : '-' }}{{ Number(r.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="px-4 py-3 text-gray-600">{{ r.description || '—' }}</td>
              <td class="px-4 py-3 tabular-nums font-bold">{{ Number(r.balance_after).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</td>
              <td class="px-4 py-3 text-center">
                <button @click="confirmDelete(r)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="!records.length">
              <td colspan="6" class="py-8 text-center text-gray-400">لا توجد سجلات</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Modal :show="showModal" :title="modalType === 'feed' ? 'تغذية العهدة' : 'صرف من العهدة'" size="md" @close="closeModal">
      <div class="space-y-4">
        <div>
          <label class="label">المبلغ</label>
          <input
            type="number" step="0.01" v-model="form.amount"
            class="input tabular-nums"
            @keydown.enter="save"
            autofocus
          />
        </div>
        <div>
          <label class="label">التاريخ</label>
          <input type="date" v-model="form.transaction_date" class="input" />
        </div>
        <div>
          <label class="label">الوصف</label>
          <input v-model="form.description" class="input" placeholder="مثال: خضار، غاز، خبز..." @keydown.enter="save" />
        </div>
      </div>
      <template #footer>
        <button @click="closeModal" class="btn-ghost">إلغاء</button>
        <button @click="save" class="btn-gold" :disabled="saving">
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <span>حفظ</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue';
import { Plus, Minus, Trash2, Loader2, Wallet } from 'lucide-vue-next';
import Modal from '../../components/Modal.vue';
import DateRangePicker from '../../components/DateRangePicker.vue';
import api from '../../api';

const toast = inject('toast');

const records = ref([]);
const currentBalance = ref(0);
const showModal = ref(false);
const saving = ref(false);
const modalType = ref('feed');
const filters = reactive({ startDate: '', endDate: '' });
const form = reactive({
  amount: 0,
  transaction_date: new Date().toISOString().split('T')[0],
  description: '',
});

const loadData = async () => {
  try {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    const { data } = await api.get('/purchase-custody', { params });
    records.value = data.data || [];
    currentBalance.value = data.currentBalance || 0;
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

const openModal = (type) => {
  modalType.value = type;
  form.amount = 0;
  form.transaction_date = new Date().toISOString().split('T')[0];
  form.description = '';
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; };

const save = async () => {
  if (!form.amount || form.amount <= 0) {
    toast('أدخل مبلغ صحيح', 'error');
    return;
  }
  saving.value = true;
  try {
    await api.post('/purchase-custody', {
      type: modalType.value,
      amount: Number(form.amount),
      transaction_date: form.transaction_date,
      description: form.description,
    });
    toast(modalType.value === 'feed' ? 'تمت التغذية بنجاح' : 'تم الصرف بنجاح');
    closeModal();
    loadData();
  } catch (err) {
    toast(err.response?.data?.error || 'فشل الحفظ', 'error');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (r) => {
  if (!confirm('هل تريد حذف هذا السجل؟')) return;
  try {
    await api.delete(`/purchase-custody/${r.id}`);
    toast('تم الحذف');
    loadData();
  } catch (err) {
    toast('فشل الحذف', 'error');
  }
};

onMounted(loadData);
</script>
