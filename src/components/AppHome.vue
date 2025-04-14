<script setup>
import KeywordManager from "./partials/KeywordManager.vue";
import CredentialStatus from "./partials/CredentialStatus.vue";
import FormScanner from "./partials/FormCleaner.vue";
</script>

<template>
    <div class="border-bottom">
        <h1 class="fs-4 fw-bold">YouTube Spam Comment Remover</h1>
    </div>

    <div class="mt-3 row">
        <!-- Form Pembersihan -->
        <div class="col-12 col-lg-6">
            <FormScanner/>
        </div>

        <!-- Bagian Status dan Proses Penghapusan -->
        <div class="col-12 col-lg-6">
            <div id="statusWrapper">
                <CredentialStatus />
            </div>
            <div class="mt-3" id="keywordsWrapper">
                <KeywordManager />
            </div>
        </div>
    </div>
</template>