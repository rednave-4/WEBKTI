/**
 * Data layer - menggunakan localStorage sebagai "database"
 * Key: sman10_announcements
 */

const STORAGE_KEY = 'sman10_announcements';
const AUTH_KEY = 'sman10_admin_auth';

// Default sample data (hanya jika belum ada data)
const SAMPLE_DATA = [
  {
    id: 'sample-1',
    namaAcara: 'Upacara Hari Kemerdekaan RI ke-81',
    tanggal: '2026-08-17',
    jam: '07.00 - 09.30 WITA',
    lokasi: 'Lapangan Upacara SMA Negeri 10 Samarinda',
    pj: 'Wakasek Kesiswaan',
    narahubung: '0812-3456-7890',
    keterangan: 'Wajib memakai seragam lengkap, membawa topi, dan botol minum.',
    deskripsi: 'Upacara bendera memperingati Hari Kemerdekaan Republik Indonesia. Seluruh siswa, guru, dan staf wajib hadir tepat waktu. Setelah upacara akan ada lomba antar kelas.',
    images: [],
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'sample-2',
    namaAcara: 'Workshop Coding & AI untuk Siswa',
    tanggal: '2026-09-20',
    jam: '08.00 - 12.00 WITA',
    lokasi: 'Lab Komputer Lantai 2',
    pj: 'Bu Sari (Guru Informatika)',
    narahubung: '0821-9876-5432',
    keterangan: 'Bawa laptop jika ada. Kuota terbatas 40 siswa (daftar ke OSIS).',
    deskripsi: 'Workshop pengenalan Artificial Intelligence dan dasar pemrograman Python. Dipandu oleh alumni dan mentor dari komunitas tech lokal.',
    images: [],
    createdAt: '2026-08-15T10:00:00.000Z'
  },
  {
    id: 'sample-3',
    namaAcara: 'Class Meeting Semester Ganjil',
    tanggal: '2026-06-10',
    jam: '07.30 - 14.00 WITA',
    lokasi: 'Aula Sekolah',
    pj: 'OSIS & Guru BK',
    narahubung: '0852-1111-2222',
    keterangan: 'Bawa bekal makan siang. Pakaian bebas rapi.',
    deskripsi: 'Kegiatan class meeting akhir semester dengan berbagai lomba, games, dan penampilan seni dari tiap kelas.',
    images: [],
    createdAt: '2026-05-20T09:00:00.000Z'
  }
];

function getAnnouncements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DATA));
      return [...SAMPLE_DATA];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading announcements', e);
    return [...SAMPLE_DATA];
  }
}

function saveAnnouncements(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getAnnouncementById(id) {
  return getAnnouncements().find(a => a.id === id) || null;
}

function addAnnouncement(data) {
  const list = getAnnouncements();
  const newItem = {
    ...data,
    id: 'ann-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    createdAt: new Date().toISOString()
  };
  list.unshift(newItem);
  saveAnnouncements(list);
  return newItem;
}

function updateAnnouncement(id, data) {
  const list = getAnnouncements();
  const idx = list.findIndex(a => a.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...data };
  saveAnnouncements(list);
  return list[idx];
}

function deleteAnnouncement(id) {
  const list = getAnnouncements().filter(a => a.id !== id);
  saveAnnouncements(list);
  return true;
}

/** Cek apakah tanggal sudah lewat (arsip) */
function isPast(tanggalStr) {
  if (!tanggalStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(tanggalStr + 'T00:00:00');
  return eventDate < today;
}

function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) === 'true';
}

function setLoggedIn(value) {
  if (value) {
    localStorage.setItem(AUTH_KEY, 'true');
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

// Format tanggal Indonesia
function formatTanggal(isoDate) {
  if (!isoDate) return '-';
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
