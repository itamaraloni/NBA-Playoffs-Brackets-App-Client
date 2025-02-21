import React, { useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      console.log("Making request to api/data...");
      const response = await fetch('http://127.0.0.1:5000/api/data');
      const result = await response.json();
      setData(result.message);
      console.log("Finished Request");
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchTeam = async (teamName) => {
    try {
      console.log(`Making request to api/teams/${teamName}...`);
      const response = await fetch(`http://127.0.0.1:5000/api/teams/${teamName}`);
      const result = await response.json();
      // setData(result.message);
      console.log(`Finished Request: ${result.message}`);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React and Flask</h1>
        <button onClick={() => fetchData()}>Fetch Data</button>
        <button onClick={() => fetchTeam('Celtics')}>Fetch Team</button>
        {data && <p>{data}</p>}
      </header>
    </div>
  );
}

export default App;
