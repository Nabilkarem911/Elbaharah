<template>
  <div class="card p-5 animate-slide-up">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-bold text-primary-500 text-base">{{ title }}</h3>
      <slot name="action" />
    </div>
    <div :class="{ 'h-64': true }">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
});
</script>
