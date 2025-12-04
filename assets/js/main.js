// =======================
// Firebase (modular CDN)
// =======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// --- Config project kamu (yang tadi kamu kirim) ---
const firebaseConfig = {
  apiKey: "AIzaSyAQxpD7ea9gHWGiU3wYXr0XHyl-SNyFYNs",
  authDomain: "katar-9cac3.firebaseapp.com",
  projectId: "katar-9cac3",
  storageBucket: "katar-9cac3.firebasestorage.app",
  messagingSenderId: "1017734829960",
  appId: "1:1017734829960:web:6b02b7176f08a23ce28c3d",
  measurementId: "G-M4F9J10TTE",
};

const app = initializeApp(firebaseConfig);
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics mungkin tidak aktif (butuh https/localhost)", e);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// =======================
// Role mapping
// =======================
const ROLE_LABELS = {
  super_admin: "Super Admin",
  ketua: "Ketua",
  wakil: "Wakil Ketua",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  sie: "Koordinator Sie",
  anggota: "Anggota",
};

// =======================
// Helper: ambil role user
// =======================
async function fetchCurrentUserRole(user) {
  if (!user) return "anggota";
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return "anggota";
    const data = snap.data();
    return data.role || "anggota";
  } catch (e) {
    console.error("Gagal mengambil role user:", e);
    return "anggota";
  }
}

// =======================
// Role → UI (sidebar, dll)
// =======================
function applyRoleToSidebarUI(role) {
  // label role di sidebar
  const badge = document.getElementById("current-role-badge");
  if (badge) {
    badge.textContent = ROLE_LABELS[role] || role || "Anggota";
  }

  // elemen yang punya data-role-allowed
  const allowedNodes = document.querySelectorAll("[data-role-allowed]");
  allowedNodes.forEach((el) => {
    const allowed = (el.getAttribute("data-role-allowed") || "").split(",");
    const trimmed = allowed.map((r) => r.trim());
    if (!trimmed.includes(role)) {
      el.classList.add("hidden");
    }
  });
}

// =======================
// Firebase Auth listener
// =======================
onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname;
  const isDashboard = path.includes("/dashboard/");
  const isLoginPage = path.endsWith("/login.html") || path.endsWith("login.html");
  const isRegisterPage = path.endsWith("/register.html") || path.endsWith("register.html");

  if (!user) {
    // kalau di area dashboard tapi belum login → lempar ke login
    if (isDashboard) {
      window.location.href = "../login.html";
    }
    return;
  }

  // logged in
  const role = await fetchCurrentUserRole(user);
  window.KARTEJI_ROLE = role;

  // terapkan role ke sidebar/menu
  applyRoleToSidebarUI(role);

  // kalau user cuma anggota & coba buka dashboard pengurus → tendang ke home
  if (isDashboard && role === "anggota") {
    showToast("Dashboard pengurus hanya untuk akun pengurus.", "error");
    window.location.href = "../index.html";
    return;
  }

  // kalau sudah login dan buka halaman login/register, lempar ke dashboard
  if (isLoginPage || isRegisterPage) {
    window.location.href = "dashboard/index.html";
  }
});

// =======================
// LOAD COMPONENT
// =======================
async function loadComponent(elementId, componentPath) {
  try {
    const response = await fetch(componentPath);

    if (!response.ok) {
      console.error("Error loading component:", componentPath, response.status);
      return;
    }

    const html = await response.text();
    const el = document.getElementById(elementId);
    if (!el) return;

    el.innerHTML = html;

    // Initialize component-specific functions
    if (componentPath.includes("navbar")) {
      initNavbar();
    }
  } catch (error) {
    console.error("Error loading component:", error);
  }
}

// =======================
// NAVBAR
// =======================
function initNavbar() {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  const authButtons = document.getElementById("auth-buttons");
  const userMenu = document.getElementById("user-menu");
  const userName = document.getElementById("user-name");

  // update UI berdasarkan auth state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data() || {};

        if (authButtons) authButtons.classList.add("hidden");
        if (userMenu) {
          userMenu.classList.remove("hidden");
          if (userName) userName.textContent = userData.name || user.email;
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    } else {
      if (authButtons) authButtons.classList.remove("hidden");
      if (userMenu) userMenu.classList.add("hidden");
    }
  });
}

// =======================
// TOAST NOTIFICATION
// =======================
export function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 text-sm ${
    type === "success" ? "bg-green-500" : "bg-red-500"
  }`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// =======================
// FORMATTER
// =======================
export function formatDate(timestamp) {
  if (!timestamp) return "-";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

// =======================
// STORAGE: upload & delete
// =======================
export async function uploadImage(file, path) {
  try {
    const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteImage(imageUrl) {
  try {
    const imageRef = ref(storage, imageUrl); // bisa pakai https url
    await deleteObject(imageRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// =======================
// MODAL & NAVIGATION
// =======================
export function showModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove("hidden");
}

export function hideModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add("hidden");
}

export function goBack() {
  window.history.back();
}

// =======================
// BASE PATH KOMponen
// =======================
function getBasePathForComponents() {
  const path = window.location.pathname;

  if (path.includes("/member/")) return "..";
  if (path.includes("/dashboard/")) return "..";

  return ".";
}

// =======================
// AUTH: REGISTER & LOGIN
// =======================

// cek apakah user pertama (untuk Super Admin)
async function isFirstUser() {
  const snap = await getDocs(collection(db, "users"));
  return snap.empty;
}

// REGISTER
function initRegisterForm() {
  const registerForm = document.getElementById("register-form");
  if (!registerForm) return;

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name")?.value.trim();
    const email = document.getElementById("register-email")?.value.trim();
    const password = document.getElementById("register-password")?.value;

    if (!name || !email || !password) {
      showToast("Mohon lengkapi semua data.", "error");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      const first = await isFirstUser();
      const role = first ? "super_admin" : "anggota";

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        active: true,
        createdAt: new Date().toISOString(),
      });

      showToast(
        first
          ? "Pendaftaran berhasil. Kamu menjadi Super Admin pertama KARTEJI."
          : "Pendaftaran berhasil. Akun kamu terdaftar sebagai anggota.",
        "success"
      );

      window.location.href = "login.html";
    } catch (err) {
      console.error("Register error:", err);
      showToast(err.message || "Terjadi kesalahan saat daftar.", "error");
    }
  });
}

// LOGIN
function initLoginForm() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email")?.value.trim();
    const password = document.getElementById("login-password")?.value;

    if (!email || !password) {
      showToast("Email dan password wajib diisi.", "error");
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login berhasil:", cred.user.uid);

      showToast("Login berhasil!", "success");
      window.location.href = "dashboard/index.html";
    } catch (err) {
      console.error("Login error:", err);
      showToast("Email atau password salah, atau akun belum terdaftar.", "error");
    }
  });
}

// =======================
// INIT PAGE
// =======================
document.addEventListener("DOMContentLoaded", () => {
  const base = getBasePathForComponents();

  // Navbar
  const navbarElement = document.getElementById("navbar");
  if (navbarElement) {
    loadComponent("navbar", `${base}/components/navbar.html`);
  }

  // Footer
  const footerElement = document.getElementById("footer");
  if (footerElement) {
    loadComponent("footer", `${base}/components/footer.html`);
  }

  // Sidebar admin / member
  const path = window.location.pathname;

  const sidebarAdminElement = document.getElementById("sidebar-admin");
  if (sidebarAdminElement && path.includes("/dashboard/")) {
    loadComponent("sidebar-admin", `${base}/components/sidebar-admin.html`);
  }

  const sidebarMemberElement = document.getElementById("sidebar-member");
  if (sidebarMemberElement && path.includes("/member/")) {
    loadComponent("sidebar-member", `${base}/components/sidebar-member.html`);
  }

  // Inisialisasi form auth kalau ada
  initLoginForm();
  initRegisterForm();
});
