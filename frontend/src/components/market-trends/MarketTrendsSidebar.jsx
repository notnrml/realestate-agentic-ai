import React from 'react';
import { 
  FaChartLine, 
  FaHistory, 
  FaRobot, 
  FaDatabase, 
  FaChartBar, 
  FaNewspaper, 
  FaSearch, 
  FaExclamationTriangle,
  FaChartPie,
  FaExchangeAlt,
  FaGlobe,
  FaCog
} from 'react-icons/fa';

const MarketTrendsSidebar = ({ activeTab, setActiveTab, onSettingsClick }) => {
  const navItems = [
    {
      section: 'Overview',
      items: [
        { id: 'overview', label: 'Market Overview', icon: <FaChartLine /> },
        { id: 'trend-cards', label: 'Trend Cards', icon: <FaChartBar /> },
        { id: 'daily-digest', label: 'Daily Digest', icon: <FaNewspaper /> }
      ]
    },
    {
      section: 'Analysis',
      items: [
        { id: 'trendspotter', label: 'TrendSpotter', icon: <FaRobot /> },
        { id: 'transactions', label: 'Transaction History', icon: <FaHistory /> },
        { id: 'market-stats', label: 'Market Statistics', icon: <FaChartPie /> }
      ]
    },
    {
      section: 'Data Sources',
      items: [
        { id: 'crawl-data', label: 'Crawl Data', icon: <FaDatabase /> },
        { id: 'property-finder', label: 'Property Finder', icon: <FaSearch /> },
        { id: 'property-monitor', label: 'Property Monitor', icon: <FaGlobe /> }
      ]
    },
    {
      section: 'Market Health',
      items: [
        { id: 'tenant-agents', label: 'Tenant Agents', icon: <FaExchangeAlt /> },
        { id: 'market-saturation', label: 'Market Saturation', icon: <FaExclamationTriangle /> }
      ]
    },
    {
      section: 'Settings',
      items: [
        { 
          id: 'market-settings', 
          label: 'Market Statistics Settings', 
          icon: <FaCog />,
          onClick: onSettingsClick
        }
      ]
    }
  ];

  return (
    <div className="w-64 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-700">
        <h3 className="text-lg font-semibold text-white">Market Trends</h3>
      </div>
      <nav className="py-2">
        {navItems.map((section) => (
          <div key={section.section} className="mb-4">
            <h4 className="px-4 py-2 text-sm font-medium text-gray-400">
              {section.section}
            </h4>
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick || (() => setActiveTab(item.id))}
                className={`w-full flex items-center px-4 py-2 text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-accent-500 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default MarketTrendsSidebar; 