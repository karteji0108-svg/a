# Instruksi Download dan Extract KARTEJI Website

## Download File

File project KARTEJI tersedia dalam format: **karteji-website.tar.gz** (67KB)

## Cara Extract

### Di Windows:
1. Download file `karteji-website.tar.gz`
2. Install 7-Zip dari https://www.7-zip.org/
3. Klik kanan pada file > 7-Zip > Extract Here
4. Extract 2x (pertama .gz, kedua .tar)

Atau gunakan WinRAR:
1. Download file `karteji-website.tar.gz`
2. Klik kanan > Extract Here

### Di Mac:
```bash
tar -xzf karteji-website.tar.gz
```

### Di Linux:
```bash
tar -xzf karteji-website.tar.gz
```

## Setelah Extract

Anda akan mendapatkan folder `project` dengan struktur:

```
project/
├── index.html                    # Homepage
├── about.html                    # Tentang
├── activities.html               # Kegiatan
├── announcements.html            # Pengumuman
├── gallery.html                  # Galeri
├── contact.html                  # Kontak
├── login.html                    # Login
├── register.html                 # Registrasi
├── README.md                     # Dokumentasi
├── FIREBASE_SETUP.md            # Panduan setup Firebase
├── package.json                  # NPM dependencies
│
├── member/                       # Portal Anggota
│   ├── activities.html
│   ├── announcements.html
│   ├── finances.html
│   ├── gallery.html
│   └── profile.html
│
├── dashboard/                    # Dashboard Admin
│   ├── index.html
│   ├── activities/list.html
│   ├── finances/list.html
│   ├── members/list.html
│   ├── announcements/list.html
│   └── gallery/albums.html
│
├── components/                   # Komponen HTML
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

## Langkah Selanjutnya

### 1. Install Dependencies
```bash
cd project
npm install
```

### 2. Setup Firebase
Ikuti panduan lengkap di file `FIREBASE_SETUP.md`

Ringkasan:
1. Buat project Firebase
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Storage
5. Copy Firebase config ke `assets/js/firebase-config.js`
6. Deploy Firestore Rules dari `firebase/firestore.rules`
7. Deploy Storage Rules dari `firebase/storage.rules`

### 3. Jalankan Development Server
```bash
npm run dev
```

Buka browser: http://localhost:5173

### 4. Register User Pertama
- User pertama yang register otomatis jadi **Super Admin**
- Login dan mulai kelola organisasi!

## Build untuk Production
```bash
npm run build
```

Output ada di folder `dist/`

## Fitur Utama

✅ **7 Role System**: Super Admin, Ketua, Wakil Ketua, Sekretaris, Bendahara, Koordinator Sie, Anggota
✅ **CRUD Lengkap**: Kegiatan, Keuangan, Anggota, Pengumuman, Galeri
✅ **Firebase Integration**: Auth, Firestore, Storage
✅ **Upload Foto**: Terintegrasi Firebase Storage
✅ **Transparansi Keuangan**: Real-time untuk semua anggota
✅ **Responsive Design**: Mobile-friendly dengan Tailwind CSS
✅ **Security**: Role-based Firestore Rules

## Support

Jika ada pertanyaan:
1. Baca `README.md` untuk dokumentasi lengkap
2. Baca `FIREBASE_SETUP.md` untuk setup Firebase
3. Check console browser untuk error messages

## Teknologi

- HTML 100%
- TailwindCSS (via CDN)
- JavaScript Vanilla
- Firebase (Auth, Firestore, Storage)
- Vite (Build tool)

---

Selamat menggunakan KARTEJI Website!
© 2025 KARTEJI - Karang Taruna Cilosari Barat
