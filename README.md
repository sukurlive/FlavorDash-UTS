# 🍽️ FlavorDash - Aplikasi Katalog & Pengiriman Makanan

Aplikasi mobile berbasis React Native (Expo) dan Node.js untuk manajemen katalog makanan, pemesanan, dan pelacakan pengiriman. Aplikasi ini dilengkapi dengan dashboard Admin yang komprehensif dan fitur lokasi berbasis GPS.

## ✨ Fitur Utama

### 👤 Sisi Pengguna (User)
- ✅ **Katalog Produk** - Tampilan daftar makanan dengan layout Flexbox yang responsif.
- ✅ **Keranjang Belanja** - Tambah, ubah jumlah, dan hapus item secara real-time.
- ✅ **Checkout & Penguncian Alamat** - Memilih alamat pengiriman yang tersimpan, sehingga data pesanan tidak berubah meskipun user mengedit profil nanti.
- ✅ **Peta & Navigasi** - Integrasi `expo-location` dan `react-native-maps` untuk melihat lokasi restoran dan membuka rute Google Maps ke alamat pengiriman.
- ✅ **Bukti Pengiriman (Kamera)** - Fitur pengambilan foto langsung melalui aplikasi (`expo-camera`) sebagai bukti pesanan diterima, yang diunggah ke server.
- ✅ **Manajemen Profil** - Kelola data diri dan multiple alamat pengiriman (dengan penanda alamat utama/default).

### 👨‍💼 Sisi Admin (Dashboard)
- ✅ **Statistik Pesanan** - Ringkasan total pesanan, menunggu, diproses, selesai, dan dibatalkan.
- ✅ **Manajemen Pesanan** - Melihat detail pesanan (termasuk alamat & koordinat GPS), mengubah status pesanan, dan melihat bukti foto pengiriman.
- ✅ **Manajemen Produk** - Menambah, mengedit, dan menghapus daftar menu makanan.
- ✅ **Manajemen Pengguna** - Melihat daftar user, mengedit data, menghapus akun, dan mengubah role (User ↔ Admin).

### ⚙️ Teknis & Keamanan
- ✅ **JWT Authentication** - Stateless authentication menggunakan Access Token & Refresh Token yang disimpan aman (`expo-secure-store` / `AsyncStorage`).
- ✅ **Role-Based Access Control (RBAC)** - Proteksi rute otomatis; User biasa tidak bisa mengakses `/admin`, dan sebaliknya.
- ✅ **Expo Router (Grouped Routes)** - Struktur navigasi modern menggunakan `(tabs)` untuk User dan folder `admin/` terpisah untuk mencegah konflik UI (double footer).
- ✅ **MySQL Database** - Relasi data yang terstruktur (Users, Addresses, Orders, Order Items, Products).

---

## 📁 Struktur Proyek

```text
FlavorDash/
├── app/ 
│   ├── _layout.tsx             # Root Stack Navigator
│   ├── login.tsx               # Halaman Login & Register
│   ├── (tabs)/                 # 📱 ROUTE GROUP: Khusus Pengguna
│   │   ├── _layout.tsx         # Tab Bar User (Home, Menu, Profile) + Custom Header
│   │   ├── index.tsx           # Halaman Home
│   │   ├── products.tsx        # Katalog Produk
│   │   ├── cart.tsx            # Keranjang & Checkout
│   │   ├── orders.tsx          # Riwayat Pesanan
│   │   ├── profile.tsx         # Profil User
│   │   ├── addresses.tsx       # Manajemen Alamat (dengan GPS)
│   │   ├── maps.tsx            # Peta Lokasi & Rute
│   │   └── detail/[id].tsx     # Detail Pesanan & Upload Bukti Foto
│   └── admin/                  # 💻 ROUTE GROUP: Khusus Admin
│       ├── _layout.tsx         # Tab Bar Admin + Custom Header
│       ├── index.tsx           # Dashboard Admin
│       ├── orders.tsx          # Daftar Semua Pesanan
│       ├── order/[id].tsx      # Detail Pesanan Admin (dengan tombol Google Maps)
│       ├── products.tsx        # Manajemen Produk
│       └── users.tsx           # Manajemen Pengguna
├── backend/                    # 🖥️ Server API
│   ├── server.js               # Express API Endpoints & Database Setup
│   ├── uploads/                # Folder penyimpanan gambar produk & bukti pengiriman
│   └── .env                    # Konfigurasi Environment (DB Credentials, JWT Secret)
├── context/ 
│   └── AuthContext.tsx         # Global State Management (Auth, Cart, API_URL)
├── types/ 
│   └── product.ts              # TypeScript Interfaces
├── database/
│   └── flavordash_db.sql       # Skema Database MySQL
└── assets/                     # Ikon, Splash Screen, dll.
```

## 🚀 Cara Menjalankan

### 1. Setting IP Address

- Ganti API_URL di context/AuthContext.tsx dengan IP PC atau laptop Anda.
- misal : 192.168.100.2 menjadi :

```bash
const API_URL = 'http://192.168.100.2:3000';
```

### 2. Database

- Buat database MySQL flavordash_db
- file database di folder : /database/flavordash_db.sql

### 3. Jalankan Terminal 1 Backend

- Untuk server API (Mendapatkan list produk)

```bash
cd backend
npm install
npm run dev
```

### 4. Jalankan Terminal 2 Aplikasi

```bash
npm install
npx expo start -c
```

### 5. Demo Login User

- Email    : user@example.com
- Password : password123

### 5. Demo Login Admin

- Email    : admin@example.com
- Password : password123