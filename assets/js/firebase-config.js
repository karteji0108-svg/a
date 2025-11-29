// Firebase Configuration
// Firebase Configuration for KARTEJI
// Using Firebase JS SDK v8 compat (sesuai project)

const firebaseConfig = {
  apiKey: "AIzaSyAQxpD7ea9gHWGiU3wYXr0XHyl-SNyFYNs",
  authDomain: "katar-9cac3.firebaseapp.com",
  projectId: "katar-9cac3",
  storageBucket: "katar-9cac3.firebasestorage.app",
  messagingSenderId: "1017734829960",
  appId: "1:1017734829960:web:6b02b7176f08a23ce28c3d",
  measurementId: "G-M4F9J10TTE"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export global access
window.auth = auth;
window.db = db;
window.storage = storage;
