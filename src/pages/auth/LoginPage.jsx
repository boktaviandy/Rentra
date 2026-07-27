import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarFront, Lock, Mail, ArrowRight, Building2, User, Phone, MapPin, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useLeadsData } from '../../hooks/useLeadsData';
import { useAuth } from '../../hooks/useAuth';
import './AuthPage.css';

// Demo tenant credentials (V1 — hardcoded for prototype)
const DEMO_CREDENTIALS = [
  { email: 'owner@garudarent.com', password: 'password123', tenantId: 'TNT-001' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { addLead } = useLeadsData();
  const { loginTenant } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [submittedLead, setSubmittedLead] = useState(null);
  const [loginError, setLoginError] = useState('');

  // Login form state
  const [email, setEmail] = useState('owner@garudarent.com');
  const [password, setPassword] = useState('password123');

  // Register form state
  const [regData, setRegData] = useState({
    namaRental: '',
    namaOwner: '',
    noWhatsapp: '',
    kota: '',
    email: '',
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const TENANT_KEY = 'rentra_tenants_v1';
    let targetTenant = null;
    try {
      const raw = localStorage.getItem(TENANT_KEY);
      const allTenants = raw ? JSON.parse(raw) : [];
      // Find by email
      const matched = allTenants.find(
        (t) => t.email?.toLowerCase() === email.trim().toLowerCase()
      );
      if (matched) {
        const trimmedPass = password.trim();

        // Check if demo user
        const isDemo = DEMO_CREDENTIALS.some(
          (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === trimmedPass
        );

        // Check matching stored temporary password or updated password
        const isTenantPass =
          (matched.passwordSementara && matched.passwordSementara === trimmedPass) ||
          (matched.password && matched.password === trimmedPass);

        // Legacy fallback: tenant created before password persistence fix
        const isLegacyWithoutPass = !matched.passwordSementara && !matched.password;

        if (isDemo || isTenantPass || isLegacyWithoutPass) {
          targetTenant = matched;
        } else {
          setLoginError('Kata sandi salah. Gunakan password sementara yang dikirim via WhatsApp.');
          return;
        }
      }
    } catch (err) {
      console.error('Login lookup error', err);
    }

    // Fallback: pure demo (TNT-001 not yet in tenant list? shouldn't happen but safe)
    if (!targetTenant) {
      const demo = DEMO_CREDENTIALS.find(
        (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
      );
      if (demo) {
        loginTenant(email.trim());
        navigate('/dashboard');
        return;
      }
      setLoginError('Email tidak ditemukan atau belum diaktifkan oleh Super Admin.');
      return;
    }

    loginTenant(targetTenant);
    navigate('/dashboard');
  };

  const handleRegister = (e) => {
    e.preventDefault();

    const lead = addLead({
      namaRental: regData.namaRental,
      namaOwner: regData.namaOwner,
      noWhatsapp: regData.noWhatsapp,
      kota: regData.kota,
      email: regData.email,
    });

    setSubmittedLead(lead);
  };


  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="brand-logo" style={{ margin: '0 auto 12px auto' }}>
            <CarFront size={28} />
          </div>
          <h2>Rentra SaaS</h2>
          <p className="subtext">Sistem Manajemen Rental Mobil Terpadu</p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setSubmittedLead(null); }}
          >
            Masuk
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setSubmittedLead(null); }}
          >
            Daftar Rental Baru
          </button>
        </div>

        {/* ── Registration Success State ── */}
        {mode === 'register' && submittedLead ? (
          <div className="auth-success-box">
            <CheckCircle2 size={48} className="auth-success-icon" />
            <h3>Pendaftaran Diterima!</h3>
            <p>
              Halo, <strong>{submittedLead.namaOwner}</strong>!<br />
              Permohonan rental <strong>{submittedLead.namaRental}</strong> telah kami terima.
            </p>

            <div className="auth-pending-card">
              <Clock size={16} />
              <div>
                <div className="auth-pending-title">Menunggu Konfirmasi Super Admin</div>
                <div className="auth-pending-sub">
                  Tim kami akan menghubungi Anda melalui WhatsApp <strong>{submittedLead.wa}</strong> dalam 1×24 jam dengan informasi URL, username, dan password akses Anda.
                </div>
              </div>
            </div>

            <div className="auth-ref">
              ID Pendaftaran: <code>{submittedLead.id}</code>
            </div>

            <button
              className="btn btn-secondary"
              style={{ marginTop: '4px' }}
              onClick={() => { setSubmittedLead(null); setRegData({ namaRental: '', namaOwner: '', noWhatsapp: '', kota: '', email: '' }); }}
            >
              Daftar Rental Lain
            </button>
          </div>

        ) : mode === 'login' ? (
          /* ── Login Form ── */
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email / Username</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="owner@garudarent.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Kata Sandi</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {loginError && (
              <div className="auth-error-box">
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full">
              Masuk ke Dashboard <ArrowRight size={16} />
            </button>
          </form>

        ) : (
          /* ── Registration Form ── */
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label className="form-label">Nama Rental <span className="text-danger">*</span></label>
              <div className="input-with-icon">
                <Building2 size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Contoh: Nusantara Auto Rent"
                  value={regData.namaRental}
                  onChange={(e) => setRegData({ ...regData, namaRental: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nama Owner <span className="text-danger">*</span></label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={regData.namaOwner}
                  onChange={(e) => setRegData({ ...regData, namaOwner: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">No. WhatsApp <span className="text-danger">*</span></label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    className="form-input"
                    required
                    placeholder="08123456789"
                    value={regData.noWhatsapp}
                    onChange={(e) => setRegData({ ...regData, noWhatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Kota <span className="text-danger">*</span></label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Contoh: Bandung"
                    value={regData.kota}
                    onChange={(e) => setRegData({ ...regData, kota: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Operasional</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="owner@rental.com (opsional)"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              Kirim Permohonan Pendaftaran <ArrowRight size={16} />
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Akses akan dikirim via WhatsApp setelah disetujui Super Admin
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
