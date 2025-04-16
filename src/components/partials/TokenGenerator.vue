<script setup>
import { ref, computed, onMounted } from "vue";
import { generateNewToken, getAuthUrl, refreshAccessToken } from "../../service/api/auth-api.js";

const authCode = ref("");
const authUrl = ref("");
const tokenData = ref(null);
const now = () => Math.floor(Date.now() / 1000);

onMounted(() => {
  authUrl.value = getAuthUrl();

  const raw = localStorage.getItem("token.json");
  if (raw) {
    tokenData.value = JSON.parse(raw);
  }
});

const isTokenActive = computed(() => {
  if (!tokenData.value) return false;
  const { created_at, expires_in } = tokenData.value;
  return now() < created_at + expires_in;
});

const generateToken = async () => {
  if (!authCode.value.trim()) return;

  try {
    const result = await generateNewToken(authCode.value);
    tokenData.value = result;
    alert("Token berhasil disimpan.");
    authCode.value = "";
  } catch (err) {
    alert("Gagal menyimpan token. Periksa kembali kode autentikasi.");
    console.error(err);
  }
};

const refreshToken = async () => {
  const result = await refreshAccessToken();
  tokenData.value = result;
  alert("Akses token diperbarui!");
};

const tokenExpiredAt = computed(() => {
  if (!tokenData.value) return null;
  const { created_at, expires_in } = tokenData.value;
  const expiredTimestamp = (created_at + expires_in) * 1000;
  return new Date(expiredTimestamp).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
});

const openPopupAuthorize = () => {
  const url = getAuthUrl();
  const width = 600;
  const height = 700;
  const left = (window.screen.width / 2) - (width / 2);
  const top = (window.screen.height / 2) - (height / 2);

  window.open(
    url,
    "_blank",
    `width=${width},height=${height},top=${top},left=${left}`
  );
};
</script>

<template>
  <div class="mb-4">
    <h2 class="fs-6 fw-bold">B. Generate Akses Token</h2>
    <p>
      1. Klik tombol berikut untuk membuka halaman otorisasi Google:<br>
      <button class="btn btn-sm btn-primary mt-2 mb-3" @click="openPopupAuthorize">
        Authorize via Google
      </button><br>
      2. Copy kode dari halaman tersebut dan tempel di bawah ini:
    </p>
    <form class="input-group mt-2 col-6" @submit.prevent="generateToken">
      <input type="text" class="form-control" v-model="authCode" placeholder="Tempel kode autentikasi dari Google"
        required>
      <button type="submit" class="btn btn-secondary">Generate Token</button>
    </form>
  </div>

  <div v-if="tokenData" class="border p-3 rounded bg-light">
    <h2 class="fs-6 fw-bold">Status Token</h2>
    <div class="small"><strong>Akses Token:</strong></div>
    <textarea class="form-control mb-2" readonly rows="2">{{ tokenData.access_token }}</textarea>
    <div class="small">
      <strong>Status:</strong>
      <div :class="isTokenActive ? 'badge bg-success' : 'badge bg-danger'">
        {{ isTokenActive ? ' Aktif | Aplikasi Sudah Siap' : ' Tidak Aktif / Kedaluwarsa | Aplikasi Belum Siap' }}
      </div>
    </div>
    <div v-if="tokenExpiredAt" class="small">
      <strong>Kedaluwarsa: </strong>
      <span class="text-muted small">{{ tokenExpiredAt }}</span>
    </div>
    <button class="btn btn-sm btn-warning mt-3" @click="refreshToken">Perbarui Token</button>
  </div>

  <div v-else class="alert alert-warning mt-3 small">
    Akses token belum tersedia. Silakan lakukan generate token terlebih dahulu agar aplikasi bisa berjalan.
  </div>
</template>
