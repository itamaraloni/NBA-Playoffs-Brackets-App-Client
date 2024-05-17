import React, { useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/data');
      const result = await response.json();
      setData(result.message);
      console.log("noderski");
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React and Flask</h1>
        <button onClick={fetchData}>Fetch Data</button>
        {data && <p>{data}</p>}
      </header>
    </div>
  );
}

export default App;
