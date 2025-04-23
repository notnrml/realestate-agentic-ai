import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const marketTrendsService = {
  // Get current market trends including daily digest and area trends
  async getCurrentTrends() {
    try {
      const response = await axios.get(`${API_BASE_URL}/market-trends/current-trends`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current trends:', error);
      throw error;
    }
  },

  // Get rental trends chart data
  async getRentalTrendsChart() {
    try {
      const response = await axios.get(`${API_BASE_URL}/market-trends/rental-trends-chart`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rental trends chart:', error);
      throw error;
    }
  },

  // Get emerging trends (trendspotter)
  async getEmergingTrends() {
    try {
      const response = await axios.get(`${API_BASE_URL}/market-trends/trend-spotter`);
      return response.data;
    } catch (error) {
      console.error('Error fetching emerging trends:', error);
      throw error;
    }
  },

  // Get market oversaturation analysis
  async getMarketOversaturation() {
    try {
      const response = await axios.get(`${API_BASE_URL}/market-trends/tenant-agents-oversaturation`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market oversaturation:', error);
      throw error;
    }
  },

  // Get AI insights analysis
  async getAIInsights() {
    try {
      const response = await axios.get(`${API_BASE_URL}/market-trends/ai-insights`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      throw error;
    }
  },

  // Get transaction history
  async getTransactions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/market-trends/transactions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get transaction history for a specific property
  async getTransactionHistory(propertyId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/market-trends/transaction-history/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction history for property ${propertyId}:`, error);
      throw error;
    }
  }
}; 