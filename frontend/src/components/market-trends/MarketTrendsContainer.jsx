import React, { useState, useEffect } from 'react';
import { marketTrendsService } from '../../services/marketTrendsService';
import TrendCard from './TrendCard';
import DailyDigest from './DailyDigest';
import MarketChart from './MarketChart';
import AIInsights from './AIInsights';
import Transactions from './Transactions';

const MarketTrendsContainer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketData, setMarketData] = useState({
    currentTrends: null,
    chartData: null,
    emergingTrends: null,
    oversaturation: null,
    aiInsights: null,
    transactions: null
  });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const [
          currentTrends,
          chartData,
          emergingTrends,
          oversaturation,
          aiInsights,
          transactions
        ] = await Promise.all([
          marketTrendsService.getCurrentTrends(),
          marketTrendsService.getRentalTrendsChart(),
          marketTrendsService.getEmergingTrends(),
          marketTrendsService.getMarketOversaturation(),
          marketTrendsService.getAIInsights(),
          marketTrendsService.getTransactions()
        ]);

        setMarketData({
          currentTrends,
          chartData,
          emergingTrends,
          oversaturation,
          aiInsights,
          transactions
        });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketData.currentTrends?.area_trends.map((trend, index) => (
          <TrendCard
            key={index}
            title={trend.area}
            value={trend.description}
            change={trend.trend === "↑" ? "+5" : "-5"}
            isPositive={trend.trend === "↑"}
          />
        ))}
      </div>

      {/* Daily Digest and Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyDigest
          updates={marketData.currentTrends?.daily_digest.map(content => ({
            content,
            timestamp: new Date().toLocaleDateString()
          }))}
        />
        
        {/* Market Chart Section */}
        <MarketChart data={marketData.chartData} />
      </div>

      {/* AI Insights Section */}
      <AIInsights insights={marketData.aiInsights} />

      {/* Emerging Trends Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Emerging Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketData.emergingTrends?.map((trend, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">{trend.area}</h4>
                <span className={`text-sm ${trend.trend === "↑" ? "text-green-400" : trend.trend === "↓" ? "text-red-400" : "text-gray-400"}`}>
                  {trend.trend}
                </span>
              </div>
              <p className="text-gray-300 text-sm mt-2">{trend.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Oversaturation Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Market Oversaturation Analysis</h3>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-white">{marketData.oversaturation?.status}</p>
        </div>
      </div>

      {/* Transactions Section */}
      <Transactions transactions={marketData.transactions} />
    </div>
  );
};

export default MarketTrendsContainer; 