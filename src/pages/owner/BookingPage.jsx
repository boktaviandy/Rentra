import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { Badge, getStatusBadgeVariant } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Plus, Eye, Receipt, Trash2, Edit, CheckCircle2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTenantStore } from '../../hooks/useTenantStore';
import './BookingPage.css';

export function BookingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: bookingList, setData: setBookingList } = useTenantStore('booking');
  const { data: mobilData } = useTenantStore('mobil');
  const { data: customerData } = useTenantStore('customer');
  const { data: driverData } = useTenantStore('driver');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  const [formData, setFormData] = useState({
    customerId: customerData[0]?.id || '',
    mobilId: mobilData[0]?.id || '',
    driverId: '',
    tglMulai: '2026-07-27',
    tglSelesai: '2026-07-30',
    harga: 1050000,
    deposit: 500000,
    metodePembayaran: 'Transfer BCA',
    status: 'Booking',
    catatan: ''
  });

  // Calculate duration & auto price
  const calculateAutoPrice = (mobilId, driverId, startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = Math.max(0, end - start);
    const durasiHari = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const mobilObj = mobilData.find((m) => m.id === mobilId);
    const driverObj = driverData.find((d) => d.id === driverId);

    const hargaHarianMobil = mobilObj ? mobilObj.hargaHarian : 350000;
    const tarifDriver = driverObj ? driverObj.tarif : 0;

    return {
      durasiHari,
      totalHarga: durasiHari * (hargaHarianMobil + tarifDriver)
    };
  };

  const handleOpenAdd = () => {
    setEditingBooking(null);
    const defaultStart = '2026-07-27';
    const defaultEnd = '2026-07-30';
    const auto = calculateAutoPrice(mobilData[0].id, '', defaultStart, defaultEnd);

    setFormData({
      customerId: customerData[0].id,
      mobilId: mobilData[0].id,
      driverId: '',
      tglMulai: defaultStart,
      tglSelesai: defaultEnd,
      harga: auto.totalHarga,
      deposit: 500000,
      metodePembayaran: 'Transfer BCA',
      status: 'Booking',
      catatan: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (booking) => {
    setEditingBooking(booking);
    setFormData({ ...booking });
    setIsModalOpen(true);
  };

  const handleDateOrUnitChange = (field, val) => {
    const updatedForm = { ...formData, [field]: val };
    const auto = calculateAutoPrice(
      updatedForm.mobilId,
      updatedForm.driverId,
      updatedForm.tglMulai,
      updatedForm.tglSelesai
    );
    updatedForm.harga = auto.totalHarga;
    setFormData(updatedForm);
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus transaksi booking ini?')) {
      setBookingList(bookingList.filter((b) => b.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setBookingList(
      bookingList.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const customerObj = customerData.find((c) => c.id === formData.customerId);
    const mobilObj = mobilData.find((m) => m.id === formData.mobilId);
    const driverObj = driverData.find((d) => d.id === formData.driverId);

    if (editingBooking) {
      // Edit / Extension mode
      const updatedList = bookingList.map((b) => {
        if (b.id === editingBooking.id) {
          return {
            ...b,
            customerId: formData.customerId,
            customerNama: customerObj?.nama || b.customerNama,
            mobilId: formData.mobilId,
            mobilNama: mobilObj?.nama || b.mobilNama,
            mobilPlat: mobilObj?.plat || b.mobilPlat,
            driverId: formData.driverId || null,
            driverNama: driverObj ? driverObj.nama : 'Tanpa Driver (Lepas Kunci)',
            tglMulai: formData.tglMulai,
            tglSelesai: formData.tglSelesai,
            harga: Number(formData.harga),
            deposit: Number(formData.deposit),
            metodePembayaran: formData.metodePembayaran,
            status: formData.status,
            catatan: formData.catatan
          };
        }
        return b;
      });
      setBookingList(updatedList);
      alert(`Booking #${editingBooking.id} berhasil di-update/diperpanjang! Harga & Kalender telah disesuaikan.`);
    } else {
      // New booking mode
      const newBooking = {
        id: `BK-202607-${String(bookingList.length + 1).padStart(3, '0')}`,
        customerId: formData.customerId,
        customerNama: customerObj?.nama || 'Customer',
        mobilId: formData.mobilId,
        mobilNama: mobilObj?.nama || 'Mobil',
        mobilPlat: mobilObj?.plat || 'Plat',
        driverId: formData.driverId || null,
        driverNama: driverObj ? driverObj.nama : 'Tanpa Driver (Lepas Kunci)',
        tglMulai: formData.tglMulai,
        tglSelesai: formData.tglSelesai,
        harga: Number(formData.harga),
        deposit: Number(formData.deposit),
        metodePembayaran: formData.metodePembayaran,
        status: formData.status,
        statusPembayaran: formData.deposit > 0 ? 'DP 50%' : 'Belum Bayar',
        catatan: formData.catatan,
        createdAt: '2026-07-27'
      };

      setBookingList([newBooking, ...bookingList]);
    }
    setIsModalOpen(false);
  };

  const filterOptions = [
    { label: 'Draft', value: 'Draft' },
    { label: 'Booking', value: 'Booking' },
    { label: 'Berjalan', value: 'Berjalan' },
    { label: 'Selesai', value: 'Selesai' },
    { label: 'Dibatalkan', value: 'Dibatalkan' },
  ];

  const currentAuto = calculateAutoPrice(formData.mobilId, formData.driverId, formData.tglMulai, formData.tglSelesai);

  const columns = [
    {
      header: 'ID Booking',
      accessorKey: 'id',
      cell: (row) => <span className="id-tag">{row.id}</span>
    },
    {
      header: 'Customer',
      accessorKey: 'customerNama',
      cell: (row) => <span className="font-medium">{row.customerNama}</span>
    },
    {
      header: 'Mobil & Driver',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.mobilNama}</div>
          <div className="subtext">{row.driverNama}</div>
        </div>
      )
    },
    {
      header: 'Periode Sewa',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.tglMulai} s/d {row.tglSelesai}</div>
        </div>
      )
    },
    {
      header: 'Total Biaya',
      cell: (row) => (
        <span className="font-medium">Rp {Number(row.harga).toLocaleString('id-ID')}</span>
      )
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>{row.status}</Badge>
      )
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <div className="table-actions">
          <button
            className="btn-icon"
            title="Lihat Detail"
            onClick={() => navigate(`/booking/${row.id}`)}
          >
            <Eye size={16} />
          </button>

          <button
            className="btn-icon"
            title="Edit / Perpanjang Sewa"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit size={16} />
          </button>

          <button
            className="btn-icon"
            title="Lihat Invoice"
            onClick={() => navigate(`/invoice/${row.id}`)}
          >
            <Receipt size={16} />
          </button>

          {row.status === 'Berjalan' && (
            <button
              className="btn-icon text-success"
              title="Tandai Selesai"
              onClick={() => handleStatusChange(row.id, 'Selesai')}
            >
              <CheckCircle2 size={16} />
            </button>
          )}

          <button
            className="btn-icon text-danger"
            title="Hapus"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="booking-page">
      <PageHeader
        title={t('nav.booking')}
        description="Kelola transaksi sewa, perpanjangan tanggal sewa, dan kalkulasi harga otomatis."
        action={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            Buat Booking Baru
          </button>
        }
      />

      <Table
        columns={columns}
        data={bookingList}
        searchKey="customerNama"
        searchPlaceholder="Cari nama customer atau id..."
        filterOptions={filterOptions}
        filterKey="status"
        pageSize={5}
      />

      {/* Modal Form Booking / Perpanjang */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBooking ? `Edit / Perpanjang Sewa #${editingBooking.id}` : 'Buat Transaksi Booking Baru'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingBooking ? 'Simpan Perubahan & Update Harga' : 'Simpan & Generate Invoice'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="booking-form">
          {/* Extension Notice */}
          <div className="card badge-info" style={{ marginBottom: '16px', padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertCircle size={18} />
            <div>
              <strong>Durasi Sewa: {currentAuto.durasiHari} Hari</strong>. Harga otomatis dihitung Rp {currentAuto.totalHarga.toLocaleString('id-ID')}.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pilih Customer</label>
            <select
              className="form-select"
              value={formData.customerId}
              onChange={(e) => handleDateOrUnitChange('customerId', e.target.value)}
            >
              {customerData.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama} ({c.noHp})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Pilih Mobil</label>
              <select
                className="form-select"
                value={formData.mobilId}
                onChange={(e) => handleDateOrUnitChange('mobilId', e.target.value)}
              >
                {mobilData.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} - Rp {m.hargaHarian.toLocaleString('id-ID')}/hr
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pilih Driver (Opsional)</label>
              <select
                className="form-select"
                value={formData.driverId}
                onChange={(e) => handleDateOrUnitChange('driverId', e.target.value)}
              >
                <option value="">Tanpa Driver (Lepas Kunci)</option>
                {driverData.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama} (+Rp {d.tarif.toLocaleString('id-ID')}/hr)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Tanggal Mulai Sewa</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.tglMulai}
                onChange={(e) => handleDateOrUnitChange('tglMulai', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tanggal Selesai (Ubah untuk Perpanjang)</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.tglSelesai}
                onChange={(e) => handleDateOrUnitChange('tglSelesai', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Total Harga (Otomatis)</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.harga}
                onChange={(e) => setFormData({ ...formData, harga: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deposit / DP (Rp)</label>
              <input
                type="number"
                className="form-input"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pembayaran</label>
              <select
                className="form-select"
                value={formData.metodePembayaran}
                onChange={(e) => setFormData({ ...formData, metodePembayaran: e.target.value })}
              >
                <option value="Transfer BCA">Transfer BCA</option>
                <option value="Transfer Mandiri">Transfer Mandiri</option>
                <option value="QRIS">QRIS</option>
                <option value="Tunai">Tunai / Cash</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status Booking</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Draft">Draft</option>
              <option value="Booking">Booking</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Catatan Tambahan / Perpanjangan</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              placeholder="Misal: Penyewa memperpanjang sewa 2 hari via WhatsApp"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
