import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Plus, TrendingDown, Image as ImageIcon } from 'lucide-react';
import { useTenantStore } from '../../hooks/useTenantStore';

export function PengeluaranPage() {
  const { t } = useTranslation();

  const { data: pengeluaranList, setData: setPengeluaranList } = useTenantStore('pengeluaran');
  const { data: mobilData } = useTenantStore('mobil');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    tanggal: '2026-07-27',
    mobilId: mobilData[0]?.id || '',
    nominal: 350000,
    kategori: 'BBM',
    catatan: '',
    bukti: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const mobilObj = mobilData.find((m) => m.id === formData.mobilId);
    const newExp = {
      ...formData,
      id: `EXP-${String(pengeluaranList.length + 1).padStart(3, '0')}`,
      mobilNama: mobilObj ? mobilObj.nama : 'Umum',
      nominal: Number(formData.nominal)
    };
    setPengeluaranList([newExp, ...pengeluaranList]);
    setIsModalOpen(false);
  };

  const totalPengeluaran = pengeluaranList.reduce((sum, item) => sum + item.nominal, 0);

  const columns = [
    {
      header: 'Tanggal',
      accessorKey: 'tanggal'
    },
    {
      header: 'Kategori',
      cell: (row) => <span className="badge badge-danger">{row.kategori}</span>
    },
    {
      header: 'Mobil Terkait',
      cell: (row) => row.mobilNama || 'Umum / Operasional'
    },
    {
      header: 'Nominal',
      cell: (row) => (
        <span className="font-medium text-danger">
          -Rp {row.nominal.toLocaleString('id-ID')}
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
        <a href={row.bukti} target="_blank" rel="noreferrer" className="btn-icon" title="Lihat Struk">
          <ImageIcon size={16} />
        </a>
      )
    }
  ];

  return (
    <div className="pengeluaran-page">
      <PageHeader
        title={t('nav.pengeluaran')}
        description={`Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}`}
        action={
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Catat Pengeluaran
          </button>
        }
      />

      <Table
        columns={columns}
        data={pengeluaranList}
        searchKey="kategori"
        searchPlaceholder="Cari kategori pengeluaran..."
        pageSize={5}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Pengeluaran Operasional"
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
        <form onSubmit={handleSubmit} className="pengeluaran-form">
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
              <label className="form-label">Kategori Pengeluaran</label>
              <select
                className="form-select"
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
              >
                <option value="Servis">Servis</option>
                <option value="Ganti Oli">Ganti Oli</option>
                <option value="BBM">BBM</option>
                <option value="Pajak">Pajak</option>
                <option value="Asuransi">Asuransi</option>
                <option value="Operasional">Operasional</option>
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
              <label className="form-label">Mobil Terkait (Opsional)</label>
              <select
                className="form-select"
                value={formData.mobilId}
                onChange={(e) => setFormData({ ...formData, mobilId: e.target.value })}
              >
                <option value="">Operasional Umum (Non-mobil)</option>
                {mobilData.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} ({m.plat})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">URL Foto Struk / Bukti</label>
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
