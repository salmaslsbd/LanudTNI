// src/App.jsx
import { useState, useEffect } from 'react';
import { useSettings } from './context/SettingsContext.jsx';
import { FiGrid, FiUser, FiFileText, FiLogOut } from 'react-icons/fi';
import logoImg from './assets/Logo_LANUD.png';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import PersonnelTracker from './components/PersonnelTracker.jsx';
import DataDiri from './components/DataDiri.jsx';
import ProfilAkun from './components/ProfilAkun.jsx';
import Pengaturan from './components/Pengaturan.jsx';
import './App.css';
import './components/sidebar-layout.css';

function SidebarLayout({ activePage, onNavigate, onLogout, children }) {
    const { t } = useSettings();

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <img src={logoImg} alt="Logo TNI AU" className="sidebar-logo-img" />
                    <div className="sidebar-brand-text">{t("app_title")}</div>
                </div>
                <nav className="sidebar-nav">
                    <div className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate('dashboard')}>
                        <FiGrid size={16} /> {t("menu_dashboard")}
                    </div>
                    <div className={`nav-item ${activePage === 'profilakun' ? 'active' : ''}`} onClick={() => onNavigate('profilakun')}>
                        <FiUser size={16} /> {t("menu_profile")}
                    </div>
                    <div className={`nav-item ${activePage === 'personnel' || activePage === 'datadiri' ? 'active' : ''}`} onClick={() => onNavigate('personnel')}>
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
            <div className="page-content">{children}</div>
        </div>
    );
}

export default function App() {
    const [page, setPage]           = useState('login');
    const [activeNrp, setActiveNrp] = useState(null);
    const [navParams, setNavParams] = useState({});
    const [adminData, setAdminData] = useState(null);

    // Restore session on app load (when user refreshes page)
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedAdmin = localStorage.getItem('admin');
        const storedPage = localStorage.getItem('lastPage');

        if (token && storedAdmin) {
            try {
                const admin = JSON.parse(storedAdmin);
                setAdminData(admin);
                
                // Restore last visited page, default to dashboard
                const pageToRestore = storedPage || 'dashboard';
                setPage(pageToRestore);
                
                // Verify token is still valid by calling API (non-blocking)
                // Only logout if we get 401/403, ignore network errors to avoid false logouts
                fetch('http://localhost:8000/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })
                .then(res => {
                    // Only logout on explicit 401/403 auth errors
                    if (res.status === 401 || res.status === 403) {
                        throw new Error('Token invalid or expired');
                    }
                    // For other statuses (including 5xx errors), keep session
                    // User will be redirected to login if they try to access protected resources
                })
                .catch(err => {
                    // Only logout on explicit auth errors
                    if (err.message === 'Token invalid or expired') {
                        console.warn('Token expired, logging out');
                        localStorage.removeItem('token');
                        localStorage.removeItem('admin');
                        localStorage.removeItem('lastPage');
                        setAdminData(null);
                        setPage('login');
                    }
                    // Network errors are silently ignored - keep user logged in
                });
            } catch (err) {
                console.error('Failed to restore session:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('admin');
                localStorage.removeItem('lastPage');
                setAdminData(null);
                setPage('login');
            }
        }
    }, []);

    function handleLogin(admin) {
        setAdminData(admin);
        localStorage.setItem('lastPage', 'dashboard');
        setPage('dashboard');
    }

    function handleLogout() {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('http://localhost:8000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }).catch(() => {});
        }
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        localStorage.removeItem('lastPage');
        setAdminData(null);
        setPage('login');
    }

    function handleNavigate(target, params = null) {
        if (typeof params === 'string') {
            setActiveNrp(params);
            setNavParams({});
        } else if (typeof params === 'object' && params !== null) {
            setNavParams(params);
            if (params.nrp) setActiveNrp(params.nrp);
        }
        // Save current page to localStorage for session restoration
        localStorage.setItem('lastPage', target);
        setPage(target);
    }

    if (page === 'login') return <Login onLogin={handleLogin} />;
    if (page === 'dashboard') return (
        <Dashboard onLogout={handleLogout} onNavigate={handleNavigate} adminData={adminData} />
    );

    return (
        <SidebarLayout activePage={page} onNavigate={handleNavigate} onLogout={handleLogout}>
            {page === 'personnel'  && <PersonnelTracker onNavigate={handleNavigate} onLogout={handleLogout} initFilter={navParams?.filter} />}
            {page === 'datadiri'   && <DataDiri nrp={activeNrp} onNavigate={handleNavigate} onLogout={handleLogout} />}
            {page === 'profilakun' && <ProfilAkun adminData={adminData} onLogout={handleLogout} />}
            {page === 'pengaturan' && <Pengaturan onNavigate={handleNavigate} />}
        </SidebarLayout>
    );
}
