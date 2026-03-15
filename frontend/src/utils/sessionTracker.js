// ─── Deteksi Browser ─────────────────────────────────────────────────────────
export function getBrowserName(ua = navigator.userAgent) {
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
    return 'Browser';
}

// ─── Deteksi OS ──────────────────────────────────────────────────────────────
export function getOSName(ua = navigator.userAgent) {
    if (ua.includes('Windows NT 10.0') || ua.includes('Windows NT 11.0')) return 'Windows';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown OS';
}

// ─── Format Waktu Indonesia ───────────────────────────────────────────────────
export function formatWaktuID(isoString) {
    const date = new Date(isoString);
    const now = new Date();

    const sampeHari = (d1, d2) => d1.toDateString() === d2.toDateString();
    const kemarin = new Date(now);
    kemarin.setDate(kemarin.getDate() - 1);

    const jam = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }) + ' WIB';

    if (sampeHari(date, now)) return `Hari ini, ${jam}`;
    if (sampeHari(date, kemarin)) return `Kemarin, ${jam}`;

    return date.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
    }) + `, ${jam}`;
}

// ─── Storage Key ─────────────────────────────────────────────────────────────
const KEY = 'disinfolahtau_sesi';

// ─── Simpan sesi login saat ini ──────────────────────────────────────────────
// Dipanggil di App.jsx setiap kali user berhasil login
export function saveSesiLogin() {
    const browser = getBrowserName();
    const os = getOSName();
    const label = `${browser} / ${os}`;
    const waktu = new Date().toISOString();

    // Ambil riwayat lama, nonaktifkan semua
    const existing = getSesiHistory().map(s => ({ ...s, active: false }));

    // Hapus entry dengan label sama supaya tidak duplikat
    const filtered = existing.filter(s => s.browser !== label);

    // Tambahkan sesi baru di depan, max 5 sesi
    const updated = [{ browser: label, waktu, active: true }, ...filtered].slice(0, 5);

    localStorage.setItem(KEY, JSON.stringify(updated));
}

// ─── Ambil riwayat sesi ──────────────────────────────────────────────────────
export function getSesiHistory() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
}