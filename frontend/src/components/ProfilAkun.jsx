import { useState, useEffect } from "react";
import { FiEdit2, FiUser, FiMail, FiPhone, FiShield, FiLock, FiClock, FiMonitor, FiChevronRight, FiX, FiSave } from "react-icons/fi";
import { RiShieldCheckLine, RiVerifiedBadgeLine } from "react-icons/ri";
import { MdOutlineCamera } from "react-icons/md";
import { HiOutlineBriefcase } from "react-icons/hi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useSettings } from '../context/SettingsContext.jsx';
import "./ProfilAkun.css";

const API = "http://localhost:8000/api";

function authHeader() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

function formatWaktu(str) {
  if (!str) return "–";
  const d = new Date(str);
  return (
    d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
}

const roleLabel = {
  super_admin: "Super Admin",
  admin: "Admin",
  operator: "Operator",
};

export default function ProfilAkun({ adminData }) {
  const [admin, setAdmin] = useState(adminData || JSON.parse(localStorage.getItem("admin") || "{}"));
  const [sesiList, setSesiList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [showSandiModal, setShowSandiModal] = useState(false);
  const [showPrivasiModal, setShowPrivasiModal] = useState(false);
  const [showBantuanModal, setShowBantuanModal] = useState(false);
  const [showRiwayatModal, setShowRiwayatModal] = useState(false);
  const [sandiForm, setSandiForm] = useState({
    password_lama: "",
    password_baru: "",
    password_baru_confirmation: "",
  });
  const [sandiMsg, setSandiMsg] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const { settings, t } = useSettings();

  useEffect(() => {
    fetchProfile();
    fetchSesi();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch(`${API}/profile`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) {
        setAdmin(data.data);
        setEditData({
          nama_lengkap: data.data.nama_lengkap,
          email_dinas: data.data.email_dinas || "",
          nomor_telepon: data.data.nomor_telepon || "",
          jabatan_struktural: data.data.jabatan_struktural || "",
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchSesi() {
    try {
      const res = await fetch(`${API}/profile/sesi`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) setSesiList(data.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveProfile() {
    try {
      const res = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMsg(t("profile_saved_success"));
        setEditMode(false);
        fetchProfile();
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch {
      setSaveMsg("Gagal menyimpan.");
    }
  }

  async function handleUploadFoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setSaveMsg("❌ Gagal: File harus berupa jpeg, png, atau jpg.");
      return;
    }

    const objectURL = URL.createObjectURL(file);
    const oldFotoUrl = admin.foto_url;
    setAdmin((prev) => ({ ...prev, foto_url: objectURL }));

    const formData = new FormData();
    formData.append("foto", file);

    try {
      const res = await fetch(`${API}/profile/foto`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaveMsg("✅ Foto profil berhasil diperbarui");

        const updatedAdmin = { ...admin, foto_url: data.foto_url };
        if (objectURL) {
          const reader = new FileReader();
          reader.onloadend = () => {
            updatedAdmin.foto_base64 = reader.result;
            setAdmin(updatedAdmin);
          };
          fetch(objectURL)
            .then((r) => r.blob())
            .then((blob) => {
              reader.readAsDataURL(blob);
            });
        } else {
          setAdmin(updatedAdmin);
        }

        const currAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
        currAdmin.foto_url = data.foto_url;
        localStorage.setItem("admin", JSON.stringify(currAdmin));

        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        const errorDetail =
          data.errors?.foto?.[0] || data.message || "Format file tidak didukung";
        setSaveMsg(`❌ Gagal: ${errorDetail}`);
        setAdmin((prev) => ({ ...prev, foto_url: oldFotoUrl }));
      }
    } catch (err) {
      setSaveMsg("❌ Kesalahan koneksi server.");
      setAdmin((prev) => ({ ...prev, foto_url: oldFotoUrl }));
    } finally {
      e.target.value = "";
    }
  }

  async function handleGantiSandi(e) {
    e.preventDefault();
    setSandiMsg("");
    try {
      const res = await fetch(`${API}/profile/ganti-password`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify(sandiForm),
      });
      const data = await res.json();
      if (data.success) {
        setSandiMsg("✅ " + data.message);
        setSandiForm({
          password_lama: "",
          password_baru: "",
          password_baru_confirmation: "",
        });
        setTimeout(() => setShowSandiModal(false), 2000);
      } else {
        setSandiMsg("❌ " + (data.message || t("password_change_failed")));
      }
    } catch {
      setSandiMsg("❌ Tidak dapat terhubung ke server.");
    }
  }

  async function handlePutusSesi(sessionId) {
    if (!window.confirm(t("sesi_putus_confirm"))) return;
    try {
      const res = await fetch(`${API}/profile/sesi/${sessionId}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMsg(t("sesi_putus_success"));
        fetchSesi();
        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        setSaveMsg(data.message || t("sesi_putus_error"));
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch {
      setSaveMsg(t("sesi_putus_connection_error"));
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  async function toggle2FA() {
    const newState = !admin.is_2fa_aktif;
    try {
      const res = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify({ is_2fa_aktif: newState }),
      });
      const data = await res.json();
      if (data.success) {
        setAdmin({ ...admin, is_2fa_aktif: newState });
        setSaveMsg(newState ? t("2fa_enabled") : t("2fa_disabled"));
        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        setSaveMsg(t("2fa_toggle_error"));
      }
    } catch {
      setSaveMsg(t("2fa_toggle_connection_error"));
    }
  }

  async function exportPDF() {
    let currentAdmin = admin;
    if (!admin.foto_base64 && admin.foto_url) {
      try {
        const resp = await fetch(`${API}/profile`, { headers: authHeader() });
        const profileData = await resp.json();
        if (profileData.success) {
          currentAdmin = profileData.data;
          setAdmin(currentAdmin);
        }
      } catch (err) {
        console.warn("Failed to refresh profile for PDF embed", err);
      }
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 14;

    async function imgUrlToBase64(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          try {
            resolve(canvas.toDataURL("image/jpeg"));
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = reject;
        img.src = url;
      });
    }

    let photoAdded = false;
    const imageSource = currentAdmin.foto_base64 || currentAdmin.foto_url;
    if (imageSource) {
      try {
        const base64 = imageSource.startsWith("data:")
          ? imageSource
          : await imgUrlToBase64(imageSource);
        const imgProps = doc.getImageProperties(base64);
        const pdfWidth = 30;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const x = (doc.internal.pageSize.getWidth() - pdfWidth) / 2;
        doc.addImage(base64, imgProps.fileType || "JPEG", x, margin, pdfWidth, pdfHeight);
        photoAdded = true;
      } catch (e) {
        console.warn("Could not embed profile photo in PDF:", e);
      }
    }

    if (currentAdmin.foto_url && !photoAdded) {
      const placeholderWidth = 30;
      const placeholderHeight = 30;
      const x = (doc.internal.pageSize.getWidth() - placeholderWidth) / 2;
      doc.setDrawColor(150);
      doc.rect(x, margin, placeholderWidth, placeholderHeight);
      doc.setFontSize(8);
      doc.text(
        "Foto tidak tersedia",
        doc.internal.pageSize.getWidth() / 2,
        margin + placeholderHeight / 2 + 3,
        { align: "center" }
      );
      photoAdded = true;
    }

    const titleY = margin + (photoAdded ? 30 + 6 : 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Data Profil Administrator", doc.internal.pageSize.getWidth() / 2, titleY, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Waktu Cetak: ${new Date().toLocaleString("id-ID")}`,
      doc.internal.pageSize.getWidth() / 2,
      titleY + 6,
      { align: "center" }
    );

    const fields = [
      ["Nama Lengkap", currentAdmin.nama_lengkap || "-"],
      ["NRP", currentAdmin.nrp || "-"],
      ["Email Dinas", currentAdmin.email_dinas || "-"],
      ["Nomor Telepon", currentAdmin.nomor_telepon || "-"],
      ["Pangkat / Korps", currentAdmin.pangkat || "-"],
      ["Satuan Kerja", currentAdmin.satuan_kerja || "-"],
      ["Jabatan Struktural", currentAdmin.jabatan_struktural || "-"],
      ["Peran Sistem", roleLabel[currentAdmin.role_sistem] || currentAdmin.role_sistem || "-"],
      [t("twofa_status_label"), currentAdmin.is_2fa_aktif ? t("active") : t("inactive")],
    ];

    let y = titleY + 12;
    const labelX = margin;
    const colonX = labelX + 45;
    const valueX = labelX + 50;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    fields.forEach(([label, value]) => {
      doc.text(label, labelX, y);
      doc.text(":", colonX, y);
      doc.text(value.toString(), valueX, y);
      y += 7;
    });

    doc.setLineWidth(0.3);
    doc.line(margin, y + 2, doc.internal.pageSize.getWidth() - margin, y + 2);

    doc.save(`Profil_Admin_${admin.nrp || "Export"}.pdf`);
  }

  return (
    <div className="profil-wrapper">
      <div className="profil-content">

        {/* ── PAGE TITLE ── */}
        <div className="profil-page-title">
          <div className="profil-page-title-text">
            <h1>{t("profile_title")}</h1>
            <p>{t("profile_desc")}</p>
          </div>
          {!editMode ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="edit-profil-btn"
                style={{ background: "#fff", color: "#1a1a2e", border: "1px solid #ddd" }}
                onClick={exportPDF}
              >
                {t("profile_export_pdf")}
              </button>
              <button className="edit-profil-btn" onClick={() => setEditMode(true)}>
                <FiEdit2 size={15} /> {t("edit_profile")}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="edit-profil-btn" onClick={handleSaveProfile}>
                <FiSave size={15} /> {t("save")}
              </button>
              <button
                className="edit-profil-btn"
                style={{ background: "#eee", color: "#555" }}
                onClick={() => setEditMode(false)}
              >
                {t("cancel")}
              </button>
            </div>
          )}
        </div>

        {/* ── SAVE MESSAGE ── */}
        {saveMsg && (
          <div
            style={{
              background: saveMsg.includes("❌") ? "#ffebee" : "#e8f5e9",
              border: `1px solid ${saveMsg.includes("❌") ? "#ef9a9a" : "#a5d6a7"}`,
              color: saveMsg.includes("❌") ? "#c62828" : "#2e7d32",
              padding: "10px 16px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {saveMsg}
          </div>
        )}

        {/* ── LEFT COLUMN ── */}
        <div>
          <div className="left-card">
            <div className="profile-photo-area">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar-circle">
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#8b6f47",
                      backgroundImage: admin.foto_url ? `url(${admin.foto_url})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </div>
                <label
                  htmlFor="upload-foto-input"
                  className="camera-btn"
                  style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <MdOutlineCamera size={11} color="white" />
                </label>
                <input
                  id="upload-foto-input"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  style={{ display: "none" }}
                  onChange={handleUploadFoto}
                />
              </div>
            </div>

            <div className="left-card-body">
              <div className="left-name">{admin.nama_lengkap}</div>
              <div className="left-meta">
                <span>{admin.pangkat}</span>
                <span className="left-meta-sep">•</span>
                <span>NRP: {admin.nrp}</span>
              </div>
              <div className="left-fields">
                <div className="left-field">
                  <div className="left-field-icon">
                    <HiOutlineBriefcase size={15} />
                  </div>
                  <div>
                    <div className="left-field-label">Satuan</div>
                    <div className="left-field-value">{admin.satuan_kerja}</div>
                  </div>
                </div>
                <div className="left-field">
                  <div className="left-field-icon">
                    <FiShield size={15} />
                  </div>
                  <div>
                    <div className="left-field-label">Peran Sistem</div>
                    <div className="left-field-value" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {roleLabel[admin.role_sistem] || admin.role_sistem}
                      {admin.status_verifikasi === "terverifikasi" && (
                        <span className="verified-badge">
                          <RiVerifiedBadgeLine size={11} /> {t("verified")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="terakhir-aktif">
                <div className="terakhir-aktif-label">{t("last_active")}</div>
                <div className="terakhir-aktif-val">
                  <FiClock size={13} /> {formatWaktu(admin.terakhir_aktif)}
                </div>
              </div>
            </div>
          </div>

          <div className="security-card">
            <div className="security-card-title">
              <FiLock size={14} /> {t("security_status")}
            </div>
            <div className="twofa-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="twofa-icon">
                  <FiLock size={15} />
                </div>
                <div className="twofa-label">
                  {admin.is_2fa_aktif ? t("2fa_active") : t("2fa_inactive")}
                </div>
              </div>
              <button
                onClick={toggle2FA}
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  borderRadius: 6,
                  fontWeight: 600,
                  border: admin.is_2fa_aktif ? "1px solid #c62828" : "1px solid #2e7d32",
                  background: admin.is_2fa_aktif ? "#ffebee" : "#e8f5e9",
                  color: admin.is_2fa_aktif ? "#c62828" : "#2e7d32",
                  cursor: "pointer",
                }}
              >
                {admin.is_2fa_aktif ? t("deactivate") : t("activate")}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="right-col">

          {/* Basic Info */}
          <div className="section-card">
            <div className="section-card-title">{t("basic_info_contact")}</div>
            <div className="info-grid">
              <div className="info-cell">
                <div className="info-cell-label">
                  <FiUser size={13} /> {t("profile_full_name")}
                </div>
                {editMode ? (
                  <input
                    className="info-input"
                    value={editData.nama_lengkap}
                    onChange={(e) => setEditData({ ...editData, nama_lengkap: e.target.value })}
                  />
                ) : (
                  <div className="info-cell-value">{admin.nama_lengkap}</div>
                )}
              </div>
              <div className="info-cell">
                <div className="info-cell-label">
                  <RiShieldCheckLine size={13} /> NRP
                </div>
                <div className="info-cell-value">{admin.nrp}</div>
              </div>
              <div className="info-cell" style={{ borderTop: "1px solid #f5f5f5" }}>
                <div className="info-cell-label">
                  <FiMail size={13} /> {t("profile_email_dinas")}
                </div>
                {editMode ? (
                  <input
                    className="info-input"
                    value={editData.email_dinas}
                    onChange={(e) => setEditData({ ...editData, email_dinas: e.target.value })}
                  />
                ) : (
                  <div className="info-cell-value">{admin.email_dinas || "–"}</div>
                )}
              </div>
              <div className="info-cell" style={{ borderTop: "1px solid #f5f5f5" }}>
                <div className="info-cell-label">
                  <FiPhone size={13} /> {t("profile_phone")}
                </div>
                {editMode ? (
                  <input
                    className="info-input"
                    value={editData.nomor_telepon}
                    onChange={(e) => setEditData({ ...editData, nomor_telepon: e.target.value })}
                  />
                ) : (
                  <div className="info-cell-value">{admin.nomor_telepon || "–"}</div>
                )}
              </div>
            </div>
          </div>

          {/* Official Details */}
          <div className="section-card">
            <div className="section-card-title">{t("official_details")}</div>
            <table className="kedinasan-table">
              <tbody>
                <tr>
                  <td>{t("rank_corps")}</td>
                  <td>{admin.pangkat}</td>
                </tr>
                <tr>
                  <td>{t("unit")}</td>
                  <td>{admin.satuan_kerja}</td>
                </tr>
                <tr>
                  <td>{t("structural_position")}</td>
                  <td>
                    {editMode ? (
                      <input
                        className="info-input"
                        value={editData.jabatan_struktural}
                        onChange={(e) => setEditData({ ...editData, jabatan_struktural: e.target.value })}
                      />
                    ) : (
                      admin.jabatan_struktural || "–"
                    )}
                  </td>
                </tr>
                <tr>
                  <td>{t("verification_status")}</td>
                  <td>
                    <span className="terverifikasi-badge">
                      {admin.status_verifikasi === "terverifikasi"
                        ? t("verified_badge")
                        : admin.status_verifikasi}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Manajemen Peran & Akses */}
          <div className="section-card">
            <div className="section-card-title">{t("role_access_management")}</div>
            <div className="peran-grid">
              <div className="peran-col">
                <div className="peran-col-header">
                  <div className="peran-col-title">{t("access_level")}</div>
                  <div className="peran-col-icon">
                    <FiShield size={14} />
                  </div>
                </div>
                <div className="peran-col-desc">{t("access_level_desc")}</div>
                <div className="super-admin-box">{roleLabel[admin.role_sistem] || admin.role_sistem}</div>
                <div className="peran-list">
                  <div className="peran-list-item">{t("permission_manage_personnel")}</div>
                  <div className="peran-list-item">{t("permission_export_pdf")}</div>
                  <div className="peran-list-item">{t("permission_manage_admin")}</div>
                </div>
              </div>
              <div className="peran-col">
                <div className="peran-col-header">
                  <div className="peran-col-title">{t("credentials")}</div>
                  <div className="peran-col-icon">
                    <FiLock size={14} />
                  </div>
                </div>
                <div className="peran-col-desc">{t("password_update_desc")}</div>
                <div className="kredensial-note">{t("password_security_note")}</div>
                <button className="ubah-sandi-btn" onClick={() => setShowSandiModal(true)}>
                  {t("change_password")}
                </button>
              </div>
            </div>

            {/* Sesi Login */}
            <div className="sesi-header">
              <FiClock size={14} /> {t("last_login_sessions")}
            </div>
            <div className="sesi-list">
              {sesiList.length === 0 ? (
                <div style={{ padding: "16px 22px", fontSize: 13, color: "#aaa" }}>
                  {t("no_session_history")}
                </div>
              ) : (
                sesiList.map((s, i) => (
                  <div className="sesi-item" key={i}>
                    <div className="sesi-device-icon">
                      <FiMonitor size={18} />
                    </div>
                    <div className="sesi-detail">
                      <div className="sesi-browser">
                        {s.browser_os || "Browser on OS"}
                        {s.lokasi ? ` – ${s.lokasi}` : ""}
                      </div>
                      <div className="sesi-ip">
                        IP: {s.ip_address} · {formatWaktu(s.waktu_login)}
                      </div>
                    </div>
                    <div className="sesi-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {s.is_current ? (
                        <div className="sesi-active">{t("current_session")}</div>
                      ) : s.status_sesi === "Aktif" ? (
                        <button
                          onClick={() => handlePutusSesi(s.sesi_id)}
                          style={{
                            padding: "4px 10px",
                            fontSize: 11,
                            background: "#fff",
                            border: "1px solid #e57373",
                            borderRadius: 4,
                            cursor: "pointer",
                            color: "#c62828",
                            fontWeight: 600,
                          }}
                        >
                          {t("logout_session")}
                        </button>
                      ) : (
                        <div style={{ fontSize: 11, color: "#999", fontStyle: "italic" }}>
                          {s.status_sesi}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="lihat-semua-btn" onClick={() => setShowRiwayatModal(true)}>
              {t("view_all_updates")} <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="page-footer">
        <span>© 2026 DISINFOLAHTAU – Markas Besar TNI Angkatan Udara</span>
        <div className="footer-links">
          <a onClick={() => setShowPrivasiModal(true)}>Kebijakan Privasi</a>
          <a onClick={() => setShowBantuanModal(true)}>Bantuan IT</a>
        </div>
      </footer>

      {/* ── MODAL: Ganti Kata Sandi ── */}
      {showSandiModal && (
        <div className="modal-overlay" onClick={() => setShowSandiModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FiLock size={16} /> {t("change_password")}
              </div>
              <button className="modal-close" onClick={() => setShowSandiModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="modal-body">
              {sandiMsg && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: 13,
                    marginBottom: 12,
                    background: sandiMsg.startsWith("✅") ? "#e8f5e9" : "#ffebee",
                    color: sandiMsg.startsWith("✅") ? "#2e7d32" : "#c62828",
                  }}
                >
                  {sandiMsg}
                </div>
              )}
              <form onSubmit={handleGantiSandi} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>
                    {t("password_old")}
                  </label>
                  <input
                    type="password"
                    className="info-input"
                    style={{ width: "100%" }}
                    value={sandiForm.password_lama}
                    onChange={(e) => setSandiForm({ ...sandiForm, password_lama: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>
                    {t("password_new")}
                  </label>
                  <input
                    type="password"
                    className="info-input"
                    style={{ width: "100%" }}
                    value={sandiForm.password_baru}
                    onChange={(e) => setSandiForm({ ...sandiForm, password_baru: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>
                    {t("password_confirm")}
                  </label>
                  <input
                    type="password"
                    className="info-input"
                    style={{ width: "100%" }}
                    value={sandiForm.password_baru_confirmation}
                    onChange={(e) => setSandiForm({ ...sandiForm, password_baru_confirmation: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="edit-profil-btn" style={{ marginTop: 4 }}>
                  {t("save_password")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Kebijakan Privasi ── */}
      {showPrivasiModal && (
        <div className="modal-overlay" onClick={() => setShowPrivasiModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              Kebijakan Privasi
              <button className="modal-close" onClick={() => setShowPrivasiModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>
                Sistem DISINFOLAHTAU berkomitmen menjaga kerahasiaan seluruh data personel TNI AU.
                Data bersifat rahasia negara dan hanya dapat diakses oleh personel yang berwenang.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Bantuan IT ── */}
      {showBantuanModal && (
        <div className="modal-overlay" onClick={() => setShowBantuanModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              Bantuan IT
              <button className="modal-close" onClick={() => setShowBantuanModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                {[
                  ["Helpdesk", "disinfolahtau@tniau.mil.id"],
                  ["Telepon", "(021) 800-1234"],
                  ["Jam Layanan", "Senin – Jumat, 08:00 – 17:00 WIB"],
                  ["Darurat 24 Jam", "+62 812-0000-1234"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "11px 14px",
                      fontSize: 13,
                      borderBottom: "1px solid #f7f7f7",
                    }}
                  >
                    <span style={{ color: "#888" }}>{k}</span>
                    <strong style={{ color: "#1a1a2e" }}>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Riwayat Sesi ── */}
      {showRiwayatModal && (
        <div className="modal-overlay" onClick={() => setShowRiwayatModal(false)}>
          <div className="modal-box" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {t("all_session_history")}
              <button className="modal-close" onClick={() => setShowRiwayatModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <div className="sesi-list" style={{ marginTop: 0 }}>
                {sesiList.length === 0 ? (
                  <div style={{ padding: "16px 22px", fontSize: 13, color: "#aaa" }}>
                    Belum ada riwayat sesi.
                  </div>
                ) : (
                  sesiList.map((s, i) => (
                    <div className="sesi-item" key={i}>
                      <div className="sesi-device-icon">
                        <FiMonitor size={18} />
                      </div>
                      <div className="sesi-detail">
                        <div className="sesi-browser">
                          {s.browser_os || "Browser on OS"}
                          {s.lokasi ? ` – ${s.lokasi}` : ""}
                        </div>
                        <div className="sesi-ip">
                          IP: {s.ip_address} · {formatWaktu(s.waktu_login)}
                        </div>
                      </div>
                      <div className="sesi-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {s.is_current ? (
                          <div className="sesi-active">Sesi Saat Ini</div>
                        ) : s.status_sesi === "Aktif" ? (
                          <button
                            onClick={() => handlePutusSesi(s.sesi_id)}
                            style={{
                              padding: "4px 10px",
                              fontSize: 11,
                              background: "#fff",
                              border: "1px solid #e57373",
                              borderRadius: 4,
                              cursor: "pointer",
                              color: "#c62828",
                              fontWeight: 600,
                            }}
                          >
                            Putus Sesi
                          </button>
                        ) : (
                          <div style={{ fontSize: 11, color: "#999", fontStyle: "italic" }}>
                            {s.status_sesi}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
