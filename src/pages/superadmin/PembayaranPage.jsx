import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export function PembayaranPage() {
  const paymentLogs = [
    { id: 'PAY-001', tenant: 'Garuda Rent Car', paket: 'Pro Plan', nominal: 599000, tgl: '2026-07-10', metode: 'Midtrans QRIS', status: 'Lunas' },
    { id: 'PAY-002', tenant: 'Nusantara Trans', paket: 'Basic Plan', nominal: 299000, tgl: '2026-07-15', metode: 'BCA Virtual Account', status: 'Lunas' },
    { id: 'PAY-003', tenant: 'Bali Auto Rental', paket: 'Pro Plan', nominal: 599000, tgl: '2026-07-20', metode: 'Mandiri VA', status: 'Lunas' },
  ];

  const columns = [
    { header: 'ID Transaksi', accessorKey: 'id', cell: (r) => <span className="id-tag">{r.id}</span> },
    { header: 'Tenant', accessorKey: 'tenant' },
    { header: 'Paket', accessorKey: 'paket' },
    { header: 'Nominal', cell: (r) => `Rp ${r.nominal.toLocaleString('id-ID')}` },
    { header: 'Metode', accessorKey: 'metode' },
    { header: 'Tanggal', accessorKey: 'tgl' },
    { header: 'Status', cell: (r) => <Badge variant="success">{r.status}</Badge> }
  ];

  return (
    <div className="pembayaran-page">
      <PageHeader
        title="Riwayat Pembayaran Tenant"
        description="Log gateway pembayaran otomatis dan billing langganan SaaS."
      />
      <Table columns={columns} data={paymentLogs} searchKey="tenant" pageSize={5} />
    </div>
  );
}
