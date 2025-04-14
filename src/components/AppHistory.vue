<script setup>
import { ref, onMounted } from "vue";
import { dbPromise } from "../lib/db.js";

const historyList = ref([]);

const loadHistory = async () => {
    const db = await dbPromise;
    const tx = db.transaction("history", "readonly");
    const store = tx.objectStore("history");
    const allHistory = await store.getAll();
    historyList.value = allHistory.sort((a, b) => b.id - a.id); // descending
};

onMounted(() => {
    loadHistory();
});
</script>

<template>
    <div class="border-bottom mb-4">
        <h1 class="fs-4 fw-bold">History</h1>
    </div>

    <div v-if="historyList.length === 0" class="text-muted">Belum ada riwayat.</div>

    <div v-else class="list-group">
        <div v-for="item in historyList" :key="item.id"
            class="list-group-item d-flex align-items-start gap-3 flex-wrap">
            <div style="width: 120px; height: 90px;" class="overflow-hidden">
                <img :src="item.thumbnail" alt="Thumbnail" class="rounded shadow-sm img-fluid" />
            </div>
            <div class="flex-grow-1">
                <h5 class="mb-1 fw-semibold">{{ item.title }}</h5>
                <p class="mb-1 text-sm text-muted">
                    Spam dibersihkan: <strong>{{ item.totalSpam }}</strong><br />
                    Tanggal: {{ item.createdAt }}
                </p>
            </div>
            <div>
                <a :href="item.url" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary">
                    Lihat di YouTube
                </a>
            </div>
        </div>
    </div>
</template>
