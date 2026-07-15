<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-primary-500">الجرد ورصيد بداية المدة</h2>
        <p class="text-sm text-gray-500 mt-1">تسجيل رصيد بداية الشهر وجرد نهاية الشهر للأسماك</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="saveAll" class="btn-gold" :disabled="saving">
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <Save class="w-4 h-4" v-else />
          <span>حفظ الكل</span>
        </button>
      </div>
    </div>

    <!-- Month selector + mode -->
    <div class="card p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label">الشهر</label>
          <input type="month" v-model="selectedMonth" class="input" @change="loadData" />
        </div>
        <div>
          <label class="label">النوع</label>
          <select v-model="mode" class="input" @change="loadData">
            <option value="opening">رصيد بداية المدة</option>
            <option value="closing">جرد نهاية الشهر</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="loadData" class="btn-outline w-full">
            <RefreshCw class="w-4 h-4" /> تحميل
          </button>
        </div>
      </div>
    </div>

    <!-- Inventory table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b">
              <th class="px-4 py-3 text-right font-bold text-gray-600">نوع السمك</th>
              <th class="px-4 py-3 text-right font-medium text-gray-500" v-if="mode === 'opening'">رصيد بداية (كجم)</th>
              <th class="px-4 py-3 text-right font-medium text-gray-500" v-if="mode === 'opening'">تكلفة بداية المدة</th>
              <th class="px-4 py-3 text-right font-medium text-gray-500" v-if="mode === 'closing'">جرد نهاية الشهر (كجم)</th>
              <th class="px-4 py-3 text-right font-medium text-gray-500" v-if="mode === 'closing'">تكلفة الجرد</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="(row, idx) in inventoryRows" :key="row.fish_type_id" class="hover:bg-gray-50/30">
              <td class="px-4 py-2.5 font-medium text-gray-700">{{ row.fishName }}</td>
              <template v-if="mode === 'opening'">
                <td class="px-4 py-2.5">
                  <input
                    type="number" step="0.001" v-model="row.opening_balance_kg"
                    class="input !py-1.5 text-sm tabular-nums w-32"
                    @keydown.enter="focusNextRow(idx)"
                  />
                </td>
                <td class="px-4 py-2.5">
                  <input
                    type="number" step="0.01" v-model="row.opening_balance_cost"
                    class="input !py-1.5 text-sm tabular-nums w-32"
                    @keydown.enter="focusNextRow(idx)"
                  />
                </td>
              </template>
              <template v-else>
                <td class="px-4 py-2.5">
                  <input
                    type="number" step="0.001" v-model="row.closing_balance_kg"
                    class="input !py-1.5 text-sm tabular-nums w-32"
                    @keydown.enter="focusNextRow(idx)"
                  />
                </td>
                <td class="px-4 py-2.5">
                  <input
                    type="number" step="0.01" v-model="row.closing_balance_cost"
                    class="input !py-1.5 text-sm tabular-nums w-32"
                    @keydown.enter="focusNextRow(idx)"
                  />
                </td>
              </template>
            </tr>
            <tr v-if="!inventoryRows.length">
              <td :colspan="3" class="py-8 text-center text-gray-400">لا توجد أنواع أسماك</td>
            </tr>
          </tbody>
          <tfoot v-if="inventoryRows.length">
            <tr class="bg-primary-50 border-t-2 border-primary-100">
              <td class="px-4 py-3 font-bold text-gray-600">الإجمالي:</td>
              <template v-if="mode === 'opening'">
                <td class="px-4 py-3 font-bold tabular-nums">{{ totalOpeningKg.toFixed(3) }} كجم</td>
                <td class="px-4 py-3 font-bold tabular-nums text-primary-500">{{ totalOpeningCost.toFixed(2) }} ر.س</td>
              </template>
              <template v-else>
                <td class="px-4 py-3 font-bold tabular-nums">{{ totalClosingKg.toFixed(3) }} كجم</td>
                <td class="px-4 py-3 font-bold tabular-nums text-primary-500">{{ totalClosingCost.toFixed(2) }} ر.س</td>
              </template>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { Save, Loader2, RefreshCw } from 'lucide-vue-next';
import api from '../../api';

const toast = inject('toast');

const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const mode = ref('opening');
const saving = ref(false);
const inventoryRows = ref([]);

const totalOpeningKg = computed(() => inventoryRows.value.reduce((s, r) => s + Number(r.opening_balance_kg || 0), 0));
const totalOpeningCost = computed(() => inventoryRows.value.reduce((s, r) => s + Number(r.opening_balance_cost || 0), 0));
const totalClosingKg = computed(() => inventoryRows.value.reduce((s, r) => s + Number(r.closing_balance_kg || 0), 0));
const totalClosingCost = computed(() => inventoryRows.value.reduce((s, r) => s + Number(r.closing_balance_cost || 0), 0));

const loadData = async () => {
  try {
    const [fishRes, invRes] = await Promise.all([
      api.get('/fish-types', { params: { limit: 500 } }),
      api.get('/fish-inventory', { params: { month: selectedMonth.value + '-01' } }),
    ]);
    const fishTypes = fishRes.data.data || fishRes.data;
    const existing = invRes.data.data || [];
    const existingMap = {};
    existing.forEach(e => { existingMap[e.fish_type_id] = e; });
    inventoryRows.value = fishTypes.map(f => ({
      fish_type_id: f.id,
      fishName: f.name,
      opening_balance_kg: existingMap[f.id]?.opening_balance_kg || 0,
      opening_balance_cost: existingMap[f.id]?.opening_balance_cost || 0,
      opening_balance_value: existingMap[f.id]?.opening_balance_value || 0,
      closing_balance_kg: existingMap[f.id]?.closing_balance_kg || 0,
      closing_balance_cost: existingMap[f.id]?.closing_balance_cost || 0,
    }));
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  }
};

const focusNextRow = (idx) => {
  const inputs = document.querySelectorAll('tbody input[type="number"]');
  const currentIdx = idx * 2;
  if (inputs[currentIdx + 2]) {
    inputs[currentIdx + 2].focus();
    inputs[currentIdx + 2].select();
  }
};

const saveAll = async () => {
  saving.value = true;
  try {
    const endpoint = mode.value === 'opening' ? '/fish-inventory/opening' : '/fish-inventory/closing';
    const items = inventoryRows.value.map(r => {
      if (mode.value === 'opening') {
        return {
          fish_type_id: r.fish_type_id,
          opening_balance_kg: Number(r.opening_balance_kg || 0),
          opening_balance_cost: Number(r.opening_balance_cost || 0),
          opening_balance_value: Number(r.opening_balance_cost || 0),
        };
      }
      return {
        fish_type_id: r.fish_type_id,
        closing_balance_kg: Number(r.closing_balance_kg || 0),
        closing_balance_cost: Number(r.closing_balance_cost || 0),
      };
    });
    await api.post(endpoint, {
      month_year: selectedMonth.value + '-01',
      items,
    });
    toast('تم الحفظ بنجاح');
  } catch (err) {
    toast(err.response?.data?.error || 'فشل الحفظ', 'error');
  } finally {
    saving.value = false;
  }
};

onMounted(loadData);
</script>
