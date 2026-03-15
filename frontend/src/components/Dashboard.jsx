import { useState, useEffect } from "react";
import { FiGrid, FiUser, FiFileText, FiLogOut, FiBell, FiDatabase, FiShield, FiClock, FiBarChart2, FiChevronRight, FiX, FiSettings, FiActivity, FiAlertCircle } from "react-icons/fi";
import logoImg from '../assets/Logo_LANUD.png';
import { HiOutlineUsers, HiOutlineUserCircle } from "react-icons/hi";
import { useSettings } from '../context/SettingsContext.jsx';
import "./dashboard.css";




// moved inside component because it needs access to t()

const API = "http://localhost:8000/api";
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";

function authHeader() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

function getFotoUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STORAGE_URL}/${path}`;
}

export default function Dashboard({ onLogout, onNavigate, adminData }) {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [notifList, setNotifList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showPrivasiModal, setShowPrivasiModal] = useState(false);
  const [showBantuanModal, setShowBantuanModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showLaporanModal, setShowLaporanModal] = useState(false);
  const [expandNotif, setExpandNotif] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [listModalType, setListModalType] = useState("Semua");
  const [personnelList, setPersonnelList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const { settings, t } = useSettings();

  // helper to show relative time with translations
  const formatMins = (timestamp) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const m = Math.floor(diffMs / 60000);
    if (m < 1) return t("just_now");
    if (m < 60) return t("minutes_ago", { n: m });
    if (m < 1440) return t("hours_ago", { n: Math.floor(m / 60) });
    return t("days_ago", { n: Math.floor(m / 1440) });
  };

  async function fetchStats() {
    try {
      const res = await fetch(`${API}/dashboard/stats`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchPersonnelListForModal(type) {
    setLoadingList(true);
    setPersonnelList([]);
    setShowListModal(true);
    setListModalType(type);

    try {
      const res = await fetch(`${API}/personel?per_page=100`, { headers: authHeader() });
      const data = await res.json();

      if (data.success) {
        let filtered = data.data;
        if (type === "Aktif") {
          filtered = filtered.filter((p) => p.status === "Aktif" || p.status_personel === "Aktif");
        }
        setPersonnelList(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  }

  async function fetchActivities() {
    try {
      const res = await fetch(`${API}/dashboard/aktivitas`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) setActivities(data.data);
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
    await fetch(`${API}/dashboard/notifikasi/${id}/baca`, { method: "POST", headers: authHeader() });
    fetchNotifikasi();
  }

  function closeAll() {
    setShowNotif(false);
    setShowUserMenu(false);
  }

  useEffect(() => {
    fetchStats();
    fetchActivities();
    fetchNotifikasi();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchActivities, 15000);
    return () => clearInterval(interval);
  }, []);
  const admin = adminData || JSON.parse(localStorage.getItem("admin") || "{}");
  const persen = stats && stats.total_personel > 0 ? Math.round((stats.personel_aktif / stats.total_personel) * 100) : 0;

  return (
    <div className="dashboard-layout" onClick={closeAll}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={logoImg} alt="Logo TNI AU" className="sidebar-logo-img" />
          <div className="sidebar-brand-text">{t("app_title")}</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <FiGrid size={16} /> {t("menu_dashboard")}
          </div>
          <div className="nav-item" onClick={() => onNavigate("profilakun")}>
            <FiUser size={16} /> {t("menu_profile")}
          </div>
          <div className="nav-item" onClick={() => onNavigate("personnel")}>
            <FiFileText size={16} /> {t("menu_personnel")}
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="system-status">
            <div className="system-status-label">{t("system_status")}</div>
            <div className="status-dot">{t("server_secure")}</div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <FiLogOut size={16} /> {t("logout")}
          </button>
        </div>
      </aside>

      <div className="main-area">
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
                  {t("notifications")}{" "}
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
                        <div className="notif-item-time">{formatMins(n.created_at)}</div>
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
                <div className="user-role">{admin.pangkat || admin.role_sistem}</div>
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
                  {admin.foto_url ? <img src={getFotoUrl(admin.foto_url)} className="user-dropdown-avatar" alt="Admin" style={{ objectFit: "cover" }} /> : <div className="user-dropdown-avatar avatar-1" />}
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

        <div className="content">
          <div className="content-main">
            <div className="page-header">
              <div className="page-header-text">
                <h2>{t("dashboard_admin")}</h2>
                <p>
                  {t("welcome_back")},{" "}
                  <strong>
                    {admin.pangkat} {admin.nama_lengkap}
                  </strong>
                  . {t("system_summary")}
                </p>
              </div>
              <div className="server-status">
                <div className="server-status-label">
                  <div className="server-status-title">{t("server_status_label")}</div>
                  <div className="server-status-val">{t("server_operational")}</div>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card" onClick={() => fetchPersonnelListForModal("Semua")} style={{ cursor: "pointer" }}>
                <div className="stat-label">
                  <HiOutlineUsers size={16} /> {t("total_personnel")}
                </div>
                <div className="stat-value">{stats ? stats.total_personel.toLocaleString("id") : "..."}</div>
                <div className="stat-sub">↗ {t("click_view_personnel")}</div>
              </div>

              <div className="stat-card" onClick={() => fetchPersonnelListForModal("Aktif")} style={{ cursor: "pointer" }}>
                <div className="stat-label">
                  <HiOutlineUserCircle size={16} /> {t("active_personnel")}
                </div>
                <div className="stat-value">{stats ? stats.personel_aktif.toLocaleString("id") : "..."}</div>
                <div className="stat-sub">↗ {persen}% {t("from_total")}</div>
              </div>
            </div>

            <div>
              <div className="section-title">
                <FiChevronRight size={16} /> {t("quick_access")}
              </div>
              <div className="quick-grid">
                <div className="quick-card" onClick={() => onNavigate("personnel")}>
                  <div className="quick-icon">
                    <FiDatabase size={20} />
                  </div>
                  <h4>{t("quick_personnel_title")}</h4>
                  <p>{t("quick_personnel_desc")}</p>
                </div>
                <div className="quick-card" onClick={() => onNavigate("profilakun")}>
                  <div className="quick-icon">
                    <FiShield size={20} />
                  </div>
                  <h4>{t("security_info_title")}</h4>
                  <p>{t("security_info_desc")}</p>
                </div>
                <div className="quick-card" onClick={() => setShowLogModal(true)}>
                  <div className="quick-icon">
                    <FiActivity size={20} />
                  </div>
                  <h4>{t("quick_activity_log_title")}</h4>
                  <p>{t("quick_activity_log_desc")}</p>
                </div>
                <div className="quick-card" onClick={() => setShowLaporanModal(true)}>
                  <div className="quick-icon">
                    <FiBarChart2 size={20} />
                  </div>
                  <h4>{t("quick_reports_title")}</h4>
                  <p>{t("quick_reports_desc")}</p>
                </div>
              </div>
            </div>

            <div className="announcement">
              <div className="ann-badge">{t("important_info")}</div>
              <h3>{t("system_update_title")}</h3>
              <p>{/* notification content comes from backend, may already be localized as needed */}</p>
              <button className="ann-btn" onClick={() => setShowMaintModal(true)}>
                {t("view_maintenance_detail")}
              </button>
            </div>
          </div>

          <div className="activity-panel">
            <div className="activity-header">
              <h3>{t("recent_activity")}</h3>
              <span className="realtime-badge">● Real-time</span>
            </div>
            <div className="activity-subtitle">{t("recent_updates_subtitle")}</div>
            <div className="activity-list">
              {activities.length === 0 && <div style={{ fontSize: 13, color: "#aaa", padding: "12px 0" }}>Belum ada aktivitas.</div>}
              {activities.slice(0, 5).map((item, i) => (
                <div key={item.log_id || i} className="activity-item">
                  {item.foto_admin ? (
                    <img
                      src={getFotoUrl(item.foto_admin)}
                      className="activity-avatar"
                      alt={item.nama_admin}
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nama_admin || "A")}&background=5a6fa8&color=fff`;
                      }}
                    />
                  ) : (
                    <div className="activity-avatar" style={{ background: "#5a6fa8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" }}>
                      {item.nama_admin ? item.nama_admin.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="activity-detail">
                    <span className="activity-name">{item.nama_admin}</span>
                    <span className="activity-action"> {item.deskripsi_aksi}</span>
                    <div className="activity-time">
                      <FiClock size={11} /> {formatMins(item.timestamp).toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all-link" onClick={() => setShowAllActivity(true)}>
              {t("view_all_activities")} <FiChevronRight size={14} />
            </div>
          </div>
        </div>

        <footer className="dashboard-footer">
          <span>{`© 2026 DISINFOLAHTAU – ${t("app_title")}`}</span>
          <div className="footer-links">
            <a onClick={() => setShowPrivasiModal(true)}>{t("privacy_policy")}</a>
            <a onClick={() => setShowBantuanModal(true)}>{t("it_support")}</a>
          </div>
        </footer>
      </div>

      {showMaintModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setShowMaintModal(false)}>
          <div className="modal-box" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FiAlertCircle size={18} color="#888" />
                <span>{t("maintenance_detail_title")}</span>
              </div>
              <button className="modal-close" onClick={() => setShowMaintModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: "0 24px 24px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: 13 }}>{t("maint_version")}</span>
                <strong style={{ color: "#1a1a2e", fontSize: 13 }}>V2.4.0</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: 13 }}>{t("maint_schedule_start")}</span>
                <strong style={{ color: "#1a1a2e", fontSize: 13 }}>Sabtu, 24 Agustus 2026 - 23:00 WIB</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#888", fontSize: 13 }}>{t("maint_estimated_finish")}</span>
                <strong style={{ color: "#1a1a2e", fontSize: 13 }}>Minggu, 25 Agustus 2026 - 02:00 WIB</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #f0f0f0", marginBottom: 24 }}>
                <span style={{ color: "#888", fontSize: 13 }}>{t("maint_status")}</span>
                <span style={{ background: "#fdf3f2", color: "#aa8622", fontWeight: 600, fontSize: 12, padding: "4px 12px", borderRadius: 20 }}>{t("maint_scheduled")}</span>
              </div>
              <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>{t("maintenance_includes")}</div>
              <ul style={{ margin: "0 0 24px 0", padding: "0 0 0 16px", fontSize: 13, color: "#555", lineHeight: 1.8 }}>
                <li>{t("maint_item_1")}</li>
                <li>{t("maint_item_2")}</li>
                <li>{t("maint_item_3")}</li>
                <li>{t("maint_item_4")}</li>
              </ul>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{t("maintenance_warning")}</div>
            </div>
          </div>
        </div>
      )}

      {showAllActivity && (
        <div className="modal-overlay" onClick={() => setShowAllActivity(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FiActivity size={16} /> {t("all_activity_log")}

              </div>
              <button className="modal-close" onClick={() => setShowAllActivity(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="modal-body">
              {activities.map((item, i) => (
                <div key={i} className="modal-riwayat-item" style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
                  {item.foto_admin ? (
                    <img
                      src={getFotoUrl(item.foto_admin)}
                      alt={item.nama_admin}
                      style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nama_admin || "A")}&background=1e1e2e&color=fff`;
                      }}
                    />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e1e2e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 14, flexShrink: 0 }}>
                      {item.nama_admin ? item.nama_admin.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{item.nama_admin}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>{item.deskripsi_aksi}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: "2px" }}>{formatMins(item.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FiActivity size={16} /> {t("all_activity_log")}
              </div>
              <button className="modal-close" onClick={() => setShowLogModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="modal-body">
              {activities.map((item, i) => (
                <div key={i} className="modal-riwayat-item">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1e1e2e", flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{item.nama_admin}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>{item.deskripsi_aksi}</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>{formatMins(item.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLaporanModal && (
        <div className="modal-overlay" onClick={() => setShowLaporanModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FiBarChart2 size={16} /> {t("quick_reports_title")}
              </div>
              <button className="modal-close" onClick={() => setShowLaporanModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="maint-detail">
                <div className="maint-row">
                  <span>Total Personel</span>
                  <strong>{stats?.total_personel ?? "..."}</strong>
                </div>
                <div className="maint-row">
                  <span>Aktif</span>
                  <strong>{stats?.personel_aktif ?? "..."}</strong>
                </div>
                <div className="maint-row">
                  <span>Cuti</span>
                  <strong>{stats?.cuti ?? "..."}</strong>
                </div>
                <div className="maint-row">
                  <span>Mutasi</span>
                  <strong>{stats?.mutasi ?? "..."}</strong>
                </div>
                <div className="maint-row">
                  <span>Pendidikan</span>
                  <strong>{stats?.pendidikan ?? "..."}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {t("privacy_desc")}
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
              <div className="maint-detail">
                <div className="maint-row">
                  <span>{t("it_support_helpdesk")}</span>
                  <strong>disinfolahtau@tniau.mil.id</strong>
                </div>
                <div className="maint-row">
                  <span>{t("it_support_phone")}</span>
                  <strong>(021) 800-1234</strong>
                </div>
                <div className="maint-row">
                  <span>{t("it_support_hours")}</span>
                  <strong>Senin–Jumat, 08:00–17:00 WIB</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showListModal && (
        <div className="modal-overlay" onClick={() => setShowListModal(false)}>
          <div className="modal-box" style={{ maxWidth: 700, width: "95%", maxHeight: "85vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: "16px 24px", borderBottom: "1px solid #eee" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
                <HiOutlineUsers size={20} /> {t("personnel_list")} {listModalType === "Aktif" ? t("active") : t("all")}
              </div>
              <button className="modal-close" onClick={() => setShowListModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ overflowY: "auto", padding: 0 }}>
              {loadingList ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#888", fontSize: 14 }}>{t("loading_personnel")}</div>
              ) : personnelList.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {personnelList.map((p, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #f1f5f9", gap: "16px" }}>
                      {p.foto_url ? (
                        <img
                          src={getFotoUrl(p.foto_url)}
                          alt={p.nama_lengkap}
                          style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama_lengkap)}&background=random`;
                          }}
                        />
                      ) : (
                        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#475569", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 16, flexShrink: 0 }}>
                          {p.nama_lengkap ? p.nama_lengkap.charAt(0).toUpperCase() : "?"}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{p.nama_lengkap}</div>
                        <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                          {p.pangkat} <span style={{ margin: "0 6px" }}>•</span> NRP: {p.nrp} <span style={{ margin: "0 6px" }}>•</span> {p.satker || p.satuan_kerja}
                        </div>
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: 12,
                            padding: "6px 12px",
                            borderRadius: 20,
                            background: p.status === "Aktif" || p.status_personel === "Aktif" ? "#dcfce7" : "#f1f5f9",
                            color: p.status === "Aktif" || p.status_personel === "Aktif" ? "#166534" : "#475569",
                            fontWeight: 600,
                          }}
                        >
                          {p.status || p.status_personel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "40px", textAlign: "center", color: "#888", fontSize: 14 }}>Tidak ada data personel yang ditemukan.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
