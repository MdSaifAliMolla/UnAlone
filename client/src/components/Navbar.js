// src/components/Navbar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { MapPin, Coffee, User, Sun, Moon, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-300 fixed top-0 z-50 shadow-sm">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          <MapPin className="w-6 h-6 text-primary" />
          Unalone
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2">
          <li>
            <Link 
              to="/" 
              className={`btn btn-ghost gap-2 ${isActive('/') ? 'btn-active' : ''}`}
            >
              <MapPin className="w-4 h-4" />
              Map
            </Link>
          </li>
          <li>
            <Link 
              to="/cafe" 
              className={`btn btn-ghost gap-2 ${isActive('/cafe') ? 'btn-active' : ''}`}
            >
              <Coffee className="w-4 h-4" />
              Global Cafe
            </Link>
          </li>
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="btn btn-ghost btn-circle"
          title="Toggle theme"
        >
          {theme === 'paper' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full border-2 border-base-300">
              <img 
                src={user?.avatarUrl} 
                alt={user?.username}
                className="rounded-full"
              />
            </div>
          </div>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
            <li className="menu-title">
              <span className="text-base-content/70">
                {user?.username}
              </span>
            </li>
            <li>
              <Link to="/profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="gap-2 text-error">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Mobile Menu */}
        <div className="dropdown dropdown-end lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300">
            <li>
              <Link to="/" className="gap-2">
                <MapPin className="w-4 h-4" />
                Map
              </Link>
            </li>
            <li>
              <Link to="/cafe" className="gap-2">
                <Coffee className="w-4 h-4" />
                Global Cafe
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;