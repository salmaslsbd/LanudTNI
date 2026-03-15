// src/components/Pengaturan.jsx
import { useState } from 'react';
import { FiBell, FiMonitor, FiSave, FiCheck } from 'react-icons/fi';
import { useSettings } from '../context/SettingsContext.jsx';
import './Pengaturan.css';

/* ─── Toggle ─── */
function Toggle({ checked, onChange }) {
    return (
        <div
            className={`pg-toggle ${checked ? 'on' : 'off'}`}
            onClick={() => onChange(!checked)}
            role="switch"
            aria-checked={checked}
        >
            <div className="pg-toggle-thumb" />
        </div>
    );
}

/* ─── Select ─── */
function PgSelect({ value, onChange, children }) {
    return (
        <select className="pg-select" value={value} onChange={onChange}>
            {children}
        </select>
    );
}

/* ─── Row ─── */
function Row({ label, desc, children }) {
    return (
        <div className="pg-row">
            <div>
                <div className="pg-row-label">{label}</div>
                <div className="pg-row-desc">{desc}</div>
            </div>
            <div className="pg-row-control">{children}</div>
        </div>
    );
}

/* ─── Card ─── */
function Card({ icon: Icon, title, subtitle, children }) {
    return (
        <div className="pg-card">
            <div className="pg-card-header">
                <div className="pg-card-icon"><Icon size={18} /></div>
                <div>
                    <div className="pg-card-title">{title}</div>
                    <div className="pg-card-subtitle">{subtitle}</div>
                </div>
            </div>
            <div className="pg-card-body">{children}</div>
        </div>
    );
}

/* ─── Main ─── */
export default function Pengaturan() {

    // ambil settings + translator
    const { settings, saveSettings, t } = useSettings();

    const [draft, setDraft] = useState({ ...settings });
    const [saved, setSaved] = useState(false);

    function update(key, value) {
        setDraft(prev => ({ ...prev, [key]: value }));
    }

    function handleSave() {
        saveSettings(draft);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    return (
        <div className="pg-wrapper">

            {/* Header */}
            <div className="pg-header">
                <div className="pg-header-text">
                    <h1>{t("settings_title")}</h1>
                    <p>{t("settings_desc")}</p>
                </div>

                <button
                    className={`pg-save-btn${saved ? ' saved' : ''}`}
                    onClick={handleSave}
                >
                    {saved ? <FiCheck size={15} /> : <FiSave size={15} />}
                    {saved ? t("saved") : t("save_settings")}
                </button>
            </div>

            {/* Grid */}
            <div className="pg-grid">

                <Card
                    icon={FiMonitor}
                    title={t("appearance")}
                    subtitle={t("appearance_desc")}
                >

                    <Row
                        label={t("theme")}
                        desc={t("theme_desc")}
                    >
                        <PgSelect
                            value={draft.theme}
                            onChange={e => update('theme', e.target.value)}
                        >
                            <option value="light">{t("theme_light")}</option>
                            <option value="dark">{t("theme_dark")}</option>
                            <option value="system">{t("theme_system")}</option>
                        </PgSelect>
                    </Row>

                    <Row
                        label={t("language")}
                        desc={t("language_desc")}
                    >
                        <PgSelect
                            value={draft.language}
                            onChange={e => update('language', e.target.value)}
                        >
                            <option value="id">{t("lang_indonesian")}</option>
                            <option value="en">{t("lang_english")}</option>
                        </PgSelect>
                    </Row>

                </Card>

                <Card
                    icon={FiBell}
                    title={t("notifications")}
                    subtitle={t("notifications_desc")}
                >

                    <Row
                        label={t("notif_web")}
                        desc={t("notif_web_desc")}
                    >
                        <Toggle
                            checked={draft.notifWeb}
                            onChange={v => update('notifWeb', v)}
                        />
                    </Row>

                    <Row
                        label={t("notif_email")}
                        desc={t("notif_email_desc")}
                    >
                        <Toggle
                            checked={draft.notifEmail}
                            onChange={v => update('notifEmail', v)}
                        />
                    </Row>

                    <Row
                        label={t("activity_log")}
                        desc={t("activity_log_desc")}
                    >
                        <Toggle
                            checked={draft.notifActivity}
                            onChange={v => update('notifActivity', v)}
                        />
                    </Row>

                </Card>

            </div>

            {/* Status */}
            <div className="pg-status">
                <div className="pg-status-dot" />
                {t("system_normal")}
            </div>

            {/* Toast */}
            {saved && (
                <div className="pg-toast">
                    <div className="pg-toast-icon">
                        <FiCheck size={13} color="#fff" />
                    </div>
                    {t("settings_saved")}
                </div>
            )}

        </div>
    );
}