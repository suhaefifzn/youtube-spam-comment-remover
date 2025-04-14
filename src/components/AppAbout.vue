<script setup></script>

<template>
    <div class="border-bottom">
        <h1 class="fs-4 fw-bold">About</h1>
    </div>
    <div class="mt-3">
        <p>
            Aplikasi ini digunakan untuk menghapus spam komentar pada YouTube berdasarkan kata kunci tertentu dan kata yang memiliki karakter khusus.
        </p>
        <p>
            Untuk versi sekarang, sangat direkomendasikan untuk dijalankan pada perangkat masing-masing atau localhost, hal ini juga menjawab kenapa memerlukan file credentials.json yang diperoleh dari Google Cloud Platform. Jika sudah dihosting, mungkin hanya pihak yang menghostingnya saja yang memerlukan file credentials.json dan user cukup login menggunakan akun Google mereka sendiri tanpa perlu memperoleh file credentials. Tapi, menghosting aplikasi ini perlu peninjauan lebih lanjut khususnya terhadap celah keamanan dan kemampuan servernya dalam menerima request. Itu sebabnya aplikasi ini lebih baik dijalankan pada localhost.
        </p>
        <p>
            <b>Bagaimana aplikasi ini menyimpan file credentials user?</b>
            <br/>Konsep dari aplikasi ini adalah sepenuhnya berjalan di sisi client, yang artinya semua disimpan di penyimpanan local browser yang Anda gunakan. Seperti manajemen keywords dan history, keduanya dikelola menggunakan teknologi IndexedDB (database pada browser modern seperti Chrome atau Firefox seharusnya sudah mendukung). Sedangkan file credentials.json dan token disimpan pada local storage browser. Jika Anda penasaran, silahkan bukan Developer Tools -> Storage / Application di browser Anda untuk melihat data yang disimpan. Ini artinya, saat Anda berpindah ke browser baru untuk membuka aplikasi ini, maka semua data di browser lama tidak akan terbawa. Karena semua berjalan di sisi client terlebih lagi di localhost, maka keamanan data adalah tanggung jawab masing-masing. Saat Anda menghapus data pada browser lama, maka semua data yang tersimpan juga akan hilang.
        </p>
        <p>
            <b>Apakah aplikasi ini gratis?</b>
            <br/>Aplikasi ini dibuat dengan tujuan untuk memudahkan menghapus spam komentar pada YouTube. Di sisi lain, pengembang dari aplikasi ini juga masih dalam tahap belajar. Oleh karena itu, aplikasi ini gratis dan open source.
        </p>
        <p>
            <b>Di mana saya bisa melihat kode sumber aplikasi ini?</b>
            <br>Silahkan kunjungi <a href="https://github.com/suhaefifzn/youtube-spam-comment-remover" target="_blank" rel="noreferrer noopener">https://github.com/suhaefifzn/youtube-spam-comment-remover</a> untuk melihat kode sumber aplikasi ini.
        </p>
    </div>
</template>