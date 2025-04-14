<script setup>
import {
    RouterView,
} from 'vue-router';
</script>

<template>
    <RouterView name="navbar"/>
    <RouterView v-slot="{ Component }">
        <div class="container my-5 pt-5" style="min-height: 83vh;">
            <component :is="Component"/>
        </div>
    </RouterView>
    <RouterView name="footer"/>
</template>