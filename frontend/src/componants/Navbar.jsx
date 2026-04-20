import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBell, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaBars, FaTimes, FaChevronDown, FaCheck } from 'react-icons/fa';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDistanceToNow } from 'date-fns';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    logout();
    navigate('/auth');
  };

  const getDashboardPath = () => {
    if (!user) return '/auth';
    if (user.role === 'ngo') return '/ngo-dashboard';
    if (user.role === 'admin') return '/admin-dashboard';
    return '/donor-dashboard';
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home' },
    ...(user?.role === 'donor' ? [
      { to: '/create-listing', label: 'Donate Items' },
      { to: '/donor-history', label: 'My History' },
      { to: '/donate', label: 'Give Cash' },
      { to: '/map', label: 'NGO Locator' },
    ] : []),
    ...(user?.role === 'ngo' ? [
      { to: '/ngo-items', label: 'Community Feed' },
      { to: '/ngo-profile', label: 'Impact & Needs' },
    ] : []),
  ];

  const roleBadgeColor = {
    donor: 'bg-blue-100 text-blue-700',
    ngo: 'bg-emerald-100 text-emerald-700',
    admin: 'bg-red-100 text-red-700',
  };

  return (
    <>
      <header className="bg-white/90 backdrop-blur-md h-16 shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto h-full flex items-center px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo className="h-9 hover:scale-105 transition-transform duration-200" />
          </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center ml-8 gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(to)
                  ? 'text-[#004B8D] bg-blue-50'
                  : 'text-gray-600 hover:text-[#004B8D] hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className={`hidden lg:flex text-gray-500 hover:text-[#004B8D] transition-all hover:scale-110 relative p-2 rounded-lg hover:bg-gray-50 ${notifOpen ? 'bg-blue-50 text-[#004B8D]' : ''}`}
                  aria-label="Notifications"
                >
                  <FaBell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-white" />
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] border border-gray-100 z-50 animate-dropdown overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                      <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-[#004B8D] hover:underline uppercase tracking-wider"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FaBell className="text-gray-300" size={20} />
                          </div>
                          <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleMarkAsRead(n._id)}
                            className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 relative group ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                              <div className="flex-1">
                                <p className={`text-sm leading-tight mb-0.5 ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                  {n.title}
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-2">{n.body}</p>
                                <p className="text-[10px] text-gray-400 mt-1.5">
                                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/30 text-center">
                        <button className="text-xs font-semibold text-gray-500 hover:text-[#004B8D] transition-colors">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative hidden lg:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl border border-gray-200 hover:border-[#004B8D]/30 hover:bg-blue-50 transition-all duration-200 group"
                  aria-label="User menu"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#004B8D] to-[#10B981] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-800 leading-none">{user.name?.split(' ')[0]}</p>
                    <p className="text-[10px] text-gray-400 leading-none mt-0.5 capitalize">{user.role}</p>
                  </div>
                  <FaChevronDown
                    size={10}
                    className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Panel */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] py-2 border border-gray-100 z-50 animate-dropdown">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#004B8D] to-[#10B981] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <span className={`inline-block mt-2.5 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${roleBadgeColor[user.role] || 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </div>

                    {/* Dashboard Link */}
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#004B8D] transition-colors"
                    >
                      <FaTachometerAlt size={13} className="text-gray-400" />
                      My Dashboard
                    </Link>

                    {/* Logout */}
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-b-2xl"
                      >
                        <FaSignOutAlt size={13} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/auth"
              className="hidden lg:inline-flex items-center gap-2 bg-[#004B8D] hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
            >
              Sign In
            </Link>
          )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* User info in mobile */}
        {user && (
          <div className="flex items-center gap-3 p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-emerald-50">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#004B8D] to-[#10B981] flex items-center justify-center text-white font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full capitalize ${roleBadgeColor[user.role] || 'bg-gray-100'}`}>
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Mobile Nav Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'bg-blue-50 text-[#004B8D] font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-[#004B8D]'
              }`}
            >
              {label}
            </Link>
          ))}

          {user && (
            <Link
              to={getDashboardPath()}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#004B8D] transition-colors"
            >
              <FaTachometerAlt size={13} />
              My Dashboard
            </Link>
          )}
        </nav>

        {/* Mobile Auth buttons */}
        <div className="p-4 border-t border-gray-100">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
            >
              <FaSignOutAlt size={14} />
              Sign Out
            </button>
          ) : (
            <Link
              to="/auth"
              className="block w-full text-center py-3 rounded-xl bg-[#004B8D] text-white font-semibold text-sm hover:bg-blue-800 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;