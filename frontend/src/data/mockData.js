export const mockStrategies = [
  {
    unit_id: "U102",
    strategy: "Raise Rent",
    description: "Increase rent by 6% based on market analysis",
    roi: 9.6,
    cost: 0,
    risk_level: "Medium",
    timeframe: "Immediate",
    impact: "High"
  },
  {
    unit_id: "U102",
    strategy: "Furnish Unit",
    description: "Add modern furniture to increase rental value",
    roi: 9.9,
    cost: 10000,
    risk_level: "Low",
    timeframe: "1 month",
    impact: "Medium"
  },
  {
    unit_id: "U102",
    strategy: "Keep Current Price",
    description: "Maintain current rent with reliable tenant",
    roi: 8.8,
    cost: 0,
    risk_level: "Low",
    timeframe: "Immediate",
    impact: "Low"
  },
  {
    unit_id: "U103",
    strategy: "Renovate Kitchen",
    description: "Modernize kitchen to attract premium tenants",
    roi: 10.2,
    cost: 25000,
    risk_level: "Medium",
    timeframe: "2 months",
    impact: "High"
  },
  {
    unit_id: "U103",
    strategy: "Add Smart Home Features",
    description: "Install smart home technology for modern appeal",
    roi: 9.5,
    cost: 15000,
    risk_level: "Low",
    timeframe: "1 month",
    impact: "Medium"
  },
  {
    unit_id: "U104",
    strategy: "Convert to Short-term Rental",
    description: "Switch to Airbnb-style rental for higher returns",
    roi: 12.5,
    cost: 20000,
    risk_level: "High",
    timeframe: "2 months",
    impact: "High"
  },
  {
    unit_id: "U104",
    strategy: "Add Balcony Extension",
    description: "Extend balcony space for premium appeal",
    roi: 11.2,
    cost: 35000,
    risk_level: "Medium",
    timeframe: "3 months",
    impact: "High"
  }
];

export const mockInvestments = [
  {
    unit_id: "INV_JVC_001",
    strategy: "Invest in 1-bed JVC",
    price: 760000,
    expected_rent: 72000,
    roi: 9.3,
    agent_name: "Ali Khan",
    listing_url: "https://www.propertyfinder.ae/en/plp/buy/apartment-for-sale-dubai-jumeirah-village-circle-diamond-views-diamond-views-2-13938313.html",
    location: "Jumeirah Village Circle",
    property_type: "Apartment",
    bedrooms: 1,
    bathrooms: 1,
    size_sqft: 739,
    amenities: ["Pool", "Gym", "Parking"],
    market_trend: "Upward",
    risk_level: "medium",
    notes: "New development with high rental demand. Close to metro station."
  },
  {
    unit_id: "INV_DIFC_002",
    strategy: "Invest in Studio DIFC",
    price: 1200000,
    expected_rent: 110000,
    roi: 8.9,
    agent_name: "Sarah Ahmed",
    listing_url: "https://www.propertyfinder.ae/en/property.html?id=123457",
    location: "DIFC",
    property_type: "Apartment",
    bedrooms: 0,
    bathrooms: 1,
    size_sqft: 600,
    amenities: ["Concierge", "Gym", "Pool", "24/7 Security"],
    market_trend: "Stable",
    risk_level: "low",
    notes: "Premium location with high occupancy rates. Corporate tenant potential."
  },
  {
    unit_id: "INV_DM_003",
    strategy: "Invest in 2-bed Downtown",
    price: 2500000,
    expected_rent: 180000,
    roi: 8.4,
    agent_name: "Mohammed Al Maktoum",
    listing_url: "https://www.propertyfinder.ae/en/property.html?id=123458",
    location: "Downtown Dubai",
    property_type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    size_sqft: 1200,
    amenities: ["Pool", "Gym", "Parking", "Kids Play Area"],
    market_trend: "Upward",
    risk_level: "medium",
    notes: "Luxury development with Burj Khalifa views. High-end tenant market."
  }
];

export const mockUnits = [
  {
    id: "U102",
    location: "Dubai Marina",
    property_type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    current_rent: 110000,
    occupancy: "Occupied",
    tenant_since: "2022-01-15",
    market_value: 1800000,
    last_renovation: "2020-06-01"
  },
  {
    id: "U103",
    location: "Business Bay",
    property_type: "Apartment",
    bedrooms: 1,
    bathrooms: 1,
    current_rent: 85000,
    occupancy: "Vacant",
    tenant_since: null,
    market_value: 1200000,
    last_renovation: "2019-03-15"
  },
  {
    id: "U104",
    location: "Palm Jumeirah",
    property_type: "Apartment",
    bedrooms: 3,
    bathrooms: 2,
    current_rent: 180000,
    occupancy: "Occupied",
    tenant_since: "2023-03-01",
    market_value: 3200000,
    last_renovation: "2021-12-01"
  }
];

// Helper function to group strategies by unit
export const getStrategiesByUnit = () => {
  return mockUnits.map(unit => ({
    ...unit,
    strategies: mockStrategies.filter(strategy => strategy.unit_id === unit.id)
  }));
};

// Helper function to get investment opportunities
export const getInvestmentOpportunities = () => {
  return mockInvestments;
}; 