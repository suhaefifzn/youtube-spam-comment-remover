<script setup>
import { ref, onMounted } from "vue";
import { dbPromise } from "../../lib/db.js";

const newKeyword = ref("");
const keywordList = ref([]);

const loadKeywords = async () => {
  const db = await dbPromise;
  const tx = db.transaction("keywords", "readonly");
  const store = tx.objectStore("keywords");
  const allKeywords = await store.getAll();
  keywordList.value = allKeywords.sort((a, b) => b.id - a.id); // descending
}

const addKeyword = async () => {
  if (!newKeyword.value.trim()) return;
  const db = await dbPromise;
  const tx = db.transaction("keywords", "readwrite");
  const store = tx.objectStore("keywords");
  await store.add({ word: newKeyword.value.trim() });
  newKeyword.value = "";
  await loadKeywords();
}

const deleteKeyword = async (id) => {
  const db = await dbPromise;
  const tx = db.transaction("keywords", "readwrite");
  const store = tx.objectStore("keywords");
  await store.delete(id);
  await loadKeywords();
}

onMounted(() => {
  loadKeywords();
});
</script>

<template>
  <div>
    <h2 class="fw-bold fs-6 border-bottom pb-2">
      Keywords:
    </h2>
    <form class="border-bottom" @submit.prevent="addKeyword">
      <div class="input-group mb-2">
        <input type="text" class="form-control" placeholder="Tambahkan keyword spam di sini" v-model="newKeyword"
          required>
        <button class="btn btn-primary" type="submit">Tambah</button>
      </div>
    </form>
    <div id="listKeywords" class="mt-2 overflow-y-scroll" style="max-height: 200px;">
      <ul class="list-group small">
        <li v-for="keyword in keywordList" :key="keyword.id"
          class="list-group-item d-flex justify-content-between align-items-center">
          {{ keyword.word }}
          <button class="badge border-0 text-bg-danger rounded-pill" @click="deleteKeyword(keyword.id)">
            Hapus
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
