import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement,
  Tooltip, 
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip, 
  Legend
);

const PrescriptionsDispensedChart = ({ darkMode }) => {
  // Sample data - ideally this would come from your backend
  const dispensedData = {
    labels: ['Dispensed', 'Pending', 'Expired', 'Revoked'],
    datasets: [
      {
        data: [68, 21, 7, 4],
        backgroundColor: [
          '#10b981', // emerald-500 (green) for Dispensed
          '#3b82f6', // blue-500 for Pending
          '#f59e0b', // amber-500 (yellow) for Expired
          '#ef4444'  // red-500 for Revoked
        ],
        borderColor: darkMode ? '#1f2937' : '#ffffff', // gray-800 : white
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#e5e7eb' : '#4b5563', // gray-200 : gray-600
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#ffffff', // gray-700 : white
        titleColor: darkMode ? '#e5e7eb' : '#111827', // gray-200 : gray-900
        bodyColor: darkMode ? '#e5e7eb' : '#1f2937', // gray-200 : gray-800
        borderColor: darkMode ? '#4b5563' : '#e5e7eb', // gray-600 : gray-200
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.formattedValue || '';
            return `${label}: ${value}%`;
          }
        }
      }
    },
    cutout: '65%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };
  
  return (
    <div className="h-64">
      <Doughnut data={dispensedData} options={options} />
    </div>
  );
};

export default PrescriptionsDispensedChart;
