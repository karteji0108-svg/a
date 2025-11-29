// Announcements Management

// Get all announcements
async function getAnnouncements(category = null) {
  try {
    let query = db.collection('announcements').orderBy('createdAt', 'desc');

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    const announcements = [];

    snapshot.forEach(doc => {
      announcements.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: announcements };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get single announcement
async function getAnnouncement(id) {
  try {
    const doc = await db.collection('announcements').doc(id).get();

    if (doc.exists) {
      return { success: true, data: { id: doc.id, ...doc.data() } };
    } else {
      return { success: false, error: 'Announcement not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Create announcement
async function createAnnouncement(announcementData) {
  try {
    const user = await getCurrentUser();

    const docRef = await db.collection('announcements').add({
      ...announcementData,
      createdBy: user.uid,
      createdByName: user.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      views: 0
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update announcement
async function updateAnnouncement(id, announcementData) {
  try {
    await db.collection('announcements').doc(id).update({
      ...announcementData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete announcement
async function deleteAnnouncement(id) {
  try {
    const announcementDoc = await db.collection('announcements').doc(id).get();
    const announcementData = announcementDoc.data();

    if (announcementData.imageUrl) {
      await deleteImage(announcementData.imageUrl);
    }

    await db.collection('announcements').doc(id).delete();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Increment announcement views
async function incrementAnnouncementViews(id) {
  try {
    await db.collection('announcements').doc(id).update({
      views: firebase.firestore.FieldValue.increment(1)
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Render announcements
function renderAnnouncements(announcements, containerId, showActions = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (announcements.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Tidak ada pengumuman</p>';
    return;
  }

  container.innerHTML = announcements.map(announcement => `
    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      ${announcement.imageUrl ? `
        <img src="${announcement.imageUrl}" alt="${announcement.title}" class="w-full h-48 object-cover rounded-lg mb-4">
      ` : ''}
      <div class="flex items-center justify-between mb-2">
        <span class="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          ${announcement.category || 'Umum'}
        </span>
        <span class="text-sm text-gray-500">${formatDate(announcement.createdAt)}</span>
      </div>
      <h3 class="text-xl font-bold mb-2">${announcement.title}</h3>
      <p class="text-gray-600 mb-4">${announcement.content.substring(0, 150)}${announcement.content.length > 150 ? '...' : ''}</p>
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500">
          <i class="fas fa-eye mr-1"></i> ${announcement.views || 0} views
        </div>
        ${showActions ? `
          <div class="space-x-2">
            <button onclick="editAnnouncement('${announcement.id}')" class="text-blue-600 hover:text-blue-800">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteAnnouncementConfirm('${announcement.id}')" class="text-red-600 hover:text-red-800">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        ` : `
          <button onclick="viewAnnouncement('${announcement.id}')" class="text-blue-600 hover:text-blue-800">
            Baca Selengkapnya <i class="fas fa-arrow-right ml-1"></i>
          </button>
        `}
      </div>
    </div>
  `).join('');
}
