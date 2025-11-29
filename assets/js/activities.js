// Activities Management

// Get all activities
async function getActivities(status = null) {
  try {
    let query = db.collection('activities').orderBy('date', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const activities = [];

    snapshot.forEach(doc => {
      activities.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: activities };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get single activity
async function getActivity(id) {
  try {
    const doc = await db.collection('activities').doc(id).get();

    if (doc.exists) {
      return { success: true, data: { id: doc.id, ...doc.data() } };
    } else {
      return { success: false, error: 'Activity not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Create activity
async function createActivity(activityData) {
  try {
    const user = await getCurrentUser();

    const docRef = await db.collection('activities').add({
      ...activityData,
      createdBy: user.uid,
      createdByName: user.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'draft',
      approvedBy: null,
      reviewedBy: null
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update activity
async function updateActivity(id, activityData) {
  try {
    await db.collection('activities').doc(id).update({
      ...activityData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete activity
async function deleteActivity(id) {
  try {
    // Get activity data to delete images
    const activityDoc = await db.collection('activities').doc(id).get();
    const activityData = activityDoc.data();

    // Delete images if exists
    if (activityData.images && activityData.images.length > 0) {
      for (const imageUrl of activityData.images) {
        await deleteImage(imageUrl);
      }
    }

    // Delete document
    await db.collection('activities').doc(id).delete();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Approve activity (Ketua)
async function approveActivity(id) {
  try {
    const user = await getCurrentUser();

    if (user.role !== 'ketua' && user.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await db.collection('activities').doc(id).update({
      status: 'approved',
      approvedBy: user.uid,
      approvedByName: user.name,
      approvedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Review activity (Wakil)
async function reviewActivity(id) {
  try {
    const user = await getCurrentUser();

    if (user.role !== 'wakil_ketua' && user.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await db.collection('activities').doc(id).update({
      status: 'reviewed',
      reviewedBy: user.uid,
      reviewedByName: user.name,
      reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Render activities
function renderActivities(activities, containerId, showActions = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (activities.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Tidak ada kegiatan</p>';
    return;
  }

  container.innerHTML = activities.map(activity => `
    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      ${activity.imageUrl ? `
        <img src="${activity.imageUrl}" alt="${activity.title}" class="w-full h-48 object-cover rounded-lg mb-4">
      ` : ''}
      <div class="flex items-center justify-between mb-2">
        <span class="px-3 py-1 text-xs rounded-full ${getStatusColor(activity.status)}">
          ${getStatusText(activity.status)}
        </span>
        <span class="text-sm text-gray-500">${formatDate(activity.date)}</span>
      </div>
      <h3 class="text-xl font-bold mb-2">${activity.title}</h3>
      <p class="text-gray-600 mb-4">${activity.description || ''}</p>
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500">
          <i class="fas fa-map-marker-alt mr-1"></i> ${activity.location || '-'}
        </div>
        ${showActions ? `
          <div class="space-x-2">
            <button onclick="editActivity('${activity.id}')" class="text-blue-600 hover:text-blue-800">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteActivityConfirm('${activity.id}')" class="text-red-600 hover:text-red-800">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// Get status color
function getStatusColor(status) {
  const colors = {
    'draft': 'bg-gray-200 text-gray-800',
    'reviewed': 'bg-yellow-200 text-yellow-800',
    'approved': 'bg-green-200 text-green-800',
    'completed': 'bg-blue-200 text-blue-800',
    'cancelled': 'bg-red-200 text-red-800'
  };
  return colors[status] || 'bg-gray-200 text-gray-800';
}

// Get status text
function getStatusText(status) {
  const texts = {
    'draft': 'Draft',
    'reviewed': 'Direview',
    'approved': 'Disetujui',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan'
  };
  return texts[status] || status;
}
