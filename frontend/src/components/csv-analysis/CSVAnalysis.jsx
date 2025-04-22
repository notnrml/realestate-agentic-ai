import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUpload, FaSpinner, FaChartBar, FaExclamationTriangle, FaFileAlt, FaTable, FaChartLine } from 'react-icons/fa';

const CSVAnalysis = () => {
  const [file, setFile] = useState(null);
  const [analysisType, setAnalysisType] = useState('general');
  const [analysisTypes, setAnalysisTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Fetch available analysis types
    const fetchAnalysisTypes = async () => {
      try {
        const response = await axios.get('http://localhost:8000/csv-analysis/analysis-types');
        setAnalysisTypes(response.data.analysis_types);
      } catch (err) {
        setError('Failed to fetch analysis types');
        console.error(err);
      }
    };

    fetchAnalysisTypes();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleAnalysisTypeChange = (e) => {
    setAnalysisType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setShowResults(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('analysis_type', analysisType);

    try {
      const response = await axios.post('http://localhost:8000/csv-analysis/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select CSV File
            </label>
            <div className="flex items-center space-x-2">
              <label className="flex items-center px-3 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600 transition-colors text-sm">
                <FaUpload className="mr-2" />
                <span>Choose File</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <span className="text-gray-300 text-sm truncate max-w-[200px]">{file.name}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Analysis Type
            </label>
            <select
              value={analysisType}
              onChange={handleAnalysisTypeChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm"
            >
              {analysisTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center ${
            loading || !file
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-accent-500 hover:bg-accent-600'
          } text-white font-medium transition-colors text-sm`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <FaChartBar className="mr-2" />
              Analyze CSV
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-900 text-red-200 rounded-lg flex items-center text-sm">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div 
            className="flex items-center justify-between cursor-pointer p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            onClick={toggleResults}
          >
            <div className="flex items-center">
              <FaFileAlt className="text-accent-400 mr-2" />
              <span className="text-white font-medium">Analysis Results</span>
            </div>
            <div className="flex items-center text-xs text-gray-400">
              <span className="mr-2">{result.data_summary.file_name}</span>
              <span>{result.data_summary.rows} rows</span>
            </div>
          </div>
          
          {showResults && (
            <div className="bg-gray-700 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <div className="text-gray-400">File</div>
                  <div className="text-white truncate">{result.data_summary.file_name}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <div className="text-gray-400">Rows</div>
                  <div className="text-white">{result.data_summary.rows}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <div className="text-gray-400">Columns</div>
                  <div className="text-white">{result.data_summary.columns.length}</div>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(result.analysis).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-600 pb-3 last:border-0">
                    <h5 className="text-sm font-medium text-white mb-1 capitalize flex items-center">
                      <FaChartLine className="mr-1 text-accent-400" />
                      {key.replace(/_/g, ' ')}
                    </h5>
                    <div className="text-gray-300 text-sm">
                      {typeof value === 'object' ? (
                        <pre className="whitespace-pre-wrap text-xs">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        value
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CSVAnalysis; 