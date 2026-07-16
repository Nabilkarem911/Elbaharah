<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-primary-500">الجرد ورصيد بداية المدة</h2>
        <p class="text-sm text-gray-500 mt-1">تسجيل رصيد بداية الشهر وجرد نهاية الشهر لـ{{ L('product', 'الأسماك') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <button v-if="!editMode" @click="startNewEntry" class="btn-gold">
          <Plus class="w-4 h-4" />
          <span>تسجيل جديد</span>
        </button>
        <button v-if="editMode" @click="saveAll" class="btn-gold" :disabled="saving">
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <Save class="w-4 h-4" v-else />
          <span>حفظ الكل</span>
        </button>
        <button v-if="editMode" @click="cancelEdit" class="btn-outline">
          <X class="w-4 h-4" />
          <span>إلغاء</span>
        </button>
      </div>
    </div>

    <!-- Edit Mode: Month selector + type + editable table -->
    <template v-if="editMode">
      <div class="card p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="label">الشهر</label>
            <input type="month" v-model="selectedMonth" class="input" @change="loadEditModeData" />
          </div>
          <div>
            <label class="label">النوع</label>
            <select v-model="mode" class="input" @change="loadEditModeData">
              <option value="opening">رصيد بداية المدة</option>
              <option value="closing">جرد نهاية الشهر</option>
            </select>
          </div>
          <div class="flex items-end">
            <button @click="loadEditModeData" class="btn-outline w-full">
              <RefreshCw class="w-4 h-4" /> تحميل
            </button>
          </div>
        </div>
      </div>

      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b">
                <th class="px-4 py-3 text-right font-bold text-gray-600">{{ L('product_type', 'نوع السمك') }}</th>
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
                    <input type="number" step="0.001" v-model="row.opening_balance_kg" class="input !py-1.5 text-sm tabular-nums w-32" @keydown.enter="focusNextRow(idx)" />
                  </td>
                  <td class="px-4 py-2.5">
                    <input type="number" step="0.01" v-model="row.opening_balance_cost" class="input !py-1.5 text-sm tabular-nums w-32" @keydown.enter="focusNextRow(idx)" />
                  </td>
                </template>
                <template v-else>
                  <td class="px-4 py-2.5">
                    <input type="number" step="0.001" v-model="row.closing_balance_kg" class="input !py-1.5 text-sm tabular-nums w-32" @keydown.enter="focusNextRow(idx)" />
                  </td>
                  <td class="px-4 py-2.5">
                    <input type="number" step="0.01" v-model="row.closing_balance_cost" class="input !py-1.5 text-sm tabular-nums w-32" @keydown.enter="focusNextRow(idx)" />
                  </td>
                </template>
              </tr>
              <tr v-if="!inventoryRows.length">
                <td :colspan="3" class="py-8 text-center text-gray-400">لا توجد أنواع {{ L('product', 'أسماك') }}</td>
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
    </template>

    <!-- Cards View: Show all months as cards -->
    <template v-else>
      <div v-if="loadingCards" class="flex justify-center py-12">
        <Loader2 class="w-8 h-8 animate-spin text-primary-400" />
      </div>

      <div v-else-if="monthCards.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="card in monthCards"
          :key="card.monthYear"
          class="card overflow-hidden transition-all"
          :class="{ 'ring-2 ring-primary-300': expandedMonth === card.monthYear }"
        >
          <!-- Card Header (clickable) -->
          <div
            class="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
            @click="toggleExpand(card.monthYear)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Calendar class="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p class="font-bold text-gray-700">{{ formatMonth(card.monthYear) }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ card.itemsCount }} نوع {{ L('product', 'أسماك') }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button @click.stop="startEditExisting(card.monthYear)" class="p-2 rounded-lg hover:bg-primary-50 text-primary-500 transition-colors" title="تعديل">
                  <Pencil class="w-4 h-4" />
                </button>
                <ChevronDown v-if="expandedMonth !== card.monthYear" class="w-5 h-5 text-gray-400" />
                <ChevronUp v-else class="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <!-- Summary stats -->
            <div class="grid grid-cols-3 gap-2 mt-3 text-center">
              <div class="bg-gray-50 rounded-lg py-2">
                <p class="text-xs text-gray-400">رصيد بداية</p>
                <p class="text-sm font-bold text-gray-700 mt-0.5">{{ card.totalOpeningKg.toFixed(1) }} كجم</p>
              </div>
              <div class="bg-gray-50 rounded-lg py-2">
                <p class="text-xs text-gray-400">الوارد</p>
                <p class="text-sm font-bold text-gray-700 mt-0.5">{{ card.totalIncoming.toFixed(1) }} كجم</p>
              </div>
              <div class="bg-gray-50 rounded-lg py-2">
                <p class="text-xs text-gray-400">رصيد نهاية</p>
                <p class="text-sm font-bold text-gray-700 mt-0.5">{{ card.totalClosingKg.toFixed(1) }} كجم</p>
              </div>
            </div>
          </div>

          <!-- Expanded Details -->
          <div v-if="expandedMonth === card.monthYear" class="border-t border-gray-100">
            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead>
                  <tr class="bg-gray-50/50">
                    <th class="px-3 py-2 text-right font-bold text-gray-600">النوع</th>
                    <th class="px-3 py-2 text-right font-medium text-gray-400">رصيد بداية</th>
                    <th class="px-3 py-2 text-right font-medium text-gray-400">الوارد</th>
                    <th class="px-3 py-2 text-right font-medium text-gray-400">الهدر</th>
                    <th class="px-3 py-2 text-right font-medium text-gray-400">رصيد نهاية</th>
                    <th class="px-3 py-2 text-right font-medium text-gray-400">تكلفة البضاعة</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="item in card.items" :key="item.id" class="hover:bg-gray-50/30">
                    <td class="px-3 py-2 font-medium text-gray-700">{{ item.fishType?.name || '—' }}</td>
                    <td class="px-3 py-2 tabular-nums text-gray-600">{{ Number(item.opening_balance_kg || 0).toFixed(2) }}</td>
                    <td class="px-3 py-2 tabular-nums text-gray-600">{{ Number(item.total_incoming_kg || 0).toFixed(2) }}</td>
                    <td class="px-3 py-2 tabular-nums text-gray-600">{{ Number(item.waste_kg || 0).toFixed(2) }}</td>
                    <td class="px-3 py-2 tabular-nums text-gray-600">{{ Number(item.closing_balance_kg || 0).toFixed(2) }}</td>
                    <td class="px-3 py-2 tabular-nums text-gray-600">{{ Number(item.cogs || 0).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="card p-12 text-center">
        <PackageOpen class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-400">لا توجد تسجيلات جرد بعد</p>
        <button @click="startNewEntry" class="btn-gold mt-4">
          <Plus class="w-4 h-4" />
          <span>تسجيل جديد</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import { Save, Loader2, RefreshCw, Plus, X, Pencil, ChevronDown, ChevronUp, Calendar, PackageOpen } from 'lucide-vue-next';
import api from '../../api';
import { useOrgLabels } from '../../composables/useOrgLabels';

const toast = inject('toast');
const { L } = useOrgLabels();

const editMode = ref(false);
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const mode = ref('opening');
const saving = ref(false);
const inventoryRows = ref([]);
const loadingCards = ref(false);
const monthCards = ref([]);
const expandedMonth = ref(null);

const totalOpeningKg = computed(() => inventoryRows.value.reduce((s, r) => s + Number(r.opening_balance_kg || 0), 0));
const totalOpeningCost = computed(() => inventoryRows.value.reduce((s, r) => s + Number(r.opening_balance_cost || 0), 0));
const totalClosingKg = computed(() => inventoryRows.value.reduce((s, r) => s + Number(r.closing_balance_kg || 0), 0));
const totalClosingCost = computed(() => inventoryRows.value.reduce((s, r) => s + Number(r.closing_balance_cost || 0), 0));

const formatMonth = (dateStr) => {
  if (!dateStr) return '—';
  const [year, month] = dateStr.slice(0, 7).split('-');
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  return `${months[parseInt(month) - 1]} ${year}`;
};

const loadCards = async () => {
  loadingCards.value = true;
  try {
    const res = await api.get('/fish-inventory', { params: { limit: 500 } });
    const allRecords = res.data.data || [];
    const grouped = {};
    allRecords.forEach(r => {
      const key = r.month_year;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });
    monthCards.value = Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a))
      .map(monthYear => {
        const items = grouped[monthYear];
        return {
          monthYear,
          items,
          itemsCount: items.length,
          totalOpeningKg: items.reduce((s, i) => s + Number(i.opening_balance_kg || 0), 0),
          totalIncoming: items.reduce((s, i) => s + Number(i.total_incoming_kg || 0), 0),
          totalClosingKg: items.reduce((s, i) => s + Number(i.closing_balance_kg || 0), 0),
        };
      });
  } catch (err) {
    toast('فشل تحميل البيانات', 'error');
  } finally {
    loadingCards.value = false;
  }
};

const toggleExpand = (monthYear) => {
  if (expandedMonth.value === monthYear) {
    expandedMonth.value = null;
  } else {
    expandedMonth.value = monthYear;
  }
};

const startNewEntry = () => {
  editMode.value = true;
  expandedMonth.value = null;
  selectedMonth.value = new Date().toISOString().slice(0, 7);
  mode.value = 'opening';
  loadEditModeData();
};

const startEditExisting = (monthYear) => {
  editMode.value = true;
  expandedMonth.value = null;
  selectedMonth.value = monthYear.slice(0, 7);
  mode.value = 'opening';
  loadEditModeData();
};

const cancelEdit = () => {
  editMode.value = false;
  loadCards();
};

const loadEditModeData = async () => {
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
    editMode.value = false;
    loadCards();
  } catch (err) {
    toast(err.response?.data?.error || 'فشل الحفظ', 'error');
  } finally {
    saving.value = false;
  }
};

onMounted(loadCards);
</script>
