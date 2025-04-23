import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import userPreferencesStore from '../../../store/userPreferences';
<<<<<<< HEAD
import InvestmentDetailsModal from './InvestmentDetailsModal';
=======
>>>>>>> origin/main

const InvestmentCard = ({ investment, delay = 0 }) => {
  const [showMessage, setShowMessage] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpeningListing, setIsOpeningListing] = useState(false);
<<<<<<< HEAD
  const [showDetails, setShowDetails] = useState(false);
=======
>>>>>>> origin/main

  const handleInvest = async () => {
    // Start opening the listing immediately
    setIsOpeningListing(true);
    window.open(investment.listing_url, '_blank');

    // Show the message in parallel
    setShowMessage(true);
    setIsGenerating(true);

    // Store the investment interest
    userPreferencesStore.addInvestmentInterest(investment);

    try {
      const response = await fetch('/api/advisor/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_type: investment.property_type,
          location: investment.location,
          price: investment.price,
          roi: investment.roi,
          risk_level: investment.risk_level
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedMessage(data.message);
      } else {
        // Fallback message if API fails
        setGeneratedMessage(`I'm interested in the ${investment.property_type} at ${investment.location}. The ROI of ${investment.roi}% and ${investment.risk_level} risk level look promising. Let's discuss the details.`);
      }
    } catch (error) {
      console.error('Error generating message:', error);
      // Fallback message if API fails
      setGeneratedMessage(`I'm interested in the ${investment.property_type} at ${investment.location}. The ROI of ${investment.roi}% and ${investment.risk_level} risk level look promising. Let's discuss the details.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
<<<<<<< HEAD
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5,
          delay: delay,
          type: "spring",
          stiffness: 200,
          damping: 15,
          mass: 0.5
        }}
        className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 cursor-pointer"
        onClick={() => setShowDetails(true)}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.3 }
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">{investment.property_type}</h3>
            <p className="text-slate-400">{investment.location}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            investment.risk_level === 'Low' 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : investment.risk_level === 'Medium'
              ? 'bg-amber-500/10 text-amber-400'
              : 'bg-red-500/10 text-red-400'
          }`}>
            {investment.risk_level} Risk
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-slate-400">Price</p>
            <p className="text-lg font-medium text-white">AED {investment.price.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">ROI</p>
            <p className="text-lg font-medium text-white">{investment.roi}%</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            handleInvest();
          }}
          disabled={isOpeningListing}
          className={`w-full py-2 rounded-lg text-sm font-medium ${
            isOpeningListing 
              ? 'bg-primary-500/20 text-primary-400/50 cursor-not-allowed'
              : 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20'
          } transition-colors`}
        >
          {isOpeningListing ? 'Opening...' : 'Invest Now'}
        </motion.button>

        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1]
                }
              }}
              exit={{ 
                opacity: 0, 
                y: -10,
                scale: 0.95,
                transition: {
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }
              }}
              className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse delay-100" />
                  <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse delay-200" />
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-white">{generatedMessage}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(generatedMessage);
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Copy to clipboard
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showDetails && (
          <InvestmentDetailsModal
            investment={investment}
            onClose={() => setShowDetails(false)}
          />
=======
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay,
        type: "spring",
        stiffness: 200,
        damping: 15,
        mass: 0.5
      }}
      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">{investment.property_type}</h3>
          <p className="text-slate-400">{investment.location}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          investment.risk_level === 'Low'
            ? 'bg-emerald-500/10 text-emerald-400'
            : investment.risk_level === 'Medium'
            ? 'bg-amber-500/10 text-amber-400'
            : 'bg-red-500/10 text-red-400'
        }`}>
          {investment.risk_level} Risk
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-slate-400">Price</p>
          <p className="text-lg font-medium text-white">AED {investment.price.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">ROI</p>
          <p className="text-lg font-medium text-white">{investment.roi}%</p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleInvest}
        disabled={isOpeningListing}
        className={`w-full py-2 rounded-lg text-sm font-medium ${
          isOpeningListing
            ? 'bg-primary-500/20 text-primary-400/50 cursor-not-allowed'
            : 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20'
        } transition-colors`}
      >
        {isOpeningListing ? 'Opening...' : 'Invest Now'}
      </motion.button>

      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.95,
              transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse delay-100" />
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse delay-200" />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-white">{generatedMessage}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedMessage)}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Copy to clipboard
                </button>
              </div>
            )}
          </motion.div>
>>>>>>> origin/main
        )}
      </AnimatePresence>
    </>
  );
};

export default InvestmentCard;