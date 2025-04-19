import { useEffect } from 'react';
import axios from 'axios';

function App() {
  useEffect(() => {
    // Test call to backend when page loads
    axios.get('http://localhost:8000/')
      .then(res => console.log('✅ Backend response:', res.data))
      .catch(err => console.error('❌ Error connecting to backend:', err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600">
        Tailwind is working ✅
      </h1>
    </div>
  );
}

export default App;
