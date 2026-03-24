import React, { Component, useState, useEffect, useCallback } from "react";
import { FiBell, FiUser, FiCheck, FiPrinter, FiDownload, FiChevronUp, FiCalendar, FiClock, FiMapPin, FiShield, FiChevronLeft, FiX, FiLogOut, FiSettings } from "react-icons/fi";
import logoImg from '../assets/Logo_LANUD.png';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useSettings } from '../context/SettingsContext.jsx';
import "./DataDiri.css";

class DataDiriErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { this.setState({ info }); console.error("DataDiri error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="datadiri-wrapper" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12 }}>
          <div style={{ fontSize: 14, color: "#e53e3e" }}>Terjadi kesalahan saat memuat data. Silakan periksa console.</div>
          <div style={{ fontSize: 12, color: "#888", maxWidth: 380, textAlign: "center", wordBreak: "break-word" }}>{this.state.error?.toString()}</div>
          <button className="back-btn" onClick={this.props.onBack || (() => window.history.back())}><FiChevronLeft size={15} /> Kembali</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";

function authHeader() {
  return { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` };
}

function formatTgl(str) {
  if (!str) return "–";
  const d = new Date(str);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function getFotoUrl(path) {
  if (!path) return "https://via.placeholder.com/300x400?text=Tanpa+Foto";
  if (path.startsWith("http")) return path;
  return `${STORAGE_URL}/${path}`;
}

export default function DataDiri({ nrp, onNavigate, onLogout }) {
  const [personel, setPersonel] = useState(null);
  const [pendidikan, setPendidikan] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);
  const [riwayatLog, setRiwayatLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSections, setOpenSections] = useState({ identitas: true, pendidikan: true, jabatan: true });
  const [showRiwayatModal, setShowRiwayatModal] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPrivasiModal, setShowPrivasiModal] = useState(false);
  const [showBantuanModal, setShowBantuanModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [expandNotif, setExpandNotif] = useState(false);
  const { settings, t } = useSettings();

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  useEffect(() => {
    const beforePrint = () => {
      document.body.classList.add("printing-datadiri");
      document.querySelector(".app-layout")?.classList.add("printing-datadiri");
    };
    const afterPrint = () => {
      document.body.classList.remove("printing-datadiri");
      document.querySelector(".app-layout")?.classList.remove("printing-datadiri");
    };
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

  const fetchPersonel = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/personel/${nrp}`, { headers: authHeader() });
      const data = await res.json();
      if (data?.success && data?.data) {
        setPersonel(data.data);
        setPendidikan(data.data.riwayat_pendidikan || []);
        setJabatanList(data.data.riwayat_jabatan || []);
        setRiwayatLog(data.data.riwayat_pembaruan || []);
      } else {
        setError(data?.message || t("personnel_not_found"));
      }
    } catch { setError(t("error_unreachable")); }
    finally { setLoading(false); }
  }, [nrp]);

  useEffect(() => {
    if (!nrp) { setError(t("error_nrp_missing")); setLoading(false); return; }
    fetchPersonel();
    fetchNotifikasi();
  }, [nrp, fetchPersonel]);

  async function fetchNotifikasi() {
    try {
      const res = await fetch(`${API}/dashboard/notifikasi`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) { setNotifList(data.data); setUnreadCount(data.unread_count); }
    } catch (e) { console.error(e); }
  }

  function toggleSection(key) { setOpenSections((prev) => ({ ...prev, [key]: !prev[key] })); }
  function closeAll() { setShowNotif(false); setShowUserMenu(false); }

  function handleEdit() {
    setEditData({
      nama_lengkap: personel.nama_lengkap, pangkat_id: personel.pangkat_id,
      satker_id: personel.satker_id, jabatan_sekarang: personel.jabatan_sekarang,
      status_personel: personel.status_personel, tempat_lahir: personel.tempat_lahir,
      tanggal_lahir: personel.tanggal_lahir, golongan_darah: personel.golongan_darah,
      agama: personel.agama, status_marital: personel.status_marital,
      jenis_kelamin: personel.jenis_kelamin, suku: personel.suku,
      tinggi_badan: personel.tinggi_badan, berat_badan: personel.berat_badan,
      alamat_domisili: personel.alamat_domisili, nik_ktp: personel.nik_ktp,
      npwp: personel.npwp, tmt_pangkat_terakhir: personel.tmt_pangkat_terakhir,
      asal_masuk_dikma: personel.asal_masuk_dikma, angkatan_dikma: personel.angkatan_dikma,
      cuti_mulai: personel.cuti_mulai || '',
      cuti_selesai: personel.cuti_selesai || '',
      pendidikan_lokasi: personel.pendidikan_lokasi || '',
      pensiun_mulai: personel.pensiun_mulai || '',
    });
    setEditMode(true);
  }

  async function handleSaveChanges(e) {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(editData).forEach(key => { if (editData[key] !== undefined && editData[key] !== null) formData.append(key, editData[key]); });
      const res = await fetch(`${API}/personel/${nrp}`, { method: "PUT", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }, body: formData });
      const data = await res.json();
      if (data.success) { alert("Data personel berhasil diperbarui."); setEditMode(false); fetchPersonel(); }
      else alert(data.message || "Gagal memperbarui data personel.");
    } catch (err) { console.error(err); alert("Terjadi kesalahan saat memperbarui data."); }
  }

  async function handleUnduhPDF() {
    if (!personel) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.width;
    const pageH = doc.internal.pageSize.height;
    const margin = 14;
    const tgl = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

    async function toBase64(url) {
      return new Promise((resolve) => {
        const existingImg = document.querySelector(`img[src*="${personel.foto_url?.split('/').pop()}"]`);
        if (existingImg && existingImg.complete && existingImg.naturalWidth > 0) {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = existingImg.naturalWidth;
            canvas.height = existingImg.naturalHeight;
            canvas.getContext("2d").drawImage(existingImg, 0, 0);
            return resolve(canvas.toDataURL("image/jpeg"));
          } catch { /* fallback */ }
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext("2d").drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg"));
          } catch { resolve(null); }
        };
        img.onerror = () => resolve(null);
        img.src = url + (url.includes("?") ? "&" : "?") + "_cb=" + Date.now();
      });
    }

    const fotoUrl = personel.foto_url ? (personel.foto_url.startsWith("http") ? personel.foto_url : `${STORAGE_URL}/${personel.foto_url}`) : null;
    const fotoBase64 = fotoUrl ? await toBase64(fotoUrl) : null;

    let y = 14;
    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 46);
    doc.text("SISTEM INFORMASI PERSONEL TNI ANGKATAN UDARA", pageW / 2, y, { align: "center" });
    y += 5;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
    doc.text(`DISINFOLAHTAU  ·  Tanggal Cetak: ${tgl}`, pageW / 2, y, { align: "center" });
    doc.setTextColor(0);
    y += 4;
    doc.setDrawColor(26, 26, 46); doc.setLineWidth(0.4);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    const fotoX = margin, fotoY = y, fotoW = 28, fotoH = 35;
    if (fotoBase64) {
      doc.addImage(fotoBase64, "JPEG", fotoX, fotoY, fotoW, fotoH);
      doc.setDrawColor(200); doc.setLineWidth(0.2); doc.rect(fotoX, fotoY, fotoW, fotoH);
    } else {
      doc.setFillColor(230, 230, 230); doc.rect(fotoX, fotoY, fotoW, fotoH, "F");
      doc.setFontSize(7); doc.setTextColor(150);
      doc.text("Tanpa Foto", fotoX + fotoW / 2, fotoY + fotoH / 2, { align: "center" });
      doc.setTextColor(0);
    }

    const infoX = fotoX + fotoW + 6;
    let infoY = fotoY + 6;
    doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 46);
    doc.text(personel.nama_lengkap || "–", infoX, infoY);
    infoY += 5;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(80);
    doc.text(`${personel.pangkat || "–"}  ·  NRP: ${personel.nrp || "–"}  ·  ${personel.satker || "–"}`, infoX, infoY);
    infoY += 6;

    const col1X = infoX, col2X = infoX + 58, col3X = infoX + 114;
    doc.setFontSize(7); doc.setTextColor(150);
    doc.text("JABATAN SAAT INI", col1X, infoY);
    doc.text("JENIS PERSONEL", col2X, infoY);
    doc.text("TMT PANGKAT TERAKHIR", col3X, infoY);
    infoY += 4;
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 46);
    const jabLines = doc.splitTextToSize(personel.jabatan_sekarang || "–", 54);
    doc.text(jabLines, col1X, infoY);
    doc.text(personel.jenis_personel || "–", col2X, infoY);
    doc.text(formatTgl(personel.tmt_pangkat_terakhir), col3X, infoY);
    doc.setFont("helvetica", "normal"); doc.setTextColor(0);

    y = Math.max(fotoY + fotoH, infoY + jabLines.length * 5) + 4;
    doc.setDrawColor(220); doc.setLineWidth(0.3); doc.line(margin, y, pageW - margin, y);
    y += 6;

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 46);
    doc.text("Data Identitas Pribadi", margin, y);
    y += 4;

    const identitas = [
      ["Nama", personel.nama_lengkap],
      ["Pangkat", personel.pangkat],
      ["NRP", personel.nrp],
      ["Tgl Lahir", formatTgl(personel.tanggal_lahir)],
      ["Tempat Lahir", personel.tempat_lahir || "–"],
      ["Gol. Darah", personel.golongan_darah || "–"],
      ["Agama", personel.agama || "–"],
      ["Status Marital", personel.status_marital || "–"],
      ["Suku", personel.suku || "–"],
      ["Jenis Kelamin", personel.jenis_kelamin || "–"],
      ["Tinggi Badan", personel.tinggi_badan ? `${personel.tinggi_badan} cm` : "–"],
      ["Berat Badan", personel.berat_badan ? `${personel.berat_badan} kg` : "–"],
      ["Alamat", personel.alamat_domisili || "–"],
      ["NIK KTP", personel.nik_ktp || "–"],
      ["NPWP", personel.npwp || "–"],
      ["Asal Masuk Dikma", personel.asal_masuk_dikma || "–"],
      ["Angkatan Dikma", personel.angkatan_dikma || "–"],
    ];

    const half = Math.ceil(identitas.length / 2);
    const colAX = margin;
    const colBX = pageW / 2 + 2;
    const colW = pageW / 2 - margin - 4;
    const labelW = 36;
    const rowH = 6;

    doc.setFontSize(9);
    identitas.forEach((item, idx) => {
      const isRight = idx >= half;
      const rowIdx = isRight ? idx - half : idx;
      const x = isRight ? colBX : colAX;
      const rowY = y + rowIdx * rowH;
      doc.setFont("helvetica", "normal"); doc.setTextColor(120);
      doc.text(item[0], x, rowY);
      doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 46);
      const valLines = doc.splitTextToSize(String(item[1] ?? "–"), colW - labelW);
      doc.text(valLines, x + labelW, rowY);
      doc.setDrawColor(240); doc.setLineWidth(0.1);
      doc.line(x, rowY + 1.8, x + colW, rowY + 1.8);
    });

    y += half * rowH + 6;
    doc.setDrawColor(220); doc.setLineWidth(0.3); doc.line(margin, y, pageW - margin, y);
    y += 6;

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 46);
    doc.text("Riwayat Pendidikan", margin, y);
    y += 2;

    if (pendidikan.length === 0) {
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(150);
      doc.text("Belum ada data pendidikan.", margin, y + 5);
      y += 12;
    } else {
      autoTable(doc, {
        startY: y,
        theme: "grid",
        head: [["TAHUN", "NAMA INSTITUSI", "JENIS"]],
        body: pendidikan.map(p => [p.tahun || "–", p.nama_institusi || "–", p.jenis_pendidikan || "–"]),
        headStyles: { fillColor: [245, 245, 245], textColor: [100, 100, 100], fontStyle: "bold", fontSize: 8 },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
        columnStyles: { 0: { cellWidth: 18 }, 2: { cellWidth: 30 } },
        styles: { cellPadding: 2 },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 6;
    }

    if (y > pageH - 55) { doc.addPage(); y = 16; }

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 46);
    doc.text("Riwayat Jabatan & Kepangkatan", margin, y);
    y += 2;

    if (jabatanList.length === 0) {
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(150);
      doc.text("Belum ada data jabatan.", margin, y + 5);
      y += 12;
    } else {
      autoTable(doc, {
        startY: y,
        theme: "grid",
        head: [["NO", "NAMA JABATAN", "PANGKAT", "PERIODE"]],
        body: jabatanList.map((j, i) => [
          i + 1, j.nama_jabatan || "–", j.pangkat_saat_itu || "–",
          `${formatTgl(j.tmt_mulai)} – ${j.tmt_selesai ? formatTgl(j.tmt_selesai) : "Sekarang"}`,
        ]),
        headStyles: { fillColor: [245, 245, 245], textColor: [100, 100, 100], fontStyle: "bold", fontSize: 8 },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
        columnStyles: { 0: { cellWidth: 10 }, 2: { cellWidth: 28 }, 3: { cellWidth: 52 } },
        styles: { cellPadding: 2 },
        margin: { left: margin, right: margin },
      });
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(200); doc.setLineWidth(0.3);
      doc.line(margin, pageH - 14, pageW - margin, pageH - 14);
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(130);
      doc.text("© 2026 DISINFOLAHTAU – Markas Besar TNI Angkatan Udara", pageW / 2, pageH - 9, { align: "center" });
      doc.setFont("helvetica", "bold"); doc.setTextColor(60);
      doc.text("Dokumen ini bersifat RAHASIA", pageW / 2, pageH - 5, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setTextColor(150);
      doc.text(`${i} / ${totalPages}`, pageW - margin, pageH - 5, { align: "right" });
    }

    doc.save(`Data_Personel_${personel.nrp}.pdf`);
  }

  const eduClass = { Militer: "edu-militer", Spesialisasi: "edu-spesialisasi", Umum: "edu-umum", Akademik: "edu-umum" };

  if (loading) return (
    <div className="datadiri-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: 14, color: "#aaa" }}>
      Memuat data personel...
    </div>
  );

  if (error) return (
    <div className="datadiri-wrapper" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12 }}>
      <div style={{ fontSize: 14, color: "#e53e3e" }}>{error}</div>
      <button className="back-btn" onClick={() => onNavigate("personnel")}><FiChevronLeft size={15} /> {t("back")}</button>
    </div>
  );

  if (!loading && !error && !personel) return (
    <div className="datadiri-wrapper" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12 }}>
      <div style={{ fontSize: 14, color: "#555" }}>{t("personnel_not_found")}</div>
      <button className="back-btn" onClick={() => onNavigate("personnel")}><FiChevronLeft size={15} /> {t("back")}</button>
    </div>
  );

  return (
    <div className="datadiri-wrapper" onClick={closeAll}>
      {/* TOPBAR */}
      <header className="topbar" onClick={(e) => e.stopPropagation()}>
        <div className="topbar-brand">
          <img src={logoImg} alt="Logo TNI AU" className="topbar-logo-img" />
        </div>
        <div className="topbar-right">
          <button className="notif-btn" onClick={() => { setShowNotif((v) => !v); setShowUserMenu(false); setExpandNotif(false); }}>
            <FiBell size={20} />
            {unreadCount > 0 && <div className="notif-badge" />}
          </button>
          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                {t("notifications")}{" "}
                <span onClick={() => { setShowNotif(false); setExpandNotif(false); }}>{t("close")}</span>
              </div>
              <div className="notif-list" style={{ maxHeight: expandNotif ? "400px" : "250px", overflowY: "auto" }}>
                {notifList.slice(0, expandNotif ? notifList.length : 2).map((n, i) => (
                  <div className="notif-item" key={i}>
                    <div className={`notif-item-dot ${!n.is_dibaca ? "unread" : "read"}`} />
                    <div className="notif-item-text">
                      <div className="notif-item-title">{n.judul}</div>
                      <div className="notif-item-desc">{n.isi_notifikasi}</div>
                    </div>
                  </div>
                ))}
              </div>
              {!expandNotif && notifList.length > 2 && (
                <div className="notif-dropdown-footer" style={{ cursor: "pointer" }} onClick={() => setExpandNotif(true)}>
                  {t("view_all_notifications")}
                </div>
              )}
            </div>
          )}
          <div className="user-info" onClick={() => { setShowUserMenu((v) => !v); setShowNotif(false); }}>
            <div className="user-text">
              <div className="user-name">{admin.nama_lengkap || "Admin"}</div>
              <div className="user-role">{admin.pangkat || ""}</div>
            </div>
            {admin.foto_url ? (
              <img src={getFotoUrl(admin.foto_url)} className="user-avatar" alt="Admin" style={{ objectFit: "cover" }}
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.nama_lengkap || "Admin")}&background=random`; }} />
            ) : (
              <div className="user-avatar av-user" />
            )}
          </div>
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                {admin.foto_url ? (
                  <img src={getFotoUrl(admin.foto_url)} className="user-dropdown-avatar" alt="Admin" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="user-dropdown-avatar" style={{ background: "#8b6f47" }} />
                )}
                <div>
                  <div className="user-dropdown-name">{admin.nama_lengkap}</div>
                  <div className="user-dropdown-role">{admin.pangkat} · {admin.satuan_kerja}</div>
                </div>
              </div>
              <button className="user-dropdown-item" onClick={() => { onNavigate("profilakun"); closeAll(); }}><FiUser size={14} /> Profil Akun</button>
              <button className="user-dropdown-item" onClick={() => { onNavigate("pengaturan"); closeAll(); }}><FiSettings size={14} /> Pengaturan</button>
              <div className="user-dropdown-sep" />
              <button className="user-dropdown-item danger" onClick={onLogout}><FiLogOut size={14} /> {t("logout")}</button>
            </div>
          )}
        </div>
      </header>

      {/* HEADER BAR */}
      <div className="dd-header-bar">
        <div className="dd-header-left">
          <button className="back-btn" onClick={() => onNavigate("personnel")}><FiChevronLeft size={15} /> {t("back")}</button>
          <span className="dd-divider">|</span>
          <div className="dd-header-title"><FiUser size={16} /> {t("personnel_detail")}</div>
          {personel.status_personel === "Aktif" && (
            <div className="dd-verified"><FiCheck size={14} style={{ color: "#22c55e" }} /> {t("verified")}</div>
          )}
        </div>
        <div className="dd-header-actions">
          <button className="action-btn" onClick={() => window.print()}><FiPrinter size={14} /> {t("print")}</button>
          <button className="action-btn primary" onClick={handleUnduhPDF}><FiDownload size={14} /> {t("download_pdf")}</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="dd-content">
        <div className="print-header">
          <h1>SISTEM INFORMASI PERSONEL TNI ANGKATAN UDARA</h1>
          <p>DISINFOLAHTAU · Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>

        <div>
          {/* Profile Card */}
          <div className="profile-card">
            <img src={getFotoUrl(personel.foto_url)} className="profile-photo av-user" alt={`Foto ${personel.nama_lengkap}`}
              onError={(e) => { e.target.src = "https://via.placeholder.com/300x400?text=Tanpa+Foto"; }} />
            <div className="profile-info">
              <div className="profile-name">{personel.nama_lengkap}</div>
              <div className="profile-meta">
                <span>{personel.pangkat}</span><span className="profile-meta-sep">·</span>
                <span>NRP: {personel.nrp}</span><span className="profile-meta-sep">·</span>
                <span>{personel.satker}</span>
                <button className="profile-status-btn" style={{ marginLeft: "auto" }}>{personel.status_personel} · Dinas Dalam</button>
              </div>
              <div className="profile-details-grid">
                <div><div className="detail-field-label">Jabatan Saat Ini</div><div className="detail-field-value">{personel.jabatan_sekarang || "–"}</div></div>
                <div><div className="detail-field-label">Jenis Personel</div><div className="detail-field-value">{personel.jenis_personel}</div></div>
                <div><div className="detail-field-label">TMT Pangkat Terakhir</div><div className="detail-field-value">{formatTgl(personel.tmt_pangkat_terakhir)}</div></div>
              </div>
            </div>
          </div>

          {/* ── Data Identitas Pribadi ── */}
          <div className="section-card">
            <div className="section-header" onClick={() => toggleSection("identitas")}>
              <div className="section-header-title"><FiUser size={15} /> Data Identitas Pribadi</div>
              <span className={`section-chevron ${openSections.identitas ? "" : "collapsed"}`}><FiChevronUp size={16} /></span>
            </div>
            {openSections.identitas && (
              <div className="section-body">
                {editMode ? (
                  <form onSubmit={handleSaveChanges}>
                    <div className="identity-grid">
                      {[
                        ["Nama Lengkap", "nama_lengkap", "text"],
                        ["Tempat Lahir", "tempat_lahir", "text"],
                        ["Tanggal Lahir", "tanggal_lahir", "date"],
                        ["Golongan Darah", "golongan_darah", "text"],
                        ["Agama", "agama", "text"],
                        ["Status Marital", "status_marital", "text"],
                        ["Suku", "suku", "text"],
                        ["Jenis Kelamin", "jenis_kelamin", "text"],
                        ["Tinggi Badan", "tinggi_badan", "number"],
                        ["Berat Badan", "berat_badan", "number"],
                        ["Alamat Domisili", "alamat_domisili", "text"],
                        ["NIK KTP", "nik_ktp", "text"],
                        ["NPWP", "npwp", "text"],
                        ["Asal Masuk Dikma", "asal_masuk_dikma", "text"],
                        ["Angkatan Dikma", "angkatan_dikma", "text"],
                        ...(editData.status_personel === 'Cuti' ? [
                          ["Cuti Mulai", "cuti_mulai", "date"],
                          ["Cuti Selesai", "cuti_selesai", "date"],
                        ] : []),
                        ...(editData.status_personel === 'Pendidikan' ? [
                          ["Lokasi Pendidikan", "pendidikan_lokasi", "text"],
                        ] : []),
                        ...(editData.status_personel === 'Pensiun' ? [
                          ["Mulai Pensiun", "pensiun_mulai", "date"],
                        ] : []),
                      ].map(([label, key, type]) => (
                        <div className="identity-row" key={key}>
                          <span className="identity-label">{label}</span>
                          <input type={type} value={editData[key] || ""} onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                            style={{ flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                      <button type="button" onClick={() => setEditMode(false)} style={{ padding: "8px 16px", border: "1px solid #ddd", borderRadius: "4px", background: "#fff", cursor: "pointer" }}>Batal</button>
                      <button type="submit" style={{ padding: "8px 16px", border: "none", borderRadius: "4px", background: "#2563eb", color: "#fff", cursor: "pointer" }}>Simpan Perubahan</button>
                    </div>
                  </form>
                ) : (
                  <div className="identity-grid">
                    {/* ── Kolom kiri: data dasar ── */}
                    {[
                      ["Nama", personel.nama_lengkap],
                      ["Pangkat", personel.pangkat],
                      ["NRP", personel.nrp],
                      ["Tanggal Lahir", formatTgl(personel.tanggal_lahir)],
                      ["Tempat Lahir", personel.tempat_lahir || "–"],
                      ["Golongan Darah", personel.golongan_darah || "–"],
                      ["Agama", personel.agama || "–"],
                      ["Status Marital", personel.status_marital || "–"],
                      ["Suku", personel.suku || "–"],
                      ["Jenis Kelamin", personel.jenis_kelamin || "–"],
                      ["Tinggi Badan", personel.tinggi_badan ? personel.tinggi_badan + " cm" : "–"],
                      ["Berat Badan", personel.berat_badan ? personel.berat_badan + " kg" : "–"],
                      ["Alamat Domisili", personel.alamat_domisili || "–"],
                      // ── 4 field yang sebelumnya tidak ditampilkan ──
                      ["NIK KTP", personel.nik_ktp || "–"],
                      ["NPWP", personel.npwp || "–"],
                      ["Asal Masuk Dikma", personel.asal_masuk_dikma || "–"],
                      ["Angkatan Dikma", personel.angkatan_dikma || "–"],
                      ...(personel.status_personel === 'Cuti' ? [
                        ["Cuti Mulai", formatTgl(personel.cuti_mulai)],
                        ["Cuti Selesai", formatTgl(personel.cuti_selesai)],
                      ] : []),
                      ...(personel.status_personel === 'Pendidikan' ? [
                        ["Lokasi Pendidikan", personel.pendidikan_lokasi || "–"],
                      ] : []),
                      ...(personel.status_personel === 'Pensiun' ? [
                        ["Mulai Pensiun", formatTgl(personel.pensiun_mulai)],
                      ] : []),
                    ].map(([label, value]) => (
                      <div className="identity-row" key={label}>
                        <span className="identity-label">{label}</span>
                        <span className="identity-value">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Riwayat Pendidikan ── */}
          <div className="section-card">
            <div className="section-header" onClick={() => toggleSection("pendidikan")}>
              <div className="section-header-title">🎓 Riwayat Pendidikan</div>
              <span className={`section-chevron ${openSections.pendidikan ? "" : "collapsed"}`}><FiChevronUp size={16} /></span>
            </div>
            {openSections.pendidikan && (
              <div className="section-body">
                {pendidikan.length === 0 ? (
                  <div style={{ padding: "16px", fontSize: 13, color: "#aaa" }}>Belum ada data pendidikan.</div>
                ) : (
                  <table className="edu-table">
                    <thead><tr><th>TAHUN</th><th>NAMA INSTITUSI</th><th>JENIS</th></tr></thead>
                    <tbody>
                      {pendidikan.map((p, i) => (
                        <tr key={i}>
                          <td>{p.tahun}</td>
                          <td>{p.nama_institusi}</td>
                          <td><span className={`edu-type-badge ${eduClass[p.jenis_pendidikan] || "edu-umum"}`}>{p.jenis_pendidikan}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* ── Riwayat Jabatan ── */}
          <div className="section-card">
            <div className="section-header" onClick={() => toggleSection("jabatan")}>
              <div className="section-header-title">🗂️ Riwayat Jabatan & Kepangkatan</div>
              <span className={`section-chevron ${openSections.jabatan ? "" : "collapsed"}`}><FiChevronUp size={16} /></span>
            </div>
            {openSections.jabatan && (
              <div className="section-body">
                {jabatanList.length === 0 ? (
                  <div style={{ padding: "16px", fontSize: 13, color: "#aaa" }}>Belum ada data jabatan.</div>
                ) : (
                  <div className="jabatan-list">
                    {jabatanList.map((j, i) => (
                      <div className="jabatan-item" key={i}>
                        <div className="jabatan-num">{i + 1}</div>
                        <div className="jabatan-detail">
                          <div className="jabatan-name">{j.nama_jabatan}</div>
                          <div className="jabatan-rank">{j.pangkat_saat_itu || "–"}</div>
                        </div>
                        <div className="jabatan-period">
                          <FiCalendar size={12} /> {formatTgl(j.tmt_mulai)} – {j.tmt_selesai ? formatTgl(j.tmt_selesai) : "Sekarang"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="security-note">
            <div className="security-note-icon">ℹ️</div>
            <div>
              <div className="security-note-title">Informasi Keamanan Data</div>
              <div className="security-note-text">Seluruh data yang ditampilkan merupakan data otentik dari sistem database personel pusat. Setiap perubahan hanya dapat dilakukan melalui otoritas admin Satker terkait dan divalidasi oleh Disminpersau.</div>
            </div>
          </div>

          <div className="print-footer">
            © 2026 DISINFOLAHTAU – Markas Besar TNI Angkatan Udara
            <strong>Dokumen ini bersifat RAHASIA</strong>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="riwayat-card">
            <div className="riwayat-title">{t("update_history_title")}</div>
            <div className="riwayat-sub">{t("update_activity_log")}</div>
            <div className="riwayat-list">
              {riwayatLog.slice(0, 3).map((r, i) => (
                <div className="riwayat-item" key={i}>
                  <div className="riwayat-dot" />
                  <div className="riwayat-detail">
                    <div className="riwayat-time">{new Date(r.timestamp).toLocaleString("id-ID")}</div>
                    <div className="riwayat-name">{r.deskripsi_aksi}</div>
                    <div className="riwayat-by">{t("by")}: {r.oleh || "Sistem"}</div>
                  </div>
                </div>
              ))}
              {riwayatLog.length === 0 && <div style={{ padding: "12px", fontSize: 13, color: "#aaa" }}>{t("no_history")}</div>}
            </div>
            <button className="lihat-riwayat" onClick={() => setShowRiwayatModal(true)}>{t("view_all_updates")} <FiClock size={13} /></button>
          </div>

          <div className="lokasi-card">
            <div className="lokasi-label"><FiMapPin size={12} /> Lokasi Penugasan</div>
            <div className="lokasi-name">{personel.satker}</div>
            <div className="lokasi-city">{personel.lokasi_satker || "–"}</div>
            <div className="lokasi-fields">
              <div className="lokasi-field">
                <span className="lokasi-field-label">Kode Satker:</span>
                <span className="lokasi-field-value">{personel.kode_satker || "–"}</span>
              </div>
              <div className="lokasi-field">
                <span className="lokasi-field-label">Otentikasi:</span>
                <span className="secure-badge"><FiShield size={12} /> Secure Channel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="page-footer">
        <span>{`© 2026 DISINFOLAHTAU – ${t("app_title")}`}</span>
        <div className="footer-links">
          <a onClick={() => setShowPrivasiModal(true)}>{t("privacy_policy")}</a>
          <a onClick={() => setShowBantuanModal(true)}>{t("it_support")}</a>
        </div>
      </footer>

      {/* MODAL: Semua Riwayat */}
      {showRiwayatModal && (
        <div className="modal-overlay" onClick={() => setShowRiwayatModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">{t("all_update_history")}<button className="modal-close" onClick={() => setShowRiwayatModal(false)}><FiX size={18} /></button></div>
            <div className="modal-body">
              {riwayatLog.length === 0 ? <div style={{ fontSize: 13, color: "#aaa", padding: 8 }}>{t("no_history")}</div> : (
                riwayatLog.map((r, i) => (
                  <div className="modal-riwayat-item" key={i}>
                    <div className="modal-riwayat-dot" />
                    <div>
                      <div className="modal-riwayat-date">{new Date(r.timestamp).toLocaleString("id-ID")}</div>
                      <div className="modal-riwayat-title">{r.deskripsi_aksi}</div>
                      <div className="modal-riwayat-by">Oleh: {r.oleh || "Sistem"}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showPrivasiModal && (
        <div className="modal-overlay" onClick={() => setShowPrivasiModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Kebijakan Privasi <button className="modal-close" onClick={() => setShowPrivasiModal(false)}><FiX size={18} /></button></div>
            <div className="modal-body"><p style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>Sistem DISINFOLAHTAU berkomitmen menjaga kerahasiaan seluruh data personel TNI AU. Data bersifat rahasia negara.</p></div>
          </div>
        </div>
      )}

      {showBantuanModal && (
        <div className="modal-overlay" onClick={() => setShowBantuanModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Bantuan IT <button className="modal-close" onClick={() => setShowBantuanModal(false)}><FiX size={18} /></button></div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden" }}>
                {[["Helpdesk", "disinfolahtau@tniau.mil.id"], ["Telepon", "(021) 800-1234"], ["Jam Layanan", "Senin – Jumat, 08:00 – 17:00 WIB"], ["Darurat 24 Jam", "+62 812-0000-1234"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 14px", fontSize: 13, borderBottom: "1px solid #f7f7f7" }}>
                    <span style={{ color: "#888" }}>{k}</span><strong style={{ color: "#1a1a2e" }}>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
