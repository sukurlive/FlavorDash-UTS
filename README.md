# 🍽️ FlavorDash - Aplikasi Katalog Makanan

Aplikasi mobile untuk katalog makanan dengan fitur keranjang belanja, autentikasi JWT, dan database MySQL.

## ✨ Fitur

- ✅ **Layout Flexbox** - Gambar produk di samping deskripsi dengan unit proporsional (flex:1)
- ✅ **Responsivitas** - Mendukung berbagai ukuran layar (fragmentasi Android & iOS)
- ✅ **JWT Authentication** - Stateless authentication dengan access token & refresh token
- ✅ **Route Protection** - Halaman detail pesanan hanya bisa diakses setelah login
- ✅ **Keranjang Belanja** - Tambah, hapus, update quantity produk
- ✅ **Checkout** - Pilihan pembayaran transfer bank atau COD
- ✅ **User Profile** - Dropdown menu untuk profil dan logout
- ✅ **Full Screen Support** - SafeAreaView untuk notch dan gesture navigation

## 📁 Struktur Proyek
```
FlavorDash/
├── app/ 
│ ├── _layout.tsx # Tab navigation & header
│ ├── index.tsx # Halaman katalog
│ ├── cart.tsx # Halaman keranjang
│ ├── addresses.tsx # Halaman menambah alamat
│ ├── login.tsx # Login/Register
│ ├── profile.tsx # Profil user
│ ├── edit-profile.tsx # Edit profile
│ ├── products.tsx # Halaman produk
│ ├── orders.tsx # Riwayat pesanan
│ └── detail/[id].tsx # Detail pesanan
├── backend/ # Untuk server API
│ ├── server.js # API endpoints
│ ├── uploads/ # Gambar produk
│ └── .env # Konfigurasi
├── context/ # AuthContext (global state)
├── types/ # TypeScript interfaces
└── assets/ # Assets (icon, splash)
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

### 5. Demo Login

- Email    : user@example.com
- Password : password123