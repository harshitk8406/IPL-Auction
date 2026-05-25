import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function MatchScreen() {
  const [socket, setSocket] = useState(null);
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);

    newSocket.on('ball_result', (data) => {
      setLogs(prev => [`You played ${data.userChoice}, Bowler played ${data.botChoice} -> ${data.outcome}`, ...prev]);
      if (data.outcome === 'wicket') {
        setWickets(w => w + 1);
      } else {
        setScore(s => s + data.runs);
      }
    });

    return () => newSocket.close();
  }, []);

  const playBall = (num) => {
    if(wickets >= 10) return;
    socket?.emit('play_ball', { choice: num, matchId: 1 });
  };

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-4xl font-extrabold text-blue-400 mb-8">Match Simulator (Hand Cricket)</h2>
      
      <div className="flex gap-8 w-full justify-center">
        <div className="glass p-8 rounded-2xl flex-1 text-center">
          <div className="text-6xl font-bold tabular-nums">{score}/{wickets}</div>
          <div className="text-xl text-gray-400 mt-2">Team Score</div>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-4">
        <h3 className="text-2xl font-semibold">Play your shot:</h3>
        <div className="flex gap-4 justify-center">
          {[1,2,3,4,6].map(num => (
            <button key={num} onClick={() => playBall(num)} disabled={wickets >= 10} className="w-16 h-16 rounded-full glass hover:bg-white/20 font-bold text-2xl flex items-center justify-center transition-colors disabled:opacity-50">
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 w-full glass p-4 rounded-xl h-48 overflow-y-auto text-left font-mono text-sm flex flex-col gap-2">
        {logs.map((log, i) => (
          <div key={i} className={`p-2 rounded ${log.includes('wicket') ? 'bg-red-500/20 text-red-200 border-l-4 border-red-500' : 'bg-green-500/10 text-green-200 border-l-4 border-green-500'}`}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
