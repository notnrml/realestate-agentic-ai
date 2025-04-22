import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStrategiesByUnit, getInvestmentOpportunities } from '../../data/mockData';
import StrategyCard from './ScenarioCompare/StrategyCard';
import InvestmentCard from './PurchaseTrigger/InvestmentCard';
import userPreferencesStore from '../../store/userPreferences';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler
);

const AdvisorTab = () => {
  const [units, setUnits] = useState(getStrategiesByUnit());
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showCompare, setShowCompare] = useState(null);
  const [lastDecisions, setLastDecisions] = useState([]);
  const [showRoiNotification, setShowRoiNotification] = useState(false);
  const [roiNotificationUnit, setRoiNotificationUnit] = useState(null);
  const [showDecisionsToast, setShowDecisionsToast] = useState(false);

  const investmentOpportunities = getInvestmentOpportunities();

  // Check for significant ROI gaps and show notification
  useEffect(() => {
    let timeoutId;
    units.forEach(unit => {
      if (unit.strategies && unit.strategies.length > 1) {
        const rois = unit.strategies.map(s => s.roi);
        const maxRoi = Math.max(...rois);
        const minRoi = Math.min(...rois);
        const roiGap = maxRoi - minRoi;

        // If ROI gap is significant (>0.5%), show notification
        if (roiGap > 0.5 && !showRoiNotification) {
          setRoiNotificationUnit(unit);
          setShowRoiNotification(true);

          // Auto-hide ROI notification after 10 seconds
          timeoutId = setTimeout(() => {
            setShowRoiNotification(false);
          }, 10000);
        }
      }
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [units, showRoiNotification]);

  // Update last decisions from preferences store
  useEffect(() => {
    const updateDecisions = () => {
      const decisions = userPreferencesStore.getLastDecisions();
      if (decisions.length > 0) {
        setLastDecisions(decisions);
        setShowDecisionsToast(true);

        // Auto-hide decisions toast after 5 seconds
        setTimeout(() => {
          setShowDecisionsToast(false);
        }, 5000);
      }
    };
    updateDecisions();
    const interval = setInterval(updateDecisions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStrategyDecision = (unitId, strategy, decision) => {
    if (decision === 'accept') {
      // Remove the entire property when a strategy is accepted
      setUnits(prevUnits => prevUnits.filter(unit => unit.id !== unitId));
    } else {
      // Remove just the rejected strategy
      setUnits(prevUnits =>
        prevUnits.map(unit => {
          if (unit.id === unitId) {
            // If strategy is not specified, remove first strategy
            const strategyToRemove = strategy || (unit.strategies && unit.strategies.length > 0 ? unit.strategies[0].strategy : null);

            if (!strategyToRemove) {
              // If no strategy to remove, remove the whole unit
              return null;
            }

            const updatedStrategies = unit.strategies.filter(s => s.strategy !== strategyToRemove);
            // If no strategies left, remove the entire property
            if (updatedStrategies.length === 0) {
              return null;
            }
            return {
              ...unit,
              strategies: unit.strategies.filter(s => s.strategy !== strategy)
            };
          }
          return unit;
        })
      );
    }

    // Show decisions toast immediately after a decision
    setShowDecisionsToast(true);
    setTimeout(() => {
      setShowDecisionsToast(false);
    }, 5000);
  };

  return (
    <div className="p-6 space-y-8">
      {/* ROI Gap Notification */}
      <AnimatePresence>
        {showRoiNotification && roiNotificationUnit && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-slate-700/50 z-50 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-accent-400 mt-2 animate-pulse" />
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Significant ROI Gap Detected</h4>
                <p className="text-xs text-slate-400 mb-2">
                  We found a significant difference in potential returns for {roiNotificationUnit.location}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowCompare(roiNotificationUnit.id);
                    setShowRoiNotification(false);
                  }}
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Compare Strategies →
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last Decisions Toast */}
      <AnimatePresence>
        {showDecisionsToast && lastDecisions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-slate-700/50 z-50"
          >
            <h4 className="text-sm font-medium text-white mb-2">Recent Decisions</h4>
            <div className="space-y-2">
              {lastDecisions.map((decision, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-xs text-slate-400"
                >
                  {decision.decision === 'accept' ? '✅' : '❌'} {decision.strategy}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Properties Section */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-2xl font-semibold text-white">Your Properties</h2>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-2 h-2 rounded-full bg-accent-400"
          />
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {units.map((unit, index) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  filter: "blur(8px)",
                  transition: { duration: 0.5 }
                }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                whileHover={{ scale: 1.02 }}
                onHoverStart={() => setHoveredCard(unit.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700/50 relative overflow-hidden"
              >
                {hoveredCard === unit.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-medium text-white">{unit.location}</h3>
                    <p className="text-slate-400">{unit.property_type} • {unit.bedrooms} Bed • {unit.bathrooms} Bath</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    unit.occupancy === 'Occupied'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {unit.occupancy}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-slate-400">Current Rent</p>
                    <p className="text-lg font-medium text-white">AED {unit.current_rent.toLocaleString()}/yr</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Market Value</p>
                    <p className="text-lg font-medium text-white">AED {unit.market_value.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Suggested Strategies</h4>
                  <AnimatePresence mode="popLayout">
                    {unit.strategies.map((strategy, idx) => (
                      <StrategyCard
                        key={strategy.strategy}
                        strategy={strategy}
                        delay={idx * 0.1}
                        onDecision={(decision) => handleStrategyDecision(unit.id, strategy.strategy, decision)}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Single Compare Button for the Property */}
                  <div className="relative">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        console.log('Compare button clicked for unit:', unit.id);
                        setShowCompare(unit.id);
                      }}
                      type="button" // Explicitly set button type
                      className="w-full py-2 rounded-lg text-sm font-medium bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors relative z-20 cursor-pointer"
                    >
                      Compare Strategies
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Investment Opportunities Section */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-2xl font-semibold text-white">Investment Opportunities</h2>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="w-2 h-2 rounded-full bg-accent-400"
          />
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {investmentOpportunities.map((investment, index) => (
            <InvestmentCard
              key={investment.unit_id}
              investment={investment}
              delay={index * 0.1}
            />
          ))}
        </div>
      </section>

      {/* Compare Modal */}
      {showCompare && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setShowCompare(null)}
        >
          <div
            className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 border border-slate-700/50 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-medium text-white">Strategy Comparison</h3>
                <p className="text-slate-400">Detailed analysis of all available strategies</p>
              </div>
              <button
                onClick={() => setShowCompare(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {(() => {
              const unit = units.find(unit => unit.id === showCompare);

              if (!unit) {
                return (
                  <div className="text-center py-8">
                    <p className="text-slate-400">Property information not found.</p>
                  </div>
                );
              }

              // Ensure strategies exist and have required fields
              const strategies = unit.strategies || [];

              // Default market data if missing
              const marketTrends = unit.market_trends || [
                "Rental prices in this area increased by 5% in the last quarter",
                "Property values are expected to rise by 8-10% over the next year",
                "Demand for similar properties has increased by 15% year-over-year"
              ];

              const competitiveAnalysis = unit.competitive_analysis || [
                "Similar properties in the area are renting for 5% more on average",
                "Renovated properties command a 12% premium over non-renovated units",
                "Properties with smart home features are renting 7% faster"
              ];

              return (
                <div className="space-y-6">
                  {/* Property Overview */}
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                    <h4 className="text-lg font-medium text-white mb-4">Property Overview</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-slate-400">Location</p>
                        <p className="text-white">{unit.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Type</p>
                        <p className="text-white">{unit.property_type || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Current Rent</p>
                        <p className="text-white">AED {(unit.current_rent || 0).toLocaleString()}/yr</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Market Value</p>
                        <p className="text-white">AED {(unit.market_value || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Strategy Comparison Grid */}
                  {strategies.length > 0 ? (
                    <div className="space-y-6">
                      {/* Charts Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ROI Comparison Chart */}
                        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                          <h5 className="text-sm font-medium text-slate-400 mb-4">ROI Comparison</h5>
                          <Bar
                            data={{
                              labels: strategies.map(s => s.strategy),
                              datasets: [{
                                label: 'ROI (%)',
                                data: strategies.map(s => s.roi),
                                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                                borderColor: 'rgb(99, 102, 241)',
                                borderWidth: 1
                              }]
                            }}
                            options={{
                              responsive: true,
                              plugins: {
                                legend: {
                                  display: false
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                  },
                                  ticks: {
                                    color: 'rgba(255, 255, 255, 0.7)'
                                  }
                                },
                                x: {
                                  grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                  },
                                  ticks: {
                                    color: 'rgba(255, 255, 255, 0.7)'
                                  }
                                }
                              }
                            }}
                          />
                        </div>

                        {/* Risk vs Return Chart */}
                        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                          <h5 className="text-sm font-medium text-slate-400 mb-4">Risk vs Return Analysis</h5>
                          <Line
                            data={{
                              labels: strategies.map(s => s.strategy),
                              datasets: [{
                                label: 'Risk Level',
                                data: strategies.map(s => {
                                  const riskMap = { 'Low': 1, 'Medium': 2, 'High': 3 };
                                  return riskMap[s.risk_level] || 2;
                                }),
                                borderColor: 'rgb(239, 68, 68)',
                                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                                yAxisID: 'y'
                              }, {
                                label: 'ROI (%)',
                                data: strategies.map(s => s.roi),
                                borderColor: 'rgb(16, 185, 129)',
                                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                                yAxisID: 'y1'
                              }]
                            }}
                            options={{
                              responsive: true,
                              interaction: {
                                mode: 'index',
                                intersect: false,
                              },
                              scales: {
                                y: {
                                  type: 'linear',
                                  display: true,
                                  position: 'left',
                                  grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                  },
                                  ticks: {
                                    color: 'rgba(255, 255, 255, 0.7)'
                                  }
                                },
                                y1: {
                                  type: 'linear',
                                  display: true,
                                  position: 'right',
                                  grid: {
                                    drawOnChartArea: false,
                                  },
                                  ticks: {
                                    color: 'rgba(255, 255, 255, 0.7)'
                                  }
                                },
                                x: {
                                  grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                  },
                                  ticks: {
                                    color: 'rgba(255, 255, 255, 0.7)'
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* AI Analysis Section */}
                      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                        <h5 className="text-sm font-medium text-slate-400 mb-4">AI Analysis</h5>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-accent-400 mt-2 animate-pulse" />
                            <div>
                              <p className="text-white">Based on the current market conditions and property metrics, here's a comparative analysis:</p>
                              <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1">
                                {strategies.map((strategy, index) => (
                                  <li key={index}>
                                    <span className="font-medium text-white">{strategy.strategy}:</span> {strategy.description}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-accent-400 mt-2 animate-pulse" />
                            <div>
                              <p className="text-white">Key Insights:</p>
                              <ul className="list-disc list-inside text-slate-300 mt-2 space-y-1">
                                <li>The highest ROI strategy is {strategies.reduce((max, curr) => curr.roi > max.roi ? curr : max).strategy} with {Math.max(...strategies.map(s => s.roi))}% return</li>
                                <li>Market trends suggest {marketTrends[0]}</li>
                                <li>Competitive analysis indicates {competitiveAnalysis[0]}</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Individual Strategy Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {strategies.map((strategy, index) => {
                          // Default values for missing fields
                          const strategyData = {
                            ...strategy,
                            roi: strategy.roi || 0,
                            cost: strategy.cost || 0,
                            risk_level: strategy.risk_level || 'Medium',
                            timeframe: strategy.timeframe || 'N/A',
                            market_impact: strategy.market_impact || 'Moderate impact on rental yield',
                            required_investment: strategy.required_investment || 0,
                            expected_return: strategy.expected_return || 0,
                            risk_factors: strategy.risk_factors || ['Market volatility', 'Tenant turnover'],
                            npv: strategy.npv || 0,
                            irr: strategy.irr || 0,
                            payback_period: strategy.payback_period || 'N/A',
                            cash_flow: strategy.cash_flow || 0
                          };

                          return (
                            <motion.div
                              key={strategy.strategy || index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="text-lg font-medium text-white">{strategyData.strategy || `Strategy ${index + 1}`}</h4>
                                  <p className="text-slate-400">{strategyData.description || 'No description available'}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      handleStrategyDecision(unit.id, strategyData.strategy, 'accept');
                                      setShowCompare(null);
                                    }}
                                    className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                  >
                                    Accept
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      handleStrategyDecision(unit.id, strategyData.strategy, 'reject');
                                      setShowCompare(null);
                                    }}
                                    className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                  >
                                    Reject
                                  </motion.button>
                                </div>
                              </div>

                              {/* Key Metrics */}
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-slate-400">ROI</p>
                                  <p className="text-white font-medium">{strategyData.roi}%</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Cost</p>
                                  <p className="text-white font-medium">AED {strategyData.cost.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Risk Level</p>
                                  <p className="text-white font-medium">{strategyData.risk_level}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Timeframe</p>
                                  <p className="text-white font-medium">{strategyData.timeframe}</p>
                                </div>
                              </div>

                              {/* Detailed Analysis */}
                              <div className="space-y-3">
                                <div>
                                  <p className="text-slate-400">Market Impact</p>
                                  <p className="text-white">{strategyData.market_impact}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Required Investment</p>
                                  <p className="text-white">AED {strategyData.required_investment.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Expected Return</p>
                                  <p className="text-white">AED {strategyData.expected_return.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Risk Factors</p>
                                  <ul className="list-disc list-inside text-white">
                                    {strategyData.risk_factors.map((factor, i) => (
                                      <li key={i}>{factor}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* Performance Metrics */}
                              <div className="mt-4 pt-4 border-t border-slate-600/50">
                                <h5 className="text-sm font-medium text-slate-400 mb-2">Performance Metrics</h5>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-slate-400">Net Present Value</p>
                                    <p className="text-white">AED {strategyData.npv.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">Internal Rate of Return</p>
                                    <p className="text-white">{strategyData.irr}%</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">Payback Period</p>
                                    <p className="text-white">{strategyData.payback_period}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">Cash Flow</p>
                                    <p className="text-white">AED {strategyData.cash_flow.toLocaleString()}/yr</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-700/50 rounded-lg p-6 text-center">
                      <p className="text-slate-400">No strategies available for this property.</p>
                    </div>
                  )}

                  {/* Market Analysis */}
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                    <h4 className="text-lg font-medium text-white mb-4">Market Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400">Market Trends</p>
                        <ul className="list-disc list-inside text-white">
                          {marketTrends.map((trend, i) => (
                            <li key={i}>{trend}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-slate-400">Competitive Analysis</p>
                        <ul className="list-disc list-inside text-white">
                          {competitiveAnalysis.map((analysis, i) => (
                            <li key={i}>{analysis}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorTab;
