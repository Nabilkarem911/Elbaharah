<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/purchases" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <h2 class="text-xl font-bold text-primary-500">{{ pageTitle }}</h2>
    </div>

    <div class="card p-6 space-y-6">
      <!-- Header fields -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label">رقم الفاتورة</label>
          <input v-model="invoiceNumber" class="input tabular-nums" readonly />
        </div>
        <div>
          <label class="label">التاريخ</label>
          <input type="date" v-model="purchaseDate" class="input" />
        </div>
        <div>
          <label class="label">طريقة الدفع</label>
          <select v-model="paymentMethod" class="input">
            <option value="cash">نقدي</option>
            <option value="credit">آجل</option>
            <option value="transfer">تحويل</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="addRow" class="btn-outline w-full">
            <Plus class="w-4 h-4" /> إضافة صف
          </button>
        </div>
      </div>

      <!-- Multi-row table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b">
              <th class="px-2 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap w-8">#</th>
              <th class="px-2 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap w-24">رمز {{ L('supplier', 'البائع') }}</th>
              <th class="px-2 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">اسم {{ L('supplier', 'البائع') }}</th>
              <th class="px-2 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap w-24">رمز {{ L('product', 'السمك') }}</th>
              <th class="px-2 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap">{{ L('product_type', 'نوع السمك') }}</th>
              <th class="px-2 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap w-28">الوزن (كجم)</th>
              <th class="px-2 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap w-28">سعر الشراء</th>
              <th class="px-2 py-2.5 text-right font-medium text-gray-500 whitespace-nowrap w-28">الإجمالي</th>
              <th class="px-2 py-2.5 text-center font-medium text-gray-500 whitespace-nowrap w-8"></th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="(row, idx) in rows" :key="idx" class="hover:bg-gray-50/30">
              <td class="px-2 py-1.5 text-center text-gray-400 text-xs">{{ idx + 1 }}</td>
              <td class="px-2 py-1.5">
                <input
                  :ref="el => supplierCodeRefs[idx] = el"
                  v-model="row.supplierCode"
                  type="text"
                  class="input !py-1.5 text-sm tabular-nums w-20"
                  placeholder="كود"
                  @input="onSupplierCodeInput(idx)"
                  @keydown.enter="focusCell(idx, 'fishCode')"
                />
              </td>
              <td class="px-2 py-1.5">
                <span class="text-sm font-medium text-gray-700">{{ row.supplierName || '—' }}</span>
              </td>
              <td class="px-2 py-1.5">
                <input
                  :ref="el => fishCodeRefs[idx] = el"
                  v-model="row.fishCode"
                  type="text"
                  class="input !py-1.5 text-sm tabular-nums w-20"
                  placeholder="كود"
                  @input="onFishCodeInput(idx)"
                  @keydown.enter="focusCell(idx, 'weight')"
                />
              </td>
              <td class="px-2 py-1.5">
                <span class="text-sm font-medium text-gray-700">{{ row.fishName || '—' }}</span>
              </td>
              <td class="px-2 py-1.5">
                <input
                  :ref="el => weightRefs[idx] = el"
                  v-model="row.weight"
                  type="number"
                  step="0.001"
                  class="input !py-1.5 text-sm tabular-nums w-24"
                  placeholder="0.000"
                  @input="calcRow(row)"
                  @keydown.enter="focusCell(idx, 'price')"
                />
              </td>
              <td class="px-2 py-1.5">
                <input
                  :ref="el => priceRefs[idx] = el"
                  v-model="row.total_price"
                  type="number"
                  step="0.01"
                  class="input !py-1.5 text-sm tabular-nums w-24"
                  placeholder="0.00"
                  @input="calcRow(row)"
                  @keydown.enter="onLastCellEnter(idx)"
                />
              </td>
              <td class="px-2 py-1.5 font-bold text-primary-500 tabular-nums">
                {{ rowTotal(row).toFixed(2) }}
              </td>
              <td class="px-2 py-1.5 text-center">
                <button @click="removeRow(idx)" class="p-1 rounded-lg hover:bg-red-50 text-red-400">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="9" class="py-8 text-center text-gray-400">لا توجد صفوف — اضغط "إضافة صف"</td>
            </tr>
          </tbody>
          <tfoot v-if="rows.length">
            <tr class="bg-primary-50 border-t-2 border-primary-100">
              <td colspan="5" class="px-2 py-3 text-left font-bold text-gray-600">الإجمالي:</td>
              <td class="px-2 py-3 font-bold tabular-nums text-gray-700">{{ totalWeight.toFixed(3) }} كجم</td>
              <td></td>
              <td class="px-2 py-3 font-bold tabular-nums text-primary-500">{{ totalAmount.toFixed(2) }} ر.س</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div>
        <label class="label">ملاحظات</label>
        <textarea v-model="notes" class="input" rows="2"></textarea>
      </div>

      <div class="flex justify-end gap-3">
        <router-link to="/purchases" class="btn-ghost">إلغاء</router-link>
        <button @click="save" class="btn-gold" :disabled="saving">
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <Save class="w-4 h-4" v-else />
          <span>حفظ الفاتورة</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowRight, Plus, Trash2, Save, Loader2 } from 'lucide-vue-next';
import api from '../../api';
import { useOrgLabels } from '../../composables/useOrgLabels';

const router = useRouter();
const route = useRoute();
const toast = inject('toast');
const { L } = useOrgLabels();

const suppliers = ref([]);
const fishTypes = ref([]);
const invoiceNumber = ref('');
const purchaseDate = ref(new Date().toISOString().split('T')[0]);
const paymentMethod = ref('cash');
const notes = ref('');
const saving = ref(false);
const rows = ref([]);

const supplierCodeRefs = ref([]);
const fishCodeRefs = ref([]);
const weightRefs = ref([]);
const priceRefs = ref([]);

const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? 'تعديل فاتورة شراء' : 'فاتورة شراء جديدة');

const supplierMap = computed(() => {
  const m = {};
  suppliers.value.forEach(s => { m[String(s.code)] = s; });
  return m;
});

const fishMap = computed(() => {
  const m = {};
  fishTypes.value.forEach(f => { m[String(f.code)] = f; });
  return m;
});

const totalWeight = computed(() => rows.value.reduce((s, r) => s + Number(r.weight || 0), 0));
const totalAmount = computed(() => rows.value.reduce((s, r) => s + rowTotal(r), 0));

const rowTotal = (row) => Number(row.total_price || 0);

const calcRow = (row) => {
  row.price_per_kilo = Number(row.weight) > 0
    ? Number(row.total_price) / Number(row.weight)
    : 0;
};

const addRow = () => {
  rows.value.push({
    supplierCode: '',
    supplierId: null,
    supplierName: '',
    fishCode: '',
    fishTypeId: null,
    fishName: '',
    weight: 0,
    total_price: 0,
    price_per_kilo: 0,
    is_damaged: false,
    damaged_weight: 0,
  });
};

const removeRow = (idx) => {
  rows.value.splice(idx, 1);
};

const onSupplierCodeInput = (idx) => {
  const row = rows.value[idx];
  const supplier = supplierMap.value[row.supplierCode?.trim()];
  if (supplier) {
    row.supplierId = supplier.id;
    row.supplierName = supplier.name;
  } else {
    row.supplierId = null;
    row.supplierName = '';
  }
};

const onFishCodeInput = (idx) => {
  const row = rows.value[idx];
  const fish = fishMap.value[row.fishCode?.trim()];
  if (fish) {
    row.fishTypeId = fish.id;
    row.fishName = fish.name;
  } else {
    row.fishTypeId = null;
    row.fishName = '';
  }
};

const focusCell = (idx, field) => {
  const refMap = {
    fishCode: fishCodeRefs,
    weight: weightRefs,
    price: priceRefs,
    supplierCode: supplierCodeRefs,
  };
  const refs = refMap[field];
  if (refs.value && refs.value[idx]) {
    refs.value[idx].focus();
    refs.value[idx].select();
  }
};

const onLastCellEnter = (idx) => {
  if (idx === rows.value.length - 1) {
    addRow();
    setTimeout(() => {
      if (supplierCodeRefs.value[idx + 1]) {
        supplierCodeRefs.value[idx + 1].focus();
      }
    }, 50);
  } else {
    focusCell(idx + 1, 'supplierCode');
  }
};

const fetchInvoiceNumber = async () => {
  try {
    const { data } = await api.get('/purchases/next-invoice');
    invoiceNumber.value = data.invoice_number;
  } catch (err) {
    invoiceNumber.value = `PUR-${Date.now()}`;
  }
};

const save = async () => {
  const validRows = rows.value.filter(r => r.supplierId && r.fishTypeId && Number(r.weight) > 0 && Number(r.total_price) > 0);
  if (!validRows.length) {
    toast('لا توجد صفوف صحيحة للحفظ', 'error');
    return;
  }

  const grouped = {};
  validRows.forEach(r => {
    if (!grouped[r.supplierId]) grouped[r.supplierId] = [];
    grouped[r.supplierId].push({
      fish_type_id: r.fishTypeId,
      weight: Number(r.weight),
      total_price: Number(r.total_price),
      price_per_kilo: Number(r.weight) > 0 ? Number(r.total_price) / Number(r.weight) : 0,
      is_damaged: r.is_damaged,
      damaged_weight: Number(r.damaged_weight || 0),
    });
  });

  const batchRows = Object.entries(grouped).map(([supplierId, items]) => ({
    supplier_id: parseInt(supplierId),
    items,
  }));

  saving.value = true;
  try {
    if (isEditing.value) {
      await api.delete(`/purchases/invoice/${invoiceNumber.value}`);
      const { data } = await api.post('/purchases/batch', {
        rows: batchRows,
        purchase_date: purchaseDate.value,
        invoice_number: invoiceNumber.value,
        payment_method: paymentMethod.value,
        notes: notes.value,
      });
      toast(`تم تعديل الفاتورة بنجاح (${data.created} قلم)`);
    } else {
      const { data } = await api.post('/purchases/batch', {
        rows: batchRows,
        purchase_date: purchaseDate.value,
        invoice_number: invoiceNumber.value,
        payment_method: paymentMethod.value,
        notes: notes.value,
      });
      toast(`تم حفظ الفاتورة بنجاح (${data.created} قلم)`);
    }
    router.push('/purchases');
  } catch (err) {
    toast(err.response?.data?.error || 'فشل الحفظ', 'error');
  } finally {
    saving.value = false;
  }
};

const loadData = async () => {
  try {
    const [s, f] = await Promise.all([
      api.get('/suppliers', { params: { limit: 500 } }),
      api.get('/fish-types', { params: { limit: 500 } }),
    ]);
    suppliers.value = s.data.data || s.data;
    fishTypes.value = f.data.data || f.data;

    if (route.params.id) {
      const { data } = await api.get(`/purchases/invoice/${route.params.id}`);
      const invoice = data;
      invoiceNumber.value = invoice.invoice_number;
      purchaseDate.value = invoice.purchase_date;
      paymentMethod.value = invoice.payment_method;
      notes.value = invoice.notes || '';
      rows.value = (invoice.items || []).map(item => ({
        supplierCode: String(item.supplier_code || ''),
        supplierId: item.supplier_id,
        supplierName: item.supplier_name || '',
        fishCode: String(item.fish_code || ''),
        fishTypeId: item.fish_type_id,
        fishName: item.fish_name || '',
        weight: Number(item.weight),
        total_price: Number(item.total_price),
        price_per_kilo: Number(item.price_per_kilo),
        is_damaged: item.is_damaged,
        damaged_weight: Number(item.damaged_weight || 0),
      }));
    } else {
      await fetchInvoiceNumber();
      addRow();
    }
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

onMounted(loadData);
</script>
