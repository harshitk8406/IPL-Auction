import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login/' : '/api/auth/register/';
    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('access', data.access);
        navigate('/teams');
      } else {
        alert(data.detail || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md glass p-8 rounded-2xl animate-pulse-slow">
      <h2 className="text-3xl font-extrabold mb-6 text-csk">{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Username" 
          className="p-3 rounded-lg bg-dark/50 border border-gray-700 text-white outline-none focus:ring-2 focus:ring-primary"
          value={username} onChange={e => setUsername(e.target.value)} required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="p-3 rounded-lg bg-dark/50 border border-gray-700 text-white outline-none focus:ring-2 focus:ring-primary"
          value={password} onChange={e => setPassword(e.target.value)} required 
        />
        <button type="submit" className="bg-gradient-to-r from-primary to-secondary p-3 rounded-lg font-bold hover:opacity-90 transition-opacity">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-4 text-gray-400 cursor-pointer hover:text-white" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
      </p>
    </div>
  );
}
