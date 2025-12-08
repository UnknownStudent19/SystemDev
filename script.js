// Storage keys
const STORAGE_KEY = 'students_records_v1';

// Global variables
let students = [];
let currentSort = { field: 'id', order: 'asc' };

// Initialize app immediately (no login)
document.addEventListener('DOMContentLoaded', () => {
  // show main app and load data
  const main = document.getElementById('mainApp');
  if (main) main.style.display = 'block';
  const adminEl = document.getElementById('adminUser');
  if (adminEl) adminEl.textContent = 'ADMIN';
  loadStudents();
  renderList();
});

// Logout function (simple reload to clear state)
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    // Reload page to reset UI
    location.reload();
  }
}

// Tab switching
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName + '-tab').classList.add('active');
  event.target.classList.add('active');
}

// Load students from localStorage
function loadStudents() {
  students = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

// Save students to localStorage
function saveStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  const msg = document.getElementById('successMsg');
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 3000);
}

// Find student by ID
function findIndexById(id) {
  return students.findIndex(s => Number(s.id) === Number(id));
}

// Update student count
function updateStudentCount() {
  document.getElementById('studentCount').textContent = students.length;
}

// Sort students
function sortStudents(field, order) {
  currentSort = { field, order };

  students.sort((a, b) => {
    let valueA, valueB;

    if (field === 'id') {
      valueA = Number(a.id);
      valueB = Number(b.id);
    } else if (field === 'name') {
      valueA = a.fullName.toLowerCase();
      valueB = b.fullName.toLowerCase();
    } else if (field === 'date') {
      // Sort by date added (newer first or older first)
      valueA = a.timestamp || 0;
      valueB = b.timestamp || 0;
    }

    if (order === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });

  renderList();
}

// Handle sort change
function handleSortChange() {
  const sortSelect = document.getElementById('sortSelect');
  const [field, order] = sortSelect.value.split('-');
  sortStudents(field, order);
}

// Render student list table
function renderList() {
  const container = document.getElementById('listContainer');
  if (students.length === 0) {
    container.innerHTML =
      '<div class="muted" style="padding:20px;text-align:center">📭 No students registered yet. Add one from the form tab!</div>';
    updateStudentCount();
    return;
  }

  let html =
    '<table><thead><tr><th>ID</th><th>Name</th><th>Grade</th><th>Attendance</th><th>Behavior</th><th>Actions</th></tr></thead><tbody>';
  students.forEach(s => {
    html += `<tr>
      <td>${escapeHtml(s.id)}</td>
      <td>${escapeHtml(s.fullName)}</td>
      <td>${Number(s.grade || 0).toFixed(2)}</td>
      <td>${escapeHtml(s.attendance || 0)}</td>
      <td>${escapeHtml((s.behavior || '').substring(0, 30))}${(s.behavior || '').length > 30 ? '...' : ''}</td>
      <td class="actions">
        <button onclick="editStudent(${JSON.stringify(s.id)})">✏️ Edit</button>
        <button onclick="deleteStudent(${JSON.stringify(s.id)})" class="ghost">🗑️ Delete</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
  updateStudentCount();
}

// Escape HTML
function escapeHtml(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// Get form data
function getFormData() {
  return {
    id: Number(document.getElementById('id').value),
    fullName: document.getElementById('fullName').value.trim(),
    dob: document.getElementById('dob').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    address: document.getElementById('address').value.trim(),
    emergencyName: document.getElementById('emergencyName').value.trim(),
    emergencyPhone: document.getElementById('emergencyPhone').value.trim(),
    grade: parseFloat(document.getElementById('grade').value) || 0,
    attendance: parseInt(document.getElementById('attendance').value) || 0,
    behavior: document.getElementById('behavior').value.trim(),
    timestamp: Date.now()
  };
}

// Reset form
function resetForm() {
  document.getElementById('studentForm').reset();
  document.getElementById('editingId').value = '';
  document.getElementById('saveBtn').textContent = '✅ Add Student';
}

// Add or update student
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('studentForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = getFormData();
      const editingId = document.getElementById('editingId').value;

      if (editingId) {
        const idx = findIndexById(editingId);
        if (idx === -1) {
          alert('Record not found for update');
          return;
        }
        students[idx] = { ...students[idx], ...data };
        saveStorage();
        renderList();
        resetForm();
        alert('✓ Record updated successfully!');
        return;
      }

      if (findIndexById(data.id) !== -1) {
        alert('⚠️ A student with the same ID already exists.');
        return;
      }

      students.push(data);
      saveStorage();
      renderList();
      resetForm();
      alert('✓ Student added successfully!');
    });
  }

  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetForm);
  }
});

// Edit student
window.editStudent = id => {
  const idx = findIndexById(id);
  if (idx === -1) {
    alert('Student not found');
    return;
  }
  const s = students[idx];
  document.getElementById('editingId').value = s.id;
  document.getElementById('id').value = s.id;
  document.getElementById('fullName').value = s.fullName;
  document.getElementById('dob').value = s.dob;
  document.getElementById('phone').value = s.phone;
  document.getElementById('email').value = s.email;
  document.getElementById('address').value = s.address;
  document.getElementById('emergencyName').value = s.emergencyName;
  document.getElementById('emergencyPhone').value = s.emergencyPhone;
  document.getElementById('grade').value = s.grade;
  document.getElementById('attendance').value = s.attendance;
  document.getElementById('behavior').value = s.behavior;
  document.getElementById('saveBtn').textContent = '🔄 Update Student';

  // Switch to form tab
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('form-tab').classList.add('active');
  document.querySelectorAll('.tab-btn')[0].classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Delete student
window.deleteStudent = id => {
  if (!confirm('🗑️ Delete record with ID ' + id + '?')) return;
  const idx = findIndexById(id);
  if (idx === -1) {
    alert('Student not found');
    return;
  }
  students.splice(idx, 1);
  saveStorage();
  renderList();
  document.getElementById('searchResult').textContent = 'Enter a student ID above to view detailed information.';
  alert('✓ Record deleted!');
};

// Search by ID
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const id = document.getElementById('searchId').value;
      if (!id) {
        alert('Enter an ID to search');
        return;
      }
      const idx = findIndexById(id);
      const panel = document.getElementById('searchResult');
      if (idx === -1) {
        panel.textContent = '❌ Student not found.';
        panel.classList.add('muted');
        panel.classList.add('not-found');
        return;
      }
      const s = students[idx];
      panel.innerHTML = `<div><strong style="font-size:16px">👤 ${escapeHtml(s.fullName)}</strong> (ID: ${escapeHtml(s.id)})</div>
        <div class="card-divider"></div>
        <div style="margin-top:12px"><strong>📋 Basic Information</strong></div>
        <div style="margin-top:8px;font-size:13px"><strong>📅 DOB:</strong> ${escapeHtml(s.dob)}</div>
        <div style="margin-top:6px;font-size:13px"><strong>📞 Phone:</strong> ${escapeHtml(s.phone)}</div>
        <div style="margin-top:6px;font-size:13px"><strong>📧 Email:</strong> ${escapeHtml(s.email)}</div>
        <div style="margin-top:6px;font-size:13px"><strong>🏠 Address:</strong> ${escapeHtml(s.address)}</div>
        <div style="margin-top:16px"><strong>🆘 Emergency Contact</strong></div>
        <div style="margin-top:8px;font-size:13px"><strong>Name:</strong> ${escapeHtml(s.emergencyName)}<br/><strong>Phone:</strong> ${escapeHtml(s.emergencyPhone)}</div>
        <div style="margin-top:16px"><strong>🎓 Academic Information</strong></div>
        <div style="margin-top:8px;font-size:13px"><strong>⭐ Grade:</strong> ${Number(s.grade).toFixed(2)} / 100</div>
        <div style="margin-top:6px;font-size:13px"><strong>📆 Attendance:</strong> ${escapeHtml(s.attendance)} days present</div>
        <div style="margin-top:6px;font-size:13px"><strong>💬 Behavior:</strong> ${escapeHtml(s.behavior)}</div>
        <div style="margin-top:16px;display:flex;gap:8px"> <button onclick="editStudent(${JSON.stringify(s.id)})">✏️ Edit</button> <button class="ghost" onclick="deleteStudent(${JSON.stringify(s.id)})">🗑️ Delete</button></div>`;
      panel.classList.remove('muted');
      panel.classList.remove('not-found');
    });
  }

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      renderList();
      document.getElementById('searchResult').textContent = 'Enter a student ID above to view detailed information.';
    });
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSortChange);
  }
});
