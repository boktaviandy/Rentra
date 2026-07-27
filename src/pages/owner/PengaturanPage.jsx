import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/ui/PageHeader';
import { Save, Upload, X, ImageIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTenantStore } from '../../hooks/useTenantStore';

/**
 * Compress an image File to a base64 data-URL at the given max width/height.
 */
function compressImage(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (ev) => {
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;

      if (w > h) {
        if (w > maxSize) { h = Math.round((h * maxSize) / w); w = maxSize; }
      } else {
        if (h > maxSize) { w = Math.round((w * maxSize) / h); h = maxSize; }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/webp', 0.82));
    };
    img.onerror = reject;
  });
}

export function PengaturanPage() {
  const { t } = useTranslation();
  const { currentTenant, loginTenant } = useAuth();
  const { data: storedSettings, setData: saveStoredSettings } = useTenantStore('settings');

  const fileRef = useRef(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const [settings, setSettings] = useState(() => ({
    namaRental: currentTenant?.namaRental || 'Garuda Rent Car',
    namaOwner: currentTenant?.namaOwner || '',
    noHp: currentTenant?.noHp || '0812-9900-1122',
    email: currentTenant?.email || '',
    alamat: currentTenant?.kota ? `Kota ${currentTenant.kota}` : 'Jl. Sudirman No. 100, Jakarta Selatan',
    zonaWaktu: 'Asia/Jakarta (WIB)',
    mataUang: 'IDR (Rp)',
    logo: '',
    ...(storedSettings[0] || {}),
  }));

  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (currentTenant) {
      setSettings((prev) => ({
        ...prev,
        namaRental: currentTenant.namaRental || prev.namaRental,
        namaOwner: currentTenant.namaOwner || prev.namaOwner,
        noHp: currentTenant.noHp || prev.noHp,
        email: currentTenant.email || prev.email,
        alamat: prev.alamat || (currentTenant.kota ? `Kota ${currentTenant.kota}` : ''),
        ...(storedSettings[0] || {}),
      }));
    }
  }, [currentTenant]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, WEBP, SVG).');
      return;
    }
    setLogoUploading(true);
    try {
      const base64 = await compressImage(file, 256);
      setSettings((prev) => ({ ...prev, logo: base64 }));
    } catch (err) {
      console.error('Gagal kompresi logo:', err);
      alert('Gagal memproses gambar. Coba file lain.');
    } finally {
      setLogoUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setSettings((prev) => ({ ...prev, logo: '' }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updatedSettings = { ...settings };
    saveStoredSettings([updatedSettings]);

    // Also update current active tenant profile in useAuth session
    const updatedTenant = {
      ...currentTenant,
      namaRental: settings.namaRental,
      namaOwner: settings.namaOwner,
      noHp: settings.noHp,
      email: settings.email,
      logo: settings.logo,
    };
    loginTenant(updatedTenant);

    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="pengaturan-page">
      <PageHeader
        title={t('nav.pengaturan')}
        description="Konfigurasi identitas rental, kontak, zona waktu, dan format mata uang."
      />

      {savedMessage && (
        <div className="card badge-success" style={{ marginBottom: '20px', padding: '12px 16px', background: '#DCFCE7', color: '#166534', borderRadius: '8px' }}>
          ✓ Pengaturan rental berhasil disimpan!
        </div>
      )}

      <div className="card" style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSave} className="pengaturan-form">
          <div className="form-group">
            <label className="form-label">Nama Rental</label>
            <input
              type="text"
              className="form-input"
              required
              value={settings.namaRental}
              onChange={(e) => setSettings({ ...settings, namaRental: e.target.value })}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Nama Owner / Pengelola</label>
              <input
                type="text"
                className="form-input"
                required
                value={settings.namaOwner}
                onChange={(e) => setSettings({ ...settings, namaOwner: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nomor WhatsApp / HP</label>
              <input
                type="text"
                className="form-input"
                required
                value={settings.noHp}
                onChange={(e) => setSettings({ ...settings, noHp: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Email Operasional</label>
              <input
                type="email"
                className="form-input"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mata Uang Default</label>
              <select
                className="form-select"
                value={settings.mataUang}
                onChange={(e) => setSettings({ ...settings, mataUang: e.target.value })}
              >
                <option value="IDR (Rp)">Rupiah Indonesia (IDR)</option>
                <option value="USD ($)">US Dollar (USD)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Garasi / Kantor</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={settings.alamat}
              onChange={(e) => setSettings({ ...settings, alamat: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Zona Waktu</label>
            <select
              className="form-select"
              value={settings.zonaWaktu}
              onChange={(e) => setSettings({ ...settings, zonaWaktu: e.target.value })}
            >
              <option value="Asia/Jakarta (WIB)">WIB (Asia/Jakarta)</option>
              <option value="Asia/Makassar (WITA)">WITA (Asia/Makassar)</option>
              <option value="Asia/Jayapura (WIT)">WIT (Asia/Jayapura)</option>
            </select>
          </div>

          {/* Logo Upload */}
          <div className="form-group">
            <label className="form-label">Logo Rental</label>
            <div className="logo-upload-wrap">
              {settings.logo ? (
                <div className="logo-preview-box">
                  <img
                    src={settings.logo}
                    alt="Logo Rental"
                    className="logo-preview-img"
                  />
                  <div className="logo-preview-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload size={14} /> Ganti Logo
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={handleRemoveLogo}
                    >
                      <X size={14} /> Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="logo-upload-btn"
                  onClick={() => fileRef.current?.click()}
                  disabled={logoUploading}
                >
                  <ImageIcon size={28} className="logo-upload-icon" />
                  <span className="logo-upload-label">
                    {logoUploading ? 'Memproses...' : 'Klik untuk upload logo'}
                  </span>
                  <span className="logo-upload-hint">PNG, JPG, WEBP — Max 2 MB — Dikompres otomatis</span>
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
            <Save size={16} /> Simpan Pengaturan
          </button>
        </form>
      </div>

      {/* Ubah Password Card */}
      <div className="card" style={{ maxWidth: '640px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔒 Keamanan & Kata Sandi
        </h3>

        {currentTenant?.passwordSementara && (
          <div style={{
            background: '#FFFBEB',
            border: '1.5px solid #FCD34D',
            color: '#92400E',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px',
            lineHeight: '1.5'
          }}>
            ⚠️ <strong>Anda masih menggunakan kata sandi sementara dari Super Admin.</strong> Demi keamanan akun rental Anda, sangat disarankan untuk membuat kata sandi baru.
          </div>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          const pass = e.target.newPass.value;
          const confirm = e.target.confirmPass.value;
          if (pass !== confirm) {
            alert('Konfirmasi kata sandi tidak cocok!');
            return;
          }
          if (pass.length < 6) {
            alert('Kata sandi minimal 6 karakter!');
            return;
          }

          // Clear temporary password and set updated password in current tenant session & storage
          const updatedTenant = {
            ...currentTenant,
            passwordSementara: null,
            password: pass,
          };
          loginTenant(updatedTenant);

          // Update tenant list in localStorage
          try {
            const raw = localStorage.getItem('rentra_tenants_v1');
            if (raw) {
              const tenants = JSON.parse(raw);
              const updated = tenants.map(t => t.id === currentTenant.id ? updatedTenant : t);
              localStorage.setItem('rentra_tenants_v1', JSON.stringify(updated));
            }
          } catch(err) { console.error(err); }

          alert('Kata sandi berhasil diperbarui!');
          e.target.reset();
        }}>
          <div className="form-group">
            <label className="form-label">Kata Sandi Baru</label>
            <input
              type="password"
              name="newPass"
              className="form-input"
              required
              minLength={6}
              placeholder="Masukkan kata sandi baru"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Konfirmasi Kata Sandi Baru</label>
            <input
              type="password"
              name="confirmPass"
              className="form-input"
              required
              minLength={6}
              placeholder="Ulangi kata sandi baru"
            />
          </div>

          <button type="submit" className="btn btn-secondary">
            Perbarui Kata Sandi
          </button>
        </form>
      </div>
    </div>
  );
}
