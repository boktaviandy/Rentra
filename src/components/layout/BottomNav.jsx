import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  FileText,
  Menu,
  X,
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
  PieChart
} from 'lucide-react';
import './BottomNav.css';

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDrawer, setShowDrawer] = useState(false);

  const isSuperAdmin = location.pathname.startsWith('/superadmin');

  const mainOwnerNav = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/booking', label: t('nav.booking'), icon: FileText },
    { path: '/kalender', label: t('nav.kalender'), icon: CalendarDays },
    { path: '/mobil', label: t('nav.mobil'), icon: Car },
  ];

  const drawerOwnerNav = [
    { path: '/customer', label: t('nav.customer'), icon: Users },
    { path: '/driver', label: t('nav.driver'), icon: UserCheck },
    { path: '/pemasukan', label: t('nav.pemasukan'), icon: TrendingUp },
    { path: '/pengeluaran', label: t('nav.pengeluaran'), icon: TrendingDown },
    { path: '/laporan', label: t('nav.laporan'), icon: BarChart3 },
    { path: '/invoice', label: t('nav.invoice'), icon: Receipt },
    { path: '/pengaturan', label: t('nav.pengaturan'), icon: Settings },
  ];

  const mainSuperNav = [
    { path: '/superadmin/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/superadmin/tenant', label: t('nav.tenant'), icon: Building2 },
    { path: '/superadmin/paket', label: t('nav.paket'), icon: Package },
    { path: '/superadmin/langganan', label: t('nav.langganan'), icon: FileText },
  ];

  const drawerSuperNav = [
    { path: '/superadmin/pembayaran', label: t('nav.pembayaran'), icon: CreditCard },
    { path: '/superadmin/statistik', label: t('nav.statistik'), icon: PieChart },
    { path: '/superadmin/pengaturan', label: t('nav.pengaturan_platform'), icon: Settings },
  ];

  const mainItems = isSuperAdmin ? mainSuperNav : mainOwnerNav;
  const drawerItems = isSuperAdmin ? drawerSuperNav : drawerOwnerNav;

  return (
    <>
      <nav className="bottom-nav">
        {mainItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `bottom-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          );
        })}

        <button
          className={`bottom-nav-item ${showDrawer ? 'active' : ''}`}
          onClick={() => setShowDrawer(!showDrawer)}
        >
          {showDrawer ? <X size={20} /> : <Menu size={20} />}
          <span className="bottom-nav-label">More</span>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {showDrawer && (
        <div className="mobile-drawer-overlay" onClick={() => setShowDrawer(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <h3>Menu Rentra</h3>
              <button onClick={() => setShowDrawer(false)} className="btn-icon">
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-grid">
              {drawerItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    className="drawer-grid-item"
                    onClick={() => {
                      navigate(item.path);
                      setShowDrawer(false);
                    }}
                  >
                    <div className="drawer-icon-box">
                      <Icon size={20} />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
