import { motion } from 'framer-motion';
import { useState } from 'react';
import DailyDigestPopup from './DailyDigestPopup';

const DailyDigest = ({ digest, totalItems, currentIndex }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleClick = () => {
    setIsPopupOpen(true);
  };

  const handleClose = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="relative cursor-pointer group"
        onClick={handleClick}
      >
        <div className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white text-lg">
                {digest.isPositive ? (
                  <span className="text-green-400">↑</span>
                ) : (
                  <span className="text-red-400">↓</span>
                )}{' '}
                {digest.message}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {new Date(digest.timestamp).toLocaleDateString()}
              </p>
            </div>
            <div className="text-gray-400 text-sm">
              {currentIndex + 1} / {totalItems}
            </div>
          </div>
        </div>
      </motion.div>

      {isPopupOpen && (
        <DailyDigestPopup
          digest={digest}
          onClose={handleClose}
          currentIndex={currentIndex}
          totalItems={totalItems}
        />
      )}
    </>
  );
};

export default DailyDigest; 