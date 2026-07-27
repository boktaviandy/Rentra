import React, { useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { Moon, Sun, Globe, Bell, Search, User, ShieldAlert, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './Header.css';

function SubscriptionBanner({ daysLeft, paket }) {
  if (daysLeft > 14) return null; // hanya tampil kalau <= 14 hari

  const isUrgent = daysLeft <= 3;
  const isWarning = daysLeft <= 7 && daysLeft > 3;

  let colorClass = 'sub-banner-info';
  let icon = <Clock size={14} />;
  if (isUrgent) { colorClass = 'sub-banner-danger'; icon = <ShieldAlert size={14} />; }
  else if (isWarning) { colorClass = 'sub-banner-warning'; icon = <Clock size={14} />; }

  return (
    <div className={`sub-banner ${colorClass}`}>
      {icon}
      <span>
        {isUrgent
          ? `⚠️ Langganan ${paket} berakhir dalam ${daysLeft} hari! Perpanjang sekarang.`
          : `Langganan ${paket} berakhir dalam ${daysLeft} hari.`
        }
      </span>
    </div>
  );
}

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { currentLang, toggleLanguage } = useLanguage();
  const { currentTenant } = useAuth();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');

  const paket = currentTenant?.paket || 'Trial';
  const tglExpired = currentTenant?.tglExpired || '2026-08-10';
  const namaRental = currentTenant?.namaRental || 'Garuda Rent Car';

  // Hitung sisa hari langganan
  const daysLeft = useMemo(() => {
    const today = new Date();
    const expired = new Date(tglExpired);
    const diff = expired - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [tglExpired]);

  return (
    <div className="header-wrapper">
      {/* Banner Peringatan Password Sementara / Langganan */}
      {!isSuperAdmin && currentTenant?.passwordSementara && (
        <div className="sub-banner sub-banner-warning" style={{ background: '#FFFBEB', color: '#92400E', borderBottom: '1px solid #FCD34D' }}>
          <ShieldAlert size={14} />
          <span>
            <strong>Keamanan:</strong> Anda menggunakan password sementara. Disarankan untuk segera <a href="/pengaturan" style={{ color: '#B45309', fontWeight: '700', textDecoration: 'underline' }}>Ganti Password di Pengaturan</a>.
          </span>
        </div>
      )}

      {!isSuperAdmin && !currentTenant?.passwordSementara && (
        <SubscriptionBanner daysLeft={daysLeft} paket={paket} />
      )}

      <header className="app-header">
        <div className="header-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Cari mobil, customer, booking..."
            className="header-search-input"
          />
        </div>

        <div className="header-actions">
          {/* Subscription Pill (compact, selalu tampil untuk owner) */}
          {!isSuperAdmin && (
            <div
              className={`sub-pill ${daysLeft <= 3 ? 'sub-pill-danger' : daysLeft <= 7 ? 'sub-pill-warning' : 'sub-pill-ok'}`}
              title={`Paket ${paket} — expired ${tglExpired}`}
            >
              <Clock size={12} />
              <span>{daysLeft} Hari</span>
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="header-action-btn"
            title="Ganti Bahasa / Change Language"
          >
            <Globe size={18} />
            <span className="lang-code">{currentLang.toUpperCase()}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="header-action-btn"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <button className="header-action-btn notif-btn" title="Notifikasi">
            <Bell size={18} />
            <span className="notif-badge"></span>
          </button>

          {/* User Profile */}
          <div className="header-user">
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">
                {isSuperAdmin ? 'Super Admin' : namaRental}
              </span>
              <span className="user-role">
                {isSuperAdmin ? 'Platform Administrator' : `${t('roles.owner')} • ${paket}`}
              </span>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
