<script setup>
import { ref, onMounted } from "vue";
import {
  getKeywords,
  deleteKeywordById,
  addKeyword
} from "../../service/idb/keywords-idb.js";

const newKeyword = ref("");
const keywordList = ref([]);

const addKeywordHandler = async () => {
  if (!newKeyword.value.trim()) return;
  await addKeyword(newKeyword.value.trim());
  keywordList.value = await getKeywords();
  newKeyword.value = "";
}

const deleteKeywordHandler = async (id) => {
  await deleteKeywordById(id);
  keywordList.value = await getKeywords();
}

onMounted(async () => {
  keywordList.value = await getKeywords();
});
</script>

<template>
  <div>
    <h2 class="fw-bold fs-6 border-bottom pb-2">
      Keywords:
    </h2>
    <form class="border-bottom" @submit.prevent="addKeywordHandler">
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
          <button class="badge border-0 text-bg-danger rounded-pill" @click="deleteKeywordHandler(keyword.id)">
            Hapus
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
