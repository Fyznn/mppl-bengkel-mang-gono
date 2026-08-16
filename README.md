# 🏍️ MANG GONO POS — Sistem Kasir & Manajemen Inventori Bengkel

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

Sistem Informasi **Point of Sale (POS)** dan **Manajemen Inventori** berbasis web yang dirancang khusus untuk mendigitalisasi operasional harian Bengkel Mang Gono. Aplikasi ini dibangun menggunakan arsitektur *decoupled* dengan **Laravel** sebagai penyedia RESTful API dan **React.js** sebagai antarmuka pengguna (*Frontend*).

Proyek ini dikembangkan untuk memenuhi Tugas Besar mata kuliah **Manajemen Proyek Perangkat Lunak (MPPL)**, Program Studi Teknik Informatika, **Universitas Komputer Indonesia (UNIKOM)**.

---

## 👥 Tim Pengembang (Kelompok)
* **Figo Immanuel Manuputty** ([@Fyznn](https://github.com/Fyznn)) — *Developer 1*
* **Yosafat Harazaki** ([@YosafatHarazaki](https://github.com/YosafatHarazaki)) — *Developer 2*

---

## ✨ Fitur Utama (Sprint 1 - 5)

Aplikasi ini dikembangkan menggunakan metodologi **Agile Scrum** yang diselesaikan dalam 5 siklus *Sprint*:

- 📦 **Sprint 1: Manajemen Inventori**
  - Sistem CRUD (Create, Read, Update, Delete) untuk data suku cadang (*spare part*).
  - Manajemen stok dinamis berbasis kode barang unik.
- 🛒 **Sprint 2: Sistem Kasir Terintegrasi**
  - Antarmuka kasir *split-screen* modern.
  - Kalkulasi total belanja dan kembalian otomatis.
  - Integrasi **Payment Gateway Midtrans (Sandbox)** untuk simulasi pembayaran QRIS & Virtual Account.
- 🔍 **Sprint 3: Riwayat Servis Pelanggan**
  - Pelacakan riwayat penggantian suku cadang berdasarkan **Plat Nomor** kendaraan.
- 🖨️ **Sprint 4: Cetak Struk / Nota Thermal**
  - *Pop-up* struk otomatis setelah transaksi sukses.
  - *Layout* presisi yang dioptimalkan untuk ukuran kertas *Thermal Printer* (80mm).
- 📊 **Sprint 5: Dashboard Laporan Keuangan**
  - Pemantauan metrik secara *real-time*: Pendapatan Hari Ini, Pendapatan Bulanan, dan Jumlah Pelanggan.
  - Tabel riwayat 10 transaksi terakhir yang masuk ke bengkel.

---

## 📸 Cuplikan Layar (*Screenshots*)

*(Tambahkan screenshot aplikasi kalian di sini)*

<details>
  <summary><b>Klik untuk melihat daftar cuplikan layar</b></summary>

  - **Halaman Kasir & QRIS:**
  <img width="1920" height="1020" alt="Screenshot 2026-08-16 124232" src="https://github.com/user-attachments/assets/5f4e9cd1-9936-46e8-916d-db978c6937a8" />
  
  - **Struk Thermal:**
  <img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/a5591fd1-29d5-4aa4-8a17-6836678070ba" />
  
  - **Dashboard Laporan Keuangan:**
  <img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/5e66666f-5926-4bdf-b648-2f533abfd6f5" />


</details>

---

## 🚀 Panduan Instalasi Lokal

Proyek ini menggunakan struktur **Monorepo**. Pastikan Anda telah menginstal PHP, Composer, Node.js, dan MySQL di perangkat Anda.

### 1. Setup Backend (Laravel)
Buka terminal dan arahkan ke folder backend:
```bash
cd bengkel-backend
composer install
cp .env.example .env
php artisan key:generate
