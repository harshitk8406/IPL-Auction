import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Trophy, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = () => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthColors = ['#ef4444', '#f59e0b', '#f59e0b', '#22c55e', '#22c55e'];
  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-bg dot-grid flex items-center justify-center px-4 py-12">
      {/* Orbs */}
      <div
        className="hero-orb w-[400px] h-[400px] -top-20 -right-20 opacity-15"
        style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)' }}
      />
      <div
        className="hero-orb w-[300px] h-[300px] bottom-0 -left-10 opacity-10"
        style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-gold mb-4 animate-float">
            <Trophy size={32} className="text-ipl-gold" />
          </div>
          <h1 className="font-rajdhani font-bold text-4xl gold-text">IPL AUCTION</h1>
          <p className="text-white/40 font-inter text-sm mt-1">Create your free account</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8">
          <h2 className="font-rajdhani font-bold text-2xl text-white mb-6">
            Join the auction
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-white/50 text-xs font-inter mb-1.5 ml-1">
                Username
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="CricketFan2025"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-ipl-gold/50 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-white/50 text-xs font-inter mb-1.5 ml-1">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-ipl-gold/50 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/50 text-xs font-inter mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-ipl-gold/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{
                          background: i <= strength ? strengthColors[strength - 1] : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-[10px] font-inter"
                    style={{ color: strength > 0 ? strengthColors[strength - 1] : '#9ca3af' }}
                  >
                    {strength > 0 ? strengthLabels[strength - 1] : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white/50 text-xs font-inter mb-1.5 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-ipl-gold/50 transition-colors"
                />
                {confirmPassword && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {confirmPassword === password ? (
                      <CheckCircle size={16} className="text-green-400" />
                    ) : (
                      <AlertCircle size={16} className="text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 animate-slide-up">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm font-inter">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-ipl-gold text-black font-rajdhani font-bold text-lg rounded-xl hover:bg-ipl-gold-light transition-all duration-300 hover:scale-[1.02] glow-gold flex items-center justify-center gap-2 disabled:opacity-60 disabled:scale-100 mt-2"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-white/40 font-inter text-sm mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-ipl-gold font-semibold hover:text-ipl-gold-light transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-white/30 font-inter text-sm hover:text-white/60 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
