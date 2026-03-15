// src/context/SettingsContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
    theme: 'light',
    language: 'id',
    notifWeb: true,
    notifEmail: false,
    notifActivity: true,
};

/* ─────────────────────────────────────────
   DICTIONARY TERJEMAHAN
───────────────────────────────────────── */

const translations = {
  id: {
    settings_title: "Pengaturan Sistem",
    settings_desc: "Kelola preferensi antarmuka, notifikasi, dan bahasa sistem.",
    appearance: "Tampilan & Tema",
    appearance_desc: "Sesuaikan tampilan visual aplikasi",
    theme: "Tema Aplikasi",
    theme_desc: "Sesuaikan mode warna antarmuka Anda.",
    theme_light: "Terang",
    theme_dark: "Gelap",
    theme_system: "Sistem",
    language: "Bahasa",
    language_desc: "Pilih bahasa utama untuk antarmuka.",
    notif_web: "Notifikasi Web",
    notif_web_desc: "Tampilkan pop-up aktivitas di dalam dashboard.",
    notif_email: "Notifikasi Email",
    notif_email_desc: "Kirimkan ringkasan aktivitas ke email dinas.",
    activity_log: "Log Aktivitas",
    activity_log_desc: "Rekam semua aktivitas sesi pengguna.",
    notifications: "Preferensi Notifikasi",
    notifications_desc: "Atur cara Anda menerima pemberitahuan",
    save: "Simpan Pengaturan",
    save_settings: "Simpan Pengaturan",
    saved: "Tersimpan",
    settings_saved: "Pengaturan telah disimpan",
    system_normal: "Sistem berjalan normal",
    app_title: "Data Diri TNI AU",
    system_summary: "Berikut ringkasan sistem hari ini.",
    server_status_label: "Status Server",
    server_operational: "Operational",
    from_total: "dari total",
    important_info: "Informasi Penting",
    system_update_title: "Pemutakhiran Sistem V2.4",
    security_info_title: "Profil & Keamanan",
    security_info_desc: "Atur informasi kredensial admin, pangkat, dan manajemen akses unit kerja.",
    just_now: "Baru saja",
    minutes_ago: "{n} menit lalu",
    hours_ago: "{n} jam lalu",
    days_ago: "{n} hari lalu",
    system_status: "System Status",
    server_secure: "Server Secure",

    // login page
    login_error_required: "NRP dan kata sandi wajib diisi.",
    login_error_invalid: "Login gagal. Periksa NRP dan kata sandi.",
    login_error_unreachable: "Tidak dapat terhubung ke server. Pastikan backend berjalan.",
    login_badge: "Secure Access Gateway",
    login_title: "Autentikasi Personel",
    login_subtitle: "Markas Besar TNI Angkatan Udara",
    login_label_nrp: "NRP / Username",
    login_placeholder_nrp: "Masukkan NRP Anda",
    login_label_password: "Kata Sandi",
    login_forgot_password: "Lupa Password?",
    login_placeholder_password: "Masukkan kata sandi",
    password_old: "Kata Sandi Lama",
    password_new: "Kata Sandi Baru",
    password_confirm: "Konfirmasi Kata Sandi Baru",
    change_password: "Ubah Kata Sandi",
    save_password: "Simpan Kata Sandi",
    password_update_desc: "Pembaruan kata sandi sistem.",
    password_security_note: "Disarankan memperbarui kata sandi setiap 90 hari untuk menjaga keamanan data negara.",
    password_change_failed: "Gagal mengganti kata sandi.",
    profile_saved_success: "Profil berhasil disimpan.",
    photo_updated_success: "Foto profil berhasil diperbarui.",
    photo_upload_error: "Gagal: {error}",
    photo_upload_connection_error: "Gagal terhubung ke server saat mengunggah foto.",
    ganti_sandi_title: "Ganti Kata Sandi",
    ganti_sandi_old: "Kata Sandi Lama",
    ganti_sandi_new: "Kata Sandi Baru",
    ganti_sandi_confirm: "Konfirmasi Kata Sandi Baru",
    ganti_sandi_submit: "Ubah Kata Sandi",
    ganti_sandi_success: "✅ {message}",
    ganti_sandi_error: "❌ {message}",
    ganti_sandi_default_error: "Gagal mengganti kata sandi.",
    ganti_sandi_connection_error: "❌ Tidak dapat terhubung ke server.",
    "2fa_enabled": "Autentikasi Dua Faktor (2FA) berhasil diaktifkan.",
    "2fa_disabled": "Autentikasi Dua Faktor (2FA) berhasil dinonaktifkan.",
    "2fa_toggle_error": "Gagal mengubah status 2FA.",
    "2fa_toggle_connection_error": "Gagal mengubah status 2FA (Koneksi error).",
    sesi_putus_confirm: "Apakah Anda yakin ingin memutus akses dari perangkat ini?",
    sesi_putus_success: "Sesi pada perangkat tersebut berhasil diputus.",
    sesi_putus_error: "Gagal memutus sesi.",
    sesi_putus_connection_error: "Gagal terhubung ke server saat memutus sesi.",
    all_session_history: "Semua Riwayat Sesi",
    last_active: "Terakhir Aktif",
    notification: "Notifikasi",
    system_summary: "Berikut ringkasan sistem hari ini.",
    table_nrp: "NRP",
    table_full_name: "Nama Lengkap",
    table_rank: "Pangkat / Gol",
    table_unit: "Satuan Kerja / Unit",
    table_status: "Status",
    rank_field: "Pangkat",
    select_rank: "Pilih Pangkat",
    total_units: "Satuan Kerja",
    col_personel: "PERSONEL",
    col_rank: "PANGKAT",
    col_unit: "UNIT / SATKER",
    col_status: "STATUS",
    col_last_update: "UPDATE TERAKHIR",
    col_action: "AKSI",
    loading_data: "Memuat data...",
    login_verifying: "Memverifikasi...",
    login_submit: "Masuk Ke Sistem",
    login_it_support: "Bantuan IT Support",
    login_support_desc: "Jika anda mengalami kendala akses, silakan hubungi tim DISINFOLAHTAU melalui saluran komunikasi resmi kedinasan.",
    login_contact_helpdesk: "Hubungi Helpdesk",
    login_footer_copyright: "© {year} Markas Besar TNI Angkatan Udara",
    login_footer_confidential: "Kerahasiaan Terjamin",
    login_footer_encrypted: "Sistem Terenkripsi",

    // profile page
    profile_title: "Profil Akun Admin",
    profile_desc: "Kelola identitas institusional dan pengaturan keamanan akses sistem Anda.",
    profile_export_pdf: "Cetak PDF",
    edit_profile: "Edit Profil",
    cancel: "Batal",
    twofa_active: "2FA Aktif",
    twofa_inactive: "2FA Tidak Aktif",
    deactivate: "Nonaktifkan",
    activate: "Aktifkan",
    basic_info_contact: "Informasi Dasar & Kontak",
    full_name: "Nama Lengkap",
    nrp: "NRP",
    company_email: "Email Dinas",
    phone_number: "Nomor Telepon",
    official_details: "Detail Kedinasan",
    rank_corps: "Pangkat / Korps",
    unit: "Satuan Kerja",
    structural_position: "Jabatan Struktural",
    verification_status: "Status Verifikasi",

    // data diri page
    personnel_not_found: "Data personel tidak ditemukan.",
    error_unreachable: "Tidak dapat terhubung ke server.",
    error_nrp_missing: "NRP tidak ditemukan.",
    loading_personnel: "Memuat data personel...",
    back: "Kembali",
    click_view_personnel: "Klik untuk lihat daftar personel",
    personnel_list: "Daftar Personel",
    active: "Aktif",
    inactive: "Tidak Aktif",
    twofa_status_label: "Status 2FA",
    all: "Keseluruhan",
    close: "Tutup",
    view_all_notifications: "Lihat semua notifikasi",
    personnel_detail: "Detail Personel",
    verified: "Terverifikasi",
    print: "Cetak",
    download_pdf: "Unduh PDF",
    personnel_current_position: "Jabatan Saat Ini",
    personnel_type: "Jenis Personel",
    tmt_last_rank: "TMT Pangkat Terakhir",
    view_all_updates: "Lihat Semua Riwayat",
    all_update_history: "Semua Riwayat Pembaruan",
    no_history: "Belum ada riwayat.",
    status_leave: "Cuti",
    status_transfer: "Mutasi",
    status_training: "Pendidikan",
    status_retired: "Pensiun",
    export_title: "DAFTAR PERSONEL TNI AU",

    menu_dashboard: "Dashboard",
    menu_profile: "Profil Akun",
    menu_personnel: "Data Diri Personel",

    logout: "Keluar",

    dashboard_admin: "Dashboard Admin",
    view_maintenance_detail: "Lihat Detail Pemeliharaan",
    view_all_activities: "Lihat Semua Aktivitas",
    maintenance_detail_title: "Detail Pemeliharaan Sistem",
    maintenance_includes: "Pemeliharaan ini meliputi:",
    maintenance_warning: "Selama periode pemeliharaan, sistem tidak dapat diakses. Pastikan semua perubahan data telah disimpan sebelum waktu tersebut.",
    all_activity_log: "Semua Log Aktivitas",
    welcome_back: "Selamat datang kembali",

    server_status: "Status Server",
    operational: "Operational",

    total_personnel: "Total Personel",
    active_personnel: "Personel Aktif",

    quick_access: "Akses Cepat",
    quick_personnel_title: "Data Personel",
    quick_personnel_desc: "Lihat / edit data personel lengkap",
    quick_profile_access_title: "Profil & Akses",
    quick_profile_access_desc: "Atur informasi kredensial admin, pangkat, dan manajemen akses unit kerja.",
    quick_activity_log_title: "Log Aktivitas",
    quick_activity_log_desc: "Pantau seluruh jejak digital perubahan data yang dilakukan oleh administrator.",
    quick_reports_title: "Laporan & Statistik",
    quick_reports_desc: "Generate dokumen PDF/CSV bulanan untuk laporan kekuatan personel.",
    recent_activity: "Aktivitas Terbaru",
    recent_updates_subtitle: "Pembaruan data personil terkini",
    profile_security: "Profil & Keamanan",
    activity_log_title: "Log Aktivitas",
    reports_statistics: "Laporan & Statistik",
    notification_preferences: "Preferensi Notifikasi",
    search_placeholder: "Cari NRP atau Nama Personel...",
    filter_status: "Filter Status",
    all_status: "Semua Status",
    advanced_filter: "Filter Lanjutan",
    sort_nrp: "Urut: NRP",
    sort_az: "Urut: A-Z",

    maint_version: "Versi",
    maint_schedule_start: "Jadwal Mulai",
    maint_estimated_finish: "Estimasi Selesai",
    maint_status: "Status",
    maint_scheduled: "Terjadwal",
    maint_item_1: "Migrasi struktur database ke skema v2.4",
    maint_item_2: "Peningkatan performa pencarian dan filter personel",
    maint_item_3: "Pembaruan modul ekspor PDF",
    maint_item_4: "Patch keamanan sistem autentikasi 2FA",

    privacy_desc: "Sistem DISINFOLAHTAU berkomitmen menjaga kerahasiaan seluruh data personel TNI AU. Data bersifat rahasia negara dan hanya dapat diakses oleh personel yang berwenang.",
    it_support_helpdesk: "Helpdesk",
    it_support_phone: "Telepon",
    it_support_hours: "Jam Layanan",

    profile_full_name: "Nama Lengkap",
    profile_email_dinas: "Email Dinas",
    profile_phone: "Nomor Telepon",
    role_access_management: "Manajemen Peran & Akses",
    access_level: "Tingkat Akses",
    access_level_desc: "Otoritas operasional Anda dalam sistem.",
    permission_manage_personnel: "Kelola semua data personel",
    permission_export_pdf: "Ekspor PDF/CSV Massal",
    permission_manage_admin: "Manajemen Akun Admin Lain",
    credentials: "Kredensial",
    last_login_sessions: "Sesi Login Terakhir",
    current_session: "Sesi Saat Ini",
    logout_session: "Putus Sesi",
    no_session_history: "Belum ada riwayat sesi.",
    verified_badge: "Terverifikasi Mabesau",
    security_status: "Status Keamanan",

    personnel_data: "Data Personel",
    database_personnel: "Database Personel",
    add_personnel: "Tambah Personel",
    add_personnel_new: "Tambah Personel Baru",
    edit_personnel_data: "Edit Data Personel",

    update_history_title: "Riwayat Pembaruan",
    update_activity_log: "Log aktivitas modifikasi data personel",

    lang_indonesian: "🇮🇩 Bahasa Indonesia",
    lang_english: "🇺🇸 English",

    current_position: "Jabatan Sekarang",
    birth_date: "Tanggal Lahir",
    by: "Oleh",
    present: "Sekarang",

    database_personnel_desc: "Mengelola data induk prajurit dan PNS di lingkungan TNI Angkatan Udara.",
    export_pdf: "Cetak PDF",
    showing_results: "Menampilkan",
    from: "dari",
    of_personnel: "personel",
    no_matching_data: "Tidak ada data yang sesuai filter.",
    admin_notes: "Catatan Administrasi",
    guideline_update_title: "Panduan Pembaruan Data Berkala",
    guideline_update_desc: "Pembaruan data personel wajib dilakukan setiap 3 bulan sekali oleh admin satker masing-masing. Data yang tidak diperbarui lebih dari 6 bulan akan ditandai sebagai \"Perlu Verifikasi\" secara otomatis oleh sistem.",
    integration_sispers_title: "Integrasi Sistem SISPERS",
    integration_sispers_desc: "Database ini telah terintegrasi dengan Sistem Informasi Personel (SISPERS) TNI AU. Setiap perubahan data akan tersinkronisasi secara otomatis dalam 1×24 jam. Hubungi tim DISINFOLAHTAU jika terjadi ketidaksesuaian data.",

    privacy_policy: "Kebijakan Privasi",
    it_support: "Bantuan IT"
  },
  en: {
    settings_title: "System Settings",
    settings_desc: "Manage interface preferences, notifications, and system language.",
    appearance: "Appearance & Theme",
    appearance_desc: "Adjust the app’s visual style",
    theme: "Application Theme",
    theme_desc: "Customize your interface color mode.",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_system: "System",
    language: "Language",
    language_desc: "Choose the primary UI language.",
    notif_web: "Web Notifications",
    notif_web_desc: "Show activity pop‑ups inside the dashboard.",
    notif_email: "Email Notifications",
    notif_email_desc: "Send activity summaries to your email.",
    activity_log: "Activity Log",
    activity_log_desc: "Record all user session activity.",
    notifications: "Notification Preferences",
    notifications_desc: "Control how you receive alerts",
    save: "Save Settings",
    save_settings: "Save Settings",
    saved: "Saved",
    settings_saved: "Settings have been saved",
    system_normal: "System running normally",
    app_title: "Data Diri TNI AU",
    system_summary: "Here is a summary of the system today.",
    server_status_label: "Server Status",
    server_operational: "Operational",
    from_total: "from total",
    important_info: "Important Information",
    system_update_title: "System Update V2.4",
    security_info_title: "Profile & Security",
    security_info_desc: "Adjust admin credentials information, rank and unit access management.",
    just_now: "Just now",
    minutes_ago: "{n} minutes ago",
    hours_ago: "{n} hours ago",
    days_ago: "{n} days ago",
    system_status: "System Status",
    server_secure: "Server Secure",

    // login page
    login_error_required: "NRP and password are required.",
    login_error_invalid: "Login failed. Check NRP and password.",
    login_error_unreachable: "Cannot connect to server. Make sure backend is running.",
    login_badge: "Secure Access Gateway",
    login_title: "Personnel Authentication",
    login_subtitle: "Headquarters of Indonesian Air Force",
    login_label_nrp: "NRP / Username",
    login_placeholder_nrp: "Enter your NRP",
    login_label_password: "Password",
    login_forgot_password: "Forgot Password?",
    login_placeholder_password: "Enter your password",
    password_old: "Old Password",
    password_new: "New Password",
    password_confirm: "Confirm New Password",
    change_password: "Change Password",
    save_password: "Save Password",
    password_update_desc: "System password update.",
    password_security_note: "It is recommended to update your password every 90 days to maintain state data security.",
    password_change_failed: "Failed to change password.",
    profile_saved_success: "Profile saved successfully.",
    photo_updated_success: "Profile photo updated successfully.",
    photo_upload_error: "Failed: {error}",
    photo_upload_connection_error: "Failed to connect to server while uploading photo.",
    ganti_sandi_title: "Change Password",
    ganti_sandi_old: "Old Password",
    ganti_sandi_new: "New Password",
    ganti_sandi_confirm: "Confirm New Password",
    ganti_sandi_submit: "Change Password",
    ganti_sandi_success: "✅ {message}",
    ganti_sandi_error: "❌ {message}",
    ganti_sandi_default_error: "Failed to change password.",
    ganti_sandi_connection_error: "❌ Cannot connect to server.",
    "2fa_enabled": "Two-Factor Authentication (2FA) enabled successfully.",
    "2fa_disabled": "Two-Factor Authentication (2FA) disabled successfully.",
    "2fa_toggle_error": "Failed to change 2FA status.",
    "2fa_toggle_connection_error": "Failed to change 2FA status (Connection error).",
    sesi_putus_confirm: "Are you sure you want to disconnect access from this device?",
    sesi_putus_success: "Session on that device has been disconnected successfully.",
    sesi_putus_error: "Failed to disconnect session.",
    sesi_putus_connection_error: "Failed to connect to server while disconnecting session.",
    all_session_history: "All Session History",
    last_active: "Last Active",
    notification: "Notification",
    system_summary: "Here is a summary of the system today.",
    table_nrp: "NRP",
    table_full_name: "Full Name",
    table_rank: "Rank / Grade",
    table_unit: "Unit / Organization",
    table_status: "Status",
    rank_field: "Rank",
    select_rank: "Select Rank",
    total_units: "Units",
    col_personel: "PERSONNEL",
    col_rank: "RANK",
    col_unit: "UNIT / ORG",
    col_status: "STATUS",
    col_last_update: "LAST UPDATE",
    col_action: "ACTION",
    loading_data: "Loading data...",
    login_verifying: "Verifying...",
    login_submit: "Sign In",
    login_it_support: "IT Support",
    login_support_desc: "If you encounter access issues, please contact DISINFOLAHTAU via official communication channels.",
    login_contact_helpdesk: "Contact Helpdesk",
    login_footer_copyright: "© {year} Headquarters Indonesian Air Force",
    login_footer_confidential: "Confidentiality Guaranteed",
    login_footer_encrypted: "System Encrypted",

    // profile page
    profile_title: "Admin Account Profile",
    profile_desc: "Manage your institutional identity and system access security settings.",
    profile_export_pdf: "Export PDF",
    edit_profile: "Edit Profil",
    cancel: "Batal",
    twofa_active: "2FA Aktif",
    twofa_inactive: "2FA Tidak Aktif",
    deactivate: "Nonaktifkan",
    activate: "Aktifkan",
    basic_info_contact: "Basic Info & Contact",
    full_name: "Full Name",
    nrp: "NRP",
    company_email: "Official Email",
    phone_number: "Phone Number",
    official_details: "Official Details",
    rank_corps: "Rank / Corps",
    unit: "Unit",
    structural_position: "Structural Position",
    verification_status: "Verification Status",

    // data diri page
    personnel_not_found: "Personnel data not found.",
    error_unreachable: "Cannot connect to server.",
    error_nrp_missing: "NRP not found.",
    loading_personnel: "Loading personnel data...",
    back: "Back",
    click_view_personnel: "Click to view personnel list",
    personnel_list: "Personnel List",
    active: "Active",
    inactive: "Inactive",
    twofa_status_label: "2FA Status",
    all: "All",
    close: "Close",
    view_all_notifications: "View all notifications",
    personnel_detail: "Personnel Detail",
    verified: "Verified",
    print: "Print",
    download_pdf: "Download PDF",
    personnel_current_position: "Current Position",
    personnel_type: "Personnel Type",
    tmt_last_rank: "Last Rank Effective Date",
    view_all_updates: "View all history",
    all_update_history: "All update history",
    no_history: "No history yet.",
    status_leave: "Leave",
    status_transfer: "Transfer",
    status_training: "Training",
    status_retired: "Retired",
    view_detail: "View Detail",
    export_title: "PERSONNEL LIST TNI AU",

    // profile page

    menu_dashboard: "Dashboard",
    menu_profile: "Account Profile",
    menu_personnel: "Personnel Data",

    logout: "Logout",

    dashboard_admin: "Admin Dashboard",
    view_maintenance_detail: "View maintenance details",
    view_all_activities: "View all activities",
    maintenance_detail_title: "System Maintenance Details",
    maintenance_includes: "This maintenance includes:",
    maintenance_warning: "During the maintenance period the system will be unavailable. Please save any changes before this time.",
    all_activity_log: "All Activity Log",
    welcome_back: "Welcome back",

    server_status: "Server Status",
    operational: "Operational",

    total_personnel: "Total Personnel",
    active_personnel: "Active Personnel",

    quick_access: "Quick Access",
    quick_personnel_title: "Personnel Data",
    quick_personnel_desc: "View / edit complete personnel records",
    quick_profile_access_title: "Profile & Access",
    quick_profile_access_desc: "Adjust admin credentials information, rank and unit access management.",
    quick_activity_log_title: "Activity Log",
    quick_activity_log_desc: "Monitor the full digital trail of changes made by administrators.",
    quick_reports_title: "Reports & Statistics",
    quick_reports_desc: "Generate monthly PDF/CSV documents for personnel strength reports.",
    recent_activity: "Recent Activity",
    recent_updates_subtitle: "Latest personnel data updates",
    profile_security: "Profile & Security",
    activity_log_title: "Activity Log",
    reports_statistics: "Reports & Statistics",
    notification_preferences: "Notification Preferences",
    quick_profile_access_title: "Profile & Access",
    quick_profile_access_desc: "Adjust admin credentials, rank and unit access management.",
    quick_activity_log_title: "Activity Log",
    quick_activity_log_desc: "Monitor the full digital trail of changes made by administrators.",
    quick_reports_title: "Reports & Statistics",
    quick_reports_desc: "Generate monthly PDF/CSV documents for personnel strength reports.",
    recent_activity: "Recent Activity",
    recent_updates_subtitle: "Latest personnel data updates",
    search_placeholder: "Search NRP or Personnel Name...",
    filter_status: "Filter Status",
    all_status: "All Status",
    advanced_filter: "Advanced Filter",
    sort_nrp: "Sort: NRP",
    sort_az: "Sort: A-Z",

    maint_version: "Version",
    maint_schedule_start: "Start Schedule",
    maint_estimated_finish: "Estimated Completion",
    maint_status: "Status",
    maint_scheduled: "Scheduled",
    maint_item_1: "Database schema migration to v2.4",
    maint_item_2: "Improved personnel search and filter performance",
    maint_item_3: "PDF/CSV export module update",
    maint_item_4: "2FA authentication system security patch",

    privacy_desc: "DISINFOLAHTAU system is committed to maintaining the confidentiality of all TNI AU personnel data. Data is classified as state secret and can only be accessed by authorized personnel.",
    it_support_helpdesk: "Helpdesk",
    it_support_phone: "Phone",
    it_support_hours: "Service Hours",

    profile_full_name: "Full Name",
    profile_email_dinas: "Official Email",
    profile_phone: "Phone Number",
    role_access_management: "Role & Access Management",
    access_level: "Access Level",
    access_level_desc: "Your operational authority in the system.",
    permission_manage_personnel: "Manage all personnel data",
    permission_export_pdf: "Bulk PDF/CSV export",
    permission_manage_admin: "Manage other admin accounts",
    credentials: "Credentials",
    last_login_sessions: "Last Login Sessions",
    current_session: "Current Session",
    logout_session: "Logout Session",
    no_session_history: "No session history.",
    verified_badge: "Verified by Mabesau",
    security_status: "Security Status",

    personnel_data: "Personnel Data",
    database_personnel: "Personnel Database",
    add_personnel: "Add Personnel",
    add_personnel_new: "Add New Personnel",
    edit_personnel_data: "Edit Personnel Data",

    update_history_title: "Update History",
    update_activity_log: "Log of personnel data modification activities",

    lang_indonesian: "🇮🇩 Bahasa Indonesia",
    lang_english: "🇺🇸 English",

    current_position: "Current Position",
    birth_date: "Birth Date",
    by: "By",
    present: "Present",

    database_personnel_desc: "Manage master data of soldiers and civil servants in TNI Air Force environment.",
    export_pdf: "Print PDF",
    showing_results: "Showing",
    from: "from",
    of_personnel: "personnel",
    no_matching_data: "No data matching the filter.",
    admin_notes: "Administration Notes",
    guideline_update_title: "Regular Data Update Guidelines",
    guideline_update_desc: "Personnel data updates must be done every 3 months by each work unit's admin. Data not updated for more than 6 months will be automatically marked as \"Needs Verification\" by the system.",
    integration_sispers_title: "SISPERS System Integration",
    integration_sispers_desc: "This database has been integrated with the Personnel Information System (SISPERS) of the TNI Air Force. Every data change will be automatically synchronized within 1×24 hours. Contact the DISINFOLAHTAU team if there are data discrepancies.",

    privacy_policy: "Privacy Policy",
    it_support: "IT Support"
  }
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {

    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('app_settings');
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    /* ─────────────────────────────────────
       APPLY THEME
    ───────────────────────────────────── */

    useEffect(() => {

        const root = document.documentElement;

        let effectiveTheme = settings.theme;

        if (settings.theme === 'system') {
            effectiveTheme =
                window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
        }

        root.setAttribute('data-theme', effectiveTheme);

    }, [settings.theme]);

    /* ─────────────────────────────────────
       APPLY LANGUAGE
    ───────────────────────────────────── */

    useEffect(() => {
        document.documentElement.setAttribute('lang', settings.language);
    }, [settings.language]);

    /* ─────────────────────────────────────
       SAVE LOCAL STORAGE
    ───────────────────────────────────── */

    useEffect(() => {
        localStorage.setItem('app_settings', JSON.stringify(settings));
    }, [settings]);

    /* ─────────────────────────────────────
       SAVE SETTINGS
    ───────────────────────────────────── */

    function saveSettings(newSettings) {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }

    /* ─────────────────────────────────────
       TRANSLATION FUNCTION
    ───────────────────────────────────── */

    function t(key, vars = {}) {
        const lang = settings.language;
        let str = translations[lang]?.[key] || key;
        // simple interpolation: replace {var} with provided values
        Object.keys(vars).forEach((v) => {
            str = str.replace(new RegExp(`\{${v}\}`, "g"), vars[v]);
        });
        return str;
    }

    return (
        <SettingsContext.Provider value={{ settings, saveSettings, t }}>
            {children}
        </SettingsContext.Provider>
    );
}

/* ─────────────────────────────────────
   HOOK
──────────────────────────────────── */

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings harus dipakai di dalam <SettingsProvider>');
    return ctx;
}