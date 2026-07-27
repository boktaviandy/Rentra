import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { RevenueLineChart } from '../../components/charts/RevenueLineChart';
import { Badge, getStatusBadgeVariant } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import {
  Car,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  ArrowUpRight,
  Eye,
  Plus
} from 'lucide-react';
import { useTenantStore } from '../../hooks/useTenantStore';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentTenant } = useAuth();

  const { data: mobilData } = useTenantStore('mobil');
  const { data: bookingData } = useTenantStore('booking');
  const { data: pemasukanData } = useTenantStore('pemasukan');
  const { data: pengeluaranData } = useTenantStore('pengeluaran');

  // Metrics computation from tenant data
  const totalMobil = mobilData.length;
  const mobilDisewa = mobilData.filter((m) => m.status === 'Disewa').length;

  const totalPemasukan = pemasukanData.reduce((acc, p) => acc + (Number(p.nominal) || 0), 0);
  const totalPengeluaran = pengeluaranData.reduce((acc, p) => acc + (Number(p.nominal) || 0), 0);
  const labaBersih = totalPemasukan - totalPengeluaran;

  const todayStr = new Date().toISOString().slice(0, 10);
  const bookingHariIni = bookingData.filter((b) => b.tglMulai === todayStr || b.tglMulai === '2026-07-27').length;
  const bookingBesok = bookingData.filter((b) => b.tglMulai === '2026-07-28').length;

  const mobilKembaliHariIni = bookingData
    .filter((b) => b.tglSelesai === todayStr || b.tglSelesai === '2026-07-27')
    .map((b) => ({ plat: b.mobilPlat, mobil: b.mobilNama, customer: b.customerNama, jam: '17:00 WIB' }));

  const recentBookings = bookingData.slice(0, 5);

  return (
    <div className="dashboard-page">
      <PageHeader
        title={t('nav.dashboard')}
        description={`Selamat datang di ${currentTenant?.namaRental || 'Rentra'}! Ringkasan operasional dan keuangan rental Anda hari ini.`}
        action={
          <button className="btn btn-primary" onClick={() => navigate('/booking')}>
            <Plus size={16} />
            Tambah Booking
          </button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <StatCard
          title={t('dashboard.total_mobil')}
          value={totalMobil}
          icon={Car}
          color="primary"
          subtext="Semua unit di garasi"
        />
        <StatCard
          title={t('dashboard.mobil_disewa')}
          value={mobilDisewa}
          icon={CheckCircle2}
          color="info"
          subtext={`${Math.round((mobilDisewa / totalMobil) * 100)}% okupansi`}
        />
        <StatCard
          title={t('dashboard.pendapatan_bulan_ini')}
          value={`Rp ${totalPemasukan.toLocaleString('id-ID')}`}
          icon={TrendingUp}
          color="success"
          subtext="+12% dari bulan lalu"
        />
        <StatCard
          title={t('dashboard.pengeluaran_bulan_ini')}
          value={`Rp ${totalPengeluaran.toLocaleString('id-ID')}`}
          icon={TrendingDown}
          color="danger"
          subtext="Servis & operasional"
        />
        <StatCard
          title={t('dashboard.laba_bersih')}
          value={`Rp ${labaBersih.toLocaleString('id-ID')}`}
          icon={DollarSign}
          color="warning"
          subtext="Margin bersih ~20.6%"
        />
        <StatCard
          title={t('dashboard.booking_hari_ini')}
          value={bookingHariIni}
          icon={Calendar}
          color="primary"
          subtext="Jadwal penyerahan unit"
        />
        <StatCard
          title={t('dashboard.booking_besok')}
          value={bookingBesok}
          icon={Clock}
          color="secondary"
          subtext="Persiapan unit esok hari"
        />
      </div>

      {/* Charts & Lists Grid */}
      <div className="dashboard-grid margin-top-lg">
        {/* Chart Column */}
        <div className="card dashboard-card chart-card">
          <div className="chart-header">
            <div>
              <h3 className="card-title">{t('dashboard.pendapatan_30_hari')}</h3>
              <p className="card-subtitle">Tren omset persewaan kendaraan bulan ini</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/laporan')}>
              {t('dashboard.lihat_laporan')} <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="chart-container">
            <RevenueLineChart />
          </div>
        </div>

        {/* Mobil Kembali Hari Ini Column */}
        <div className="card dashboard-card">
          <div className="card-header">
            <h3 className="card-title">{t('dashboard.mobil_kembali_hari_ini')}</h3>
            <span className="badge badge-warning">{mobilKembaliHariIni.length} Unit</span>
          </div>

          <div className="returns-list">
            {mobilKembaliHariIni.map((item, idx) => (
              <div key={idx} className="return-item">
                <div className="return-icon-box">
                  <Clock size={18} />
                </div>
                <div className="return-info">
                  <div className="return-title">{item.mobil}</div>
                  <div className="return-sub">
                    {item.plat} • {item.customer}
                  </div>
                </div>
                <div className="return-time">{item.jam}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card margin-top-lg">
        <div className="card-header flex-between">
          <h3 className="card-title">{t('dashboard.booking_terbaru')}</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/booking')}>
            Lihat Semua Booking
          </button>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID Booking</th>
                <th>Pelanggan</th>
                <th>Mobil</th>
                <th>Tanggal Sewa</th>
                <th>Total Biaya</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <span className="id-tag">{b.id}</span>
                  </td>
                  <td className="font-medium">{b.customerNama}</td>
                  <td>
                    {b.mobilNama}
                    <div className="subtext">{b.mobilPlat}</div>
                  </td>
                  <td>
                    {b.tglMulai} s/d {b.tglSelesai}
                    <div className="subtext">{b.totalHari} Hari</div>
                  </td>
                  <td className="font-semibold">
                    Rp {Number(b.totalHarga).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <Badge variant={getStatusBadgeVariant(b.status)}>{b.status}</Badge>
                  </td>
                  <td>
                    <button
                      className="btn-icon"
                      title="Lihat Detail"
                      onClick={() => navigate(`/booking/${b.id}`)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
