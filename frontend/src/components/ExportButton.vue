<template>
  <div class="flex items-center gap-2">
    <button class="btn-outline" @click="exportExcel">
      <FileSpreadsheet class="w-4 h-4" />
      <span>Excel</span>
    </button>
    <button class="btn-outline" @click="exportPDF">
      <FileText class="w-4 h-4" />
      <span>PDF</span>
    </button>
    <button class="btn-outline" @click="print">
      <Printer class="w-4 h-4" />
      <span>طباعة</span>
    </button>
  </div>
</template>

<script setup>
import { FileSpreadsheet, FileText, Printer } from 'lucide-vue-next';
import * as XLSX from 'xlsx';

const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  filename: { type: String, default: 'export' },
  title: { type: String, default: '' },
});

function buildPrintHTML() {
  const cols = props.columns;
  const rows = props.data;
  const tableHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead>
        <tr>${cols.map(c => `<th style="border:1px solid #ddd;padding:6px;background:#f5f5f5;text-align:right;">${c.label}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map(row => `<tr>${cols.map(c => {
          let val = row[c.key];
          if (c.type === 'currency') val = Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
          if (c.type === 'weight') val = Number(val || 0).toFixed(3) + ' كجم';
          return `<td style="border:1px solid #ddd;padding:6px;text-align:right;">${val ?? ''}</td>`;
        }).join('')}</tr>`).join('')}
      </tbody>
    </table>`;
  return `
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>${props.title || props.filename}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; }
        h2 { text-align: center; margin-bottom: 20px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      ${props.title ? `<h2>${props.title}</h2>` : ''}
      ${tableHTML}
    </body>
    </html>`;
}

function exportExcel() {
  const cols = props.columns;
  const rows = props.data.map(row => {
    const obj = {};
    cols.forEach(c => { obj[c.label] = row[c.key] ?? ''; });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${props.filename}.xlsx`);
}

function exportPDF() {
  const html = buildPrintHTML();
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
    setTimeout(() => w.close(), 500);
  }, 300);
}

function print() {
  const html = buildPrintHTML();
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
    setTimeout(() => w.close(), 500);
  }, 300);
}
</script>
