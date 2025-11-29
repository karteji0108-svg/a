// Main JavaScript Functions

// Load Component
async function loadComponent(elementId, componentPath) {
  try {
    const response = await fetch(componentPath);
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;

    // Initialize component-specific functions
    if (componentPath.includes('navbar')) {
      initNavbar();
    }
  } catch (error) {
    console.error('Error loading component:', error);
  }
}

// Initialize Navbar
function initNavbar() {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Update user status
  auth.onAuthStateChanged(async (user) => {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');

    if (user) {
      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.data();

      if (authButtons) authButtons.classList.add('hidden');
      if (userMenu) {
        userMenu.classList.remove('hidden');
        const userName = document.getElementById('user-name');
        if (userName) userName.textContent = userData.name;
      }
    } else {
      if (authButtons) authButtons.classList.remove('hidden');
      if (userMenu) userMenu.classList.add('hidden');
    }
  });
}

// Show Toast Notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Format Date
function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

// Format Currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Upload Image to Firebase Storage
async function uploadImage(file, path) {
  try {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(`${path}/${Date.now()}_${file.name}`);

    const snapshot = await fileRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();

    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete Image from Firebase Storage
async function deleteImage(imageUrl) {
  try {
    const imageRef = storage.refFromURL(imageUrl);
    await imageRef.delete();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Show Modal
function showModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

// Hide Modal
function hideModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// Go Back
function goBack() {
  window.history.back();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Load navbar if exists
  const navbarElement = document.getElementById('navbar');
  if (navbarElement) {
    loadComponent('navbar', '/components/navbar.html');
  }

  // Load footer if exists
  const footerElement = document.getElementById('footer');
  if (footerElement) {
    loadComponent('footer', '/components/footer.html');
  }

  // Load sidebar if exists
  const sidebarElement = document.getElementById('sidebar');
  if (sidebarElement) {
    const path = window.location.pathname;
    if (path.includes('/dashboard/')) {
      loadComponent('sidebar', '/components/sidebar-admin.html');
    } else if (path.includes('/member/')) {
      loadComponent('sidebar', '/components/sidebar-member.html');
    }
  }

  // Check authentication
  checkAuth();
});
