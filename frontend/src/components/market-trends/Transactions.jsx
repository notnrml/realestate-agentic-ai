import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';

const Transactions = ({ transactions }) => {
  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Helper function to get the appropriate icon based on price change
  const getPriceChangeIcon = (priceChangePercent) => {
    if (priceChangePercent > 0) {
      return <FaArrowUp className="text-green-400" />;
    } else if (priceChangePercent < 0) {
      return <FaArrowDown className="text-red-400" />;
    } else {
      return <FaEquals className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Property</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Agent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-700"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {transaction.property_type}
                    </div>
                    <div className="text-xs text-gray-400">
                      {transaction.bedrooms} bed • {transaction.bathrooms} bath • {transaction.size_sqft} sqft
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {transaction.location}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {formatCurrency(transaction.current_price)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`flex items-center text-sm ${
                      transaction.price_change_percent > 0 ? 'text-green-400' : 
                      transaction.price_change_percent < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {getPriceChangeIcon(transaction.price_change_percent)}
                      <span className="ml-1">
                        {transaction.price_change_percent > 0 ? '+' : ''}{transaction.price_change_percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatCurrency(transaction.price_change)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {transaction.transaction_date}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {transaction.agent_name}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-3 text-center text-gray-400">
                  No transaction data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions; 