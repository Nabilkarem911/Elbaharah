<template>
  <div class="flex flex-wrap items-center gap-3">
    <div class="flex items-center gap-2">
      <button
        v-for="p in presets"
        :key="p.key"
        @click="selectPreset(p.key)"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        :class="selectedPreset === p.key
          ? 'bg-primary-500 text-white'
          : 'bg-white border border-gray-200 text-gray-600 hover:bg-primary-50'"
      >
        {{ p.label }}
      </button>
    </div>
    <div class="flex items-center gap-2">
      <div class="relative">
        <input
          type="date"
          :value="startDate"
          @input="$emit('update:startDate', $event.target.value)"
          class="input !py-1.5 !pr-3 text-sm w-auto"
        />
      </div>
      <span class="text-gray-400 text-sm">إلى</span>
      <div class="relative">
        <input
          type="date"
          :value="endDate"
          @input="$emit('update:endDate', $event.target.value)"
          class="input !py-1.5 !pr-3 text-sm w-auto"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
});

const emit = defineEmits(['update:startDate', 'update:endDate', 'change']);

const selectedPreset = ref('thisMonth');

const presets = [
  { key: 'today', label: 'اليوم' },
  { key: 'thisWeek', label: 'هذا الأسبوع' },
  { key: 'thisMonth', label: 'هذا الشهر' },
  { key: 'thisQuarter', label: 'ربع سنوي' },
  { key: 'thisYear', label: 'هذا العام' },
];

const selectPreset = (key) => {
  selectedPreset.value = key;
  const now = new Date();
  let start, end;
  end = new Date(now);
  switch (key) {
    case 'today':
      start = new Date(now);
      break;
    case 'thisWeek':
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      break;
    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'thisQuarter':
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
      break;
    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1);
      break;
  }
  emit('update:startDate', start.toISOString().split('T')[0]);
  emit('update:endDate', end.toISOString().split('T')[0]);
  emit('change', { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] });
};
</script>
