import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function PortfolioPage() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [simulationValues, setSimulationValues] = useState({
    rent: 0,
    occupancy: 0,
    maintenance: 0
  });
  const [properties, setProperties] = useState(() => {
    const savedProperties = localStorage.getItem('portfolioProperties');
    return savedProperties ? JSON.parse(savedProperties) : [];
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [aiInsights, setAiInsights] = useState(() => {
    const savedInsights = localStorage.getItem('portfolioInsights');
    return savedInsights ? JSON.parse(savedInsights) : null;
  });
  const [editingProperty, setEditingProperty] = useState(null);

  useEffect(() => {
    localStorage.setItem('portfolioProperties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('portfolioInsights', JSON.stringify(aiInsights));
  }, [aiInsights]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to backend
      const response = await fetch('http://localhost:8000/api/portfolio/upload', {
        method: 'POST',
        body: formData,
      });

      // Log response details for debugging
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (!response.ok) {
        throw new Error(`Upload failed: ${responseText}`);
      }

      try {
        const data = JSON.parse(responseText);
        setProperties(data.properties || []);
        setAiInsights(data.insights || []);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      setUploadError(`Failed to upload file: ${error.message}`);
      console.error('Full error:', error);
    } finally {
      setIsUploading(false);
    }
  };

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

  const handlePropertyUpdate = async (propertyId, updatedData) => {
    try {
      const response = await fetch(`http://localhost:8000/api/portfolio/property/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update property');
      }

      // Update local state
      setProperties(properties.map(prop => 
        prop.id === propertyId ? { ...prop, ...updatedData } : prop
      ));
      
      // Exit edit mode
      setEditingProperty(null);

      // Save to localStorage
      localStorage.setItem('portfolioProperties', JSON.stringify(properties));
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Failed to update property. Please try again.');
    }
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* File Upload Section */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-slate-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium text-lg">Upload Your Portfolio</h3>
              <p className="text-slate-400 text-sm mt-1">
                Upload a CSV or Excel file containing your property investments
              </p>
            </div>
            <label className="relative cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-accent-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload File
              </motion.div>
            </label>
          </div>
          {isUploading && (
            <div className="mt-4 flex items-center gap-2 text-slate-400">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing your portfolio...
            </div>
          )}
          {uploadError && (
            <div className="mt-4 text-red-400 text-sm">{uploadError}</div>
          )}
        </motion.div>

        {/* Properties List */}
        {properties.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((property) => (
                <motion.div
                  key={property.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800 rounded-xl overflow-hidden shadow-lg relative"
                >
                  {/* Edit Button */}
                  <button
                    onClick={() => setEditingProperty(property.id)}
                    className="absolute top-4 right-4 p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors z-10"
                  >
                    <svg 
                      className="w-5 h-5 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                      />
                    </svg>
                  </button>

                  <div className="relative h-48">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-4">
                      {editingProperty === property.id ? (
                        <input
                          type="text"
                          defaultValue={property.name}
                          className="bg-slate-700 text-white px-2 py-1 rounded w-full mb-2"
                          onBlur={(e) => handlePropertyUpdate(property.id, { name: e.target.value })}
                        />
                      ) : (
                        <h3 className="text-white font-bold text-lg">{property.name}</h3>
                      )}
                      {editingProperty === property.id ? (
                        <input
                          type="text"
                          defaultValue={property.location}
                          className="bg-slate-700 text-white px-2 py-1 rounded w-full"
                          onBlur={(e) => handlePropertyUpdate(property.id, { location: e.target.value })}
                        />
                      ) : (
                        <p className="text-slate-400 text-sm">{property.location}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm">Current Value</p>
                        {editingProperty === property.id ? (
                          <input
                            type="number"
                            defaultValue={property.currentValue}
                            className="bg-slate-700 text-white px-2 py-1 rounded w-full"
                            onBlur={(e) => handlePropertyUpdate(property.id, { 
                              currentValue: parseFloat(e.target.value) 
                            })}
                          />
                        ) : (
                          <p className="text-white font-medium">
                            AED {property.currentValue.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Monthly Rent</p>
                        {editingProperty === property.id ? (
                          <input
                            type="number"
                            defaultValue={property.monthlyRent}
                            className="bg-slate-700 text-white px-2 py-1 rounded w-full"
                            onBlur={(e) => handlePropertyUpdate(property.id, { 
                              monthlyRent: parseFloat(e.target.value) 
                            })}
                          />
                        ) : (
                          <p className="text-white font-medium">
                            AED {property.monthlyRent.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">ROI</p>
                        {editingProperty === property.id ? (
                          <input
                            type="number"
                            step="0.1"
                            defaultValue={property.roi}
                            className="bg-slate-700 text-white px-2 py-1 rounded w-full"
                            onBlur={(e) => handlePropertyUpdate(property.id, { 
                              roi: parseFloat(e.target.value) 
                            })}
                          />
                        ) : (
                          <p className="text-white font-medium">
                            {calculateNewROI(property).toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Occupancy</p>
                        {editingProperty === property.id ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={property.occupancyRate}
                            className="bg-slate-700 text-white px-2 py-1 rounded w-full"
                            onBlur={(e) => handlePropertyUpdate(property.id, { 
                              occupancyRate: parseFloat(e.target.value) 
                            })}
                          />
                        ) : (
                          <p className="text-white font-medium">
                            {property.occupancyRate}%
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Save/Cancel buttons in edit mode */}
                    {editingProperty === property.id && (
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => setEditingProperty(null)}
                          className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setEditingProperty(null)}
                          className="px-3 py-1 bg-accent-500 text-white rounded hover:bg-accent-400"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {properties.length === 0 && !isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No Properties Added</h3>
            <p className="text-slate-400">Upload your portfolio file to get started</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default PortfolioPage;