import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { useTenantStore } from '../../hooks/useTenantStore';
import './KalenderPage.css';

export function KalenderPage() {
  const { t } = useTranslation();

  const { data: bookingData } = useTenantStore('booking');
  const { data: mobilData } = useTenantStore('mobil');

  const [selectedMobilId, setSelectedMobilId] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dayDropdownEvents, setDayDropdownEvents] = useState(null); // { dateStr, events }

  // Calendar State: Default July 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed (6 = July)

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(6);
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Adjusted start offset (Monday = 0, Sunday = 6)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const gridDays = [];
  for (let i = 0; i < startOffset; i++) {
    gridDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    gridDays.push(d);
  }

  const formatDateStr = (dayNum) => {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    return `${currentYear}-${mStr}-${dStr}`;
  };

  const allEvents = [];

  bookingData.forEach((b) => {
    if (selectedMobilId === 'ALL' || b.mobilId === selectedMobilId) {
      let variant = 'blue';
      if (b.status === 'Selesai') variant = 'green';
      if (b.status === 'Draft') variant = 'amber';

      allEvents.push({
        id: b.id,
        title: `${b.mobilNama} (${b.customerNama})`,
        startDate: b.tglMulai,
        endDate: b.tglSelesai,
        variant,
        type: 'booking',
        data: b
      });
    }
  });

  mobilData
    .filter((m) => m.status === 'Servis')
    .forEach((m) => {
      if (selectedMobilId === 'ALL' || m.id === selectedMobilId) {
        allEvents.push({
          id: `SERVIS-${m.id}`,
          title: `[SERVIS] ${m.nama}`,
          startDate: '2026-07-20',
          endDate: '2026-07-31',
          variant: 'red',
          type: 'servis',
          data: {
            mobilNama: m.nama,
            status: 'Servis Bengkel',
            catatan: m.catatan
          }
        });
      }
    });

  const getEventsForDate = (dateStr) => {
    return allEvents.filter((ev) => dateStr >= ev.startDate && dateStr <= ev.endDate);
  };

  return (
    <div className="kalender-page">
      <PageHeader
        title={t('nav.kalender')}
        description="Pantau ketersediaan armada dan jadwal booking secara visual."
      />

      {/* Container */}
      <div className="calendar-container card">
        {/* Top Control Bar */}
        <div className="calendar-toolbar-compact">
          <div className="toolbar-left">
            <div className="calendar-controls">
              <button className="btn btn-secondary btn-sm" onClick={handlePrevMonth}>
                <ChevronLeft size={16} />
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleToday}>
                Bulan Ini
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleNextMonth}>
                <ChevronRight size={16} />
              </button>
            </div>

            <h3 className="calendar-month-title">
              {monthNames[currentMonth]} {currentYear}
            </h3>
          </div>

          <div className="toolbar-right">
            {/* Filter Dropdown */}
            <div className="filter-mobil-box-compact">
              <Filter size={14} />
              <select
                className="form-select-compact"
                value={selectedMobilId}
                onChange={(e) => setSelectedMobilId(e.target.value)}
              >
                <option value="ALL">Semua Mobil</option>
                {mobilData.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} ({m.plat})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="calendar-legend-compact">
          <div className="legend-item"><span className="legend-color legend-green"></span><span>Tersedia / Selesai</span></div>
          <div className="legend-item"><span className="legend-color legend-blue"></span><span>Sedang Disewa</span></div>
          <div className="legend-item"><span className="legend-color legend-red"></span><span>Dalam Servis</span></div>
          <div className="legend-item"><span className="legend-color legend-amber"></span><span>Draft</span></div>
        </div>

        {/* Ultra-Compact Calendar Grid */}
        <div className="custom-calendar-grid-micro">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ming'].map((dayName, idx) => (
            <div key={idx} className="grid-header-cell-micro">
              {dayName}
            </div>
          ))}

          {gridDays.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} className="grid-cell-micro empty-cell" />;
            }

            const dateStr = formatDateStr(dayNum);
            const dayEvents = getEventsForDate(dateStr);
            const isToday = dateStr === '2026-07-27';

            // Determine dominant variant color for single booking or mixed
            const primaryVariant = dayEvents.length > 0 ? dayEvents[0].variant : 'none';

            return (
              <div key={dayNum} className={`grid-cell-micro ${isToday ? 'today-cell' : ''}`}>
                <span className="cell-day-num-micro">{dayNum}</span>

                {dayEvents.length > 0 && (
                  <div
                    className={`cell-dropdown-badge badge-variant-${primaryVariant}`}
                    onClick={() => setDayDropdownEvents({ dateStr, dayNum, events: dayEvents })}
                  >
                    <span>{dayEvents.length} Jadwal</span>
                    <ChevronDown size={11} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Events Dropdown / Popover Modal */}
      <Modal
        isOpen={!!dayDropdownEvents}
        onClose={() => setDayDropdownEvents(null)}
        title={dayDropdownEvents ? `Jadwal Tanggal ${dayDropdownEvents.dayNum} ${monthNames[currentMonth]} ${currentYear}` : ''}
        footer={
          <button className="btn btn-secondary" onClick={() => setDayDropdownEvents(null)}>
            Tutup
          </button>
        }
      >
        {dayDropdownEvents && (
          <div className="day-dropdown-modal-list">
            <p className="subtext" style={{ marginBottom: '12px' }}>
              Daftar unit booking & servis pada tanggal {dayDropdownEvents.dateStr}:
            </p>
            {dayDropdownEvents.events.map((ev) => (
              <div
                key={ev.id}
                className={`dropdown-event-item event-pill-${ev.variant}`}
                onClick={() => {
                  setDayDropdownEvents(null);
                  setSelectedEvent(ev.data);
                }}
              >
                <div>
                  <div className="font-medium" style={{ color: '#FFFFFF' }}>{ev.title}</div>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>
                    Periode: {ev.startDate} s/d {ev.endDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Detail Rincian Booking / Servis"
        footer={
          <button className="btn btn-primary" onClick={() => setSelectedEvent(null)}>
            Tutup
          </button>
        }
      >
        {selectedEvent && (
          <div className="event-detail-box">
            <div className="event-detail-row">
              <strong>Mobil:</strong> {selectedEvent.mobilNama}
            </div>
            {selectedEvent.customerNama && (
              <div className="event-detail-row">
                <strong>Pelanggan:</strong> {selectedEvent.customerNama}
              </div>
            )}
            {selectedEvent.tglMulai && (
              <div className="event-detail-row">
                <strong>Periode:</strong> {selectedEvent.tglMulai} s/d {selectedEvent.tglSelesai}
              </div>
            )}
            <div className="event-detail-row">
              <strong>Status:</strong> {selectedEvent.status}
            </div>
            {selectedEvent.harga && (
              <div className="event-detail-row">
                <strong>Harga Total:</strong> Rp {Number(selectedEvent.harga).toLocaleString('id-ID')}
              </div>
            )}
            <div className="event-detail-row">
              <strong>Catatan:</strong> {selectedEvent.catatan || '-'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
