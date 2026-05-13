# 🍽️ FlavorDash - Aplikasi Katalog Makanan

Aplikasi mobile untuk katalog makanan dengan fitur keranjang belanja, autentikasi JWT, dan database MySQL.

## ✨ Fitur

- ✅ **Layout Flexbox** - Gambar produk di samping deskripsi dengan unit proporsional (flex:1)
- ✅ **Responsivitas** - Mendukung berbagai ukuran layar (fragmentasi Android & iOS)
- ✅ **JWT Authentication** - Stateless authentication dengan access token & refresh token
- ✅ **Route Protection** - Halaman detail pesanan hanya bisa diakses setelah login
- ✅ **Keranjang Belanja** - Tambah, hapus, update quantity produk
- ✅ **Checkout** - Pilihan pembayaran transfer bank atau COD
- ✅ **Auto Refresh** - Cart count di header otomatis update
- ✅ **User Profile** - Dropdown menu untuk profil dan logout
- ✅ **Full Screen Support** - SafeAreaView untuk notch dan gesture navigation

## 🛠️ Teknologi

| Stack | Teknologi |
|-------|-----------|
| Frontend | React Native + Expo |
| Backend | Express.js |
| Database | MySQL |
| Authentication | JWT (JSON Web Token) |
| Storage | SecureStore (Native), AsyncStorage (Web) |
| Icons | React Native Vector Icons |

## 📁 Struktur Proyek
FlavorDash/
├── app/ # Screens dan navigasi
│ ├── _layout.tsx # Tab navigation & header
│ ├── index.tsx # Halaman katalog
│ ├── cart.tsx # Halaman keranjang
│ ├── login.tsx # Login/Register
│ ├── profile.tsx # Profil user
│ ├── orders.tsx # Riwayat pesanan
│ └── detail/[id].tsx # Detail pesanan
├── backend/ # Express.js server
│ ├── server.js # API endpoints
│ ├── uploads/ # Gambar produk
│ └── .env # Konfigurasi
├── context/ # AuthContext (global state)
├── types/ # TypeScript interfaces
└── assets/ # Assets (icon, splash)


## 🚀 Cara Menjalankan

### 1. Jalankan Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Jalankan Backend
```bash
npm install
npx expo start -c
```

### 3. Setting IP Address

Ganti API_URL di context/AuthContext.tsx dengan IP laptop Anda.

### 4. Database

Buat database MySQL flavordash_db
file database di /database/flavordash_db.sql
Jalankan script SQL di backend/server.js (auto setup)

### 5. Demo Login

Email    : user@example.com
Password : password123