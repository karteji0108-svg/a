# KARTEJI - Karang Taruna Cilosari Barat

Website resmi organisasi Karang Taruna Cilosari Barat dengan sistem manajemen berbasis role untuk pengelolaan kegiatan, keuangan, anggota, pengumuman, dan galeri.

## Teknologi

- **HTML 100%**
- **TailwindCSS** (via CDN)
- **JavaScript Murni** (tanpa framework)
- **Firebase**:
  - Firebase Auth
  - Firestore Database
  - Firebase Storage
  - Firestore Rules berbasis role

## Struktur Folder

```
karteji-web/
├── index.html                  # Halaman utama
├── about.html                  # Tentang KARTEJI
├── activities.html             # Daftar kegiatan publik
├── announcements.html          # Pengumuman publik
├── gallery.html                # Galeri publik
├── contact.html                # Kontak
├── login.html                  # Login
├── register.html               # Registrasi
│
├── member/                     # Portal Anggota
│   ├── activities.html
│   ├── announcements.html
│   ├── finances.html           # Transparansi kas (read-only)
│   ├── gallery.html
│   └── profile.html
│
├── dashboard/                  # Dashboard Pengurus
│   ├── index.html              # Dashboard utama
│   ├── activities/list.html
│   ├── finances/list.html
│   ├── members/list.html
│   ├── announcements/list.html
│   └── gallery/albums.html
│
├── components/                 # Komponen reusable
│   ├── navbar.html
│   ├── footer.html
│   ├── sidebar-admin.html
│   ├── sidebar-member.html
│   └── back-button.html
│
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── responsive.css
│   └── js/
│       ├── firebase-config.js
│       ├── auth.js
│       ├── main.js
│       ├── activities.js
│       ├── finances.js
│       ├── members.js
│       ├── announcements.js
│       └── gallery.js
│
└── firebase/
    ├── firestore.rules
    ├── firestore.indexes.json
    └── storage.rules
```

## Role System

### Hierarki Role:
1. **Super Admin** - Akses penuh, pendaftar pertama otomatis menjadi Super Admin
2. **Ketua** - Approve kegiatan, ubah role anggota
3. **Wakil Ketua** - Review kegiatan
4. **Sekretaris** - Input kegiatan
5. **Bendahara** - Kelola keuangan penuh
6. **Koordinator Sie** - Ajukan kegiatan
7. **Anggota** - Read-only untuk transparansi kas

### Permission:
- Super Admin/Ketua/Wakil: Akses dashboard admin
- Bendahara: Full access keuangan
- Koordinator Sie: Buat kegiatan
- Anggota: Portal member dengan akses terbatas

## Fitur

### Halaman Publik:
- Landing page dengan info organisasi
- Daftar kegiatan yang telah disetujui
- Pengumuman terbaru
- Galeri foto
- Form kontak
- Sistem login dan registrasi

### Portal Anggota:
- Lihat semua kegiatan
- Baca pengumuman
- Transparansi kas (read-only)
- Galeri foto
- Kelola profil pribadi

### Dashboard Admin:
- Statistik dashboard
- CRUD Kegiatan (dengan approval workflow)
- CRUD Keuangan (khusus Bendahara)
- Manajemen Role Anggota (Ketua/Wakil/Super Admin)
- CRUD Pengumuman
- CRUD Galeri & Album

## Firebase Configuration

1. Buat project Firebase di [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Enable Firebase Storage
5. Copy Firebase config ke `assets/js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

6. Deploy Firestore Rules dari `firebase/firestore.rules`
7. Deploy Storage Rules dari `firebase/storage.rules`
8. Import indexes dari `firebase/firestore.indexes.json`

## Instalasi

1. Clone repository
2. Setup Firebase configuration
3. Deploy Firestore & Storage rules
4. Jalankan development server:
   ```bash
   npm install
   npm run dev
   ```

## Build & Deploy

```bash
npm run build
```

Output akan ada di folder `dist/`

## Keamanan

- Row Level Security (RLS) berbasis role
- Firestore Rules yang ketat
- Storage Rules untuk upload gambar
- Authentication required untuk akses member/admin
- Role-based access control (RBAC)

## Fitur Unggulan

1. **Sistem Role Lengkap** - 7 level role dengan permission berbeda
2. **Approval Workflow** - Kegiatan harus direview wakil dan diapprove ketua
3. **Transparansi Keuangan** - Anggota bisa lihat kas secara real-time
4. **Responsive Design** - Mobile-friendly dengan Tailwind CSS
5. **Upload Gambar** - Terintegrasi Firebase Storage
6. **Real-time Updates** - Data sync otomatis via Firestore

## Catatan Penting

- User pertama yang mendaftar otomatis menjadi **Super Admin**
- Bendahara memiliki full access ke modul keuangan
- Ketua/Wakil/Super Admin bisa mengubah role member
- Anggota hanya bisa melihat data keuangan (read-only)
- Semua upload gambar maksimal 5MB

## Lisensi

© 2025 KARTEJI - Karang Taruna Cilosari Barat. All rights reserved.
