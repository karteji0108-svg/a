// Financial Management

// Get all financial records
async function getFinancialRecords(type = null) {
  try {
    let query = db.collection('financial_records').orderBy('date', 'desc');

    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.get();
    const records = [];

    snapshot.forEach(doc => {
      records.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: records };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get financial summary
async function getFinancialSummary() {
  try {
    const snapshot = await db.collection('financial_records').get();

    let totalIncome = 0;
    let totalExpense = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === 'income') {
        totalIncome += data.amount;
      } else if (data.type === 'expense') {
        totalExpense += data.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    return {
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Create financial record
async function createFinancialRecord(recordData) {
  try {
    const user = await getCurrentUser();

    if (!['bendahara', 'super_admin'].includes(user.role)) {
      return { success: false, error: 'Unauthorized' };
    }

    const docRef = await db.collection('financial_records').add({
      ...recordData,
      createdBy: user.uid,
      createdByName: user.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update financial record
async function updateFinancialRecord(id, recordData) {
  try {
    const user = await getCurrentUser();

    if (!['bendahara', 'super_admin'].includes(user.role)) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.collection('financial_records').doc(id).update({
      ...recordData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete financial record
async function deleteFinancialRecord(id) {
  try {
    const user = await getCurrentUser();

    if (!['bendahara', 'super_admin'].includes(user.role)) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.collection('financial_records').doc(id).delete();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Render financial records
function renderFinancialRecords(records, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (records.length === 0) {
    container.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">Tidak ada data keuangan</td></tr>';
    return;
  }

  container.innerHTML = records.map(record => `
    <tr class="border-b hover:bg-gray-50">
      <td class="py-3 px-4">${formatDate(record.date)}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-1 text-xs rounded ${record.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          ${record.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
        </span>
      </td>
      <td class="py-3 px-4">${record.description}</td>
      <td class="py-3 px-4 font-semibold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}">
        ${formatCurrency(record.amount)}
      </td>
      <td class="py-3 px-4">${record.category || '-'}</td>
      <td class="py-3 px-4">
        <button onclick="editFinancialRecord('${record.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteFinancialRecordConfirm('${record.id}')" class="text-red-600 hover:text-red-800">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}
