import React from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
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

const WeeklyStatsChart = ({ darkMode }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    // Sample data - this would come from your backend in a real application
  const prescriptionsData = [12, 19, 15, 25, 22, 14, 10];
  
  const data = {
    labels: days,
    datasets: [
      {
        label: 'Prescriptions Issued',
        data: prescriptionsData,
        borderColor: '#3b82f6', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#3b82f6',
        tension: 0.4,
        fill: false,
        yAxisID: 'y'
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#e5e7eb' : '#4b5563', // gray-200 : gray-600
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#ffffff', // gray-700 : white
        titleColor: darkMode ? '#e5e7eb' : '#111827', // gray-200 : gray-900
        bodyColor: darkMode ? '#e5e7eb' : '#1f2937', // gray-200 : gray-800
        borderColor: darkMode ? '#4b5563' : '#e5e7eb', // gray-600 : gray-200
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          title: (tooltipItems) => {
            return `${tooltipItems[0].label}`;
          },
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.yAxisID === 'y1') {
              label += context.parsed.y + '%';
            } else {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },    scales: {
      x: {
        grid: {
          color: darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(243, 244, 246, 0.8)' // gray-600 : gray-100
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#4b5563' // gray-400 : gray-600
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Prescriptions',
          color: darkMode ? '#9ca3af' : '#4b5563' // gray-400 : gray-600
        },
        grid: {
          color: darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(243, 244, 246, 0.8)' // gray-600 : gray-100
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#4b5563' // gray-400 : gray-600
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="h-72">
      <Line data={data} options={options} />
    </div>
  );
};

export default WeeklyStatsChart;
