import { useState, useEffect } from "react";
import { FiBell, FiSearch, FiFilter, FiEye, FiEdit2, FiTrash2, FiMoreHorizontal, FiChevronLeft, FiChevronRight, FiFile, FiX, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import logoImg from '../assets/Logo_LANUD.png';
import { HiOutlineUsers, HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlineArrowUpward } from "react-icons/md";
import { RiShieldCheckLine } from "react-icons/ri";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useSettings } from '../context/SettingsContext.jsx';
import "./PersonnelTracker.css";




const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";

function authHeader() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

function getFotoUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STORAGE_URL}/${path}`;
}

function formatMins(timestamp, t) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return t("just_now");
  if (m < 60) return t("minutes_ago", { n: m });
  if (m < 1440) return t("hours_ago", { n: Math.floor(m / 60) });
  return t("days_ago", { n: Math.floor(m / 1440) });
}

const avatarColors = ["#8b6f47", "#6b8e7f", "#5a6fa8", "#7a6b8e", "#8e5a6b", "#4a7a6b", "#6b5a8e", "#8e7a4a", "#5a8e6b", "#8e4a5a", "#4a6b8e", "#7a8e4a", "#8e6b4a", "#4a8e7a"];
const statusClass = { Aktif: "status-aktif", Cuti: "status-cuti", Mutasi: "status-mutasi", Pendidikan: "status-pendidikan", Pensiun: "status-mutasi" };

const catatanData = [
  {
    label: "guideline_update_title",
    isi: "guideline_update_desc",
  },
  {
    label: "integration_sispers_title",
    isi: "integration_sispers_desc",
  },
];

const PER_PAGE = 5;

// ── REUSABLE: Baris Riwayat Jabatan ──
// Didefinisikan di LUAR komponen utama agar tidak di-recreate setiap render
const labelStyleShared = { fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px", display: "block" };
const inputStyleShared = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box", outline: "none", backgroundColor: "#fff" };

// ── DAFTAR JABATAN TNI AU ──
const JABATAN_LIST = [
  "Kepala Staf Angkatan Udara (KSAU)",
  "Wakil Kepala Staf Angkatan Udara (Wakil KSAU)",
  "Inspektur Jenderal TNI Angkatan Udara (Irjenau)",
  "Koordinator Staf Ahli KSAU",
  "Asisten Operasi KSAU (Asops KSAU)",
  "Asisten Personel KSAU (Aspers KSAU)",
  "Asisten Logistik KSAU (Aslog KSAU)",
  "Asisten Perencanaan dan Anggaran KSAU (Asrena KSAU)",
  "Asisten Intelijen KSAU (Asintel KSAU)",
  "Asisten Potensi Dirgantara KSAU (Aspotdirga KSAU)",
  "Asisten Komunikasi dan Elektronika KSAU (Askomlek KSAU)",
  "Panglima Koopsudnas",
  "Panglima Komando Operasi Udara I",
  "Panglima Komando Operasi Udara II",
  "Panglima Komando Operasi Udara III",
  "Komandan Kodiklatau",
  "Komandan Wing Pendidikan",
  "Komandan Sekolah Penerbang",
  "Komandan Skadik",
  "Komandan Pangkalan Udara (Danlanud)",
  "Komandan Wing Udara",
  "Komandan Skuadron Udara",
  "Komandan Satuan Radar (Dansatrad)",
  "Danlanud Halim Perdanakusuma",
  "Danlanud Iswahjudi",
  "Danlanud Supadio",
  "Kepala Dinas Operasi",
  "Kepala Dinas Personel",
  "Kepala Dinas Logistik",
  "Kepala Dinas Penerangan TNI AU (Kadispenau)",
  "Kepala Dinas Kesehatan TNI AU (Kadiskesau)",
  "Kepala Dinas Hukum TNI AU",
  "Komandan Batalyon Kopaskhas",
  "Komandan Wing Komando Paskhas",
];

// ── DAFTAR PANGKAT (kode + label) ──
const PANGKAT_RIWAYAT_LIST = [
  { value: 'MARSKAL', label: 'Marsekal' },
  { value: 'MARSMAD', label: 'Marsekal Madya' },
  { value: 'MARSMUD', label: 'Marsekal Muda' },
  { value: 'MARSPERT', label: 'Marsekal Pertama' },
  { value: 'KOLONEL', label: 'Kolonel' },
  { value: 'LETKOL', label: 'Letnan Kolonel' },
  { value: 'MAYOR', label: 'Mayor' },
  { value: 'KAPTEN', label: 'Kapten' },
  { value: 'LETTU', label: 'Letnan Satu' },
  { value: 'LETDA', label: 'Letnan Dua' },
  { value: 'PELTU', label: 'Pembantu Letnan Satu' },
  { value: 'PELDA', label: 'Pembantu Letnan Dua' },
  { value: 'SERMA', label: 'Sersan Mayor' },
  { value: 'SERKA', label: 'Sersan Kepala' },
  { value: 'SERTU', label: 'Sersan Satu' },
  { value: 'SERDA', label: 'Sersan Dua' },
  { value: 'KOPKA', label: 'Kopral Kepala' },
  { value: 'KOPTU', label: 'Kopral Satu' },
  { value: 'KOPDA', label: 'Kopral Dua' },
  { value: 'PRAKA', label: 'Prajurit Kepala' },
  { value: 'PRATU', label: 'Prajurit Satu' },
  { value: 'PRADA', label: 'Prajurit Dua' },
  { value: 'IV/e', label: 'Pembina Utama (IV/e)' },
  { value: 'IV/d', label: 'Pembina Utama Madya (IV/d)' },
  { value: 'IV/c', label: 'Pembina Utama Muda (IV/c)' },
  { value: 'IV/b', label: 'Pembina Tingkat I (IV/b)' },
  { value: 'IV/a', label: 'Pembina (IV/a)' },
  { value: 'III/d', label: 'Penata Tingkat I (III/d)' },
  { value: 'III/c', label: 'Penata (III/c)' },
  { value: 'III/b', label: 'Penata Muda Tingkat I (III/b)' },
  { value: 'III/a', label: 'Penata Muda (III/a)' },
  { value: 'II/d', label: 'Pengatur Tingkat I (II/d)' },
  { value: 'II/c', label: 'Pengatur (II/c)' },
  { value: 'II/b', label: 'Pengatur Muda Tingkat I (II/b)' },
  { value: 'II/a', label: 'Pengatur Muda (II/a)' },
  { value: 'I/d', label: 'Juru Tingkat I (I/d)' },
  { value: 'I/c', label: 'Juru (I/c)' },
  { value: 'I/b', label: 'Juru Muda Tingkat I (I/b)' },
  { value: 'I/a', label: 'Juru Muda (I/a)' },
];

// ── KOMPONEN STANDALONE: Rows Riwayat Jabatan ──
// HARUS di luar PersonnelTracker agar tidak di-recreate setiap render.
// Kalau didefinisikan di dalam, setiap render = komponen baru = form tidak bisa submit.
function RiwayatJabatanRows({ rows, setRows }) {
  return rows.map((row, i) => (
    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 170px 120px 120px 36px', gap: 10, marginBottom: 10, alignItems: 'end' }}>
      <div>
        {i === 0 && <label style={labelStyleShared}>Nama Jabatan</label>}
        <select style={inputStyleShared} value={row.nama_jabatan}
          onChange={e => { const r = rows.map((x, idx) => idx === i ? { ...x, nama_jabatan: e.target.value } : x); setRows(r); }}>
          <option value="">-- Pilih Jabatan --</option>
          {JABATAN_LIST.map(j => <option key={j} value={j}>{j}</option>)}
        </select>
      </div>
      <div>
        {i === 0 && <label style={labelStyleShared}>Pangkat Saat Itu</label>}
        <select style={inputStyleShared} value={row.pangkat_saat_itu}
          onChange={e => { const r = rows.map((x, idx) => idx === i ? { ...x, pangkat_saat_itu: e.target.value } : x); setRows(r); }}>
          <option value="">-- Pilih Pangkat --</option>
          {PANGKAT_RIWAYAT_LIST.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      <div>
        {i === 0 && <label style={labelStyleShared}>TMT Mulai</label>}
        <input type="date" style={inputStyleShared} value={row.tmt_mulai}
          onChange={e => { const r = rows.map((x, idx) => idx === i ? { ...x, tmt_mulai: e.target.value } : x); setRows(r); }} />
      </div>
      <div>
        {i === 0 && <label style={labelStyleShared}>TMT Selesai</label>}
        <input type="date" style={inputStyleShared} value={row.tmt_selesai}
          onChange={e => { const r = rows.map((x, idx) => idx === i ? { ...x, tmt_selesai: e.target.value } : x); setRows(r); }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <button type="button"
          onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
          disabled={rows.length === 1}
          style={{ width: 36, height: 38, borderRadius: 6, border: '1px solid #fca5a5', background: '#fff1f1', color: '#ef4444', cursor: rows.length === 1 ? 'not-allowed' : 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ×
        </button>
      </div>
    </div>
  ));
}

export default function PersonnelTracker({ onNavigate, onLogout, initFilter }) {
  const [allPersonnel, setAllPersonnel] = useState([]);
  const [stats, setStats] = useState({ total: 0, aktif: 0, total_unit: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [openCatatan, setOpenCatatan] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPrivasiModal, setShowPrivasiModal] = useState(false);
  const [showBantuanModal, setShowBantuanModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openMore, setOpenMore] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [filterStatus, setFilterStatus] = useState(initFilter || "Semua");
  const [filterSort, setFilterSort] = useState("NRP");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [pangkatList, setPangkatList] = useState([]);
  const [satkerList, setSatkerList] = useState([]);
  const [expandNotif, setExpandNotif] = useState(false);
  const { settings, t } = useSettings();

  const [formData, setFormData] = useState({
    nrp: "",
    nama_lengkap: "",
    jenis_personel: "Prajurit Karier",
    pangkat_id: "",
    satker_id: "",
    jabatan_sekarang: "",
    status_personel: "Aktif",
    cuti_mulai: "",
    cuti_selesai: "",
    pendidikan_lokasi: "",
    pensiun_mulai: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    golongan_darah: "",
    agama: "",
    status_marital: "",
    jenis_kelamin: "",
    suku: "",
    tinggi_badan: "",
    berat_badan: "",
    alamat_domisili: "",
    nik_ktp: "",
    npwp: "",
    tmt_pangkat_terakhir: "",
    asal_masuk_dikma: "",
    angkatan_dikma: "",
    foto: null,
  });

  const [formPendidikan, setFormPendidikan] = useState([
    { tahun: '', nama_institusi: '', jenis_pendidikan: 'Militer' }
  ]);
  const [formJabatan, setFormJabatan] = useState([
    { nama_jabatan: '', pangkat_saat_itu: '', tmt_mulai: '', tmt_selesai: '' }
  ]);

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  useEffect(() => {
    fetchStats();
    fetchNotifikasi();
    fetchAllPersonnel();
    fetchDropdown();
  }, []);

  async function fetchDropdown() {
    try {
      const p = await fetch(`${API}/dropdown/pangkat`, {
        headers: authHeader(),
      });
      const s = await fetch(`${API}/dropdown/satker`, {
        headers: authHeader(),
      });
      const pd = await p.json();
      const sd = await s.json();
      if (pd.success) setPangkatList(pd.data);
      if (sd.success) setSatkerList(sd.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API}/personel/stats`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchNotifikasi() {
    try {
      const res = await fetch(`${API}/dashboard/notifikasi`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) {
        setNotifList(data.data);
        setUnreadCount(data.unread_count);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function tandaiBaca(id) {
    try {
      await fetch(`${API}/dashboard/notifikasi/${id}/baca`, { method: "POST", headers: authHeader() });
      fetchNotifikasi();
    } catch (e) {
      console.error(e);
    }
  }

  function cekCutiHabis(data) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habis = data.filter(p => {
      if (p.status !== 'Cuti' || !p.cuti_selesai) return false;
      const selesai = new Date(p.cuti_selesai);
      selesai.setHours(0, 0, 0, 0);
      return selesai <= today;
    });

    if (habis.length > 0) {
      const names = habis.map(p => `• ${p.nama_lengkap} (${p.nrp})`).join('\n');
      alert(`⚠️ Masa cuti telah habis untuk ${habis.length} personel:\n\n${names}\n\nSegera perbarui status personel tersebut.`);
    }
  }

  async function fetchAllPersonnel() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/personel?per_page=100`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) setAllPersonnel(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function addPendidikan() {
    setFormPendidikan([...formPendidikan, { tahun: '', nama_institusi: '', jenis_pendidikan: 'Militer' }]);
  }
  function removePendidikan(i) {
    setFormPendidikan(formPendidikan.filter((_, idx) => idx !== i));
  }
  function addJabatan() {
    setFormJabatan([...formJabatan, { nama_jabatan: '', pangkat_saat_itu: '', tmt_mulai: '', tmt_selesai: '' }]);
  }
  function removeJabatan(i) {
    setFormJabatan(formJabatan.filter((_, idx) => idx !== i));
  }

  let filtered = allPersonnel.filter((p) => {
    const matchSearch = p.nama_lengkap.toLowerCase().includes(searchVal.toLowerCase()) || p.nrp.includes(searchVal);
    const matchStatus = filterStatus === "Semua" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });
  if (filterSort === "A-Z") filtered = [...filtered].sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap));
  if (filterSort === "NRP") filtered = [...filtered].sort((a, b) => a.nrp.localeCompare(b.nrp));

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageData = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const displayStart = totalFiltered === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
  const displayEnd = Math.min(safePage * PER_PAGE, totalFiltered);

  function getPageNumbers() {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  function closeAll() {
    setShowNotif(false);
    setShowUserMenu(false);
    setOpenMore(null);
    setShowFilterPanel(false);
  }

  function exportPDF() {
    const doc = new jsPDF("landscape");
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(26, 26, 46);
    doc.text(t("export_title"), pageWidth / 2, 18, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, pageWidth / 2, 24, { align: "center" });

    const header = [["NRP", "Nama Lengkap", "Pangkat / Gol", "Satuan Kerja / Unit", "Status"]];
    const rows = filtered.map((p) => [p.nrp, p.nama_lengkap, `${p.pangkat || "-"} ${p.golongan ? `(${p.golongan})` : ""}`, p.satker || p.satuan_kerja || "-", p.status]);

    autoTable(doc, {
      head: header,
      body: rows,
      startY: 32,
      theme: "striped",
      headStyles: { fillColor: "#1e3a8a", textColor: "#ffffff", fontStyle: "bold", halign: "center" },
      bodyStyles: { textColor: "#333333", fontSize: 10, valign: "middle" },
      columnStyles: { 0: { cellWidth: 35, halign: "center" }, 1: { cellWidth: 70 }, 2: { cellWidth: 45, halign: "center" }, 3: { cellWidth: 80 }, 4: { cellWidth: 30, halign: "center" } },
      styles: { fontSize: 10, cellPadding: 5, lineColor: [220, 220, 220], lineWidth: 0.1 },
      margin: { top: 30, left: 14, right: 14 },
    });
    doc.save(`Daftar_Personel_${new Date().getTime()}.pdf`);
  }

  async function handleAddPersonnel(e) {
    if (e?.preventDefault) e.preventDefault();

    // Validasi manual
    if (!formData.nrp?.trim()) return alert("NRP wajib diisi.");
    if (!formData.nama_lengkap?.trim()) return alert("Nama Lengkap wajib diisi.");
    if (!formData.pangkat_id) return alert("Pangkat wajib dipilih.");
    if (!formData.satker_id) return alert("Satuan Kerja wajib dipilih.");

    const fd = new FormData();
    Object.keys(formData).forEach((k) => {
      if (formData[k] !== null) {
        fd.append(k, formData[k]);
      }
    });

    fd.append('riwayat_pendidikan', JSON.stringify(formPendidikan.filter(p => p.nama_institusi)));
    fd.append('riwayat_jabatan', JSON.stringify(formJabatan.filter(j => j.nama_jabatan)));

    try {
      const res = await fetch(`${API}/personel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: fd,
      });

      let data = null;
      try { data = await res.json(); } catch { data = null; }

      if (res.ok || data?.success) {
        alert("Data personel berhasil ditambahkan.");
        setShowAddModal(false);
        setFormData({
          nrp: "", nama_lengkap: "", jenis_personel: "Prajurit Karier",
          pangkat_id: "", satker_id: "", jabatan_sekarang: "",
          status_personel: "Aktif", tempat_lahir: "", tanggal_lahir: "",
          golongan_darah: "", agama: "", status_marital: "", jenis_kelamin: "",
          suku: "", tinggi_badan: "", berat_badan: "", alamat_domisili: "",
          nik_ktp: "", npwp: "", tmt_pangkat_terakhir: "",
          asal_masuk_dikma: "", angkatan_dikma: "", foto: null,
        });
        setFormJabatan([{ nama_jabatan: '', pangkat_saat_itu: '', tmt_mulai: '', tmt_selesai: '' }]);
        setFormPendidikan([{ tahun: '', nama_institusi: '', jenis_pendidikan: 'Militer' }]);
        fetchAllPersonnel();
        fetchStats();
      } else {
        alert("Gagal menambahkan data: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan");
    }
  }

  async function handleEditPersonnel(e) {
    if (e?.preventDefault) e.preventDefault();

    // Validasi manual
    if (!editData.pangkat_id) return alert("Pangkat wajib dipilih.");
    if (!editData.satker_id) return alert("Satuan Kerja wajib dipilih.");
    if (!editData.nama_lengkap?.trim()) return alert("Nama Lengkap wajib diisi.");

    const fd = new FormData();
    fd.append("_method", "PUT");

    // Kirim semua field skalar (bukan object/array/file khusus)
    Object.keys(editData).forEach((k) => {
      if (
        editData[k] !== null &&
        editData[k] !== undefined &&
        typeof editData[k] !== "object" &&
        k !== "foto_baru" &&
        k !== "foto_url"
      ) {
        fd.append(k, editData[k]);
      }
    });

    if (editData.foto_baru) {
      fd.append("foto", editData.foto_baru);
    }

    // ── Kirim riwayat pendidikan & jabatan ──
    fd.append('riwayat_pendidikan', JSON.stringify(formPendidikan.filter(p => p.nama_institusi)));
    fd.append('riwayat_jabatan', JSON.stringify(formJabatan.filter(j => j.nama_jabatan)));

    try {
      const res = await fetch(`${API}/personel/${editData.nrp}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: fd,
      });

      let data = null;
      try { data = await res.json(); } catch { data = null; }
      if (res.ok || data?.success) {
        alert("Data personel berhasil diperbarui.");
        setShowEditModal(false);
        setEditData(null);
        fetchAllPersonnel();
        fetchStats();
      } else {
        alert("Gagal memperbarui data: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui data. HTTP Status: " + res.status + " | " + JSON.stringify(data));
    }
  }
  async function handleDeletePersonnel(p) {
    if (window.confirm(`Hapus data ${p.nama_lengkap} (NRP: ${p.nrp}) secara permanen?`)) {
      try {
        const res = await fetch(`${API}/personel/${p.nrp}`, {
          method: "DELETE",
          headers: authHeader(),
        });
        const data = await res.json();
        if (data.success) {
          alert("Data personel berhasil dihapus.");
          fetchAllPersonnel();
          fetchStats();
        } else {
          alert("Gagal menghapus data: " + (data.message || ""));
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan jaringan.");
      }
    }
    setOpenMore(null);
  }

  const labelStyle = { fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px", display: "block" };
  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box", outline: "none", backgroundColor: "#fff" };


  return (
    <div className="tracker-wrapper" onClick={closeAll}>
      <header className="topbar" onClick={(e) => e.stopPropagation()}>
        <div className="topbar-brand">
          <img src={logoImg} alt="Logo TNI AU" className="topbar-logo-img" />
        </div>
        <div className="topbar-right">
          <button
            className="notif-btn"
            onClick={() => {
              setShowNotif((v) => !v);
              setShowUserMenu(false);
            }}
          >
            <FiBell size={20} />
            {unreadCount > 0 && <div className="notif-badge" />}
          </button>
          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                {t("notification")}{" "}
                <span
                  onClick={() => {
                    setShowNotif(false);
                    setExpandNotif(false);
                  }}
                >
                  {t("close")}
                </span>
              </div>

              <div className="notif-list" style={{ maxHeight: expandNotif ? "400px" : "250px", overflowY: "auto" }}>
                {notifList.slice(0, expandNotif ? notifList.length : 2).map((n) => (
                  <div className="notif-item" key={n.notif_id} onClick={() => tandaiBaca(n.notif_id)}>
                    <div className={`notif-item-dot ${!n.is_dibaca ? "unread" : "read"}`} />
                    <div className="notif-item-text">
                      <div className="notif-item-title">{n.judul}</div>
                      <div className="notif-item-desc">{n.isi_notifikasi}</div>
                      <div className="notif-item-time">{formatMins(n.created_at, t)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {!expandNotif && notifList.length > 2 && (
                <div className="notif-dropdown-footer" onClick={() => setExpandNotif(true)} style={{ cursor: "pointer" }}>
                  {t("view_all_notifications")}
                </div>
              )}
            </div>
          )}

          <div
            className="user-info"
            onClick={() => {
              setShowUserMenu((v) => !v);
              setShowNotif(false);
            }}
          >
            <div className="user-text">
              <div className="user-name">{admin.nama_lengkap || "Admin"}</div>
              <div className="user-role">{admin.pangkat || ""}</div>
            </div>
            {admin.foto_url ? (
              <img
                src={getFotoUrl(admin.foto_url)}
                className="user-avatar"
                alt="Admin"
                style={{ objectFit: "cover" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.nama_lengkap || "Admin")}&background=random`;
                }}
              />
            ) : (
              <div className="user-avatar avatar-1" />
            )}
          </div>
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                {admin.foto_url ? (
                  <img
                    src={getFotoUrl(admin.foto_url)}
                    className="user-avatar"
                    alt="Admin"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.nama_lengkap || "Admin")}&background=random`;
                    }}
                  />
                ) : (
                  <div className="user-avatar avatar-1" />
                )}
                <div>
                  <div className="user-dropdown-name">{admin.nama_lengkap}</div>
                  <div className="user-dropdown-role">
                    {admin.pangkat} · {admin.satuan_kerja}
                  </div>
                </div>
              </div>
              <button
                className="user-dropdown-item"
                onClick={() => {
                  onNavigate("profilakun");
                  closeAll();
                }}
              >
                <FiUser size={14} /> Profil Akun
              </button>
              <button
                className="user-dropdown-item"
                onClick={() => {
                  onNavigate("pengaturan");
                  closeAll();
                }}
              >
                <FiSettings size={14} /> Pengaturan
              </button>
              <div className="user-dropdown-sep" />
              <button className="user-dropdown-item danger" onClick={onLogout}>
                <FiLogOut size={14} /> Keluar
              </button>
            </div>
          )}
        </div>
      </header>

      <div
        className="tracker-content"
        onClick={() => {
          setOpenMore(null);
          setShowFilterPanel(false);
        }}
      >
        <div className="breadcrumb">
          <a onClick={() => onNavigate("dashboard")}>Dashboard</a>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{t("personnel_data")}</span>
        </div>

        <div className="page-header-row">
          <div className="page-title-group">
            <div className="page-title-icon">
              <HiOutlineUsers size={30} />
            </div>
            <div className="page-title">
              <h1>{t("database_personnel")}</h1>
              <p>{t("database_personnel_desc")}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="add-btn" style={{ background: "#fff", color: "#1a1a2e", border: "1px solid #ddd" }} onClick={exportPDF}>
              <FiFile size={15} style={{ marginRight: 6 }} /> {t("export_pdf")}
            </button>
            <button className="add-btn" onClick={() => {
              // Reset semua form saat buka modal tambah
              setFormData({
                nrp: "", nama_lengkap: "", jenis_personel: "Prajurit Karier",
                pangkat_id: "", satker_id: "", jabatan_sekarang: "",
                status_personel: "Aktif", tempat_lahir: "", tanggal_lahir: "",
                golongan_darah: "", agama: "", status_marital: "", jenis_kelamin: "",
                suku: "", tinggi_badan: "", berat_badan: "", alamat_domisili: "",
                nik_ktp: "", npwp: "", tmt_pangkat_terakhir: "",
                asal_masuk_dikma: "", angkatan_dikma: "", foto: null,
              });
              setFormJabatan([{ nama_jabatan: '', pangkat_saat_itu: '', tmt_mulai: '', tmt_selesai: '' }]);
              setFormPendidikan([{ tahun: '', nama_institusi: '', jenis_pendidikan: 'Militer' }]);
              setShowAddModal(true);
            }}>
              + {t("add_personnel")}
            </button>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-item-icon">
              <RiShieldCheckLine size={20} />
            </div>
            <div className="stat-item-text">
              <div className="stat-item-label">Total Terdaftar</div>
              <div className="stat-item-value">{stats.total} Personel</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-item-icon">
              <HiOutlineUsers size={20} />
            </div>
            <div className="stat-item-text">
              <div className="stat-item-label">Tersedia (Aktif)</div>
              <div className="stat-item-value">{stats.aktif} Personel</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-item-icon">
              <HiOutlineLocationMarker size={20} />
            </div>
            <div className="stat-item-text">
              <div className="stat-item-label">Unit Terintegrasi</div>
              <div className="stat-item-value">{stats.total_unit} {t("total_units")}</div>
            </div>
          </div>
        </div>

        <div className="toolbar" onClick={(e) => e.stopPropagation()}>
          <div className="search-box">
            <FiSearch size={15} />
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchVal && (
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", display: "flex" }} onClick={() => setSearchVal("")}>
                <FiX size={13} />
              </button>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <button className="filter-btn" onClick={() => setShowFilterPanel((v) => !v)}>
              <FiFilter size={14} /> {t("advanced_filter")}
            </button>
            {showFilterPanel && (
              <div className="filter-panel">
                <div className="filter-panel-title">{t("filter_status")}</div>
                {["Semua", "Aktif", "Cuti", "Mutasi", "Pendidikan", "Pensiun"].map((s) => {
                  const labelMap = {
                    Semua: t("all"),
                    Aktif: t("active"),
                    Cuti: t("status_leave"),
                    Mutasi: t("status_transfer"),
                    Pendidikan: t("status_training"),
                    Pensiun: t("status_retired"),
                  };
                  return (
                    <label key={s} className="filter-radio">
                      <input
                        type="radio"
                        name="fstatus"
                        value={s}
                        checked={filterStatus === s}
                        onChange={() => {
                          setFilterStatus(s);
                          setCurrentPage(1);
                        }}
                      />
                      {labelMap[s] || s}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="toolbar-spacer" />
          <select
            className="sort-btn"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="Semua">{t("all_status")}</option>
            <option value="Aktif">{t("active")}</option>
            <option value="Cuti">{t("status_leave")}</option>
            <option value="Mutasi">{t("status_transfer")}</option>
            <option value="Pendidikan">{t("status_training")}</option>
            <option value="Pensiun">{t("status_retired")}</option>
          </select>
          <select
            className="sort-btn"
            value={filterSort}
            onChange={(e) => {
              setFilterSort(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="NRP">{t("sort_nrp")}</option>
            <option value="A-Z">{t("sort_az")}</option>
          </select>
        </div>

        <div className="table-card">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <div className="th-nrp">
                      NRP <MdOutlineArrowUpward size={12} />
                    </div>
                  </th>
                  <th>PERSONEL</th>
                  <th>{t("col_rank")}</th>
                  <th>{t("col_unit")}</th>
                  <th>{t("col_status")}</th>
                  <th>{t("col_last_update")}</th>
                  <th>{t("col_action")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "28px", color: "#aaa", fontSize: 13 }}>
                      {t("loading_data")}
                    </td>
                  </tr>
                ) : pageData.length > 0 ? (
                  pageData.map((p, idx) => (
                    <tr key={p.nrp}>
                      <td>{p.nrp}</td>
                      <td>
                        <div className="personnel-cell">
                          {p.foto_url ? (
                            <img
                              src={getFotoUrl(p.foto_url)}
                              className="personnel-avatar"
                              alt={p.nama_lengkap}
                              style={{ objectFit: "cover" }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama_lengkap)}&background=random`;
                              }}
                            />
                          ) : (
                            <div className="personnel-avatar" style={{ background: avatarColors[((safePage - 1) * PER_PAGE + idx) % avatarColors.length] }} />
                          )}
                          <div>
                            <div className="personnel-name">{p.nama_lengkap}</div>
                            <div className="personnel-sub">{p.jenis_personel?.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.pangkat}</td>
                      <td>
                        <div className="unit-cell">
                          <div className="unit-dot" />
                          {p.satker}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${statusClass[p.status] || ""}`}>{p.status}</span>
                      </td>
                      <td>{p.updated_at}</td>
                      <td>
                        <div className="aksi-cell">
                          <button className="lihat-btn" onClick={() => onNavigate("datadiri", p.nrp)}>
                            <FiEye size={15} /> Lihat
                          </button>
                          <div className="more-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                            <button className="more-btn" onClick={() => setOpenMore(openMore === p.nrp ? null : p.nrp)}>
                              <FiMoreHorizontal size={16} />
                            </button>
                            {openMore === p.nrp && (
                              <div className="more-dropdown">
                                <button
                                  className="more-dropdown-item"
                                  onClick={() => {
                                    onNavigate("datadiri", p.nrp);
                                    setOpenMore(null);
                                  }}
                                >
                                  <FiEye size={14} /> {t("view_detail")}
                                </button>
                                <button
                                  className="more-dropdown-item"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setOpenMore(null);
                                    try {
                                      const res = await fetch(`${API}/personel/${p.nrp}`, { headers: authHeader() });
                                      const d = await res.json();
                                      if (d.success) {
                                        setEditData({
                                          ...d.data,
                                          // Konversi ke string agar match dengan <option value>
                                          pangkat_id: String(d.data.pangkat_id || ''),
                                          satker_id: String(d.data.satker_id || ''),
                                          cuti_mulai: d.data.cuti_mulai || '',
                                          cuti_selesai: d.data.cuti_selesai || '',
                                          pendidikan_lokasi: d.data.pendidikan_lokasi || '',
                                          pensiun_mulai: d.data.pensiun_mulai || '',
                                          foto_baru: null,
                                        });
                                        // Load riwayat jabatan & pendidikan dari data existing
                                        if (d.data.riwayat_jabatan && d.data.riwayat_jabatan.length > 0) {
                                          setFormJabatan(d.data.riwayat_jabatan.map(j => ({
                                            nama_jabatan: j.nama_jabatan || '',
                                            pangkat_saat_itu: j.pangkat_saat_itu || '',
                                            tmt_mulai: j.tmt_mulai || '',
                                            tmt_selesai: j.tmt_selesai || '',
                                          })));
                                        } else {
                                          setFormJabatan([{ nama_jabatan: '', pangkat_saat_itu: '', tmt_mulai: '', tmt_selesai: '' }]);
                                        }
                                        if (d.data.riwayat_pendidikan && d.data.riwayat_pendidikan.length > 0) {
                                          setFormPendidikan(d.data.riwayat_pendidikan.map(p => ({
                                            tahun: p.tahun || '',
                                            nama_institusi: p.nama_institusi || '',
                                            jenis_pendidikan: p.jenis_pendidikan || 'Militer',
                                          })));
                                        } else {
                                          setFormPendidikan([{ tahun: '', nama_institusi: '', jenis_pendidikan: 'Militer' }]);
                                        }
                                        setShowEditModal(true);
                                      }
                                    } catch (err) {
                                      alert("Gagal mengambil data detail personel.");
                                    }
                                  }}
                                >
                                  <FiEdit2 size={14} /> Edit Data
                                </button>
                                <button className="more-dropdown-item danger" onClick={() => handleDeletePersonnel(p)}>
                                  <FiTrash2 size={14} /> Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "28px", color: "#aaa", fontSize: 13 }}>
                      {t("no_matching_data")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-row">
            <div className="pagination-info">
              {t("showing_results")} {displayStart}–{displayEnd} {t("from")} <strong>{totalFiltered}</strong> {t("of_personnel")}
            </div>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
                <FiChevronLeft size={14} />
              </button>
              {getPageNumbers().map((pg, i) =>
                pg === "..." ? (
                  <span key={`d${i}`} className="page-dots">
                    ...
                  </span>
                ) : (
                  <button key={pg} className={`page-btn ${safePage === pg ? "active" : ""}`} onClick={() => setCurrentPage(pg)}>
                    {pg}
                  </button>
                ),
              )}
              <button className="page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="catatan-section">
          <div className="catatan-title">
            <FiFile size={18} /> {t("admin_notes")}
          </div>
          {catatanData.map((c, i) => (
            <div key={i}>
              <div className="catatan-item" onClick={() => setOpenCatatan(openCatatan === i ? null : i)}>
                <span className="catatan-item-label">{t(c.label)}</span>
                <span className={`catatan-chevron ${openCatatan === i ? "open" : ""}`}>
                  <FiChevronRight size={16} />
                </span>
              </div>
              {openCatatan === i && <div className="catatan-body">{t(c.isi)}</div>}
            </div>
          ))}
        </div>
      </div>

      <footer className="page-footer">
        <span>© 2026 DISINFOLAHTAU – Markas Besar TNI Angkatan Udara</span>
        <div className="footer-links">
          <a onClick={() => setShowPrivasiModal(true)}>{t("privacy_policy")}</a>
          <a onClick={() => setShowBantuanModal(true)}>{t("it_support")}</a>
        </div>
      </footer>

      {/* MODAL KEBIJAKAN PRIVASI & BANTUAN */}
      {showPrivasiModal && (
        <div className="modal-overlay" onClick={() => setShowPrivasiModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {t("privacy_policy")}{" "}
              <button className="modal-close" onClick={() => setShowPrivasiModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>
                Sistem Informasi Personel TNI AU berkomitmen menjaga kerahasiaan seluruh data personel.
                <br />
                <br />• Data bersifat rahasia negara...
                <br />• Sistem menggunakan enkripsi end-to-end...
              </p>
            </div>
          </div>
        </div>
      )}

      {showBantuanModal && (
        <div className="modal-overlay" onClick={() => setShowBantuanModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {t("it_support")}{" "}
              <button className="modal-close" onClick={() => setShowBantuanModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden" }}>
                {[
                  ["Helpdesk", "disinfolahtau@tniau.mil.id"],
                  ["Telepon", "(021) 800-1234"],
                  ["Jam Layanan", "Senin – Jumat, 08:00 – 17:00 WIB"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 14px", fontSize: 13, borderBottom: "1px solid #f7f7f7" }}>
                    <span style={{ color: "#888" }}>{k}</span>
                    <strong style={{ color: "#1a1a2e" }}>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL TAMBAH PERSONEL                                             */}
      {/* ================================================================ */}
      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="modal-box" style={{ maxWidth: 800, width: "90%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="modal-header" style={{ padding: "16px 24px", borderBottom: "1px solid #eee" }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>{t("add_personnel_new")}</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ overflowY: "auto", padding: "24px" }}>
              <form onSubmit={handleAddPersonnel}>
                <h4 style={{ margin: "0 0 16px 0", color: "#334155", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>Data Kedinasan</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                  <div className="form-group">
                    <label style={labelStyle}>NRP <span style={{ color: "red" }}>*</span></label>
                    <input type="text" style={inputStyle} value={formData.nrp} onChange={(e) => setFormData({ ...formData, nrp: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Jenis Personel</label>
                    <select style={inputStyle} value={formData.jenis_personel} onChange={(e) => setFormData({ ...formData, jenis_personel: e.target.value })}>
                      <option value="Prajurit Karier">Prajurit Karier</option>
                      <option value="PNS">PNS</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Pangkat <span style={{ color: "red" }}>*</span></label>
                    <select style={inputStyle} value={formData.pangkat_id} onChange={(e) => setFormData({ ...formData, pangkat_id: e.target.value })}>
                      <option value="">{t("select_rank")}</option>
                      {pangkatList.map((p) => (
                        <option key={p.pangkat_id} value={p.pangkat_id}>{p.nama_pangkat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Satuan Kerja <span style={{ color: "red" }}>*</span></label>
                    <select style={inputStyle} value={formData.satker_id} onChange={(e) => setFormData({ ...formData, satker_id: e.target.value })}>
                      <option value="">Pilih Satker</option>
                      {satkerList.map((s) => (
                        <option key={s.satker_id} value={s.satker_id}>{s.nama_satker}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>{t("current_position")}</label>
                    <input type="text" style={inputStyle} value={formData.jabatan_sekarang || ""} onChange={(e) => setFormData({ ...formData, jabatan_sekarang: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Status Personel</label>
                    <select style={inputStyle} value={formData.status_personel || "Aktif"} onChange={(e) => setFormData({ ...formData, status_personel: e.target.value })}>
                      <option value="Aktif">Aktif</option>
                      <option value="Cuti">Cuti</option>
                      <option value="Mutasi">Mutasi</option>
                      <option value="Pendidikan">Pendidikan</option>
                      <option value="Pensiun">Pensiun</option>
                    </select>
                  </div>

                  {formData.status_personel === 'Cuti' && (
                    <>
                      <div className="form-group">
                        <label style={labelStyle}>Cuti Mulai</label>
                        <input type="date" style={inputStyle} value={formData.cuti_mulai}
                          onChange={(e) => setFormData({ ...formData, cuti_mulai: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label style={labelStyle}>Cuti Selesai</label>
                        <input type="date" style={inputStyle} value={formData.cuti_selesai}
                          onChange={(e) => setFormData({ ...formData, cuti_selesai: e.target.value })} />
                      </div>
                    </>
                  )}

                  {formData.status_personel === 'Pendidikan' && (
                    <div className="form-group">
                      <label style={labelStyle}>Lokasi Pendidikan</label>
                      <input type="text" placeholder="Contoh: Bandung, Jawa Barat" style={inputStyle}
                        value={formData.pendidikan_lokasi || ''}
                        onChange={(e) => setFormData({ ...formData, pendidikan_lokasi: e.target.value })} />
                    </div>
                  )}

                  {formData.status_personel === 'Pensiun' && (
                    <div className="form-group">
                      <label style={labelStyle}>Mulai Pensiun</label>
                      <input type="date" style={inputStyle} value={formData.pensiun_mulai}
                        onChange={(e) => setFormData({ ...formData, pensiun_mulai: e.target.value })} />
                    </div>
                  )}

                  <div className="form-group">
                    <label style={labelStyle}>TMT Pangkat</label>
                    <input type="date" style={inputStyle} value={formData.tmt_pangkat_terakhir} onChange={(e) => setFormData({ ...formData, tmt_pangkat_terakhir: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Asal Masuk Dikma</label>
                    <input type="text" style={inputStyle} value={formData.asal_masuk_dikma || ""} onChange={(e) => setFormData({ ...formData, asal_masuk_dikma: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Angkatan Dikma</label>
                    <input type="text" style={inputStyle} value={formData.angkatan_dikma || ""} onChange={(e) => setFormData({ ...formData, angkatan_dikma: e.target.value })} />
                  </div>
                </div>

                <h4 style={{ margin: "0 0 16px 0", color: "#334155", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>Data Pribadi & Fisik</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                  <div className="form-group">
                    <label style={labelStyle}>Nama Lengkap <span style={{ color: "red" }}>*</span></label>
                    <input type="text" style={inputStyle} value={formData.nama_lengkap} onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>NIK KTP</label>
                    <input type="text" style={inputStyle} value={formData.nik_ktp || ""} onChange={(e) => setFormData({ ...formData, nik_ktp: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>NPWP</label>
                    <input type="text" style={inputStyle} value={formData.npwp || ""} onChange={(e) => setFormData({ ...formData, npwp: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Tempat Lahir</label>
                    <input type="text" style={inputStyle} value={formData.tempat_lahir} onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>{t("birth_date")}</label>
                    <input type="date" style={inputStyle} value={formData.tanggal_lahir} onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Jenis Kelamin</label>
                    <select style={inputStyle} value={formData.jenis_kelamin || ""} onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}>
                      <option value="">- Pilih -</option>
                      <option>Laki-laki</option>
                      <option>Perempuan</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Suku</label>
                    <input type="text" style={inputStyle} value={formData.suku || ""} onChange={(e) => setFormData({ ...formData, suku: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Agama</label>
                    <select style={inputStyle} value={formData.agama || ""} onChange={(e) => setFormData({ ...formData, agama: e.target.value })}>
                      <option value="">- Pilih -</option>
                      <option>Islam</option>
                      <option>Kristen</option>
                      <option>Katolik</option>
                      <option>Hindu</option>
                      <option>Buddha</option>
                      <option>Konghucu</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Golongan Darah</label>
                    <select style={inputStyle} value={formData.golongan_darah || ""} onChange={(e) => setFormData({ ...formData, golongan_darah: e.target.value })}>
                      <option value="">- Pilih -</option>
                      <option>A</option><option>B</option><option>AB</option><option>O</option>
                      <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                      <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Status Pernikahan</label>
                    <select style={inputStyle} value={formData.status_marital || ""} onChange={(e) => setFormData({ ...formData, status_marital: e.target.value })}>
                      <option value="">- Pilih -</option>
                      <option>Belum Kawin</option>
                      <option>Kawin</option>
                      <option>Cerai</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Tinggi Badan (cm)</label>
                    <input type="number" style={inputStyle} value={formData.tinggi_badan || ""} onChange={(e) => setFormData({ ...formData, tinggi_badan: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Berat Badan (kg)</label>
                    <input type="number" style={inputStyle} value={formData.berat_badan || ""} onChange={(e) => setFormData({ ...formData, berat_badan: e.target.value })} />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Foto Personel</label>
                    <input type="file" accept="image/*" style={{ ...inputStyle, padding: "7px 12px" }} onChange={(e) => setFormData({ ...formData, foto: e.target.files[0] })} />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Alamat Domisili</label>
                    <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} value={formData.alamat_domisili || ""} onChange={(e) => setFormData({ ...formData, alamat_domisili: e.target.value })} />
                  </div>
                </div>

                {/* ── RIWAYAT PENDIDIKAN ── */}
                <h4 style={{ margin: '32px 0 16px 0', color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  🎓 Riwayat Pendidikan
                  <button type="button" onClick={addPendidikan}
                    style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>
                    + Tambah
                  </button>
                </h4>
                {formPendidikan.map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 160px 36px', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                    <div>
                      {i === 0 && <label style={labelStyle}>Tahun</label>}
                      <input type="number" placeholder="2010" style={inputStyle} value={row.tahun}
                        onChange={e => { const r = [...formPendidikan]; r[i].tahun = e.target.value; setFormPendidikan(r); }} />
                    </div>
                    <div>
                      {i === 0 && <label style={labelStyle}>Nama Institusi</label>}
                      <input type="text" placeholder="Nama sekolah / institusi" style={inputStyle} value={row.nama_institusi}
                        onChange={e => { const r = [...formPendidikan]; r[i].nama_institusi = e.target.value; setFormPendidikan(r); }} />
                    </div>
                    <div>
                      {i === 0 && <label style={labelStyle}>Jenis Pendidikan</label>}
                      <select style={inputStyle} value={row.jenis_pendidikan}
                        onChange={e => { const r = [...formPendidikan]; r[i].jenis_pendidikan = e.target.value; setFormPendidikan(r); }}>
                        <option value="Militer">Militer</option>
                        <option value="Spesialisasi">Spesialisasi</option>
                        <option value="Akademik">Akademik</option>
                        <option value="Umum">Umum</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button type="button" onClick={() => removePendidikan(i)} disabled={formPendidikan.length === 1}
                        style={{ width: 36, height: 38, borderRadius: 6, border: '1px solid #fca5a5', background: '#fff1f1', color: '#ef4444', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {/* ── RIWAYAT JABATAN (TAMBAH) ── */}
                <h4 style={{ margin: '32px 0 16px 0', color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  🗂️ Riwayat Jabatan & Kepangkatan
                  <button type="button" onClick={addJabatan}
                    style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>
                    + Tambah
                  </button>
                </h4>
                <RiwayatJabatanRows rows={formJabatan} setRows={setFormJabatan} />

                <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button type="button" style={{ padding: "10px 20px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", color: "#475569", fontWeight: 500 }} onClick={() => setShowAddModal(false)}>
                    Batal
                  </button>
                  <button type="button" onClick={handleAddPersonnel} style={{ padding: "10px 20px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600, boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)" }}>
                    Simpan Data
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL EDIT PERSONEL                                               */}
      {/* ================================================================ */}
      {showEditModal && editData && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" style={{ maxWidth: 800, width: "90%", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: "16px 24px", borderBottom: "1px solid #eee" }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>Edit Data Personel</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ overflowY: "auto", padding: "24px" }}>
              <form onSubmit={handleEditPersonnel}>
                <h4 style={{ margin: "0 0 16px 0", color: "#334155", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>Data Kedinasan</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                  <div className="form-group">
                    <label style={labelStyle}>NRP</label>
                    <input type="text" disabled style={{ ...inputStyle, background: "#f1f5f9" }} value={editData.nrp} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Jenis Personel</label>
                    <select style={inputStyle} value={editData.jenis_personel || ""} onChange={(e) => setEditData({ ...editData, jenis_personel: e.target.value })}>
                      <option value="Prajurit Karier">Prajurit Karier</option>
                      <option value="PNS">PNS</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Pangkat <span style={{ color: "red" }}>*</span></label>
                    <select style={inputStyle} value={String(editData.pangkat_id || "")} onChange={(e) => setEditData({ ...editData, pangkat_id: e.target.value })}>
                      <option value="">Pilih Pangkat</option>
                      {pangkatList.map((p) => (
                        <option key={p.pangkat_id} value={String(p.pangkat_id)}>{p.nama_pangkat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Satuan Kerja <span style={{ color: "red" }}>*</span></label>
                    <select style={inputStyle} value={String(editData.satker_id || "")} onChange={(e) => setEditData({ ...editData, satker_id: e.target.value })}>
                      <option value="">Pilih Satker</option>
                      {satkerList.map((s) => (
                        <option key={s.satker_id} value={String(s.satker_id)}>{s.nama_satker}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Jabatan Sekarang</label>
                    <input type="text" style={inputStyle} value={editData.jabatan_sekarang || ""} onChange={(e) => setEditData({ ...editData, jabatan_sekarang: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Status Personel</label>
                    <select style={inputStyle} value={editData.status_personel || "Aktif"} onChange={(e) => setEditData({ ...editData, status_personel: e.target.value })}>
                      <option value="Aktif">Aktif</option>
                      <option value="Cuti">Cuti</option>
                      <option value="Mutasi">Mutasi</option>
                      <option value="Pendidikan">Pendidikan</option>
                      <option value="Pensiun">Pensiun</option>
                    </select>
                  </div>

                  {editData.status_personel === 'Cuti' && (
                    <>
                      <div className="form-group">
                        <label style={labelStyle}>Cuti Mulai</label>
                        <input type="date" style={inputStyle} value={editData.cuti_mulai || ''}
                          onChange={(e) => setEditData({ ...editData, cuti_mulai: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label style={labelStyle}>Cuti Selesai</label>
                        <input type="date" style={inputStyle} value={editData.cuti_selesai || ''}
                          onChange={(e) => setEditData({ ...editData, cuti_selesai: e.target.value })} />
                      </div>
                    </>
                  )}

                  {editData.status_personel === 'Pendidikan' && (
                    <div className="form-group">
                      <label style={labelStyle}>Lokasi Pendidikan</label>
                      <input type="text" placeholder="Contoh: Bandung, Jawa Barat" style={inputStyle}
                        value={editData.pendidikan_lokasi || ''}
                        onChange={(e) => setEditData({ ...editData, pendidikan_lokasi: e.target.value })} />
                    </div>
                  )}

                  {editData.status_personel === 'Pensiun' && (
                    <div className="form-group">
                      <label style={labelStyle}>Mulai Pensiun</label>
                      <input type="date" style={inputStyle} value={editData.pensiun_mulai || ''}
                        onChange={(e) => setEditData({ ...editData, pensiun_mulai: e.target.value })} />
                    </div>
                  )}

                  <div className="form-group">
                    <label style={labelStyle}>TMT Pangkat</label>
                    <input type="date" style={inputStyle} value={editData.tmt_pangkat_terakhir || ""} onChange={(e) => setEditData({ ...editData, tmt_pangkat_terakhir: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Asal Masuk Dikma</label>
                    <input type="text" style={inputStyle} value={editData.asal_masuk_dikma || ""} onChange={(e) => setEditData({ ...editData, asal_masuk_dikma: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Angkatan Dikma</label>
                    <input type="text" style={inputStyle} value={editData.angkatan_dikma || ""} onChange={(e) => setEditData({ ...editData, angkatan_dikma: e.target.value })} />
                  </div>
                </div>

                <h4 style={{ margin: "0 0 16px 0", color: "#334155", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>Data Pribadi & Fisik</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                  <div className="form-group">
                    <label style={labelStyle}>Nama Lengkap <span style={{ color: "red" }}>*</span></label>
                    <input type="text" style={inputStyle} value={editData.nama_lengkap || ""} onChange={(e) => setEditData({ ...editData, nama_lengkap: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>NIK KTP</label>
                    <input type="text" style={inputStyle} value={editData.nik_ktp || ""} onChange={(e) => setEditData({ ...editData, nik_ktp: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>NPWP</label>
                    <input type="text" style={inputStyle} value={editData.npwp || ""} onChange={(e) => setEditData({ ...editData, npwp: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Tempat Lahir</label>
                    <input type="text" style={inputStyle} value={editData.tempat_lahir || ""} onChange={(e) => setEditData({ ...editData, tempat_lahir: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Tanggal Lahir</label>
                    <input type="date" style={inputStyle} value={editData.tanggal_lahir || ""} onChange={(e) => setEditData({ ...editData, tanggal_lahir: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Jenis Kelamin</label>
                    <select style={inputStyle} value={editData.jenis_kelamin || ""} onChange={(e) => setEditData({ ...editData, jenis_kelamin: e.target.value })}>
                      <option value="">- Pilih -</option>
                      <option>Laki-laki</option>
                      <option>Perempuan</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Agama</label>
                    <select style={inputStyle} value={editData.agama || ""} onChange={(e) => setEditData({ ...editData, agama: e.target.value })}>
                      <option value="">- Pilih -</option>
                      <option>Islam</option>
                      <option>Kristen</option>
                      <option>Katolik</option>
                      <option>Hindu</option>
                      <option>Buddha</option>
                      <option>Konghucu</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Golongan Darah</label>
                    <select style={inputStyle} value={editData.golongan_darah || ""} onChange={(e) => setEditData({ ...editData, golongan_darah: e.target.value })}>
                      <option value="">- Pilih -</option>
                      <option>A</option><option>B</option><option>AB</option><option>O</option>
                      <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                      <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Status Pernikahan</label>
                    <select style={inputStyle} value={editData.status_marital || ""} onChange={(e) => setEditData({ ...editData, status_marital: e.target.value })}>
                      <option value="">- Pilih -</option>
                      <option>Belum Kawin</option>
                      <option>Kawin</option>
                      <option>Cerai</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Suku</label>
                    <input type="text" style={inputStyle} value={editData.suku || ""} onChange={(e) => setEditData({ ...editData, suku: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Tinggi Badan (cm)</label>
                    <input type="number" style={inputStyle} value={editData.tinggi_badan || ""} onChange={(e) => setEditData({ ...editData, tinggi_badan: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Berat Badan (kg)</label>
                    <input type="number" style={inputStyle} value={editData.berat_badan || ""} onChange={(e) => setEditData({ ...editData, berat_badan: e.target.value })} />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Alamat Domisili</label>
                    <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} value={editData.alamat_domisili || ""} onChange={(e) => setEditData({ ...editData, alamat_domisili: e.target.value })} />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Foto Saat Ini</label>
                    <div style={{ marginBottom: "12px", display: "flex", gap: "16px", alignItems: "flex-end" }}>
                      {editData.foto_baru ? (
                        <img src={URL.createObjectURL(editData.foto_baru)} alt="Preview Baru" style={{ width: "90px", height: "120px", objectFit: "cover", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                      ) : editData.foto_url ? (
                        <img
                          src={getFotoUrl(editData.foto_url)}
                          alt="Foto Saat Ini"
                          style={{ width: "90px", height: "120px", objectFit: "cover", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(editData.nama_lengkap)}&background=random`;
                          }}
                        />
                      ) : (
                        <div style={{ width: "90px", height: "120px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", border: "1px dashed #cbd5e1", fontSize: "12px", color: "#64748b", textAlign: "center" }}>
                          Belum ada foto
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Ganti Foto Personel (Biarkan kosong jika tidak mengubah)</label>
                        <input type="file" accept="image/*" style={{ ...inputStyle, padding: "7px 12px" }} onChange={(e) => setEditData({ ...editData, foto_baru: e.target.files[0] })} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── RIWAYAT PENDIDIKAN ── */}
                <h4 style={{ margin: '32px 0 16px 0', color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  🎓 Riwayat Pendidikan
                  <button type="button" onClick={addPendidikan}
                    style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>
                    + Tambah
                  </button>
                </h4>
                {formPendidikan.map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 160px 36px', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                    <div>
                      {i === 0 && <label style={labelStyle}>Tahun</label>}
                      <input type="number" placeholder="2010" style={inputStyle} value={row.tahun}
                        onChange={e => { const r = [...formPendidikan]; r[i].tahun = e.target.value; setFormPendidikan(r); }} />
                    </div>
                    <div>
                      {i === 0 && <label style={labelStyle}>Nama Institusi</label>}
                      <input type="text" placeholder="Nama sekolah / institusi" style={inputStyle} value={row.nama_institusi}
                        onChange={e => { const r = [...formPendidikan]; r[i].nama_institusi = e.target.value; setFormPendidikan(r); }} />
                    </div>
                    <div>
                      {i === 0 && <label style={labelStyle}>Jenis Pendidikan</label>}
                      <select style={inputStyle} value={row.jenis_pendidikan}
                        onChange={e => { const r = [...formPendidikan]; r[i].jenis_pendidikan = e.target.value; setFormPendidikan(r); }}>
                        <option value="Militer">Militer</option>
                        <option value="Spesialisasi">Spesialisasi</option>
                        <option value="Akademik">Akademik</option>
                        <option value="Umum">Umum</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button type="button" onClick={() => removePendidikan(i)} disabled={formPendidikan.length === 1}
                        style={{ width: 36, height: 38, borderRadius: 6, border: '1px solid #fca5a5', background: '#fff1f1', color: '#ef4444', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {/* ── RIWAYAT JABATAN (EDIT) ── */}
                <h4 style={{ margin: '32px 0 16px 0', color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  🗂️ Riwayat Jabatan & Kepangkatan
                  <button type="button" onClick={addJabatan}
                    style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>
                    + Tambah
                  </button>
                </h4>
                <RiwayatJabatanRows rows={formJabatan} setRows={setFormJabatan} />

                <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button type="button" style={{ padding: "10px 20px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", color: "#475569", fontWeight: 500 }} onClick={() => setShowEditModal(false)}>
                    Batal
                  </button>
                  <button type="button" onClick={handleEditPersonnel} style={{ padding: "10px 20px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600, boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)" }}>
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}