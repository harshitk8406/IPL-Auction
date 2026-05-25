import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeamSelection() {
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/teams/')
      .then(res => res.json())
      .then(data => setTeams(data));
  }, []);

  const selectTeam = async (teamId) => {
    const token = localStorage.getItem('access');
    try {
      await fetch(`http://localhost:8000/api/teams/${teamId}/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ humanControlled: true })
      });
      navigate('/dashboard');
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Select Your Franchise</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {teams.map(t => (
          <div key={t.id} className="glass p-6 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform" onClick={() => selectTeam(t.id)}>
            <div className="text-2xl font-bold text-white mb-2">{t.name}</div>
            <div className="text-sm text-gray-400">Purse: ₹{t.purse} L</div>
            {t.humanControlled && <div className="text-xs text-red-400 mt-2">Taken</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
