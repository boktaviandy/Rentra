import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { SuperAdminLoginPage } from '../pages/auth/SuperAdminLoginPage';

// Owner Pages
import { DashboardPage } from '../pages/owner/DashboardPage';
import { MobilPage } from '../pages/owner/MobilPage';
import { MobilDetailPage } from '../pages/owner/MobilDetailPage';
import { BookingPage } from '../pages/owner/BookingPage';
import { BookingDetailPage } from '../pages/owner/BookingDetailPage';
import { KalenderPage } from '../pages/owner/KalenderPage';
import { CustomerPage } from '../pages/owner/CustomerPage';
import { CustomerDetailPage } from '../pages/owner/CustomerDetailPage';
import { DriverPage } from '../pages/owner/DriverPage';
import { PemasukanPage } from '../pages/owner/PemasukanPage';
import { PengeluaranPage } from '../pages/owner/PengeluaranPage';
import { LaporanPage } from '../pages/owner/LaporanPage';
import { InvoicePage } from '../pages/owner/InvoicePage';
import { InvoiceDetailPage } from '../pages/owner/InvoiceDetailPage';
import { PengaturanPage } from '../pages/owner/PengaturanPage';
import { AuditLogPage } from '../pages/owner/AuditLogPage';

// Super Admin Pages
import { SADashboardPage } from '../pages/superadmin/SADashboardPage';
import { TenantPage } from '../pages/superadmin/TenantPage';
import { PaketPage } from '../pages/superadmin/PaketPage';
import { LanggananPage } from '../pages/superadmin/LanggananPage';
import { PembayaranPage } from '../pages/superadmin/PembayaranPage';
import { StatistikPage } from '../pages/superadmin/StatistikPage';
import { PengaturanPlatformPage } from '../pages/superadmin/PengaturanPlatformPage';
import { FotoMobilPage } from '../pages/superadmin/FotoMobilPage';
import { SALeadsPage } from '../pages/superadmin/SALeadsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />

        {/* Owner Layout Routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Mobil */}
          <Route path="/mobil" element={<MobilPage />} />
          <Route path="/mobil/:id" element={<MobilDetailPage />} />

          {/* Booking */}
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/:id" element={<BookingDetailPage />} />

          {/* Kalender */}
          <Route path="/kalender" element={<KalenderPage />} />

          {/* Customer */}
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/customer/:id" element={<CustomerDetailPage />} />

          {/* Driver */}
          <Route path="/driver" element={<DriverPage />} />

          {/* Pemasukan & Pengeluaran */}
          <Route path="/pemasukan" element={<PemasukanPage />} />
          <Route path="/pengeluaran" element={<PengeluaranPage />} />

          {/* Laporan & Invoice */}
          <Route path="/laporan" element={<LaporanPage />} />
          <Route path="/invoice" element={<InvoicePage />} />
          <Route path="/invoice/:id" element={<InvoiceDetailPage />} />

          {/* Pengaturan */}
          <Route path="/pengaturan" element={<PengaturanPage />} />
          <Route path="/audit-log" element={<AuditLogPage />} />

          {/* Super Admin Routes (Shared Shell) */}
          <Route path="/superadmin/dashboard" element={<SADashboardPage />} />
          <Route path="/superadmin/tenant" element={<TenantPage />} />
          <Route path="/superadmin/paket" element={<PaketPage />} />
          <Route path="/superadmin/langganan" element={<LanggananPage />} />
          <Route path="/superadmin/pembayaran" element={<PembayaranPage />} />
          <Route path="/superadmin/statistik" element={<StatistikPage />} />
          <Route path="/superadmin/pengaturan" element={<PengaturanPlatformPage />} />
          <Route path="/superadmin/foto-mobil" element={<FotoMobilPage />} />
          <Route path="/superadmin/leads" element={<SALeadsPage />} />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
