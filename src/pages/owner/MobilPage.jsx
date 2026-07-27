import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { Badge, getStatusBadgeVariant } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PhotoPicker } from '../../components/ui/PhotoPicker';
import { Plus, Eye, Edit, Trash2, Car, Image as ImageIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTenantStore } from '../../hooks/useTenantStore';
import './MobilPage.css';

export function MobilPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: mobilList, setData: setMobilList } = useTenantStore('mobil');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMobil, setEditingMobil] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    merk: '',
    plat: '',
    tahun: 2023,
    hargaHarian: 350000,
    hargaMingguan: 2200000,
    hargaBulanan: 8000000,
    status: 'Tersedia',
    foto: '',     // base64 from library
    fotoId: '',   // library foto ID reference
    catatan: ''
  });

  const handleOpenAdd = () => {
    setEditingMobil(null);
    setFormData({
      nama: '',
      merk: '',
      plat: '',
      tahun: 2023,
      hargaHarian: 350000,
      hargaMingguan: 2200000,
      hargaBulanan: 8000000,
      status: 'Tersedia',
      foto: '',
      fotoId: '',
      catatan: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mobil) => {
    setEditingMobil(mobil);
    setFormData({ ...mobil });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mobil ini?')) {
      setMobilList(mobilList.filter((m) => m.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMobil) {
      setMobilList(mobilList.map((m) => (m.id === editingMobil.id ? { ...formData, id: m.id } : m)));
    } else {
      const newMobil = {
        ...formData,
        id: `MOB-${String(mobilList.length + 1).padStart(3, '0')}`,
        totalHariDisewa: 0,
        totalPendapatan: 0
      };
      setMobilList([newMobil, ...mobilList]);
    }
    setIsModalOpen(false);
  };

  const filterOptions = [
    { label: 'Tersedia', value: 'Tersedia' },
    { label: 'Disewa', value: 'Disewa' },
    { label: 'Servis', value: 'Servis' },
    { label: 'Nonaktif', value: 'Nonaktif' },
  ];

  const columns = [
    {
      header: 'Mobil',
      cell: (row) => (
        <div className="mobil-info-cell">
          {row.foto ? (
            <img
              src={row.foto}
              alt={row.nama}
              className="mobil-thumb"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div className={`mobil-thumb-placeholder ${row.foto ? 'hidden' : ''}`}>
            <Car size={18} />
          </div>
          <div>
            <div className="mobil-title">{row.nama}</div>
            <div className="mobil-sub">{row.merk} • {row.tahun}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Plat Nomor',
      accessorKey: 'plat',
      cell: (row) => <span className="plat-badge">{row.plat}</span>
    },
    {
      header: 'Harga Harian',
      cell: (row) => `Rp ${Number(row.hargaHarian).toLocaleString('id-ID')}`
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <div className="table-actions">
          <button
            className="btn-icon"
            title="Detail"
            onClick={() => navigate(`/mobil/${row.id}`)}
          >
            <Eye size={16} />
          </button>
          <button
            className="btn-icon"
            title="Edit"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit size={16} />
          </button>
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
    <div className="mobil-page">
      <PageHeader
        title={t('nav.mobil')}
        description="Kelola armada kendaraan rental Anda secara lengkap."
        action={
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            Tambah Mobil
          </button>
        }
      />

      <Table
        columns={columns}
        data={mobilList}
        searchKey="nama"
        searchPlaceholder="Cari nama atau merk mobil..."
        filterOptions={filterOptions}
        filterKey="status"
        pageSize={5}
      />

      {/* Modal Form Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMobil ? 'Edit Data Mobil' : 'Tambah Mobil Baru'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Simpan Data
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="mobil-form">
          <div className="form-group">
            <label className="form-label">Nama Mobil</label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Contoh: Toyota Avanza Veloz"
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Merk</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.merk}
                onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                placeholder="Contoh: Toyota"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Plat Nomor</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.plat}
                onChange={(e) => setFormData({ ...formData, plat: e.target.value })}
                placeholder="Contoh: B 1234 RNT"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Tahun</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.tahun}
                onChange={(e) => setFormData({ ...formData, tahun: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Tersedia">Tersedia</option>
                <option value="Disewa">Disewa</option>
                <option value="Servis">Servis</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Harga Harian (Rp)</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.hargaHarian}
                onChange={(e) => setFormData({ ...formData, hargaHarian: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Harga Mingguan (Rp)</label>
              <input
                type="number"
                className="form-input"
                value={formData.hargaMingguan}
                onChange={(e) => setFormData({ ...formData, hargaMingguan: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Harga Bulanan (Rp)</label>
              <input
                type="number"
                className="form-input"
                value={formData.hargaBulanan}
                onChange={(e) => setFormData({ ...formData, hargaBulanan: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Foto Mobil — Photo Picker */}
          <div className="form-group">
            <label className="form-label">Foto Mobil</label>

            {formData.foto ? (
              <div className="mobil-foto-preview">
                <img src={formData.foto} alt="Preview" className="mobil-foto-preview-img" />
                <div className="mobil-foto-preview-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsPickerOpen(true)}
                  >
                    <ImageIcon size={14} /> Ganti Foto
                  </button>
                  <button
                    type="button"
                    className="btn-icon text-danger"
                    title="Hapus foto"
                    onClick={() => setFormData({ ...formData, foto: '', fotoId: '' })}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="mobil-foto-picker-btn"
                onClick={() => setIsPickerOpen(true)}
              >
                <Car size={24} className="mobil-foto-picker-icon" />
                <span className="mobil-foto-picker-label">Pilih Foto dari Library</span>
                <span className="mobil-foto-picker-hint">
                  {formData.nama
                    ? `Foto akan difilter berdasarkan: "${formData.nama}"`
                    : 'Isi nama mobil terlebih dahulu untuk saran foto otomatis'}
                </span>
              </button>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Catatan / Spesifikasi</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              placeholder="Catatan kondisi mobil, fitur pendukung, dll."
            />
          </div>
        </form>
      </Modal>

      {/* Photo Picker Modal */}
      <PhotoPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        carName={formData.nama}
        currentFoto={formData.foto}
        onSelect={(base64, fotoId) => {
          setFormData({ ...formData, foto: base64 || '', fotoId: fotoId || '' });
        }}
      />
    </div>
  );
}
