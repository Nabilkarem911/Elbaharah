<template>
  <div class="space-y-6">
    <PageHeader title="الموازنات" subtitle="حركة ماكينات الدفع اليومية" />

    <!-- Machine tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="m in machines"
        :key="m.id"
        @click="selectedMachine = m.id"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
        :class="selectedMachine === m.id ? 'bg-primary-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-primary-50'"
      >
        جهاز {{ m.machine_number }} — {{ m.bank }}
      </button>
    </div>

    <!-- Transactions table -->
    <DataTable
      :data="filteredTransactions"
      :columns="columns"
    >
      <template #cell-card_type="{ value }">
        <span class="badge" :class="cardBadge(value)">{{ cardLabel(value) }}</span>
      </template>
      <template #cell-amount_after_fee="{ value }">
        <span class="font-medium text-success tabular-nums">{{ Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
      </template>
      <template #actions="{ row }">
        <button @click="deleteTx(row)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
          <Trash2 class="w-4 h-4" />
        </button>
      </template>
    </DataTable>

    <!-- Add transaction -->
    <div class="card p-5">
      <h3 class="font-bold text-primary-500 mb-4">إضافة حركة</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label">التاريخ</label>
          <input type="date" v-model="newTx.transaction_date" class="input" />
        </div>
        <div>
          <label class="label">نوع البطاقة</label>
          <select v-model="newTx.card_type" class="input">
            <option value="mada">مدى</option>
            <option value="visa">فيزا</option>
            <option value="visa_plus">فيزا +</option>
            <option value="mastercard">ماستر كارد</option>
            <option value="mastercard_plus">ماستر كارد +</option>
          </select>
        </div>
        <div>
          <label class="label">المبلغ</label>
          <input type="number" step="0.01" v-model="newTx.amount" class="input tabular-nums" />
        </div>
        <div class="flex items-end">
          <button @click="addTx" class="btn-gold w-full">
            <Plus class="w-4 h-4" /> إضافة
          </button>
        </div>
      </div>
      <div class="mt-3 p-3 bg-primary-50 rounded-xl text-sm text-primary-500">
        المبلغ بعد الرسوم: <span class="font-bold tabular-nums">{{ afterFee.toFixed(2) }} ر.س</span>
        (رسوم: {{ feePercent }}%)
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const toast = inject('toast');

const columns = [
  { key: 'transaction_date', label: 'التاريخ', sortable: true },
  { key: 'card_type', label: 'نوع البطاقة' },
  { key: 'amount', label: 'المبلغ', type: 'currency', sortable: true },
  { key: 'fee_percentage', label: 'الرسوم %', type: 'number' },
  { key: 'amount_after_fee', label: 'بعد الرسوم', type: 'currency', sortable: true },
];

const machines = ref([]);
const transactions = ref([]);
const selectedMachine = ref(null);

const newTx = reactive({
  transaction_date: new Date().toISOString().split('T')[0],
  card_type: 'mada',
  amount: 0,
});

const feeMap = { mada: 0, visa: 2.5, visa_plus: 2.5, mastercard: 2.5, mastercard_plus: 2.5 };
const feePercent = computed(() => feeMap[newTx.card_type] || 0);
const afterFee = computed(() => Number(newTx.amount || 0) * (1 - feePercent.value / 100));

const filteredTransactions = computed(() =>
  transactions.value.filter(t => t.pos_machine_id === selectedMachine.value)
);

const cardLabels = { mada: 'مدى', visa: 'فيزا', visa_plus: 'فيزا +', mastercard: 'ماستر كارد', mastercard_plus: 'ماستر +' };
const cardLabel = (v) => cardLabels[v] || v;
const cardBadge = (v) => v === 'mada' ? 'badge-success' : 'badge-info';

const loadData = async () => {
  try {
    const [m, t] = await Promise.all([
      api.get('/pos/machines'),
      api.get('/pos/transactions', { params: { limit: 500 } }),
    ]);
    machines.value = m.data.data || m.data;
    transactions.value = t.data.data || t.data;
    if (machines.value.length && !selectedMachine.value) {
      selectedMachine.value = machines.value[0].id;
    }
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

const addTx = async () => {
  if (!newTx.amount || !selectedMachine.value) return;
  try {
    await api.post('/pos/transactions', {
      ...newTx,
      pos_machine_id: selectedMachine.value,
      fee_percentage: feePercent.value,
    });
    toast('تم إضافة الحركة بنجاح');
    newTx.amount = 0;
    loadData();
  } catch (err) {
    toast('فشل الإضافة', 'error');
  }
};

const deleteTx = async (row) => {
  if (!confirm('هل تريد حذف هذه الحركة؟')) return;
  try {
    await api.delete(`/pos/transactions/${row.id}`);
    toast('تم الحذف');
    loadData();
  } catch (err) {
    toast('فشل الحذف', 'error');
  }
};

onMounted(loadData);
</script>
