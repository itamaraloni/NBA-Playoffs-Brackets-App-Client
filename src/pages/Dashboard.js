import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="text-3xl font-bold mb-6">Welcome to NBA Playoff Predictions</h1>
      
      <div className="dashboard-sections grid md:grid-cols-2 gap-6">
        <div className="section bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Current Leagues</h2>
          <p className="text-gray-600">You are not a member of any leagues yet.</p>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Join a League
          </button>
        </div>

        <div className="section bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Predictions</h2>
          <p className="text-gray-600">You have not made any predictions yet.</p>
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Make Predictions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;