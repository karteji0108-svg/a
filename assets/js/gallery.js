// Gallery Management

// Get all albums
async function getAlbums() {
  try {
    const snapshot = await db.collection('albums').orderBy('createdAt', 'desc').get();
    const albums = [];

    snapshot.forEach(doc => {
      albums.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: albums };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get album by ID
async function getAlbum(id) {
  try {
    const doc = await db.collection('albums').doc(id).get();

    if (doc.exists) {
      return { success: true, data: { id: doc.id, ...doc.data() } };
    } else {
      return { success: false, error: 'Album not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Create album
async function createAlbum(albumData) {
  try {
    const user = await getCurrentUser();

    const docRef = await db.collection('albums').add({
      ...albumData,
      createdBy: user.uid,
      createdByName: user.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      photoCount: 0
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update album
async function updateAlbum(id, albumData) {
  try {
    await db.collection('albums').doc(id).update({
      ...albumData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete album
async function deleteAlbum(id) {
  try {
    // Delete all photos in album
    const photos = await getGalleryPhotos(id);
    if (photos.success) {
      for (const photo of photos.data) {
        await deleteGalleryPhoto(photo.id);
      }
    }

    await db.collection('albums').doc(id).delete();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get photos by album
async function getGalleryPhotos(albumId = null) {
  try {
    let query = db.collection('galleries').orderBy('createdAt', 'desc');

    if (albumId) {
      query = query.where('albumId', '==', albumId);
    }

    const snapshot = await query.get();
    const photos = [];

    snapshot.forEach(doc => {
      photos.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: photos };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Add photo to gallery
async function addGalleryPhoto(photoData) {
  try {
    const user = await getCurrentUser();

    const docRef = await db.collection('galleries').add({
      ...photoData,
      uploadedBy: user.uid,
      uploadedByName: user.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update album photo count
    if (photoData.albumId) {
      await db.collection('albums').doc(photoData.albumId).update({
        photoCount: firebase.firestore.FieldValue.increment(1)
      });
    }

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete photo from gallery
async function deleteGalleryPhoto(id) {
  try {
    const photoDoc = await db.collection('galleries').doc(id).get();
    const photoData = photoDoc.data();

    // Delete image from storage
    if (photoData.imageUrl) {
      await deleteImage(photoData.imageUrl);
    }

    // Update album photo count
    if (photoData.albumId) {
      await db.collection('albums').doc(photoData.albumId).update({
        photoCount: firebase.firestore.FieldValue.increment(-1)
      });
    }

    await db.collection('galleries').doc(id).delete();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Render albums
function renderAlbums(albums, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (albums.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Tidak ada album</p>';
    return;
  }

  container.innerHTML = albums.map(album => `
    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer" onclick="viewAlbum('${album.id}')">
      ${album.coverImage ? `
        <img src="${album.coverImage}" alt="${album.title}" class="w-full h-48 object-cover">
      ` : `
        <div class="w-full h-48 bg-gray-200 flex items-center justify-center">
          <i class="fas fa-images text-6xl text-gray-400"></i>
        </div>
      `}
      <div class="p-4">
        <h3 class="text-lg font-bold mb-2">${album.title}</h3>
        <p class="text-gray-600 text-sm mb-3">${album.description || ''}</p>
        <div class="flex items-center justify-between text-sm text-gray-500">
          <span><i class="fas fa-image mr-1"></i> ${album.photoCount || 0} foto</span>
          <span>${formatDate(album.createdAt)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Render gallery photos
function renderGalleryPhotos(photos, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (photos.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">Tidak ada foto</p>';
    return;
  }

  container.innerHTML = photos.map(photo => `
    <div class="relative group cursor-pointer" onclick="viewPhoto('${photo.imageUrl}', '${photo.title}')">
      <img src="${photo.imageUrl}" alt="${photo.title}" class="w-full h-64 object-cover rounded-lg">
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded-lg flex items-center justify-center">
        <i class="fas fa-search-plus text-white text-3xl opacity-0 group-hover:opacity-100 transition"></i>
      </div>
      <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent rounded-b-lg">
        <p class="text-white font-semibold">${photo.title}</p>
      </div>
    </div>
  `).join('');
}
