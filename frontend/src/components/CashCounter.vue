<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-bold text-primary-500">عداد الكاش</h3>
      <button @click="reset" class="btn-ghost text-xs">تصفير</button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="table-header">
            <th class="px-4 py-2 text-right">الفئة</th>
            <th class="px-4 py-2 text-right">العدد</th>
            <th class="px-4 py-2 text-right">المبلغ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in denominations" :key="d.value" class="table-row">
            <td class="px-4 py-2 font-medium text-primary-500">{{ d.label }}</td>
            <td class="px-4 py-2">
              <input
                type="number"
                min="0"
                v-model.number="d.count"
                class="input !py-1.5 !px-2 w-24 tabular-nums text-center"
                :data-idx="denominations.indexOf(d)"
                @input="calc"
                @keydown.enter="focusNextDenomination($event, denominations.indexOf(d))"
              />
            </td>
            <td class="px-4 py-2 tabular-nums font-medium">{{ (d.count * d.value).toLocaleString('en-US') }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="label">فلوس فضية (فكة)</label>
        <input type="number" step="0.01" v-model.number="coins" class="input tabular-nums" data-field="coins" @input="calc" @keydown.enter="focusNextField($event, 'cards')" />
      </div>
      <div>
        <label class="label">فلوس في البطاقات</label>
        <input type="number" step="0.01" v-model.number="cards" class="input tabular-nums" data-field="cards" @input="calc" @keydown.enter="apply" />
      </div>
    </div>

    <div class="p-4 bg-primary-50 rounded-xl flex items-center justify-between">
      <span class="font-bold text-primary-500">المجمــــــــوع</span>
      <span class="text-2xl font-bold text-primary-500 tabular-nums">{{ total.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
    </div>

    <div class="flex gap-2">
      <button @click="apply" class="btn-gold flex-1">
        <Check class="w-4 h-4" />
        <span>تطبيق على الصندوق</span>
      </button>
      <button @click="$emit('close')" class="btn-ghost">إلغاء</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Check } from 'lucide-vue-next';

const emit = defineEmits(['apply', 'close']);

const denominations = ref([
  { label: '500', value: 500, count: 0 },
  { label: '200', value: 200, count: 0 },
  { label: '100', value: 100, count: 0 },
  { label: '50', value: 50, count: 0 },
  { label: '20', value: 20, count: 0 },
  { label: '10', value: 10, count: 0 },
  { label: '5', value: 5, count: 0 },
  { label: '1', value: 1, count: 0 },
]);

const coins = ref(0);
const cards = ref(0);

const notesTotal = computed(() =>
  denominations.value.reduce((sum, d) => sum + (d.count * d.value), 0)
);

const total = computed(() =>
  notesTotal.value + Number(coins.value || 0) + Number(cards.value || 0)
);

const calc = () => {};

const focusNextDenomination = (e, idx) => {
  e.preventDefault();
  const inputs = document.querySelectorAll('[data-idx]');
  if (idx < inputs.length - 1) {
    inputs[idx + 1].focus();
  } else {
    const coinsField = document.querySelector('[data-field="coins"]');
    if (coinsField) coinsField.focus();
  }
};

const focusNextField = (e, field) => {
  e.preventDefault();
  const next = document.querySelector(`[data-field="${field}"]`);
  if (next) next.focus();
};

const apply = () => {
  emit('apply', total.value);
};

const reset = () => {
  denominations.value.forEach(d => d.count = 0);
  coins.value = 0;
  cards.value = 0;
};
</script>
