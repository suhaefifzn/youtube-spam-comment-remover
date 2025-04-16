<script setup>
import { ref, nextTick } from "vue";
import { addHistory } from "../../service/idb/history-idb.js";
import { isAccessTokenExpired } from "../../service/api/auth-api.js";
import {
  fetchCommentsFromVideoById,
  fetchCommentsFromChannelById,
  getDetailVideoById,
  getDetailChannelById,
  rejectComments
} from "../../service/api/youtube-api.js";

const selectedRadio = ref("video");
const videoID = ref("");
const channelID = ref("");
const terminalOutput = ref("");
const showTerminal = ref(false);
const idsToDelete = ref([]);
const canDelete = ref(false);
const dataForHistory = ref("");
const isTokenExpired = isAccessTokenExpired();

const logToTerminal = async (comments) => {
  if (Array.isArray(comments)) {
    comments.forEach((comment, index) => {
      terminalOutput.value += `${index + 1}. 🚨 Spam detected: "${comment.text}"\n`;
    });
  } else {
    if (typeof comments === "string") {
      terminalOutput.value += `${comments}\n`;
    }
  }

  // Scroll otomatis ke bawah setelah update
  await nextTick();
  const terminal = document.getElementById("terminalWrapper");
  if (terminal) {
    terminal.scrollTop = terminal.scrollHeight;
  }
};

const runCleaner = async () => {
  showTerminal.value = isTokenExpired ? false : true;
  terminalOutput.value = "";
  let result = [];

  if (selectedRadio.value === "video") {
    const video = await getDetailVideoById(videoID.value);
    
    await logToTerminal("-----------------------");
    await logToTerminal(`Mode: ${selectedRadio.value}`);
    await logToTerminal(`Video ID: ${videoID.value}`);
    await logToTerminal(`Judul Video: ${video.title}`);
    await logToTerminal(`Nama Channel: ${video.channelTitle}`);
    await logToTerminal("-----------------------");
    
    result = await fetchCommentsFromVideoById(videoID.value);
    dataForHistory.value = {
      title: video.title,
      id: videoID.value,
      totalSpam: result.length,
      thumbnail: video.thumbnails?.standard?.url,
      isChannel: false
    };

    await logToTerminal(result);
  } else if (selectedRadio.value === "channel") {
    const channel = await getDetailChannelById(channelID.value);

    await logToTerminal("-----------------------");
    await logToTerminal(`Mode: ${selectedRadio.value}`);
    await logToTerminal(`Channel ID: ${channelID.value}`);
    await logToTerminal(`Nama Channel: ${channel.title}`);
    await logToTerminal("-----------------------");

    result = await fetchCommentsFromChannelById(channelID.value);

    // belum dibuat api untuk get detail channel-nya
    dataForHistory.value = {
      title: 'Hapus Semua Komentar Spam yang Ada di Channel: ' + channel.title,
      id: channelID.value,
      totalSpam: result.length,
      thumbnail: channel.thumbnails?.high?.url,
      isChannel: true
    };
    await logToTerminal(result);
  }

  if (result.length > 0) {
    await logToTerminal(`\n🗑️ Menemukan ${result.length} komentar spam.`);

    idsToDelete.value = result.map(comment => comment.commentId);
    canDelete.value = true;

    await logToTerminal(`Klik tombol "Bersihkan" untuk menghapus komentar.`);
  } else {
    await logToTerminal(`🎉 Tidak ada komentar spam ditemukan.`);
  }
};

const addToHistoryHandler = async ({ title, id, totalSpam, thumbnail, isChannel }) => {
  if (totalSpam > 0) {
    await addHistory({ title, id, totalSpam, thumbnail, isChannel });
  }
};

const deleteHandler = async () => {
  if (idsToDelete.value.length === 0) return;

  await logToTerminal("\n🔨 Memulai proses penghapusan komentar...");
  await rejectComments(idsToDelete.value, (msg) => {
    logToTerminal(msg);
  });
  await logToTerminal(`\n✅ Proses selesai. ${idsToDelete.value.length} komentar dihapus.`);

  dataForHistory.value.totalSpam = idsToDelete.value.length;
  await addToHistoryHandler(dataForHistory.value);

  canDelete.value = false;
  idsToDelete.value = [];
};
</script>

<template>
  <form @submit.prevent="runCleaner">
    <div id="radioGroupCategory">
      <input type="radio" class="btn-check" name="options-base" id="option1" autocomplete="off" value="video"
        v-model="selectedRadio">
      <label class="btn" for="option1">By Video</label>
      <input type="radio" class="btn-check" name="options-base" id="option2" autocomplete="off" value="channel"
        v-model="selectedRadio">
      <label class="btn" for="option2">By Channel</label>
    </div>

    <!-- Jenis input yang muncul tergantung radio yang dipilih -->
    <div class="mt-3">
      <template v-if="!isTokenExpired">
        <!-- Input Video ID -->
        <template v-if="selectedRadio === 'video'">
          <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Masukkan Video ID di sini" id="inputVideoID"
              v-model="videoID" required>
            <button class="btn btn-dark" type="submit">Jalankan</button>
          </div>
        </template>
        <template v-else-if="selectedRadio === 'channel'">
          <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Masukkan Channel ID di sini" id="inputChannelID"
              v-model="channelID" required>
            <button class="btn btn-dark" type="submit">Jalankan</button>
          </div>
        </template>

        <!-- Terminal Output -->
        <div v-if="showTerminal" id="terminalWrapper"
          class="border rounded p-3 bg-dark overflow-scroll small text-light"
          style="max-height: 250px; min-height: 250px;">
          <pre>{{ terminalOutput }}</pre>
        </div>
        <div v-if="showTerminal" class="mt-2 d-flex justify-content-end">
          <button class="btn btn-sm btn-danger" @click="deleteHandler" :disabled="!canDelete">
            Bersihkan
          </button>
        </div>
      </template>
      <template v-else>
        <div class="alert alert-danger small" role="alert">
          <b>Token belum tersedia / kadaluwarsa.</b>
          <br />Silakan lakukan generate terlebih dahulu pada halaman <router-link :to="{ name: 'tutorial' }">First
            Step</router-link>.
        </div>
      </template>
    </div>
  </form>
</template>