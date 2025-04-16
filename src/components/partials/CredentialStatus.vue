<script setup>
import { ref } from "vue";
import { isAccessTokenExpired } from "../../service/api/auth-api.js";

const isTokenExpired = ref(false);
isTokenExpired.value = isAccessTokenExpired();

const checkIfTokenReady = () => {
    isTokenExpired.value = isAccessTokenExpired();  
};
</script>

<template>
    <form class="border-bottom pb-1 mb-2 d-flex justify-content-between align-items-center">
        <h2 class="fw-bold fs-6 d-inline">
            Status:
            <span :class="{
                'text-success': !isTokenExpired,
                'text-danger': isTokenExpired
            }">
                {{
                    !isTokenExpired ? 'Siap' : 'Belum Siap'
                }}
            </span>
        </h2>
        <button type="button" class="btn btn-sm btn-warning" @click="checkIfTokenReady">
            Cek Ulang
        </button>
    </form>
</template>
