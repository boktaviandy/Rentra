import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, CarFront, QrCode } from 'lucide-react';
import { useTenantStore } from '../../hooks/useTenantStore';
import './InvoiceDetailPage.css';

export function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: bookingData } = useTenantStore('booking');
  const { data: customerData } = useTenantStore('customer');
  const { data: mobilData } = useTenantStore('mobil');

  const booking = bookingData.find((b) => b.id === id) || bookingData[0] || {};
  const customer = customerData.find((c) => c.id === booking.customerId);
  const mobil = mobilData.find((m) => m.id === booking.mobilId);

  const sisa = (booking.harga || booking.totalHarga || 0) - (booking.deposit || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-detail-page">
      <div className="no-print" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="back-link" onClick={() => navigate('/invoice')}>
          <ArrowLeft size={16} /> Kembali ke Daftar Invoice
        </div>

        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={16} /> Cetak Invoice / Download PDF
        </button>
      </div>

      {/* Printable Paper Card */}
      <div className="invoice-paper card">
        {/* Invoice Header */}
        <div className="invoice-header">
          <div className="brand-header">
            <div className="brand-logo">
              <CarFront size={24} />
            </div>
            <div>
              <h2 className="company-name">Garuda Rent Car</h2>
              <p className="company-sub">Jl. Sudirman No. 100, Jakarta • 0812-9900-1122</p>
            </div>
          </div>

          <div className="invoice-title-block">
            <h1 className="inv-title">INVOICE</h1>
            <div className="inv-num">INV/{booking.id}</div>
            <div className="inv-date">Tanggal: {booking.createdAt}</div>
          </div>
        </div>

        <hr className="inv-divider" />

        {/* Invoice Info Row */}
        <div className="invoice-info-grid">
          <div className="inv-box">
            <span className="inv-label">DITAGIHKAN KEPADA:</span>
            <div className="inv-val-title">{booking.customerNama}</div>
            {customer && (
              <div className="inv-val-sub">
                No HP: {customer.noHp}<br />
                KTP: {customer.noKtp}<br />
                Alamat: {customer.alamat}
              </div>
            )}
          </div>

          <div className="inv-box text-right">
            <span className="inv-label">DETAIL PEMBAYARAN:</span>
            <div className="inv-val-title">{booking.metodePembayaran}</div>
            <div className="inv-val-sub">
              Status: <strong>{booking.statusPembayaran}</strong><br />
              Rek BCA: 123-456-7890 (a.n Garuda Rent)
            </div>
          </div>
        </div>

        {/* Item Table */}
        <div className="table-container margin-top-lg">
          <table className="table">
            <thead>
              <tr>
                <th>Deskripsi Sewa</th>
                <th>Mobil / Plat</th>
                <th>Periode Sewa</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Sewa Mobil + Driver</strong><br />
                  <span className="subtext">{booking.driverNama}</span>
                </td>
                <td>{booking.mobilNama} ({booking.mobilPlat})</td>
                <td>{booking.tglMulai} s/d {booking.tglSelesai}</td>
                <td className="text-right font-medium">
                  Rp {booking.harga.toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Invoice Summary */}
        <div className="invoice-summary-grid margin-top-lg">
          <div className="qris-box">
            <QrCode size={64} className="qris-icon" />
            <div>
              <strong>Scan QRIS untuk Pelunasan</strong>
              <p className="subtext">Mendukung BCA, Mandiri, GoPay, OVO, Dana</p>
            </div>
          </div>

          <div className="summary-calculations">
            <div className="summary-row">
              <span>Total Sewa:</span>
              <strong>Rp {booking.harga.toLocaleString('id-ID')}</strong>
            </div>
            <div className="summary-row text-success">
              <span>Deposit (DP):</span>
              <strong>- Rp {booking.deposit.toLocaleString('id-ID')}</strong>
            </div>
            <hr className="inv-divider" />
            <div className="summary-row total-row">
              <span>Sisa Pembayaran:</span>
              <strong className="text-primary">
                Rp {sisa.toLocaleString('id-ID')}
              </strong>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="invoice-footer-note">
          <p>Terima kasih telah mempercayakan perjalanan Anda kepada <strong>Garuda Rent Car</strong>.</p>
          <p className="subtext">Syarat & Ketentuan pengembalian mobil berlaku sesuai perjanjian sewa.</p>
        </div>
      </div>
    </div>
  );
}
