import { useState } from 'react';
import { motion } from 'framer-motion';

const mockProperties = [
  {
    id: 1,
    name: "Luxury Apartment - Downtown",
    location: "Downtown Dubai",
    purchasePrice: 2500000,
    currentValue: 2800000,
    monthlyRent: 15000,
    occupancyRate: 95,
    roi: 7.2,
    riskLevel: "Low",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 2,
    name: "Villa - Palm Jumeirah",
    location: "Palm Jumeirah",
    purchasePrice: 5000000,
    currentValue: 5200000,
    monthlyRent: 30000,
    occupancyRate: 85,
    roi: 6.8,
    riskLevel: "Medium",
    image: "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80"
  }
];

function PortfolioPage() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [simulationValues, setSimulationValues] = useState({
    rent: 0,
    occupancy: 0,
    maintenance: 0
  });

  const handleSimulationChange = (property, values) => {
    setSelectedProperty(property);
    setSimulationValues(values);
  };

  const calculateNewROI = (property) => {
    if (!selectedProperty || property.id !== selectedProperty.id) return property.roi;
    
    const baseAnnualIncome = property.monthlyRent * 12;
    const newAnnualIncome = (baseAnnualIncome + simulationValues.rent) * 
                           ((100 + simulationValues.occupancy) / 100);
    const expenses = property.purchasePrice * (simulationValues.maintenance / 100);
    
    return ((newAnnualIncome - expenses) / property.purchasePrice) * 100;
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-slate-400 text-sm font-medium">Total Portfolio Value</h3>
            <p className="text-3xl font-bold text-white mt-2">AED 8,000,000</p>
            <p className="text-green-400 text-sm mt-2">+12.5% from last year</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-slate-400 text-sm font-medium">Average ROI</h3>
            <p className="text-3xl font-bold text-white mt-2">7.0%</p>
            <p className="text-green-400 text-sm mt-2">+0.5% from last quarter</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-slate-400 text-sm font-medium">Total Monthly Rent</h3>
            <p className="text-3xl font-bold text-white mt-2">AED 45,000</p>
            <p className="text-green-400 text-sm mt-2">+8.3% from last month</p>
          </motion.div>
        </div>

        {/* Properties List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Your Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockProperties.map((property) => (
              <motion.div
                key={property.id}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800 rounded-xl overflow-hidden shadow-lg"
              >
                <div className="relative h-48">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg">{property.name}</h3>
                    <p className="text-slate-400 text-sm">{property.location}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">Current Value</p>
                      <p className="text-white font-medium">AED {property.currentValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Monthly Rent</p>
                      <p className="text-white font-medium">AED {property.monthlyRent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">ROI</p>
                      <p className="text-white font-medium">{calculateNewROI(property).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Risk Level</p>
                      <p className={`font-medium ${
                        property.riskLevel === "Low" ? "text-green-400" :
                        property.riskLevel === "Medium" ? "text-yellow-400" :
                        "text-red-400"
                      }`}>{property.riskLevel}</p>
                    </div>
                  </div>

                  {/* Simulation Controls */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Simulate Changes</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-slate-400 text-sm">Rent Change (%)</label>
                        <input
                          type="number"
                          className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white"
                          value={selectedProperty?.id === property.id ? simulationValues.rent : 0}
                          onChange={(e) => handleSimulationChange(property, {
                            ...simulationValues,
                            rent: parseFloat(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm">Occupancy Rate Change (%)</label>
                        <input
                          type="number"
                          className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white"
                          value={selectedProperty?.id === property.id ? simulationValues.occupancy : 0}
                          onChange={(e) => handleSimulationChange(property, {
                            ...simulationValues,
                            occupancy: parseFloat(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm">Maintenance Cost (%)</label>
                        <input
                          type="number"
                          className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white"
                          value={selectedProperty?.id === property.id ? simulationValues.maintenance : 0}
                          onChange={(e) => handleSimulationChange(property, {
                            ...simulationValues,
                            maintenance: parseFloat(e.target.value)
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PortfolioPage; 