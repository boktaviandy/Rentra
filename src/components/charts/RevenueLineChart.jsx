import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function RevenueLineChart() {
  const labels = [
    '01 Jul', '04 Jul', '07 Jul', '10 Jul', '13 Jul',
    '16 Jul', '19 Jul', '22 Jul', '25 Jul', '27 Jul'
  ];

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Pendapatan (Rp)',
        data: [
          1200000, 2500000, 1800000, 3200000, 2900000,
          4100000, 3500000, 4800000, 5200000, 6100000
        ],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#FFFFFF',
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let value = context.parsed.y;
            return ' Rp ' + value.toLocaleString('id-ID');
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748B',
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
        ticks: {
          color: '#64748B',
          font: { size: 11 },
          callback: function (value) {
            return 'Rp ' + (value / 1000000) + ' Jt';
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}
