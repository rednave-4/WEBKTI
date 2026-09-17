const ADMIN_USER = 'admin';
const ADMIN_PASS = 'evanganteng';

let uploadedImages = []; // base64 strings untuk form saat ini

function initAdmin() {
  const loginSection = document.getElementById('loginSection');
  const adminSection = document.getElementById('adminSection');

  if (isLoggedIn()) {
    showAdmin();
  } else {
    loginSection.style.display = 'block';
    adminSection.style.display = 'none';
  }

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('username').value.trim();
      const pass = document.getElementById('password').value;

      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        setLoggedIn(true);
        showAdmin();
      } else {
        const err = document.getElementById('loginError');
        err.textContent = 'Username atau password salah.';
        err.style.display = 'block';
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      setLoggedIn(false);
      location.reload();
    });
  }

  // Tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.tab;
      document.getElementById('listTab').style.display = target === 'list' ? 'block' : 'none';
      document.getElementById('addTab').style.display = target === 'add' ? 'block' : 'none';

      if (target === 'list') renderAdminList();
      if (target === 'add') resetForm();
    });
  });

  // Form submit
  const form = document.getElementById('announcementForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Cancel edit
  const cancelBtn = document.getElementById('cancelEdit');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      resetForm();
      // Switch to list
      document.querySelector('.admin-tab[data-tab="list"]').click();
    });
  }

  // Image upload
  setupImageUpload();
}

function showAdmin() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('adminSection').style.display = 'block';
  renderAdminList();
}

function renderAdminList() {
  const container = document.getElementById('adminList');
  if (!container) return;

  const list = getAnnouncements().sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  );

  if (list.length === 0) {
    container.innerHTML = '<p style="color:#718096;text-align:center;padding:30px;">Belum ada pengumuman. Tambahkan yang baru!</p>';
    return;
  }

  container.innerHTML = list.map(ann => {
    const past = isPast(ann.tanggal);
    return `
      <div class="admin-item">
        <div class="admin-item-info">
          <h3>${escapeHtml(ann.namaAcara)}</h3>
          <p>
            ${formatTanggal(ann.tanggal)} · 
            <span style="color:${past ? '#718096' : '#38a169'}">${past ? 'Arsip' : 'Akan Datang'}</span>
            ${ann.images && ann.images.length ? ` · ${ann.images.length} gambar` : ''}
          </p>
        </div>
        <div class="admin-item-actions">
          <button class="btn btn-sm btn-outline" onclick="editAnnouncement('${ann.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="confirmDelete('${ann.id}')">Hapus</button>
        </div>
      </div>
    `;
  }).join('');
}

function resetForm() {
  document.getElementById('announcementForm').reset();
  document.getElementById('editId').value = '';
  uploadedImages = [];
  document.getElementById('previewImages').innerHTML = '';
  document.getElementById('submitBtn').textContent = 'Simpan Pengumuman';
}

function editAnnouncement(id) {
  const ann = getAnnouncementById(id);
  if (!ann) return;

  document.getElementById('editId').value = ann.id;
  document.getElementById('namaAcara').value = ann.namaAcara || '';
  document.getElementById('tanggal').value = ann.tanggal || '';
  document.getElementById('jam').value = ann.jam || '';
  document.getElementById('lokasi').value = ann.lokasi || '';
  document.getElementById('pj').value = ann.pj || '';
  document.getElementById('narahubung').value = ann.narahubung || '';
  document.getElementById('keterangan').value = ann.keterangan || '';
  document.getElementById('deskripsi').value = ann.deskripsi || '';

  uploadedImages = ann.images ? [...ann.images] : [];
  renderPreviews();

  document.getElementById('submitBtn').textContent = 'Update Pengumuman';

  // Switch to add tab
  document.querySelector('.admin-tab[data-tab="add"]').click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function confirmDelete(id) {
  if (confirm('Yakin ingin menghapus pengumuman ini?')) {
    deleteAnnouncement(id);
    renderAdminList();
  }
}

function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('editId').value;
  const data = {
    namaAcara: document.getElementById('namaAcara').value.trim(),
    tanggal: document.getElementById('tanggal').value,
    jam: document.getElementById('jam').value.trim(),
    lokasi: document.getElementById('lokasi').value.trim(),
    pj: document.getElementById('pj').value.trim(),
    narahubung: document.getElementById('narahubung').value.trim(),
    keterangan: document.getElementById('keterangan').value.trim(),
    deskripsi: document.getElementById('deskripsi').value.trim(),
    images: [...uploadedImages]
  };

  if (!data.namaAcara || !data.tanggal || !data.jam || !data.lokasi || !data.pj || !data.narahubung) {
    alert('Mohon lengkapi field yang wajib diisi.');
    return;
  }

  if (id) {
    updateAnnouncement(id, data);
    alert('Pengumuman berhasil diperbarui!');
  } else {
    addAnnouncement(data);
    alert('Pengumuman berhasil ditambahkan!');
  }

  resetForm();
  document.querySelector('.admin-tab[data-tab="list"]').click();
}

function setupImageUpload() {
  const input = document.getElementById('gambarInput');
  const area = document.getElementById('uploadArea');

  if (!input || !area) return;

  input.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    input.value = ''; // reset agar bisa pilih file yang sama lagi
  });

  // Drag & drop
  area.addEventListener('dragover', (e) => {
    e.preventDefault();
    area.classList.add('dragover');
  });
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });
}

function handleFiles(fileList) {
  const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
  if (files.length === 0) return;

  files.forEach(file => {
    if (file.size > 2 * 1024 * 1024) {
      alert(`Gambar "${file.name}" terlalu besar (maks 2MB).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImages.push(e.target.result);
      renderPreviews();
    };
    reader.readAsDataURL(file);
  });
}

function renderPreviews() {
  const container = document.getElementById('previewImages');
  if (!container) return;

  container.innerHTML = uploadedImages.map((src, idx) => `
    <div class="preview-item">
      <img src="${src}" alt="Preview ${idx + 1}" />
      <button type="button" class="remove-img" onclick="removeImage(${idx})" title="Hapus">×</button>
    </div>
  `).join('');
}

function removeImage(index) {
  uploadedImages.splice(index, 1);
  renderPreviews();
}

// Make some functions global for onclick
window.editAnnouncement = editAnnouncement;
window.confirmDelete = confirmDelete;
window.removeImage = removeImage;
