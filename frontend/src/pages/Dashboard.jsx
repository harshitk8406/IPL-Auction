import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-6xl flex flex-col gap-8 text-left">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Manager Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl flex flex-col gap-4 items-start">
          <h3 className="text-2xl font-bold">Mock Auction</h3>
          <p className="text-gray-300">Build your squad in a live real-time auction with AI bots and human players.</p>
          <button onClick={() => navigate('/auction')} className="bg-primary px-6 py-2 rounded-lg font-semibold hover:bg-primary/80 mt-auto">Enter Auction Room</button>
        </div>

        <div className="glass p-6 rounded-2xl flex flex-col gap-4 items-start">
          <h3 className="text-2xl font-bold">Play Match (Hand Cricket)</h3>
          <p className="text-gray-300">Take control of the pitch with our hand-cricket simulator for the league fixtures.</p>
          <button onClick={() => navigate('/match')} className="bg-secondary px-6 py-2 rounded-lg font-semibold hover:bg-secondary/80 mt-auto">Play Next Match</button>
        </div>
      </div>
    </div>
  );
}
