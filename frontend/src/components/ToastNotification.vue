<template>
  <Transition
    enter-active-class="transition-all duration-300"
    enter-from-class="opacity-0 translate-y-4"
    leave-active-class="transition-all duration-200"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="show"
      class="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg"
      :class="typeClass"
    >
      <component :is="icon" class="w-5 h-5 flex-shrink-0" />
      <span class="text-sm font-medium">{{ message }}</span>
      <button @click="$emit('close')" class="ml-2 opacity-70 hover:opacity-100">
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-vue-next';

const props = defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: '' },
  type: { type: String, default: 'success' },
});

defineEmits(['close']);

const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
const typeClass = computed(() => ({
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-600 text-white',
}[props.type]));
const icon = computed(() => icons[props.type] || Info);
</script>
