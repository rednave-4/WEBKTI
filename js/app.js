/**
 * Frontend logic untuk halaman publik
 */

function setupMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  // Tutup saat klik link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

function createCard(ann) {
  const past = isPast(ann.tanggal);
  const imgSrc = (ann.images && ann.images.length > 0)
    ? ann.images[0]
    : null;

  const card = document.createElement('article');
  card.className = 'card';
  card.onclick = () => {
    window.location.href = `detail.html?id=${encodeURIComponent(ann.id)}`;
  };

  card.innerHTML = `
    <div class="card-image">
      ${imgSrc
        ? `<img src="${imgSrc}" alt="${escapeHtml(ann.namaAcara)}" loading="lazy" />`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#2c5282,#1e3a5f);color:white;font-size:2.5rem;">📢</div>`
      }
      <span class="card-badge ${past ? 'archive' : ''}">${past ? 'Arsip' : 'Akan Datang'}</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(ann.namaAcara)}</h3>
      <div class="card-meta">📅 ${formatTanggal(ann.tanggal)}</div>
      <div class="card-meta">🕐 ${escapeHtml(ann.jam || '-')}</div>
      <div class="card-meta">📍 ${escapeHtml(ann.lokasi || '-')}</div>
      <p class="card-desc">${escapeHtml(ann.deskripsi || ann.keterangan || '')}</p>
      <div class="card-footer">PJ: ${escapeHtml(ann.pj || '-')}</div>
    </div>
  `;
  return card;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderHomeCards() {
  const container = document.getElementById('homeCards');
  if (!container) return;

  const list = getAnnouncements()
    .filter(a => !isPast(a.tanggal))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    .slice(0, 3);

  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<p style="color:#718096;grid-column:1/-1;text-align:center;">Belum ada pengumuman mendatang.</p>';
    return;
  }
  list.forEach(ann => container.appendChild(createCard(ann)));
}

function initAnnouncementPage() {
  let currentFilter = 'upcoming';
  let currentSort = 'date-asc';

  const cardsEl = document.getElementById('announcementCards');
  const emptyEl = document.getElementById('emptyState');
  const sortSelect = document.getElementById('sortSelect');

  function render() {
    let list = getAnnouncements();

    // Filter
    if (currentFilter === 'upcoming') {
      list = list.filter(a => !isPast(a.tanggal));
    } else if (currentFilter === 'archive') {
      list = list.filter(a => isPast(a.tanggal));
    }

    // Sort
    if (currentSort === 'date-asc') {
      list.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    } else if (currentSort === 'date-desc') {
      list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    } else if (currentSort === 'newest') {
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }

    cardsEl.innerHTML = '';
    if (list.length === 0) {
      emptyEl.style.display = 'block';
    } else {
      emptyEl.style.display = 'none';
      list.forEach(ann => cardsEl.appendChild(createCard(ann)));
    }
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      render();
    });
  }

  render();
}

function renderDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('detailContent');

  if (!id || !container) {
    container.innerHTML = '<p>Pengumuman tidak ditemukan.</p>';
    return;
  }

  const ann = getAnnouncementById(id);
  if (!ann) {
    container.innerHTML = '<p>Pengumuman tidak ditemukan. <a href="announcement.html">Kembali</a></p>';
    return;
  }

  const past = isPast(ann.tanggal);
  const images = ann.images && ann.images.length > 0 ? ann.images : [];

  let galleryHtml = '';
  if (images.length > 0) {
    galleryHtml = `
      <div class="detail-gallery">
        ${images.map(src => `<img src="${src}" alt="${escapeHtml(ann.namaAcara)}" loading="lazy" />`).join('')}
      </div>
    `;
  } else {
    galleryHtml = `
      <div class="detail-gallery">
        <div style="height:200px;background:linear-gradient(135deg,#2c5282,#1e3a5f);display:flex;align-items:center;justify-content:center;color:white;font-size:3rem;">📢</div>
      </div>
    `;
  }

  container.innerHTML = `
    ${galleryHtml}
    <div class="detail-body">
      <span class="status-badge ${past ? 'archive' : 'upcoming'}">
        ${past ? 'Arsip (Sudah Selesai)' : 'Akan Datang'}
      </span>
      <h1 class="detail-title">${escapeHtml(ann.namaAcara)}</h1>

      <div class="detail-meta">
        <div class="meta-item">
          <span class="meta-label">Tanggal</span>
          <span class="meta-value">${formatTanggal(ann.tanggal)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Jam Kegiatan</span>
          <span class="meta-value">${escapeHtml(ann.jam || '-')}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Lokasi</span>
          <span class="meta-value">${escapeHtml(ann.lokasi || '-')}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">PJ</span>
          <span class="meta-value">${escapeHtml(ann.pj || '-')}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Narahubung</span>
          <span class="meta-value">${escapeHtml(ann.narahubung || '-')}</span>
        </div>
      </div>

      ${ann.keterangan ? `
        <div class="detail-section">
          <h3>Keterangan Kegiatan</h3>
          <p>${escapeHtml(ann.keterangan)}</p>
        </div>
      ` : ''}

      ${ann.deskripsi ? `
        <div class="detail-section">
          <h3>Deskripsi Kegiatan</h3>
          <p>${escapeHtml(ann.deskripsi)}</p>
        </div>
      ` : ''}
    </div>
  `;
}
