import React, { useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  FileText,
  Users,
  UserCheck,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Receipt,
  Settings,
  Building2,
  Package,
  CreditCard,
  PieChart,
  LogOut,
  CarFront,
  Clock,
  ShieldAlert,
  Images,
  History,
  Inbox
} from 'lucide-react';
import { useTenantStore } from '../../hooks/useTenantStore';
import { useLeadsData } from '../../hooks/useLeadsData';
import './Sidebar.css';


export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTenant, logout } = useAuth();
  const { data: tenantSettings } = useTenantStore('settings');
  const { pendingCount } = useLeadsData();
  const tenantLogo = tenantSettings[0]?.logo || currentTenant?.logo || null;

  const isSuperAdmin = location.pathname.startsWith('/superadmin');

  const paket = currentTenant?.paket || 'Trial';
  const tglExpired = currentTenant?.tglExpired || '2026-08-10';

  // Hitung sisa hari langganan
  const daysLeft = useMemo(() => {
    const today = new Date();
    const expired = new Date(tglExpired);
    const days = Math.ceil((expired - today) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [tglExpired]);

  const subStatusClass = daysLeft <= 3 ? 'sub-status-danger' : daysLeft <= 7 ? 'sub-status-warning' : daysLeft <= 14 ? 'sub-status-info' : 'sub-status-ok';
  const subStatusLabel = daysLeft <= 3 ? 'Kritis' : daysLeft <= 7 ? 'Hampir Habis' : daysLeft <= 14 ? 'Segera Habis' : 'Aktif';

  const ownerNavItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/mobil', label: t('nav.mobil'), icon: Car },
    { path: '/booking', label: t('nav.booking'), icon: FileText },
    { path: '/kalender', label: t('nav.kalender'), icon: CalendarDays },
    { path: '/customer', label: t('nav.customer'), icon: Users },
    { path: '/driver', label: t('nav.driver'), icon: UserCheck },
    { path: '/pemasukan', label: t('nav.pemasukan'), icon: TrendingUp },
    { path: '/pengeluaran', label: t('nav.pengeluaran'), icon: TrendingDown },
    { path: '/laporan', label: t('nav.laporan'), icon: BarChart3 },
    { path: '/invoice', label: t('nav.invoice'), icon: Receipt },
    { path: '/audit-log', label: 'Audit Log', icon: History },
    { path: '/pengaturan', label: t('nav.pengaturan'), icon: Settings },
  ];

  const superAdminNavItems = [
    { path: '/superadmin/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/superadmin/leads', label: 'Leads', icon: Inbox, badge: pendingCount },
    { path: '/superadmin/tenant', label: t('nav.tenant'), icon: Building2 },
    { path: '/superadmin/paket', label: t('nav.paket'), icon: Package },
    { path: '/superadmin/langganan', label: t('nav.langganan'), icon: FileText },
    { path: '/superadmin/pembayaran', label: t('nav.pembayaran'), icon: CreditCard },
    { path: '/superadmin/statistik', label: t('nav.statistik'), icon: PieChart },
    { path: '/superadmin/foto-mobil', label: 'Library Foto', icon: Images },
    { path: '/superadmin/pengaturan', label: t('nav.pengaturan_platform'), icon: Settings },
  ];

  const navItems = isSuperAdmin ? superAdminNavItems : ownerNavItems;

  const handleLogout = () => {
    logout();
    if (isSuperAdmin) {
      navigate('/superadmin/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          {!isSuperAdmin && tenantLogo ? (
            <img
              src={tenantLogo}
              alt="Logo Rental"
              className="brand-logo-img"
            />
          ) : (
            <CarFront size={24} className="brand-icon" />
          )}
        </div>
        <div className="brand-text">
          <span className="brand-title">Rentra</span>
          {isSuperAdmin ? (
            <span className="brand-subtitle">{t('roles.superadmin')}</span>
          ) : (
            <span className={`brand-sub-pill brand-sub-pill-${(paket || 'Trial').toLowerCase()}`}>
              {paket || 'Trial'}
            </span>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Subscription Status Block (only for Owner/Admin) */}
      {!isSuperAdmin && (
        <div className={`sidebar-sub-card ${subStatusClass}`}>
          <div className="sub-card-header">
            {daysLeft <= 3 ? <ShieldAlert size={12} /> : <Clock size={12} />}
            <span className="sub-card-label">{paket} • {daysLeft} Hari</span>
            <span className="sub-card-status">{subStatusLabel}</span>
          </div>
          <div className="sub-card-footer">
            <span className="sub-card-expired">Exp: {tglExpired}</span>
            <a
              href={`https://wa.me/6281250308099?text=${encodeURIComponent(`Halo Admin Rentra, saya mau perpanjang langganan rental: ${namaRental} (${paket})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sub-card-extend-btn"
            >
              Perpanjang
            </a>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
