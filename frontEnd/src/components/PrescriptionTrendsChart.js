import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale,  
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement,
  Title, 
  Tooltip, 
  Legend
);

const PrescriptionTrendsChart = ({ darkMode, data: prescriptionTrends }) => {
  const data = {
    labels: prescriptionTrends.map(item => item.month),
    datasets: [
      {
        label: 'Prescription Count',
        data: prescriptionTrends.map(item => item.count),
        backgroundColor: darkMode ? 
          'rgba(96, 165, 250, 0.6)' : // blue-400 with opacity
          'rgba(59, 130, 246, 0.6)', // blue-500 with opacity
        borderColor: darkMode ? '#60a5fa' : '#3b82f6', // blue-400 : blue-500
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: darkMode ? 'rgba(96, 165, 250, 0.8)' : 'rgba(59, 130, 246, 0.8)',
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#ffffff', // gray-700 : white
        titleColor: darkMode ? '#e5e7eb' : '#111827', // gray-200 : gray-900
        bodyColor: darkMode ? '#e5e7eb' : '#1f2937', // gray-200 : gray-800
        borderColor: darkMode ? '#4b5563' : '#e5e7eb', // gray-600 : gray-200
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            return `Prescriptions: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#4b5563' // gray-400 : gray-600
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? 'rgba(75, 85, 99, 0.1)' : 'rgba(243, 244, 246, 0.8)' // gray-600 : gray-100
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#4b5563', // gray-400 : gray-600
          precision: 0
        }
      }
    }
  };

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
};

export default PrescriptionTrendsChart;
