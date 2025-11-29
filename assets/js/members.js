// Members Management

// Get all members
async function getMembers(role = null) {
  try {
    let query = db.collection('users').orderBy('createdAt', 'desc');

    if (role) {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.get();
    const members = [];

    snapshot.forEach(doc => {
      members.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: members };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get member by ID
async function getMember(id) {
  try {
    const doc = await db.collection('users').doc(id).get();

    if (doc.exists) {
      return { success: true, data: { id: doc.id, ...doc.data() } };
    } else {
      return { success: false, error: 'Member not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update member role
async function updateMemberRole(memberId, newRole) {
  try {
    const user = await getCurrentUser();

    if (!['super_admin', 'ketua', 'wakil_ketua'].includes(user.role)) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.collection('users').doc(memberId).update({
      role: newRole,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update member profile
async function updateMemberProfile(memberId, profileData) {
  try {
    await db.collection('users').doc(memberId).update({
      ...profileData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete member
async function deleteMember(memberId) {
  try {
    const user = await getCurrentUser();

    if (user.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await db.collection('users').doc(memberId).delete();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Render members table
function renderMembers(members, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (members.length === 0) {
    container.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">Tidak ada data anggota</td></tr>';
    return;
  }

  container.innerHTML = members.map(member => `
    <tr class="border-b hover:bg-gray-50">
      <td class="py-3 px-4">${member.name}</td>
      <td class="py-3 px-4">${member.email}</td>
      <td class="py-3 px-4">${member.phone || '-'}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-1 text-xs rounded ${getRoleColor(member.role)}">
          ${getRoleText(member.role)}
        </span>
      </td>
      <td class="py-3 px-4">
        <span class="px-2 py-1 text-xs rounded ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
          ${member.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
        </span>
      </td>
      <td class="py-3 px-4">
        <button onclick="editMember('${member.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="viewMember('${member.id}')" class="text-green-600 hover:text-green-800">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Get role color
function getRoleColor(role) {
  const colors = {
    'super_admin': 'bg-purple-100 text-purple-800',
    'ketua': 'bg-blue-100 text-blue-800',
    'wakil_ketua': 'bg-indigo-100 text-indigo-800',
    'sekretaris': 'bg-green-100 text-green-800',
    'bendahara': 'bg-yellow-100 text-yellow-800',
    'koordinator_sie': 'bg-orange-100 text-orange-800',
    'anggota': 'bg-gray-100 text-gray-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}

// Get role text
function getRoleText(role) {
  const texts = {
    'super_admin': 'Super Admin',
    'ketua': 'Ketua',
    'wakil_ketua': 'Wakil Ketua',
    'sekretaris': 'Sekretaris',
    'bendahara': 'Bendahara',
    'koordinator_sie': 'Koordinator Sie',
    'anggota': 'Anggota'
  };
  return texts[role] || role;
}
