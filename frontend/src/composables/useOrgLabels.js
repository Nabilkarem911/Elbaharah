import { ref } from 'vue';
import api from '../api';

const labels = ref({});
const orgName = ref('');
const branches = ref([]);
let loaded = false;

function loadOrgLabels() {
  loaded = true;
  api.get('/me/org').then(({ data }) => {
    labels.value = data.labels || {};
    orgName.value = data.organization?.name || '';
    if (data.branches) branches.value = data.branches;
  }).catch(() => {});
}

export function resetOrgLabels() {
  labels.value = {};
  orgName.value = '';
  branches.value = [];
  loaded = false;
}

export function useOrgLabels() {
  if (!loaded) {
    loadOrgLabels();
  }

  const L = (key, fallback) => labels.value[key] || fallback;

  return { labels, orgName, branches, L };
}
