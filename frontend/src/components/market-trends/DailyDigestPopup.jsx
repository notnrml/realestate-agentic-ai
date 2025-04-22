import { FaNewspaper, FaTimes } from 'react-icons/fa';

const DailyDigestPopup = ({ isOpen, onClose, updates }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <FaNewspaper className="text-accent-400 mr-2" />
            <h3 className="text-xl font-semibold text-white">Daily Market Digest</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {updates.map((update, index) => (
            <div 
              key={index} 
              className="border-l-2 border-accent-400 pl-4 py-2 hover:bg-gray-800 transition-colors rounded-r"
            >
              <p className="text-white text-lg">{update.content}</p>
              <span className="text-gray-400 text-sm">{update.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyDigestPopup; 