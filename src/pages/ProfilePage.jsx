import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
    const { currentUser } = useAuth();
  
    // Using dummy data directly
    const playerData = {
      hasJoinedLeague: true,
      playerName: "NBA Fan",
      leagueName: "Friends League",
      predictions: {
        champion: "Boston Celtics",
        mvp: "Jayson Tatum"
      }
    };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      {/* Personal Information Section */}
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Personal Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="font-medium">{currentUser?.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Display Name</p>
            <p className="font-medium">{currentUser?.displayName || "Not set"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Account Created</p>
            <p className="font-medium">
              {currentUser?.metadata?.creationTime 
                ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Player Information Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">NBA Predictions Profile</h2>
        
        {!playerData || !playerData.hasJoinedLeague ? (
          <div className="py-4 text-center">
            <div className="text-yellow-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600">You haven't joined any leagues yet.</p>
            <a href="/league" className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
              Join a League
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm">Player Name</p>
              <p className="font-medium">{playerData.playerName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">League</p>
              <p className="font-medium">{playerData.leagueName}</p>
            </div>
            
            {/* Predictions Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-2 mt-4 text-gray-700">My Predictions</h3>
              
              {!playerData.predictions ? (
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-blue-700">You haven't made any predictions yet.</p>
                  <a href="/predictions" className="text-blue-600 underline">Make predictions now</a>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-gray-500 text-sm">NBA Champion Pick</p>
                    <p className="font-bold text-xl">{playerData.predictions.champion}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <p className="text-gray-500 text-sm">MVP Pick</p>
                    <p className="font-bold text-xl">{playerData.predictions.mvp}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;