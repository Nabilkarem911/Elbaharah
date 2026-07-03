<template>
  <div class="space-y-6">
    <PageHeader title="مبيعات آجل" subtitle="حسابات الآجل والمستحقات">
      <template #actions>
        <button @click="openModal()" class="btn-gold"><Plus class="w-4 h-4" /> مبيعة آجل</button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard title="إجمالي المستحقات" :value="totalDue" :icon="Wallet" color="danger" suffix=" ر.س" />
      <StatCard title="المسدد" :value="totalPaid" :icon="CheckCircle" color="success" suffix=" ر.س" />
      <StatCard title="غير مسدد" :value="totalUnpaid" :icon="Clock" color="warning" suffix=" ر.س" />
    </div>

    <DataTable :data="sales" :columns="columns">
      <template #cell-is_paid="{ value, row }">
        <button @click="togglePaid(row)" :class="value ? 'badge-success' : 'badge-warning'">
          {{ value ? 'مسدد' : 'غير مسدد' }}
        </button>
      </template>
      <template #actions="{ row }">
        <button @click="confirmDelete(row)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 class="w-4 h-4" /></button>
      </template>
    </DataTable>

    <Modal :show="showModal" title="مبيعة آجل" @close="closeModal">
      <div class="space-y-4">
        <div><label class="label">الشركة</label>
          <select v-model="form.credit_account_id" class="input">
            <option value="">اختر</option>
            <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.company_name }}</option>
          </select>
        </div>
        <div><label class="label">تاريخ البيع</label><input type="date" v-model="form.sale_date" class="input" /></div>
        <div><label class="label">تاريخ السداد</label><input type="date" v-model="form.due_date" class="input" /></div>
        <div><label class="label">المبلغ</label><input type="number" step="0.01" v-model="form.amount" class="input tabular-nums" /></div>
      </div>
      <template #footer>
        <button @click="closeModal" class="btn-ghost">إلغاء</button>
        <button @click="save" class="btn-gold">إضافة</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { Plus, Trash2, Wallet, CheckCircle, Clock } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import StatCard from '../../components/StatCard.vue';
import Modal from '../../components/Modal.vue';
import api from '../../api';

const toast = inject('toast');
const columns = [
  { key: 'account', label: 'الشركة' },
  { key: 'sale_date', label: 'تاريخ البيع', sortable: true },
  { key: 'due_date', label: 'تاريخ السداد' },
  { key: 'amount', label: 'المبلغ', type: 'currency', sortable: true },
  { key: 'is_paid', label: 'الحالة' },
];

const sales = ref([]);
const accounts = ref([]);
const showModal = ref(false);
const form = reactive({ credit_account_id: '', sale_date: new Date().toISOString().split('T')[0], due_date: '', amount: 0 });

const totalDue = computed(() => sales.value.reduce((s, i) => s + Number(i.amount), 0));
const totalPaid = computed(() => sales.value.filter(i => i.is_paid).reduce((s, i) => s + Number(i.amount), 0));
const totalUnpaid = computed(() => sales.value.filter(i => !i.is_paid).reduce((s, i) => s + Number(i.amount), 0));

const loadData = async () => {
  try {
    const [s, a] = await Promise.all([
      api.get('/credit/sales', { params: { limit: 500 } }),
      api.get('/credit/accounts', { params: { limit: 500 } }),
    ]);
    sales.value = (s.data.data || s.data).map(i => ({ ...i, account: i.account?.company_name }));
    accounts.value = a.data.data || a.data;
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

const togglePaid = async (row) => {
  try {
    await api.put(`/credit/sales/${row.id}`, {
      is_paid: !row.is_paid,
      paid_date: !row.is_paid ? new Date().toISOString().split('T')[0] : null,
    });
    toast(row.is_paid ? 'تم إلغاء التحديد' : 'تم التحديد كمسدد');
    loadData();
  } catch { toast('فشل', 'error'); }
};

const openModal = () => {
  Object.assign(form, { credit_account_id: '', sale_date: new Date().toISOString().split('T')[0], due_date: '', amount: 0 });
  showModal.value = true;
};
const closeModal = () => { showModal.value = false; };

const save = async () => {
  try { await api.post('/credit/sales', form); toast('تم الإضافة'); closeModal(); loadData(); }
  catch { toast('فشل', 'error'); }
};

const confirmDelete = async (row) => {
  if (!confirm('حذف؟')) return;
  try { await api.delete(`/credit/sales/${row.id}`); toast('تم الحذف'); loadData(); }
  catch { toast('فشل', 'error'); }
};

onMounted(loadData);
</script>
