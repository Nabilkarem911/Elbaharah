<template>
  <div class="card p-5 flex items-center gap-4 animate-slide-up">
    <div
      class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
      :class="iconBg"
    >
      <component :is="icon" class="w-6 h-6" :class="iconColor" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm text-gray-500 font-medium truncate">{{ title }}</p>
      <p class="text-2xl font-bold text-primary-500 tabular-nums mt-0.5">{{ formattedValue }}</p>
      <div v-if="subtitle" class="flex items-center gap-1 mt-1">
        <component :is="trendIcon" v-if="trend" class="w-3.5 h-3.5" :class="trendColor" />
        <span class="text-xs" :class="trendColor">{{ subtitle }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { TrendingUp, TrendingDown } from 'lucide-vue-next';

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  icon: { type: Object, required: true },
  color: { type: String, default: 'primary' },
  subtitle: { type: String, default: '' },
  trend: { type: String, default: null },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
});

const colorMap = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-500' },
  gold: { bg: 'bg-gold/10', text: 'text-gold-dark' },
  success: { bg: 'bg-green-50', text: 'text-success' },
  danger: { bg: 'bg-red-50', text: 'text-danger' },
  info: { bg: 'bg-blue-50', text: 'text-blue-600' },
};

const iconBg = computed(() => colorMap[props.color]?.bg || colorMap.primary.bg);
const iconColor = computed(() => colorMap[props.color]?.text || colorMap.primary.text);
const trendIcon = computed(() => props.trend === 'up' ? TrendingUp : TrendingDown);
const trendColor = computed(() => props.trend === 'up' ? 'text-success' : 'text-danger');
const formattedValue = computed(() => {
  const v = typeof props.value === 'number'
    ? props.value.toLocaleString('ar-SA', { maximumFractionDigits: 2 })
    : props.value;
  return `${props.prefix}${v}${props.suffix}`;
});
</script>
