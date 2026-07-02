<template>
  <div class="flex items-center gap-2">
    <button class="btn-outline" @click="$emit('export', 'excel')">
      <FileSpreadsheet class="w-4 h-4" />
      <span>Excel</span>
    </button>
    <button class="btn-outline" @click="$emit('export', 'pdf')">
      <FileText class="w-4 h-4" />
      <span>PDF</span>
    </button>
    <button class="btn-outline" @click="$emit('export', 'print')">
      <Printer class="w-4 h-4" />
      <span>طباعة</span>
    </button>
  </div>
</template>

<script setup>
import { FileSpreadsheet, FileText, Printer } from 'lucide-vue-next';
defineEmits(['export']);
</script>
