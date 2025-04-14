<script setup>
import CredentialUploader from './partials/CredentialUploader.vue';
</script>

<template>
    <div class="border-bottom">
        <h1 class="fs-4 fw-bold">First Steps</h1>
    </div>
    <div class="mt-3">

        <div class="mb-3 alert alert-danger small">
            <p>
                <b>Peringatan:</b> Jangan membagikan file <b>credentials.json dan access token</b> kepada siapapun!
                <br/>
                Pastikan aplikasi ini telah terdaftar pada Google Cloud Console milik Anda.
            </p>
            <ol class="list-group list-group-numbered small">
                <li class="list-group-item">
                    Masuk ke <a href="https://console.cloud.google.com/" target="_blank"
                        rel="noopener noreferrer">https://console.cloud.google.com/</a> menggunakan akun Google
                    Anda.
                </li>
                <li class="list-group-item">
                    Aktifkan / <b>Enable YouTube Data API V3</b>. Anda dapat menemukannya melalui kolom pencarian pada
                    halaman Google Cloud Console.
                </li>
                <li class="list-group-item">
                    Buat kredensial OAuth 2.0:
                    <ul>
                        <li>
                            Masuk ke <b>APIs & Services -> Credentials</b>
                        </li>
                        <li>
                            Pilih <b>Create credentials -> OAuth client ID</b>
                        </li>
                        <li>
                            Pilih <b>Desktop Application</b>, beri nama untuk kredensialnya dan unduh file JSON. Beri nama file tersebut <b>credentials.json</b>
                        </li>
                        <li>
                            Secara default kredensial untuk aplikasi ini <b>berlaku untuk mode Testing</b>. Anda dapat melihatnya pada menu Audience. Saya merekomendasikan untuk tetap menggunakan mode Testing, karena di mode tersebut <b>Anda dapat membatasi email</b> yang dapat mengakses aplikasi ini. Jadi, <b>pastikan email Anda telah terdaftar pada menu Audience sebagai Test users</b>.
                        </li>
                    </ul>
                </li>
                <li class="list-group-item">
                    Perlu diketahui, bahwa <b>Google membatasi jumlah permintaan sebanyak 10.000 untuk satu hari</b>.
                </li>
            </ol>
        </div>
        <CredentialUploader />
    </div>
</template>