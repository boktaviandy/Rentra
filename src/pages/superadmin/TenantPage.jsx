import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { Badge, getStatusBadgeVariant } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { RefreshCw, Trash2, Plus, MapPin, Phone } from 'lucide-react';
import { useTenantData } from '../../hooks/useTenantData';

export function TenantPage() {
  const { tenants, addTenant, updateStatus, updatePaket, updateTenant, extendSubscription, deleteTenant } = useTenantData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [extendModalTenant, setExtendModalTenant] = useState(null);
  const [extendOption, setExtendOption] = useState('365');
  const [customDate, setCustomDate] = useState('');

  const [formData, setFormData] = useState({
    namaRental: '',
    namaOwner: '',
    email: '',
    noHp: '',
    kota: '',
    paket: 'Pro',
    status: 'Aktif',
    durasiHari: 365,
  });

  const handleOpenAddModal = () => {
    setFormData({
      namaRental: '',
      namaOwner: '',
      email: '',
      noHp: '',
      kota: 'Jakarta',
      paket: 'Pro',
      status: 'Aktif',
      durasiHari: 365,
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.namaRental || !formData.namaOwner) return;

    addTenant({
      namaRental: formData.namaRental,
      namaOwner: formData.namaOwner,
      email: formData.email,
      wa: formData.noHp,
      kota: formData.kota,
      paket: formData.paket,
      status: formData.status,
      durasiHari: Number(formData.durasiHari) || 365,
    });

    setIsAddModalOpen(false);
  };

  const handleStatusChange = (id, newStatus) => {
    updateStatus(id, newStatus);
  };

  const handlePaketChange = (id, newPaket) => {
    updatePaket(id, newPaket);
  };

  const handleOpenExtendModal = (tenant) => {
    setExtendModalTenant(tenant);
    setExtendOption('365');
    // Pre-fill custom date with next year
    const d = new Date(tenant.tglExpired > new Date().toISOString().slice(0, 10) ? tenant.tglExpired : new Date());
    d.setFullYear(d.getFullYear() + 1);
    setCustomDate(d.toISOString().slice(0, 10));
  };

  const handleExtendSubmit = (e) => {
    e.preventDefault();
    if (!extendModalTenant) return;

    if (extendOption === 'custom') {
      if (!customDate) return;
      updateTenant(extendModalTenant.id, {
        tglExpired: customDate,
        status: 'Aktif',
      });
    } else {
      const days = Number(extendOption);
      extendSubscription(extendModalTenant.id, days);
    }

    setExtendModalTenant(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tenant ini?')) {
      deleteTenant(id);
    }
  };

  // Calculate new expiration preview
  const getPreviewExpiredDate = () => {
    if (!extendModalTenant) return '';
    if (extendOption === 'custom') return customDate || '-';

    const base = new Date(extendModalTenant.tglExpired > new Date().toISOString().slice(0, 10) ? extendModalTenant.tglExpired : new Date());
    base.setDate(base.getDate() + Number(extendOption));
    return base.toISOString().slice(0, 10);
  };

  const columns = [
    {
      header: 'Nama Rental',
      cell: (row) => (
        <div>
          <div className="font-medium" style={{ fontWeight: '700', color: 'var(--text-main)' }}>{row.namaRental}</div>
          <div className="subtext">
            Owner: {row.namaOwner} • <MapPin size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {row.kota || 'Indonesia'}
          </div>
        </div>
      )
    },
    {
      header: 'Kontak',
      cell: (row) => (
        <div className="subtext">
          {row.email}<br />
          <Phone size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {row.noHp}
        </div>
      )
    },
    {
      header: 'Paket SaaS (Ubah)',
      cell: (row) => (
        <select
          className="form-select"
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '6px',
            width: 'auto',
            background: row.paket === 'Pro' ? '#EFF6FF' : row.paket === 'Enterprise' ? '#F3E8FF' : row.paket === 'Basic' ? '#F0FFF4' : '#FEF2F2',
            color: row.paket === 'Pro' ? '#1D4ED8' : row.paket === 'Enterprise' ? '#6B21A8' : row.paket === 'Basic' ? '#15803D' : '#B91C1C',
            borderColor: row.paket === 'Pro' ? '#BFDBFE' : row.paket === 'Enterprise' ? '#E9D5FF' : row.paket === 'Basic' ? '#BBF7D0' : '#FECACA',
            cursor: 'pointer'
          }}
          value={row.paket || 'Trial'}
          onChange={(e) => handlePaketChange(row.id, e.target.value)}
        >
          <option value="Trial">Trial</option>
          <option value="Basic">Basic</option>
          <option value="Pro">Pro</option>
          <option value="Enterprise">Enterprise</option>
        </select>
      )
    },
    {
      header: 'Periode Berlangganan',
      cell: (row) => (
        <div className="subtext">
          Bergabung: {row.tglBergabung}<br />
          Expired: <strong style={{ color: 'var(--text-main)' }}>{row.tglExpired}</strong>
        </div>
      )
    },
    {
      header: 'Status',
      cell: (row) => {
        const statusStyles = {
          'Aktif':     { background: '#F0FDF4', color: '#15803D', borderColor: '#86EFAC' },
          'Trial':     { background: '#FFFBEB', color: '#B45309', borderColor: '#FCD34D' },
          'Suspended': { background: '#FFF7ED', color: '#C2410C', borderColor: '#FDBA74' },
          'Blocked':   { background: '#FEF2F2', color: '#B91C1C', borderColor: '#FECACA' },
        };
        const style = statusStyles[row.status] || statusStyles['Trial'];
        return (
          <select
            value={row.status || 'Trial'}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '6px',
              border: `1.5px solid ${style.borderColor}`,
              background: style.background,
              color: style.color,
              cursor: 'pointer',
              width: 'auto',
            }}
          >
            <option value="Trial">🟡 Trial</option>
            <option value="Aktif">🟢 Aktif</option>
            <option value="Suspended">🟠 Suspended</option>
            <option value="Blocked">🔴 Blocked</option>
          </select>
        );
      }
    },
    {
      header: 'Aksi Super Admin',
      cell: (row) => (
        <div className="table-actions" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '12px' }}
            title="Perpanjang Langganan"
            onClick={() => handleOpenExtendModal(row)}
          >
            <RefreshCw size={13} /> Perpanjang
          </button>

          <button
            className="btn-icon text-danger"
            title="Hapus Tenant"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="tenant-page">
      <PageHeader
        title="Manajemen Tenant SaaS"
        description="Daftar seluruh rental mobil yang terdaftar. Kelola paket SaaS, perpanjang langganan, atau aktifkan/suspend tenant."
        action={
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} /> Tambah Tenant Manual
          </button>
        }
      />

      <Table
        columns={columns}
        data={tenants}
        searchKey="namaRental"
        searchPlaceholder="Cari nama rental, owner, atau email..."
        pageSize={10}
      />

      {/* Modal Perpanjang Langganan */}
      {extendModalTenant && (
        <Modal
          isOpen={true}
          onClose={() => setExtendModalTenant(null)}
          title={`Perpanjang Langganan — ${extendModalTenant.namaRental}`}
        >
          <form onSubmit={handleExtendSubmit}>
            <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tenant:</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                {extendModalTenant.namaRental} ({extendModalTenant.paket})
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Expired Sekarang: <strong>{extendModalTenant.tglExpired}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pilih Durasi Perpanjangan</label>
              <select
                className="form-select"
                value={extendOption}
                onChange={(e) => setExtendOption(e.target.value)}
              >
                <option value="14">+14 Hari (Trial)</option>
                <option value="30">+1 Bulan (30 Hari)</option>
                <option value="90">+3 Bulan (90 Hari)</option>
                <option value="180">+6 Bulan (180 Hari)</option>
                <option value="365">+1 Tahun (365 Hari)</option>
                <option value="730">+2 Tahun (730 Hari)</option>
                <option value="custom">Pilih Tanggal Manual...</option>
              </select>
            </div>

            {extendOption === 'custom' && (
              <div className="form-group">
                <label className="form-label">Tanggal Expired Baru</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
              </div>
            )}

            <div style={{
              background: '#F0FFF4',
              border: '1px solid #BBF7D0',
              color: '#15803D',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CalendarDays size={16} />
              <span>Tanggal Expired Baru: <strong>{getPreviewExpiredDate()}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setExtendModalTenant(null)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Simpan Perpanjangan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Tambah Tenant Manual */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Tenant Manual (Super Admin)"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleAddSubmit}>
              Simpan Tenant
            </button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="mobil-form">
          <div className="form-group">
            <label className="form-label">Nama Rental <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Contoh: Maju Jaya Rent Car"
              value={formData.namaRental}
              onChange={(e) => setFormData({ ...formData, namaRental: e.target.value })}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Nama Owner <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="Contoh: H. Ahmad"
                value={formData.namaOwner}
                onChange={(e) => setFormData({ ...formData, namaOwner: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Kota</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Surabaya"
                value={formData.kota}
                onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Email Owner</label>
              <input
                type="email"
                className="form-input"
                placeholder="owner@majujaya.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">No. WhatsApp</label>
              <input
                type="tel"
                className="form-input"
                placeholder="081299887766"
                value={formData.noHp}
                onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Paket Langganan</label>
              <select
                className="form-select"
                value={formData.paket}
                onChange={(e) => setFormData({ ...formData, paket: e.target.value })}
              >
                <option value="Trial">Trial</option>
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status Awal</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Aktif">Aktif</option>
                <option value="Trial">Trial</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Durasi Masa Aktif</label>
              <select
                className="form-select"
                value={formData.durasiHari}
                onChange={(e) => setFormData({ ...formData, durasiHari: Number(e.target.value) })}
              >
                <option value={14}>14 Hari (Trial)</option>
                <option value={30}>1 Bulan (30 Hari)</option>
                <option value={180}>6 Bulan (180 Hari)</option>
                <option value={365}>1 Tahun (365 Hari)</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
