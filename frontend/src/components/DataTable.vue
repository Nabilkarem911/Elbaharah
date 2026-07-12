<template>
  <div class="card overflow-hidden animate-slide-up">
    <div v-if="title || $slots.header || searchable" class="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3">
      <h3 v-if="title" class="font-bold text-primary-500 text-base">{{ title }}</h3>
      <slot name="header" />
      <div v-if="searchable" class="relative">
        <Search class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="بحث سريع..."
          class="input !py-1.5 !pr-9 text-sm w-48"
        />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th
              v-for="col in columns"
              :key="col.key"
              class="table-header"
              :class="{ 'cursor-pointer hover:bg-primary-50': col.sortable }"
              @click="col.sortable && toggleSort(col.key)"
            >
              <div class="flex items-center gap-1">
                {{ col.label }}
                <component
                  v-if="col.sortable && sortKey === col.key"
                  :is="sortDir === 'asc' ? ArrowUp : ArrowDown"
                  class="w-3 h-3"
                />
              </div>
            </th>
            <th v-if="$slots.actions" class="table-header">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in sortedData" :key="row.id" class="table-row">
            <td v-for="col in columns" :key="col.key" class="table-cell">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ formatCell(row[col.key], col) }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="table-cell">
              <div class="flex items-center gap-1">
                <slot name="actions" :row="row" />
              </div>
            </td>
          </tr>
          <tr v-if="!sortedData.length">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="py-12 text-center text-gray-400">
              <div class="flex flex-col items-center gap-2">
                <Inbox class="w-10 h-10 text-gray-300" />
                <p>لا توجد بيانات</p>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="$slots.footer">
          <tr class="border-t-2 border-primary-100 bg-primary-50/30">
            <slot name="footer" />
          </tr>
        </tfoot>
      </table>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <span class="text-xs text-gray-500">
        {{ (page - 1) * perPage + 1 }} - {{ Math.min(page * perPage, total) }} من {{ total }}
      </span>
      <div class="flex items-center gap-1">
        <button
          v-for="p in Math.min(totalPages, 7)"
          :key="p"
          @click="$emit('page-change', p)"
          class="w-8 h-8 rounded-lg text-sm font-medium transition-all"
          :class="page === p
            ? 'bg-primary-500 text-white'
            : 'text-gray-600 hover:bg-primary-50'"
        >
          {{ p }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ArrowUp, ArrowDown, Inbox, Search } from 'lucide-vue-next';

const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  page: { type: Number, default: 1 },
  perPage: { type: Number, default: 50 },
  total: { type: Number, default: 0 },
  totalPages: { type: Number, default: 0 },
  searchable: { type: Boolean, default: false },
});

defineEmits(['page-change']);

const sortKey = ref(null);
const sortDir = ref('asc');
const searchQuery = ref('');

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDir.value = 'asc';
  }
};

const filteredData = computed(() => {
  if (!searchQuery.value) return props.data;
  const q = searchQuery.value.toLowerCase();
  return props.data.filter(row =>
    props.columns.some(col => {
      const val = row[col.key];
      if (val === null || val === undefined) return false;
      if (typeof val === 'object') return Object.values(val).some(v => String(v).toLowerCase().includes(q));
      return String(val).toLowerCase().includes(q);
    })
  );
});

const sortedData = computed(() => {
  const data = filteredData.value;
  if (!sortKey.value) return data;
  const key = sortKey.value;
  const dir = sortDir.value === 'asc' ? 1 : -1;
  return [...data].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av || '').localeCompare(String(bv || '')) * dir;
  });
});

const formatCell = (value, col) => {
  if (value === null || value === undefined) return '—';
  if (col.type === 'currency') return `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;
  if (col.type === 'number') return Number(value).toLocaleString('en-US');
  if (col.type === 'weight') return `${Number(value).toFixed(3)} كجم`;
  if (col.type === 'date') return value;
  return value;
};
</script>
