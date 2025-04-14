<script setup>
import { ref } from 'vue';
import TokenGenerator from './TokenGenerator.vue';

const status = ref('none'); // none, loading, ready, error
const fileName = ref('');
const fileContent = ref(null);

if (localStorage.getItem('credentials.json')) {
  status.value = 'ready';
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  status.value = 'loading';

  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = JSON.parse(e.target.result);

        if (result.installed === undefined
          || result.installed.client_id === undefined
          || result.installed.redirect_uris === undefined
          || result.installed.client_secret === undefined
        ) {
          status.value = 'error';
        } else {
          fileContent.value = result;
          fileName.value = file.name;
          status.value = 'ready';
          localStorage.setItem('credentials.json', JSON.stringify(result));
        }
      } catch (err) {
        console.error('Invalid JSON format:', err);
        status.value = 'error';
      }
    };
    reader.readAsText(file);
  } catch (err) {
    console.error('File reading failed:', err);
    status.value = 'error';
  }
}

// Cek apakah credentials sudah tersimpan di localStorage
if (localStorage.getItem('credentials.json')) {
  status.value = 'ready';
  fileName.value = 'credentials.json (tersimpan)';
}
</script>

<template>
  <div class="mb-4 small">
    <h2 class="fs-6 fw-bold">A. Upload File Credentials</h2>
    <input type="file" class="form-control mb-2" accept="application/json" @change="handleFileUpload" />
    <div v-if="status === 'none'" class="text-secondary">Belum ada file diunggah</div>
    <div v-else-if="status === 'loading'" class="text-warning">Membaca file...</div>
    <div v-else-if="status === 'ready'" class="text-success">File siap digunakan: <strong>{{ fileName }}</strong></div>
    <div v-else-if="status === 'error'" class="text-danger">File tidak valid. Pastikan format JSON sesuai credentials
      Google.</div>
  </div>
  <template v-if="status === 'ready'">
    <TokenGenerator/>
  </template>
</template>