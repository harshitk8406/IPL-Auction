import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Trophy, Wifi, WifiOff, LogOut, User, Zap } from 'lucide-react';
import { useSocket } from '../context/SocketContext.jsx';

export default function Navbar({ gameCode, round }) {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 px-4 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Trophy
              size={28}
              className="text-ipl-gold animate-pulse-gold group-hover:scale-110 transition-transform"
            />
          </div>
          <span className="font-rajdhani font-700 text-xl tracking-wider gold-text">
            IPL AUCTION
          </span>
        </Link>

        {/* Center info */}
        <div className="flex items-center gap-4">
          {gameCode && (
            <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2">
              <Zap size={14} className="text-ipl-gold" />
              <span className="font-rajdhani font-semibold text-sm text-white/70">
                CODE:{' '}
              </span>
              <span className="font-rajdhani font-bold text-ipl-gold tracking-widest">
                {gameCode}
              </span>
            </div>
          )}
          {round !== undefined && round !== null && (
            <div className="glass px-4 py-1.5 rounded-full">
              <span className="font-rajdhani font-semibold text-sm text-white/70">
                ROUND{' '}
              </span>
              <span className="font-rajdhani font-bold text-ipl-gold-light">
                {round}
              </span>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            {connected ? (
              <>
                <Wifi size={14} className="text-green-400" />
                <span className="text-xs text-green-400 hidden sm:block">Live</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-red-400" />
                <span className="text-xs text-red-400 hidden sm:block">Offline</span>
              </>
            )}
          </div>

          {/* User */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2">
                <User size={14} className="text-ipl-gold" />
                <span className="font-inter text-sm text-white/90 hidden sm:block">
                  {user.username || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="glass px-4 py-1.5 rounded-full font-rajdhani font-semibold text-sm text-ipl-gold hover:bg-ipl-gold/10 transition-all duration-300"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
