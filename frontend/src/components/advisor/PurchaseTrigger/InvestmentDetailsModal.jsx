import { motion, AnimatePresence } from 'framer-motion';
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

const InvestmentDetailsModal = ({ investment, onClose }) => {
  // Sample data for charts
  const roiData = {
    labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    datasets: [
      {
        label: 'Projected ROI',
        data: [
          investment.roi * 0.8,
          investment.roi * 0.9,
          investment.roi,
          investment.roi * 1.1,
          investment.roi * 1.2
        ],
        borderColor: 'rgb(96, 165, 250)',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const priceData = {
    labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    datasets: [
      {
        label: 'Property Value',
        data: [
          investment.price,
          investment.price * 1.05,
          investment.price * 1.1,
          investment.price * 1.15,
          investment.price * 1.2
        ],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)'
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-medium text-white">{investment.property_type}</h3>
            <p className="text-slate-400">{investment.location}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Details */}
          <div className="space-y-6">
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
              <h4 className="text-lg font-medium text-white mb-4">Property Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400">Bedrooms</p>
                  <p className="text-white font-medium">{investment.bedrooms}</p>
                </div>
                <div>
                  <p className="text-slate-400">Bathrooms</p>
                  <p className="text-white font-medium">{investment.bathrooms}</p>
                </div>
                <div>
                  <p className="text-slate-400">Size</p>
                  <p className="text-white font-medium">{investment.size_sqft} sqft</p>
                </div>
                <div>
                  <p className="text-slate-400">Price</p>
                  <p className="text-white font-medium">AED {investment.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
              <h4 className="text-lg font-medium text-white mb-4">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {investment.amenities.map((amenity, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400"
                  >
                    {amenity}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
              <h4 className="text-lg font-medium text-white mb-4">Market Analysis</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-slate-400">Market Trend</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    investment.market_trend === 'Upward' 
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : investment.market_trend === 'Stable'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {investment.market_trend}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400">Risk Level</p>
                  <p className="text-white font-medium">{investment.risk_level}</p>
                </div>
                <div>
                  <p className="text-slate-400">Expected Rent</p>
                  <p className="text-white font-medium">AED {investment.expected_rent.toLocaleString()}/yr</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-6">
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
              <h4 className="text-lg font-medium text-white mb-4">ROI Projection</h4>
              <div className="h-64">
                <Line data={roiData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
              <h4 className="text-lg font-medium text-white mb-4">Property Value Trend</h4>
              <div className="h-64">
                <Line data={priceData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
              <h4 className="text-lg font-medium text-white mb-4">Investment Summary</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400">Initial Investment</p>
                  <p className="text-white font-medium">AED {investment.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Annual Return</p>
                  <p className="text-white font-medium">AED {(investment.price * investment.roi / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">ROI</p>
                  <p className="text-white font-medium">{investment.roi}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-700/50 text-slate-400 hover:bg-slate-700/70 transition-colors"
          >
            Close
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open(investment.listing_url, '_blank')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors"
          >
            View Listing
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvestmentDetailsModal; 