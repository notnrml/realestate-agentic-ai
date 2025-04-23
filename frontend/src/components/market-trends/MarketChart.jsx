import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MarketChart = ({ data }) => {
  console.log('MarketChart received data:', data); // Debug log

  // Ensure we have valid data
  if (!data || !data.labels || !data.values || data.labels.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-white text-center">
        No chart data available
      </div>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Rental Prices',
        data: data.values,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Dubai Rental Market Trends',
        color: 'white'
      }
    },
    scales: {
      y: {
        ticks: {
          color: 'white',
          callback: function(value) {
            return 'AED ' + value.toLocaleString();
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'white',
          maxRotation: 45,
          minRotation: 45,
          callback: function(value, index) {
            // Convert YYYY-MM format to Month YYYY
            const month = this.getLabelForValue(value);
            const [year, monthNum] = month.split('-');
            const date = new Date(year, monthNum - 1);
            return date.toLocaleString('default', { month: 'short', year: 'numeric' });
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MarketChart; 