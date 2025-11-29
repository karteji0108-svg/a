// Authentication Functions

// Check if user is logged in
function checkAuth(requiredRole = null) {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      if (window.location.pathname.includes('/member/') || window.location.pathname.includes('/dashboard/')) {
        window.location.href = '/login.html';
      }
      return;
    }

    // Get user role
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (userData) {
      window.currentUser = {
        uid: user.uid,
        email: user.email,
        role: userData.role,
        name: userData.name,
        ...userData
      };

      // Redirect based on role
      if (requiredRole && !checkPermission(userData.role, requiredRole)) {
        window.location.href = '/index.html';
      }
    }
  });
}

// Check permission based on role
function checkPermission(userRole, requiredRole) {
  const roleHierarchy = {
    'super_admin': 10,
    'ketua': 9,
    'wakil_ketua': 8,
    'sekretaris': 7,
    'bendahara': 6,
    'koordinator_sie': 5,
    'anggota': 1
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Register Function
async function register(email, password, name, phone) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Check if this is the first user (Super Admin)
    const usersSnapshot = await db.collection('users').get();
    const role = usersSnapshot.empty ? 'super_admin' : 'anggota';

    // Create user document
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: email,
      name: name,
      phone: phone,
      role: role,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    });

    return { success: true, role: role };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Login Function
async function login(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Get user role
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    // Redirect based on role
    if (['super_admin', 'ketua', 'wakil_ketua', 'sekretaris', 'bendahara', 'koordinator_sie'].includes(userData.role)) {
      window.location.href = '/dashboard/index.html';
    } else {
      window.location.href = '/member/activities.html';
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Logout Function
async function logout() {
  try {
    await auth.signOut();
    window.location.href = '/index.html';
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get current user data
async function getCurrentUser() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        resolve({ ...user, ...userDoc.data() });
      } else {
        resolve(null);
      }
    });
  });
}
