import React, { useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  const fetchTeam = async (teamName) => {
    try {
      console.log(`Making request to api/teams/${teamName}...`);
      const response = await fetch(`http://127.0.0.1:5000/api/users/${teamName}`);
      const data = await response.json();
      if (response.ok) {
        setData(data.email);
        console.log(`received email from server: ${data.email}`); // Access the email here
      } else {
        console.error('Error fetching email');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const generalUse = async () => {
    try {
      console.log(`Making request to api/general_use...`);
      const response = await fetch(`http://127.0.0.1:5000/api/general_use`);
      const data = await response.json();
      if (response.ok) {
        // setData(data.email);
        console.log(`received email from server: ${data.name}`); // Access the email here
      } else {
        console.error('Error fetching email');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React and Flask</h1>
        <button onClick={() => fetchTeam('u1')}>Fetch Team</button>
        <button onClick={() => generalUse()}>General Use</button>
        {data && <p>{data}</p>}
      </header>
    </div>
  );
}

export default App;
