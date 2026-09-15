// ===== Hamburger menu =====
function initNavToggle() {
    const toggleBtn = document.getElementById("nav-toggle-btn");
    const nav = document.querySelector("header nav");

    if (!toggleBtn || !nav) return;

    toggleBtn.addEventListener("click", function () {
        nav.classList.toggle("nav-open");
    });
}


// ===== Konfirmasi hapus dengan event delegation =====
function initHapusConfirm() {
    document.addEventListener("click", function (e) {
        console.log(e.target);
        const btn = e.target.closest(".btn-hapus");

        if (!btn) return;

        const row = btn.closest("tr");
        const nama = row ? row.querySelector("td")?.textContent : "data ini";

        const yakin = confirm("Yakin ingin menghapus \"" + nama + "\"?");

        if (yakin && row) {
            row.remove();
        }
    });
}

// ===== Counter jumlah baris =====
function updateRowCounter() {
    const table = document.querySelector(".table-responsive table");
    const counter = document.getElementById("row-counter");

    if (!table || !counter) return;

    const rows = table.querySelectorAll("tbody tr");
    const total = rows.length;

    let tampil = 0;

    rows.forEach(function (row) {
        if (row.style.display !== "none") {
            tampil++;
        }
    });

    counter.textContent =
        "Menampilkan " + tampil + " dari " + total + " buku";
}


// ===== Filter / pencarian tabel =====
function initTableFilter() {
    const input = document.getElementById("search-input");
    const table = document.querySelector(".table-responsive table");

    if (!input || !table) return;

    input.addEventListener("keyup", function () {
        const keyword = input.value.toLowerCase();
        const rows = table.querySelectorAll("tbody tr");

        rows.forEach(function (row) {
            const kolomJudul = row.querySelector("td");

            if (!kolomJudul) return;

            const judul = kolomJudul.textContent.toLowerCase();

            if (judul.includes(keyword)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });

        updateRowCounter();
    });
}


// ===== Validasi form =====
function tampilkanError(input, pesan) {
    hapusError(input);

    const span = document.createElement("span");
    span.className = "error";
    span.textContent = pesan;

    input.insertAdjacentElement("afterend", span);
}


function hapusError(input) {
    const next = input.nextElementSibling;

    if (next && next.classList.contains("error")) {
        next.remove();
    }
}


function initValidasiForm() {
    const form = document.getElementById("form-tambah");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        let valid = true;

        // Daftar field yang wajib diisi
        const fieldWajib = [
            {
                nama: "judul",
                pesan: "Judul wajib diisi."
            },
            {
                nama: "nama",
                pesan: "Nama wajib diisi."
            },
            {
                nama: "pengarang",
                pesan: "Pengarang wajib diisi."
            }
        ];

        // Validasi semua field wajib
        fieldWajib.forEach(function (field) {
            const input = form.querySelector("[name='" + field.nama + "']");

            if (!input) return;

            if (input.value.trim() === "") {
                tampilkanError(input, field.pesan);
                valid = false;
            } else {
                hapusError(input);
            }
        });

        // Validasi tahun
        const tahun = form.querySelector("[name='tahun']");

        if (tahun) {
            const nilai = parseInt(tahun.value, 10);

            if (isNaN(nilai) || nilai < 1900 || nilai > 2026) {
                tampilkanError(
                    tahun,
                    "Tahun harus di antara 1900-2026."
                );
                valid = false;
            } else {
                hapusError(tahun);
            }
        }

        // Validasi stok
        const stok = form.querySelector("[name='stok']");

        if (stok) {
            const nilai = parseInt(stok.value, 10);

            if (isNaN(nilai) || nilai < 0) {
                tampilkanError(
                    stok,
                    "Stok tidak boleh negatif."
                );
                valid = false;
            } else {
                hapusError(stok);
            }
        }

        // Validasi ISBN
        const isbn = form.querySelector("[name='isbn']");

        if (isbn) {
            const nilai = isbn.value.trim();

            if (nilai !== "" && !/^[0-9-]+$/.test(nilai)) {
                tampilkanError(
                    isbn,
                    "ISBN hanya boleh berisi angka dan tanda hubung (-)."
                );
                valid = false;
            } else {
                hapusError(isbn);
            }
        }

        if (!valid) {
            e.preventDefault();
        }
    });
}

// ===== Fungsi generik: ambil & render data tabel dari JSON =====
async function muatDaftar(namaFileJson, daftarKunci, opsi) {
    const tbody = document.querySelector(".table-responsive table tbody");
    const loading = document.getElementById("loading-indicator");
    if (!tbody) return;

    loading.style.display = "block";
    tbody.innerHTML = "";

    try {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const res = await fetch(namaFileJson);
        if (!res.ok) {
            throw new Error("Gagal mengambil data (status " + res.status + ")");
        }
        const daftarData = await res.json();

        daftarData.forEach(function (item) {
            const tr = document.createElement("tr");

            // Bangun <td> untuk tiap kunci yang diberikan
            let selKolom = "";
            daftarKunci.forEach(function (kunci) {
                selKolom += "<td>" + item[kunci] + "</td>";
            });

            // Tombol Detail cuma dipakai kalau opsi.hasDetailButton = true
            const tombolDetail = (opsi && opsi.hasDetailButton)
                ? "<button type=\"button\">Detail</button> "
                : "";

            tr.innerHTML =
                selKolom +
                "<td>" +
                "<button type=\"button\">Edit</button> " +
                tombolDetail +
                "<button type=\"button\" class=\"btn-hapus\">Hapus</button>" +
                "</td>";

            tbody.appendChild(tr);
        });

        updateRowCounter();
    } catch (err) {
        tbody.innerHTML =
            "<tr><td colspan=\"5\">Gagal memuat data: " + err.message + "</td></tr>";
    } finally {
        loading.style.display = "none";
    }
}


// ===== Jalankan semua fungsi setelah halaman selesai dimuat =====
document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initHapusConfirm();
    initTableFilter();
    initValidasiForm();
    updateRowCounter();
});