<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/purchases" class="p-2 rounded-lg hover:bg-primary-50 text-primary-400">
        <ArrowRight class="w-5 h-5" />
      </router-link>
      <h2 class="text-xl font-bold text-primary-500">فاتورة شراء جديدة</h2>
    </div>

    <div class="card p-6 space-y-6">
      <!-- Header fields -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label">رقم الفاتورة</label>
          <input v-model="form.invoice_number" class="input" placeholder="INV-001" />
        </div>
        <div>
          <label class="label">الدلال</label>
          <select v-model="form.supplier_id" class="input">
            <option value="">اختر الدلال</option>
            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div>
          <label class="label">التاريخ</label>
          <input type="date" v-model="form.purchase_date" class="input" />
        </div>
        <div>
          <label class="label">طريقة الدفع</label>
          <select v-model="form.payment_method" class="input">
            <option value="cash">نقدي</option>
            <option value="credit">آجل</option>
            <option value="transfer">تحويل</option>
          </select>
        </div>
      </div>

      <!-- Items -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-primary-500">الأقلام</h3>
          <button @click="addItem" class="btn-outline">
            <Plus class="w-4 h-4" /> إضافة قلم
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr>
                <th class="table-header">نوع السمك</th>
                <th class="table-header">الوزن (كجم)</th>
                <th class="table-header">سعر الكيلو</th>
                <th class="table-header">الإجمالي</th>
                <th class="table-header">تالف؟</th>
                <th class="table-header">وزن التالف</th>
                <th class="table-header"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in form.items" :key="idx" class="table-row">
                <td class="table-cell">
                  <select v-model="item.fish_type_id" class="input !py-1.5 text-sm">
                    <option value="">اختر</option>
                    <option v-for="f in fishTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
                  </select>
                </td>
                <td class="table-cell">
                  <input type="number" step="0.001" v-model="item.weight" class="input !py-1.5 text-sm w-24 tabular-nums" @input="calcItem(item)" />
                </td>
                <td class="table-cell">
                  <input type="number" step="0.01" v-model="item.price_per_kilo" class="input !py-1.5 text-sm w-24 tabular-nums" @input="calcItem(item)" />
                </td>
                <td class="table-cell font-bold text-primary-500 tabular-nums">{{ item.total_price.toFixed(2) }}</td>
                <td class="table-cell"><input type="checkbox" v-model="item.is_damaged" class="w-4 h-4" /></td>
                <td class="table-cell">
                  <input type="number" step="0.001" v-model="item.damaged_weight" class="input !py-1.5 text-sm w-20 tabular-nums" :disabled="!item.is_damaged" />
                </td>
                <td class="table-cell">
                  <button @click="removeItem(idx)" class="p-1 rounded-lg hover:bg-red-50 text-red-400">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr v-if="!form.items.length">
                <td colspan="7" class="py-8 text-center text-gray-400">لا توجد أقلام — اضغط "إضافة قلم"</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="mt-4 flex justify-end">
          <div class="w-64 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">إجمالي الوزن:</span>
              <span class="font-bold tabular-nums">{{ totalWeight.toFixed(3) }} كجم</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">إجمالي المبلغ:</span>
              <span class="font-bold text-primary-500 tabular-nums">{{ totalAmount.toFixed(2) }} ر.س</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label class="label">ملاحظات</label>
        <textarea v-model="form.notes" class="input" rows="2"></textarea>
      </div>

      <div class="flex justify-end gap-3">
        <router-link to="/purchases" class="btn-ghost">إلغاء</router-link>
        <button @click="save" class="btn-gold" :disabled="saving">
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <span>حفظ الفاتورة</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, Plus, Trash2, Loader2 } from 'lucide-vue-next';
import api from '../../api';

const router = useRouter();
const toast = inject('toast');

const suppliers = ref([]);
const fishTypes = ref([]);
const saving = ref(false);

const form = reactive({
  invoice_number: '',
  supplier_id: '',
  purchase_date: new Date().toISOString().split('T')[0],
  payment_method: 'cash',
  notes: '',
  items: [],
});

const addItem = () => {
  form.items.push({
    fish_type_id: '', weight: 0, price_per_kilo: 0, total_price: 0,
    is_damaged: false, damaged_weight: 0,
  });
};

const removeItem = (idx) => { form.items.splice(idx, 1); };

const calcItem = (item) => {
  item.total_price = Number(item.weight || 0) * Number(item.price_per_kilo || 0);
};

const totalWeight = computed(() => form.items.reduce((s, i) => s + Number(i.weight || 0), 0));
const totalAmount = computed(() => form.items.reduce((s, i) => s + Number(i.total_price || 0), 0));

const save = async () => {
  if (!form.invoice_number || !form.supplier_id || !form.items.length) {
    toast('يرجى إكمال البيانات', 'error');
    return;
  }
  saving.value = true;
  try {
    await api.post('/purchases', {
      ...form,
      total_weight: totalWeight.value,
      total_amount: totalAmount.value,
    });
    toast('تم حفظ الفاتورة بنجاح');
    router.push('/purchases');
  } catch (err) {
    toast(err.response?.data?.error || 'فشل الحفظ', 'error');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  const [s, f] = await Promise.all([
    api.get('/suppliers', { params: { limit: 500 } }),
    api.get('/fish-types', { params: { limit: 500 } }),
  ]);
  suppliers.value = s.data.data || s.data;
  fishTypes.value = f.data.data || f.data;
  addItem();
});
</script>
