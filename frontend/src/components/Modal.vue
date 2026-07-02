<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-primary-900/40 backdrop-blur-sm" @click="$emit('close')" />
        <div
          class="relative bg-white rounded-2xl shadow-xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
          :class="sizeClass"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
            <h3 class="font-bold text-primary-500 text-lg">{{ title }}</h3>
            <button @click="$emit('close')" class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div class="p-6">
            <slot />
          </div>
          <div v-if="$slots.footer" class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' },
});

defineEmits(['close']);

const sizeClass = computed(() => ({
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
}[props.size] || 'max-w-lg'));
</script>
