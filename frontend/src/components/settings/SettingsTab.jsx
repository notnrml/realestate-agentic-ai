import { useState, useEffect } from 'react';
import { FaCog, FaSave, FaTimes, FaChartLine } from 'react-icons/fa';

const SettingsTab = () => {
  const [marketSettings, setMarketSettings] = useState({
    bedrooms: 2,
    propertySize: 'all',
    neighborhoods: ['Dubai Marina', 'Downtown Dubai', 'Business Bay'],
    showRentalPrice: true,
    showPropertySize: true,
    showNeighborhoodShifts: true
  });

  // Available options
  const bedroomOptions = [1, 2, 3, 4, 5];
  const propertySizeOptions = ['all', 'studio', '1-bedroom', '2-bedroom', '3-bedroom', '4-bedroom', '5-bedroom', 'villa'];
  const allNeighborhoods = [
    'Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Dubai Hills', 
    'Palm Jumeirah', 'Dubai Silicon Oasis', 'Jumeirah Lakes Towers', 
    'Dubai Sports City', 'Dubai Land', 'Dubai South'
  ];

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMarketSettings({
      ...marketSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNeighborhoodChange = (neighborhood) => {
    setMarketSettings(prev => {
      const neighborhoods = prev.neighborhoods.includes(neighborhood)
        ? prev.neighborhoods.filter(n => n !== neighborhood)
        : [...prev.neighborhoods, neighborhood];
      
      return {
        ...prev,
        neighborhoods
      };
    });
  };

  const handleSave = () => {
    localStorage.setItem('marketStatsSettings', JSON.stringify(marketSettings));
    // You could also save to a backend here
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Settings</h2>
      </div>

      {/* Market Statistics Settings */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center mb-6">
          <FaChartLine className="text-accent-400 mr-2" />
          <h3 className="text-xl font-semibold text-white">Market Statistics Settings</h3>
        </div>

        <div className="space-y-6">
          {/* Bedrooms Selection */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Number of Bedrooms</h4>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map(bedroom => (
                <button
                  key={bedroom}
                  onClick={() => setMarketSettings({...marketSettings, bedrooms: bedroom})}
                  className={`px-4 py-2 rounded-md ${
                    marketSettings.bedrooms === bedroom 
                      ? 'bg-accent-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {bedroom === 1 ? 'Studio' : `${bedroom} BR`}
                </button>
              ))}
            </div>
          </div>

          {/* Property Size Filter */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Property Size Filter</h4>
            <select
              name="propertySize"
              value={marketSettings.propertySize}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:border-accent-400 focus:outline-none"
            >
              {propertySizeOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All Sizes' : option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Neighborhood Selection */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Tracked Neighborhoods</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allNeighborhoods.map(neighborhood => (
                <div 
                  key={neighborhood}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id={`neighborhood-${neighborhood}`}
                    checked={marketSettings.neighborhoods.includes(neighborhood)}
                    onChange={() => handleNeighborhoodChange(neighborhood)}
                    className="mr-2 accent-accent-400"
                  />
                  <label 
                    htmlFor={`neighborhood-${neighborhood}`}
                    className="text-gray-300"
                  >
                    {neighborhood}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div>
            <h4 className="text-lg font-medium text-white mb-3">Display Options</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showRentalPrice"
                  name="showRentalPrice"
                  checked={marketSettings.showRentalPrice}
                  onChange={handleChange}
                  className="mr-2 accent-accent-400"
                />
                <label htmlFor="showRentalPrice" className="text-gray-300">
                  Show Average Rental Price
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showPropertySize"
                  name="showPropertySize"
                  checked={marketSettings.showPropertySize}
                  onChange={handleChange}
                  className="mr-2 accent-accent-400"
                />
                <label htmlFor="showPropertySize" className="text-gray-300">
                  Show Property Size
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showNeighborhoodShifts"
                  name="showNeighborhoodShifts"
                  checked={marketSettings.showNeighborhoodShifts}
                  onChange={handleChange}
                  className="mr-2 accent-accent-400"
                />
                <label htmlFor="showNeighborhoodShifts" className="text-gray-300">
                  Show Neighborhood Shifts
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 flex items-center"
          >
            <FaSave className="mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab; 