<script setup></script>

<template>
    <header class="position-relative">
        <nav class="navbar bg-purple-3 fixed-top navbar-expand-lg d-flex align-items-center">
            <div class="container">
                <router-link class="navbar-brand fs-4 fw-bold" :to="{ name: 'home' }" title="Spam Comment Remover">
                    <img src="../assets/logo.webp" alt="Logo Spam Comment Remover" width="45">
                </router-link>
                <button class="navbar-toggler my-2 mb-md-0" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item px-2">
                            <router-link class="nav-link" :to="{ name: 'tutorial' }">
                                First Steps
                            </router-link>
                        </li>
                        <li class="nav-item px-2">
                            <router-link class="nav-link" :to="{ name: 'history' }">
                                History
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link px-2" :to="{ name: 'about' }">
                                About
                            </router-link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
</template>

<style scoped>
.nav-item:hover {
    border-radius: 0.5em;
    background-color: #6A42C2;
    transition: all 0.3s ease-in-out;
}

.nav-item a {
    color: #b4b4b4;
}

.nav-item:hover a, 
.router-link-exact-active{
    color: #fff!important;
}
</style>