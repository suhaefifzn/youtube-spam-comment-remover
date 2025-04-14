<script setup>
import { ref, onMounted } from 'vue';

const authCode = ref('');
const copySuccess = ref(false);

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (code) {
    authCode.value = code;
  }
});

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(authCode.value);
    copySuccess.value = true;
    setTimeout(() => (copySuccess.value = false), 2000);
  } catch (err) {
    alert('Gagal menyalin ke clipboard.');
    console.error(err)
  }
};
</script>

<template>
  <div class="container py-5">
    <div class="text-center mb-4">
      <h1 class="fw-bold text-primary">Otorisasi Berhasil!</h1>
      <p class="text-muted">Salin kode otorisasi berikut dan kembali ke aplikasi utama untuk melanjutkan.</p>
    </div>

    <div v-if="authCode" class="d-flex justify-content-center">
      <div class="input-group w-75">
        <input type="text" class="form-control form-control-lg" :value="authCode" readonly>
        <button class="btn btn-outline-secondary" @click="copyToClipboard">
          {{ copySuccess ? '✅ Disalin!' : 'Salin' }}
        </button>
      </div>
    </div>

    <div v-else class="alert alert-danger text-center mt-4" role="alert">
      Kode otorisasi tidak ditemukan di URL.
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
}
</style>
