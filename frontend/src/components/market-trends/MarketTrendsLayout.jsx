import { useState } from 'react';
import MarketTrendsTab from './MarketTrendsTab';
import MarketTrendsSidebar from './MarketTrendsSidebar';
import MarketStatsSettings from './MarketStatsSettings';

const MarketTrendsLayout = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [marketSettings, setMarketSettings] = useState({
    bedrooms: 2,
    propertySize: 'all',
    neighborhoods: ['Dubai Marina', 'Downtown Dubai', 'Business Bay'],
    showRentalPrice: true,
    showPropertySize: true,
    showNeighborhoodShifts: true
  });

  const handleSettingsSave = (newSettings) => {
    setMarketSettings(newSettings);
    localStorage.setItem('marketStatsSettings', JSON.stringify(newSettings));
  };

  return (
    <div className="flex gap-6 p-6">
      <MarketTrendsSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      
      <div className="flex-1">
        <MarketTrendsTab marketSettings={marketSettings} />
      </div>

      <MarketStatsSettings 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSettingsSave}
        initialSettings={marketSettings}
      />
    </div>
  );
};

export default MarketTrendsLayout; 