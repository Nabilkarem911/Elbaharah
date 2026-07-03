<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/credit-sales" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <PageHeader title="تسوية آجل" subtitle="تسجيل دفعات العملاء وتقليل الأرصدة" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard title="إجمالي الأرصدة" :value="totalBalance" :icon="Wallet" color="danger" suffix=" ر.س" />
      <StatCard title="عدد الحسابات" :value="accounts.length" :icon="Users" color="primary" />
      <StatCard title="مدفوعات اليوم" :value="todayPayments" :icon="CheckCircle" color="success" suffix=" ر.س" />
    </div>

    <DataTable :data="accounts" :columns="columns" searchable>
      <template #cell-total_balance="{ value }">
        <span class="font-bold tabular-nums" :class="value > 0 ? 'text-danger' : 'text-success'">
          {{ Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </span>
      </template>
      <template #actions="{ row }">
        <button v-if="row.total_balance > 0" @click="openPaymentModal(row)" class="btn-gold !py-1.5 !px-3 text-xs">
          <DollarSign class="w-3.5 h-3.5" />
          تسديد
        </button>
      </template>
    </DataTable>

    <Modal :show="showModal" title="تسديد دفعة" @close="closeModal">
      <div class="space-y-4">
        <div class="p-3 bg-primary-50 rounded-xl">
          <p class="text-sm text-gray-600">الشركة: <span class="font-bold text-primary-500">{{ selectedAccount?.company_name }}</span></p>
          <p class="text-sm text-gray-600">الرصيد الحالي: <span class="font-bold text-danger tabular-nums">{{ Number(selectedAccount?.total_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }} ر.س</span></p>
        </div>
        <div>
          <label class="label">مبلغ الدفعة</label>
          <input type="number" step="0.01" v-model="paymentAmount" class="input tabular-nums" :max="selectedAccount?.total_balance" />
        </div>
        <div>
          <label class="label">تاريخ الدفع</label>
          <input type="date" v-model="paymentDate" class="input" />
        </div>
        <div class="flex gap-2">
          <button @click="quickFill" class="btn-outline text-xs flex-1">تسديد كامل</button>
        </div>
      </div>
      <template #footer>
        <button @click="closeModal" class="btn-ghost">إلغاء</button>
        <button @click="processPayment" class="btn-gold" :disabled="processing">
          <Loader2 v-if="processing" class="w-4 h-4 animate-spin" />
          <span>تأكيد الدفع</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, Wallet, Users, CheckCircle, DollarSign, Loader2 } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import StatCard from '../../components/StatCard.vue';
import Modal from '../../components/Modal.vue';
import api from '../../api';

const toast = inject('toast');
const router = useRouter();

const accounts = ref([]);
const showModal = ref(false);
const selectedAccount = ref(null);
const paymentAmount = ref(0);
const paymentDate = ref(new Date().toISOString().split('T')[0]);
const processing = ref(false);

const columns = [
  { key: 'company_name', label: 'الشركة', sortable: true },
  { key: 'phone', label: 'الهاتف' },
  { key: 'total_balance', label: 'الرصيد', type: 'currency', sortable: true },
];

const totalBalance = computed(() => accounts.value.reduce((s, a) => s + Number(a.total_balance), 0));
const todayPayments = computed(() => 0);

const loadAccounts = async () => {
  try {
    const { data } = await api.get('/credit/accounts', { params: { limit: 500 } });
    accounts.value = (data.data || data).filter(a => Number(a.total_balance) > 0);
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

const openPaymentModal = (account) => {
  selectedAccount.value = account;
  paymentAmount.value = 0;
  paymentDate.value = new Date().toISOString().split('T')[0];
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; };

const quickFill = () => {
  paymentAmount.value = Number(selectedAccount.value?.total_balance || 0);
};

const processPayment = async () => {
  const amount = Number(paymentAmount.value);
  if (amount <= 0) { toast('أدخل مبلغ صحيح', 'error'); return; }
  processing.value = true;
  try {
    const acct = selectedAccount.value;
    const newBalance = Number(acct.total_balance) - amount;
    await api.put(`/credit/accounts/${acct.id}`, { total_balance: newBalance });
    toast('تم تسجيل الدفعة بنجاح');
    closeModal();
    loadAccounts();
  } catch (err) {
    toast('فشل تسجيل الدفعة', 'error');
  } finally {
    processing.value = false;
  }
};

onMounted(loadAccounts);
</script>
