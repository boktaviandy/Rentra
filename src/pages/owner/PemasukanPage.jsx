import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Plus, TrendingUp, FileText, Image as ImageIcon } from 'lucide-react';
import { useTenantStore } from '../../hooks/useTenantStore';

export function PemasukanPage() {
  const { t } = useTranslation();

  const { data: pemasukanList, setData: setPemasukanList } = useTenantStore('pemasukan');
  const { data: bookingData } = useTenantStore('booking');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    tanggal: '2026-07-27',
    nominal: 500000,
    kategori: 'Sewa Mobil',
    bookingId: bookingData[0]?.id || '',
    catatan: '',
    bukti: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInc = {
      ...formData,
      id: `INC-${String(pemasukanList.length + 1).padStart(3, '0')}`,
      nominal: Number(formData.nominal)
    };
    setPemasukanList([newInc, ...pemasukanList]);
    setIsModalOpen(false);
  };

  const totalPemasukan = pemasukanList.reduce((sum, item) => sum + item.nominal, 0);

  const columns = [
    {
      header: 'Tanggal',
      accessorKey: 'tanggal'
    },
    {
      header: 'Kategori',
      cell: (row) => <span className="id-tag">{row.kategori}</span>
    },
    {
      header: 'Booking ID',
      cell: (row) => row.bookingId || '-'
    },
    {
      header: 'Nominal',
      cell: (row) => (
        <span className="font-medium text-success">
          +Rp {row.nominal.toLocaleString('id-ID')}
        </span>
      )
    },
    {
      header: 'Catatan',
      accessorKey: 'catatan'
    },
    {
      header: 'Bukti',
      cell: (row) => (
        <a href={row.bukti} target="_blank" rel="noreferrer" className="btn-icon" title="Lihat Bukti">
          <ImageIcon size={16} />
        </a>
      )
    }
  ];

  return (
    <div className="pemasukan-page">
      <PageHeader
        title={t('nav.pemasukan')}
        description={`Total Pemasukan: Rp ${totalPemasukan.toLocaleString('id-ID')}`}
        action={
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Catat Pemasukan
          </button>
        }
      />

      <Table
        columns={columns}
        data={pemasukanList}
        searchKey="kategori"
        searchPlaceholder="Cari kategori atau catatan..."
        pageSize={5}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Pemasukan Baru"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Simpan Transaksi
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="pemasukan-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kategori Pemasukan</label>
              <select
                className="form-select"
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
              >
                <option value="Sewa Mobil">Sewa Mobil</option>
                <option value="Driver">Driver</option>
                <option value="Denda">Denda</option>
                <option value="Overtime">Overtime</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Nominal (Rp)</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.nominal}
                onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Booking Terkait (Opsional)</label>
              <select
                className="form-select"
                value={formData.bookingId}
                onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
              >
                <option value="">Tidak ada</option>
                {bookingData.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} - {b.customerNama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">URL Bukti Transfer</label>
            <input
              type="text"
              className="form-input"
              value={formData.bukti}
              onChange={(e) => setFormData({ ...formData, bukti: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Catatan</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
