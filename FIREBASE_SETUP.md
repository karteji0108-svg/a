# Panduan Setup Firebase untuk KARTEJI

## Langkah 1: Buat Project Firebase

1. Kunjungi [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" atau "Tambah project"
3. Masukkan nama project: **KARTEJI**
4. Ikuti wizard setup hingga selesai

## Langkah 2: Setup Authentication

1. Di Firebase Console, pilih project KARTEJI
2. Klik menu **Authentication** di sidebar
3. Klik tab **Sign-in method**
4. Enable **Email/Password**
5. Klik **Save**

## Langkah 3: Setup Firestore Database

1. Klik menu **Firestore Database** di sidebar
2. Klik **Create database**
3. Pilih **Start in production mode**
4. Pilih lokasi server (pilih yang terdekat, misalnya asia-southeast1)
5. Klik **Enable**

## Langkah 4: Setup Storage

1. Klik menu **Storage** di sidebar
2. Klik **Get started**
3. Gunakan default security rules
4. Pilih lokasi yang sama dengan Firestore
5. Klik **Done**

## Langkah 5: Get Firebase Configuration

1. Klik icon **Settings (gear)** di sidebar
2. Klik **Project settings**
3. Scroll ke bawah ke section **Your apps**
4. Klik icon **Web (</>) **
5. Register app dengan nama: **KARTEJI Web**
6. Copy Firebase configuration object

## Langkah 6: Update Firebase Config

Buka file `assets/js/firebase-config.js` dan ganti dengan config Anda:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                          // Ganti dengan API Key Anda
  authDomain: "karteji.firebaseapp.com",     // Ganti dengan auth domain Anda
  projectId: "karteji",                       // Ganti dengan project ID Anda
  storageBucket: "karteji.appspot.com",      // Ganti dengan storage bucket Anda
  messagingSenderId: "123456789",             // Ganti dengan sender ID Anda
  appId: "1:123456789:web:abc123"            // Ganti dengan app ID Anda
};
```

## Langkah 7: Deploy Firestore Rules

1. Di Firebase Console, klik **Firestore Database**
2. Klik tab **Rules**
3. Copy semua isi dari file `firebase/firestore.rules`
4. Paste ke editor rules di Firebase Console
5. Klik **Publish**

Rules ini mengatur:
- Super Admin: Full access
- Ketua: Approve kegiatan, ubah role
- Wakil Ketua: Review kegiatan
- Bendahara: Full access keuangan
- Sekretaris: Input kegiatan
- Koordinator Sie: Ajukan kegiatan
- Anggota: Read-only

## Langkah 8: Deploy Storage Rules

1. Di Firebase Console, klik **Storage**
2. Klik tab **Rules**
3. Copy semua isi dari file `firebase/storage.rules`
4. Paste ke editor rules di Firebase Console
5. Klik **Publish**

Rules ini mengatur:
- Semua orang bisa read gambar
- Hanya user authenticated yang bisa upload
- Max size: 5MB
- Hanya image files

## Langkah 9: Setup Indexes (Optional tapi Recommended)

1. Di Firebase Console, klik **Firestore Database**
2. Klik tab **Indexes**
3. Untuk setiap query yang membutuhkan composite index, Firebase akan memberikan link otomatis saat error
4. Atau, upload file `firebase/firestore.indexes.json` via Firebase CLI:

```bash
firebase deploy --only firestore:indexes
```

Index yang diperlukan:
- activities: status + date
- activities: createdBy + date
- financial_records: type + date
- announcements: category + createdAt
- galleries: albumId + createdAt
- users: role + createdAt

## Langkah 10: Test Setup

1. Jalankan website: `npm run dev`
2. Buka browser: `http://localhost:5173`
3. Klik **Daftar**
4. Register user pertama (akan otomatis jadi Super Admin)
5. Login dan cek dashboard

## Troubleshooting

### Error: Missing or insufficient permissions

**Solusi**: Pastikan Firestore Rules sudah di-publish dengan benar

### Error: Storage CORS not configured

**Solusi**:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Init project: `firebase init`
4. Deploy: `firebase deploy`

### Error: Index required

**Solusi**:
- Klik link yang diberikan Firebase di console browser
- Atau deploy indexes: `firebase deploy --only firestore:indexes`

## Firebase CLI Commands (Optional)

Install Firebase CLI untuk management yang lebih mudah:

```bash
# Install
npm install -g firebase-tools

# Login
firebase login

# Init project
firebase init

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy semua
firebase deploy
```

## Keamanan

1. **Jangan expose** Firebase config di public repository production
2. Gunakan **Environment Variables** untuk production
3. Enable **App Check** untuk keamanan ekstra
4. Monitor **Firebase Console** untuk aktivitas mencurigakan
5. Set **Budget alerts** di Google Cloud Console

## Tips

1. Backup Firestore data secara berkala
2. Monitor usage di Firebase Console untuk menghindari billing surprise
3. Test rules di **Rules Playground** sebelum publish
4. Gunakan **Firebase Emulator** untuk development local

## Support

Jika ada masalah:
1. Cek [Firebase Documentation](https://firebase.google.com/docs)
2. Cek [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
3. Hubungi admin KARTEJI

---

Setup selesai! Website KARTEJI siap digunakan.
