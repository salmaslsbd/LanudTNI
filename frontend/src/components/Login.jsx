import { useState } from 'react';
import { FiUser, FiLock, FiChevronRight, FiInfo, FiExternalLink, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import logoImg from '../assets/Logo_LANUD.png';
import { useSettings } from '../context/SettingsContext.jsx';
import backgroundImg from '../assets/background.jpg';
import './login.css';

export default function Login({ onLogin }) {
    const [nrp, setNrp] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showBantuanModal, setShowBantuanModal] = useState(false);
    const { settings, t } = useSettings();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!nrp || !password) {
            setError(t('login_error_required'));
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nrp, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('admin', JSON.stringify(data.data.admin));
                onLogin(data.data.admin);
            } else {
                setError(data.message || t('login_error_invalid'));
            }
        } catch {
            setError(t('login_error_unreachable'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg" style={{ backgroundImage: `url(${backgroundImg})` }} />
            <div className="login-badge">
                <span>{t('login_badge')}</span>
            </div>
            <div className="login-card">
                <div className="login-logo">
                    <div className="logo-icon">
                        <img src={logoImg} alt="Logo LANUD" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                    </div>
                    <h1>{t('login_title')}</h1>
                    <p>{t('login_subtitle')}</p>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            background: '#ff000015',
                            border: '1px solid #ff000040',
                            color: '#ff4444',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            marginBottom: '12px'
                        }}>
                            {error}
                        </div>
                    )}
                    <div className="form-group">
                        <label>{t('login_label_nrp')}</label>
                        <div className="input-wrapper">
                            <FiUser />
                            <input
                                type="text"
                                placeholder={t('login_placeholder_nrp')}
                                value={nrp}
                                onChange={(e) => setNrp(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="form-group-header">
                            <label>{t('login_label_password')}</label>
                            <span className="forgot-link">{t('login_forgot_password')}</span>
                        </div>
                        <div className="input-wrapper">
                            <FiLock />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t('login_placeholder_password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: 'pointer', marginLeft: 'auto', opacity: 0.5 }}
                            >
                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </span>
                        </div>
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? t('login_verifying') : t('login_submit')}
                        {!loading && <FiChevronRight size={18} />}
                    </button>
                </form>
                <div className="login-support">
                    <div className="support-title">
                        <FiInfo size={15} />
                        {t('login_it_support')}
                    </div>
                    <p className="support-desc">
                        {t('login_support_desc')}
                    </p>
                    <button
                        className="helpdesk-link"
                        onClick={() => setShowBantuanModal(true)}
                    >
                        {t('login_contact_helpdesk')} &nbsp;<FiExternalLink size={12} />
                    </button>
                </div>
            </div>
            <div className="login-footer">
                <p>{t('login_footer_copyright', { year: new Date().getFullYear() })}</p>
                <div className="footer-badges">
                    <span>{t('login_footer_confidential')}</span>
                    <div className="footer-dot" />
                    <span>{t('login_footer_encrypted')}</span>
                </div>
            </div>

            {/* MODAL BANTUAN IT */}
            {showBantuanModal && (
                <div
                    className="login-modal-overlay"
                    onClick={() => setShowBantuanModal(false)}
                >
                    <div
                        className="login-modal-box"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="login-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FiInfo size={16} />
                                {t('it_support')}
                            </div>
                            <button
                                className="login-modal-close"
                                onClick={() => setShowBantuanModal(false)}
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="login-modal-body">
                            <div className="login-modal-contact-list">
                                {[
                                    [t('it_support_helpdesk'), 'disinfolahtau@tniau.mil.id'],
                                    [t('it_support_phone'), '(021) 800-1234'],
                                    [t('it_support_hours'), 'Senin – Jumat, 08:00 – 17:00 WIB'],
                                    ['Darurat 24 Jam', '+62 812-0000-1234'],
                                ].map(([k, v]) => (
                                    <div key={k} className="login-modal-contact-row">
                                        <span className="login-modal-contact-label">{k}</span>
                                        <strong className="login-modal-contact-value">{v}</strong>
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
