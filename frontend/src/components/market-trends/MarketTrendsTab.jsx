import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrendCard from './TrendCard';
import MarketChart from './MarketChart';
import DailyDigest from './DailyDigest';
import DailyDigestPopup from './DailyDigestPopup';
import { FaArrowUp, FaArrowDown, FaHome, FaRuler, FaMapMarkerAlt, FaCog, FaNewspaper, FaChartLine, FaExclamationTriangle, FaHistory, FaRobot, FaDatabase, FaChartBar, FaExchangeAlt } from 'react-icons/fa';
import MarketStatsSettings from './MarketStatsSettings';
import './MarketTrends.css';

const MarketTrendsTab = () => {
  const [trendData, setTrendData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], values: [] });
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [currentDigestIndex, setCurrentDigestIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [digestPopupOpen, setDigestPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'trends', 'insights', or 'trendspotter'
  const [marketSettings, setMarketSettings] = useState({
    bedrooms: 2,
    propertySize: 'all',
    neighborhoods: ['Dubai Marina', 'Downtown Dubai', 'Business Bay'],
    showRentalPrice: true,
    showPropertySize: true,
    showNeighborhoodShifts: true
  });

  // New state for additional features
  const [aiInsights, setAiInsights] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [marketOversaturation, setMarketOversaturation] = useState([]);
  const [trendScannerResults, setTrendScannerResults] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());

  // Static fake data for areas in decline
  const staticFallingTrends = [
    {
      title: "Jumeirah Lakes Towers",
      value: "AED 85,000",
      change: 5.2,
      isPositive: false
    },
    {
      title: "Dubai Marina",
      value: "AED 120,000",
      change: 3.8,
      isPositive: false
    },
    {
      title: "Business Bay",
      value: "AED 95,000",
      change: 4.5,
      isPositive: false
    },
    {
      title: "Downtown Dubai",
      value: "AED 150,000",
      change: 2.9,
      isPositive: false
    }
  ];

  // Static market statistics data with variations based on settings
  const getMarketStats = () => {
    // Base data
    const baseData = {
      averageRentalPrice: {
        value: "AED 125,000",
        change: 2.5,
        isPositive: true,
        description: "Average annual rental price for 2-bedroom apartments"
      },
      propertySize: {
        value: "1,250 sq ft",
        change: 1.8,
        isPositive: true,
        description: "Average property size in Dubai"
      },
      neighborhoodShifts: [
        {
          from: "Dubai Marina",
          to: "Dubai Hills",
          percentage: 15,
          description: "Residents moving from Dubai Marina to Dubai Hills"
        },
        {
          from: "Downtown Dubai",
          to: "Palm Jumeirah",
          percentage: 12,
          description: "Residents moving from Downtown Dubai to Palm Jumeirah"
        },
        {
          from: "Business Bay",
          to: "Dubai Silicon Oasis",
          percentage: 8,
          description: "Residents moving from Business Bay to Dubai Silicon Oasis"
        }
      ]
    };

    // Adjust data based on settings
    const adjustedData = { ...baseData };
    
    // Adjust rental price based on bedrooms
    const bedroomPrices = {
      1: { value: "AED 85,000", change: 1.2 },
      2: { value: "AED 125,000", change: 2.5 },
      3: { value: "AED 180,000", change: 3.1 },
      4: { value: "AED 250,000", change: 3.8 },
      5: { value: "AED 350,000", change: 4.2 }
    };
    
    if (bedroomPrices[marketSettings.bedrooms]) {
      adjustedData.averageRentalPrice.value = bedroomPrices[marketSettings.bedrooms].value;
      adjustedData.averageRentalPrice.change = bedroomPrices[marketSettings.bedrooms].change;
      adjustedData.averageRentalPrice.description = `Average annual rental price for ${marketSettings.bedrooms === 1 ? 'studio' : `${marketSettings.bedrooms}-bedroom`} apartments`;
    }
    
    // Adjust property size based on filter
    if (marketSettings.propertySize !== 'all') {
      const sizeData = {
        'studio': { value: "600 sq ft", change: 0.5 },
        '1-bedroom': { value: "800 sq ft", change: 0.8 },
        '2-bedroom': { value: "1,250 sq ft", change: 1.8 },
        '3-bedroom': { value: "1,800 sq ft", change: 2.2 },
        '4-bedroom': { value: "2,500 sq ft", change: 2.5 },
        '5-bedroom': { value: "3,200 sq ft", change: 2.8 },
        'villa': { value: "4,000 sq ft", change: 3.2 }
      };
      
      if (sizeData[marketSettings.propertySize]) {
        adjustedData.propertySize.value = sizeData[marketSettings.propertySize].value;
        adjustedData.propertySize.change = sizeData[marketSettings.propertySize].change;
        adjustedData.propertySize.description = `Average size for ${marketSettings.propertySize.replace('-', ' ')} properties`;
      }
    }
    
    // Filter neighborhood shifts based on selected neighborhoods
    if (marketSettings.neighborhoods.length > 0) {
      adjustedData.neighborhoodShifts = baseData.neighborhoodShifts.filter(shift => 
        marketSettings.neighborhoods.includes(shift.from) || 
        marketSettings.neighborhoods.includes(shift.to)
      );
    }
    
    return adjustedData;
  };

  // Fetch data for all features
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        // Fetch current trends and daily digest
        const trendsResponse = await fetch('http://localhost:8000/market-trends/current-trends');
        const trendsData = await trendsResponse.json();
        
        // Fetch chart data
        const chartResponse = await fetch('http://localhost:8000/market-trends/rental-trends-chart');
        const chartData = await chartResponse.json();
        
        // Fetch AI insights (hardcoded for now)
        const aiInsightsData = [
          {
            id: 1,
            title: "Dubai Hills is emerging as a new investment hotspot",
            description: "Our AI models predict a 15% increase in property values over the next 12 months due to new infrastructure developments.",
            confidence: 0.85,
            source: "Property Finder, Property , Bayut"
          },
          {
            id: 2,
            title: "Downtown Dubai rental market is stabilizing",
            description: "After a period of decline, our analysis shows that rental prices in Downtown Dubai are beginning to stabilize with a projected 3% growth in the next quarter.",
            confidence: 0.78,
            source: "Property Finder, Property Monitor, Bayut"
          },
          {
            id: 3,
            title: "New investment opportunity in Dubai Silicon Oasis",
            description: "Our AI has identified a potential investment opportunity in Dubai Silicon Oasis with a projected ROI of 12% over the next 18 months.",
            confidence: 0.92,
            source: "Property Finder, Property Monitor, Bayut"
          }
        ];
        
        // Fetch transaction history (hardcoded for now)
        const transactionHistoryData = [
          {
            id: 1,
            property: "Luxury Apartment in Dubai Marina",
            date: "2023-01-15",
            price: "AED 1,200,000",
            change: "+5.2%",
            isPositive: true
          },
          {
            id: 2,
            property: "Villa in Palm Jumeirah",
            date: "2023-02-20",
            price: "AED 3,500,000",
            change: "+3.8%",
            isPositive: true
          },
          {
            id: 3,
            property: "Apartment in Business Bay",
            date: "2023-03-10",
            price: "AED 950,000",
            change: "-2.1%",
            isPositive: false
          },
          {
            id: 4,
            property: "Penthouse in Downtown Dubai",
            date: "2023-04-05",
            price: "AED 2,800,000",
            change: "+7.5%",
            isPositive: true
          }
        ];
        
        // Fetch market oversaturation data (hardcoded for now)
        const marketOversaturationData = [
          {
            id: 1,
            area: "Jumeirah Lakes Towers",
            riskLevel: "High",
            description: "Market is oversaturated with rental properties. High competition is driving prices down.",
            recommendation: "Consider selling or holding properties until market conditions improve."
          },
          {
            id: 2,
            area: "Business Bay",
            riskLevel: "Medium",
            description: "Growing number of new listings indicate potential oversaturation in the next 6 months.",
            recommendation: "Monitor market closely and consider diversifying portfolio."
          }
        ];
        
        // Fetch TrendScanner results (hardcoded for now)
        const trendScannerData = [
          {
            id: 1,
            pattern: "Increasing demand for waterfront properties",
            description: "Our TrendSpotter has detected a 25% increase in searches for waterfront properties in the last 30 days.",
            impact: "Positive",
            affectedAreas: ["Dubai Marina", "Palm Jumeirah", "JBR"]
          },
          {
            id: 2,
            pattern: "Shift towards larger living spaces",
            description: "TrendSpotter shows a 15% increase in searches for 3+ bedroom properties compared to smaller units.",
            impact: "Positive",
            affectedAreas: ["Dubai Hills", "Dubai Silicon Oasis", "Dubai Land"]
          },
          {
            id: 3,
            pattern: "Decreasing interest in studio apartments",
            description: "Our analysis shows a 10% decrease in searches for studio apartments in the last quarter.",
            impact: "Negative",
            affectedAreas: ["Downtown Dubai", "Business Bay", "Dubai Marina"]
          }
        ];

        // Transform the data for our components
        const transformedTrendData = trendsData.area_trends.map(trend => ({
          title: trend.area,
          value: trend.description,
          change: parseFloat(trend.description.match(/\d+\.?\d*/)[0]),
          isPositive: trend.trend === "↑"
        }));

        setTrendData(transformedTrendData);
        setChartData(chartData);
        setDailyUpdates(trendsData.daily_digest.map(item => ({
          content: item.text,
          isIncrease: item.is_increase,
          change: item.change,
          timestamp: 'Today'
        })));
        setAiInsights(aiInsightsData);
        setTransactionHistory(transactionHistoryData);
        setMarketOversaturation(marketOversaturationData);
        setTrendScannerResults(trendScannerData);
        setLastUpdated(new Date().toLocaleString());
        setError(null);
      } catch (err) {
        setError('Failed to fetch market data. Please try again later.');
        console.error('Error fetching market data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  // Add rotation effect for daily digest
  useEffect(() => {
    if (dailyUpdates.length > 0) {
      const interval = setInterval(() => {
        setCurrentDigestIndex((prevIndex) => 
          prevIndex === dailyUpdates.length - 1 ? 0 : prevIndex + 1
        );
      }, 10000); // Rotate every 10 seconds (slowed down from 5 seconds)

      return () => clearInterval(interval);
    }
  }, [dailyUpdates]);

  const handleSettingsSave = (newSettings) => {
    setMarketSettings(newSettings);
    // In a real app, you might want to save these settings to localStorage or a backend
    localStorage.setItem('marketStatsSettings', JSON.stringify(newSettings));
  };

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('marketStatsSettings');
    if (savedSettings) {
      try {
        setMarketSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
  }, []);

  // Separate rising and falling trends
  const risingTrends = trendData.filter(trend => trend.isPositive);
  // Use static data if no falling trends are available
  const fallingTrends = trendData.filter(trend => !trend.isPositive).length > 0 
    ? trendData.filter(trend => !trend.isPositive) 
    : staticFallingTrends;

  // Get market stats based on current settings
  const marketStats = getMarketStats();

  // Render the main overview tab
  const renderOverviewTab = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex gap-8"
      >
        {/* Main Content - Left Side */}
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Dubai Rental Market Overview</h2>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSettingsOpen(true)}
                className="flex items-center text-accent-400 hover:text-accent-300 transition-colors"
              >
                <FaCog className="mr-2" />
                <span>Customize</span>
              </motion.button>
            </div>

            {/* Daily Digest Headline Ticker */}
            {dailyUpdates.length > 0 && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg cursor-pointer hover:bg-slate-700/90 transition-colors border border-slate-700/50"
                onClick={() => setDigestPopupOpen(true)}
              >
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <FaNewspaper className="text-accent-400 mr-2" />
                    <span className="text-accent-400 font-medium">Daily Digest:</span>
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div 
                      key={currentDigestIndex}
                      className="digest-ticker text-white text-lg font-medium whitespace-nowrap flex items-center"
                    >
                      {dailyUpdates[currentDigestIndex].isIncrease ? (
                        <FaArrowUp className="text-green-500 mr-2" />
                      ) : (
                        <FaArrowDown className="text-red-500 mr-2" />
                      )}
                      {dailyUpdates[currentDigestIndex].content}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Market Statistics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-700/50"
          >
            <div className="space-y-4">
              {/* Top Row - Average Rental Price and Property Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Average Rental Price */}
                {marketSettings.showRentalPrice && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-700/50"
                  >
                    <div className="flex items-center mb-1">
                      <FaHome className="text-accent-400 mr-2" />
                      <h4 className="text-sm font-semibold text-white">Average Rental Price</h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">{marketStats.averageRentalPrice.value}</span>
                      <div className={`flex items-center ${marketStats.averageRentalPrice.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {marketStats.averageRentalPrice.isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                        <span className="font-semibold text-sm">{marketStats.averageRentalPrice.change}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{marketStats.averageRentalPrice.description}</p>
                  </motion.div>
                )}

                {/* Property Size */}
                {marketSettings.showPropertySize && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-700/50"
                  >
                    <div className="flex items-center mb-1">
                      <FaRuler className="text-accent-400 mr-2" />
                      <h4 className="text-sm font-semibold text-white">Property Size</h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">{marketStats.propertySize.value}</span>
                      <div className={`flex items-center ${marketStats.propertySize.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {marketStats.propertySize.isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                        <span className="font-semibold text-sm">{marketStats.propertySize.change}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{marketStats.propertySize.description}</p>
                  </motion.div>
                )}
              </div>

              {/* Bottom Row - Neighborhood Shifts */}
              {marketSettings.showNeighborhoodShifts && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-slate-700/50"
                >
                  <div className="flex items-center mb-3">
                    <FaMapMarkerAlt className="text-accent-400 mr-2" />
                    <h4 className="text-base font-semibold text-white">Neighborhood Shifts</h4>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {marketStats.neighborhoodShifts.length > 0 ? (
                      marketStats.neighborhoodShifts.map((shift, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-slate-700/50 pb-2 last:border-0"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-white text-sm">{shift.from} → {shift.to}</span>
                            <span className="text-accent-400 text-sm font-semibold">{shift.percentage}%</span>
                          </div>
                          <p className="text-xs text-slate-400">{shift.description}</p>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">No neighborhood shifts data available for selected neighborhoods.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
          
          {/* Market Oversaturation Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-slate-700/50"
          >
            <div className="flex items-center mb-3">
              <FaExclamationTriangle className="text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Market Oversaturation</h3>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {marketOversaturation.map((warning, index) => (
                <motion.div 
                  key={warning.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-700/50 rounded-lg p-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-white font-medium">{warning.area}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      warning.riskLevel === "High" ? "bg-red-900/50 text-red-200" : 
                      warning.riskLevel === "Medium" ? "bg-yellow-900/50 text-yellow-200" : 
                      "bg-green-900/50 text-green-200"
                    }`}>
                      {warning.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{warning.description}</p>
                  <p className="text-xs text-accent-400">{warning.recommendation}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side - Areas on the Rise and Decline */}
        <div className="w-96 space-y-6">
          {/* Rising Trends Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-slate-700/50"
          >
            <div className="flex items-center mb-3">
              <FaArrowUp className="text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Areas on the Rise</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <div className="space-y-3">
                {risingTrends.map((trend, index) => (
                  <motion.div
                    key={`rising-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TrendCard {...trend} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Falling Trends Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-slate-700/50"
          >
            <div className="flex items-center mb-3">
              <FaArrowDown className="text-red-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Areas in Decline</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <div className="space-y-3">
                {fallingTrends.map((trend, index) => (
                  <motion.div
                    key={`falling-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TrendCard {...trend} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // Render the trends and history tab
  const renderTrendsTab = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        {/* Market Chart Section */}
        <section>
          <div className="flex items-center mb-4">
            <FaChartBar className="text-accent-400 mr-2" />
            <h3 className="text-xl font-semibold text-white">Rental Market Trends</h3>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-700/50"
          >
            <MarketChart data={chartData} />
          </motion.div>
        </section>

        {/* Transaction History Section */}
        <section>
          <div className="flex items-center mb-4">
            <FaHistory className="text-accent-400 mr-2" />
            <h3 className="text-xl font-semibold text-white">Transaction History</h3>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-700/50 overflow-x-auto"
          >
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-700/50">
                  <th className="pb-2 text-slate-400 font-medium">Property</th>
                  <th className="pb-2 text-slate-400 font-medium">Date</th>
                  <th className="pb-2 text-slate-400 font-medium">Price</th>
                  <th className="pb-2 text-slate-400 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {transactionHistory.map((transaction, index) => (
                  <motion.tr 
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-slate-700/50 last:border-0"
                  >
                    <td className="py-3 text-white">{transaction.property}</td>
                    <td className="py-3 text-slate-300">{transaction.date}</td>
                    <td className="py-3 text-slate-300">{transaction.price}</td>
                    <td className={`py-3 ${transaction.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.change}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </section>
      </motion.div>
    );
  };

  // Render the TrendSpotter tab with combined AI Insights
  const renderTrendSpotterTab = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="flex items-center mb-4">
          <FaChartLine className="text-blue-400 mr-2" />
          <h3 className="text-xl font-semibold text-white">TrendSpotter</h3>
        </div>
        
        <div className="flex gap-6">
          {/* AI Insights Section - Left side (2/3 width) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-2/3 bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-700/50"
          >
            <h4 className="text-lg font-medium text-white mb-4">AI-Powered Insights</h4>
            <div className="space-y-6">
              {aiInsights.map((insight, index) => (
                <motion.div 
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-slate-700/50 pb-6 last:border-0"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-medium text-white">{insight.title}</h4>
                    <div className="flex items-center">
                      <span className="text-xs text-slate-400 mr-2">Confidence:</span>
                      <div className="w-16 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${insight.confidence * 100}%` }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                          className="h-full bg-accent-400"
                        />
                      </div>
                      <span className="text-xs text-slate-400 ml-2">{Math.round(insight.confidence * 100)}%</span>
                    </div>
                  </div>
                  <p className="text-slate-300 mb-3">{insight.description}</p>
                  <div className="flex items-center text-xs text-slate-400">
                    <FaDatabase className="mr-1" />
                    <span>{insight.source}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* TrendSpotter Section - Right side (1/3 width) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-1/3 bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-700/50"
          >
            <h4 className="text-lg font-medium text-white mb-4">Market Trends</h4>
            <div className="space-y-6">
              {trendScannerResults.map((result, index) => (
                <motion.div 
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-700/50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-medium text-white">{result.pattern}</h4>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      result.impact === "Positive" ? "bg-green-900/50 text-green-200" : 
                      result.impact === "Negative" ? "bg-red-900/50 text-red-200" : 
                      "bg-slate-900/50 text-slate-200"
                    }`}>
                      {result.impact} Impact
                    </span>
                  </div>
                  <p className="text-slate-300 mb-3">{result.description}</p>
                  <div className="flex items-center text-xs text-slate-400">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>Affected Areas: {result.affectedAreas.join(", ")}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-4 py-2 font-medium text-sm flex items-center ${
            activeTab === 'overview' 
              ? 'text-accent-400 border-b-2 border-accent-400' 
              : 'text-slate-400 hover:text-slate-300'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          <FaHome className="mr-2" />
          Overview
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-4 py-2 font-medium text-sm flex items-center ${
            activeTab === 'trendspotter' 
              ? 'text-accent-400 border-b-2 border-accent-400' 
              : 'text-slate-400 hover:text-slate-300'
          }`}
          onClick={() => setActiveTab('trendspotter')}
        >
          <FaChartLine className="mr-2" />
          TrendSpotter
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-4 py-2 font-medium text-sm flex items-center ${
            activeTab === 'trends' 
              ? 'text-accent-400 border-b-2 border-accent-400' 
              : 'text-slate-400 hover:text-slate-300'
          }`}
          onClick={() => setActiveTab('trends')}
        >
          <FaHistory className="mr-2" />
          Transactions
        </motion.button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? renderOverviewTab() : 
         activeTab === 'trendspotter' ? renderTrendSpotterTab() :
         renderTrendsTab()}
      </AnimatePresence>

      {/* Settings Modal */}
      <MarketStatsSettings 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSettingsSave}
        initialSettings={marketSettings}
      />

      {/* Daily Digest Popup */}
      <DailyDigestPopup
        isOpen={digestPopupOpen}
        onClose={() => setDigestPopupOpen(false)}
        updates={dailyUpdates}
      />

      {/* Data Source and Last Updated - Moved to bottom */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-4 border-t border-slate-700">
        <div className="flex items-center">
          <FaDatabase className="mr-1" />
          <span>Data sources: Property Finder, Property Monitor, Bayut</span>
        </div>
        <div>
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>
    </div>
  );
};

export default MarketTrendsTab; 