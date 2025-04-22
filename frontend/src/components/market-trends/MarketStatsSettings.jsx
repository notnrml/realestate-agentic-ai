import { useState, useEffect } from 'react';
import { FaCog, FaSave, FaTimes } from 'react-icons/fa';

const MarketStatsSettings = ({ isOpen, onClose, onSave, initialSettings }) => {
  const [settings, setSettings] = useState({
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

  // Initialize settings with props if provided
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNeighborhoodChange = (neighborhood) => {
    setSettings(prev => {
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
    onSave(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <FaCog className="text-accent-400 mr-2" />
            <h2 className="text-xl font-semibold text-white">Market Statistics Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-6">
          {/* Bedrooms Selection */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Number of Bedrooms</h3>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map(bedroom => (
                <button
                  key={bedroom}
                  onClick={() => setSettings({...settings, bedrooms: bedroom})}
                  className={`px-4 py-2 rounded-md ${
                    settings.bedrooms === bedroom 
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
            <h3 className="text-lg font-medium text-white mb-3">Property Size Filter</h3>
            <select
              name="propertySize"
              value={settings.propertySize}
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
            <h3 className="text-lg font-medium text-white mb-3">Tracked Neighborhoods</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allNeighborhoods.map(neighborhood => (
                <div 
                  key={neighborhood}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id={`neighborhood-${neighborhood}`}
                    checked={settings.neighborhoods.includes(neighborhood)}
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
            <h3 className="text-lg font-medium text-white mb-3">Display Options</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showRentalPrice"
                  name="showRentalPrice"
                  checked={settings.showRentalPrice}
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
                  checked={settings.showPropertySize}
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
                  checked={settings.showNeighborhoodShifts}
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

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
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

export default MarketStatsSettings; 