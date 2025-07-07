import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Navbar.css';
import { FiBell } from 'react-icons/fi';

const Navbar = ({ user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
    // Optionally poll every 30s
    // const interval = setInterval(fetchNotifications, 30000);
    // return () => clearInterval(interval);
  }, [user]);

  // Close notification panel or user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (isNotifOpen && notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await import('../utils/api').then(m => m.default.get('/users/me/notifications'));
      setNotifications(res.data.notifications || []);
      setUnreadCount((res.data.notifications || []).filter(n => !n.read).length);
    } catch (e) { setNotifications([]); setUnreadCount(0); }
  };

  const handleNotifClick = () => {
    setIsNotifOpen(v => !v);
    if (unreadCount > 0) markAllRead();
  };

  const markAllRead = async () => {
    try {
      await import('../utils/api').then(m => m.default.post('/users/me/notifications/read'));
      fetchNotifications();
    } catch (e) {}
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Homepage Navbar (when user is not logged in)
  const HomepageNavbar = () => (
    <nav className="navbar custom-navbar">
      <div className="navbar-content">
        {/* Logo */}
        <div className="navbar-logo-text">
          <Link to="/" className="navbar-logo-link">
            <span className="navbar-logo-bold">Confidex</span>
          </Link>
        </div>
        
        {/* Center Nav Links */}
        <ul className="navbar-links">
          <li><a href="#about">About us</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#blogs">Blogs</a></li>
        </ul>
        
        {/* Right Auth Buttons */}
        <div className="navbar-auth">
          <Link to="/login" className="navbar-btn login">Log In</Link>
          <Link to="/login" className="navbar-btn signup">Sign In</Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="navbar-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <ul className="navbar-mobile-links">
            <li><a href="#about">About us</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#blogs">Blogs</a></li>
            <li><Link to="/login" className="navbar-btn login">Log In</Link></li>
            <li><Link to="/login" className="navbar-btn signup">Sign In</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );

  // Dashboard Navbar (when user is logged in)
  const DashboardNavbar = () => (
    <nav className="navbar dashboard-navbar">
      <div className="navbar-content">
        {/* Logo */}
        <div className="navbar-logo-text">
          <Link to="/" className="navbar-logo-link">
            <span className="navbar-logo-bold">Confidex</span>
          </Link>
        </div>
        {/* Right User Menu (hidden on mobile) */}
        <div className="navbar-user-menu desktop-only">
          <button
            className="navbar-btn pricing"
            onClick={() => navigate('/pricing')}
          >
            Pricing
          </button>
          <button
            className="navbar-btn dashboard"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          {/* Notification Bell */}
          <div ref={notifRef} className="notif-bell" style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={handleNotifClick}>
            <div className="notif-bell-circle" style={{ boxShadow: unreadCount > 0 ? '0 0 0 2px #e11d48' : 'none' }}>
              <FiBell size={22} color="#fff" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  minWidth: 16,
                  height: 16,
                  background: '#e11d48',
                  color: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  border: '2px solid #fff',
                  zIndex: 2,
                  padding: '0 4px'
                }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </div>
            {isNotifOpen && (
              <div className="notif-dropdown" style={{
                position: 'absolute',
                right: 0,
                top: 36,
                minWidth: 320,
                background: '#fff',
                border: '1.5px solid #e5e7eb',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                zIndex: 100,
                padding: '1rem 0'
              }}>
                <div style={{ fontWeight: 700, fontSize: 16, padding: '0 1.2rem 0.7rem 1.2rem', borderBottom: '1px solid #eee' }}>
                  Notifications
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1.2rem', color: '#888', textAlign: 'center' }}>No notifications</div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div key={notif.id || idx} style={{
                      padding: '0.9rem 1.2rem',
                      borderBottom: idx === notifications.length - 1 ? 'none' : '1px solid #f3f4f6',
                      background: notif.read ? '#fff' : '#f0f9ff',
                      color: notif.read ? '#222' : '#0ea5e9',
                      fontWeight: notif.read ? 400 : 600,
                      fontSize: 15
                    }}>
                      {notif.text}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="user-info" onClick={() => setIsDropdownOpen(v => !v)} style={{ cursor: 'pointer', position: 'relative' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="user-avatar" />
            ) : (
              <div className="user-avatar">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
            <span className="user-name">{user?.displayName || user?.email}</span>
            <span className="user-arrow" style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8L10 12L14 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {isDropdownOpen && (
              <div className="modern-dropdown" style={{ right: 0, left: 'auto', minWidth: 260, top: 44, padding: 0 }}>
                {/* User Info */}
                <div style={{ padding: '1.1rem 1.2rem', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.displayName}</div>
                    <div style={{ color: '#888', fontSize: 13 }}>{user?.email}</div>
                  </div>
                </div>
                {/* ACCOUNT Section */}
                <div style={{ fontSize: 12, color: '#888', fontWeight: 700, padding: '0.7rem 1.2rem 0.2rem 1.2rem', letterSpacing: 1 }}>ACCOUNT</div>
                <button type="button" className="modern-dropdown-item" style={{ textAlign: 'left' }} onClick={() => { setIsDropdownOpen(false); navigate('/settings'); }}>
                  Your settings
                </button>
                <div style={{ height: 1, background: '#f3f4f6', margin: '0.5rem 0' }} />
                {/* RESOURCES Section */}
                <div style={{ fontSize: 12, color: '#888', fontWeight: 700, padding: '0.7rem 1.2rem 0.2rem 1.2rem', letterSpacing: 1 }}>RESOURCES</div>
                <button type="button" className="modern-dropdown-item" style={{ textAlign: 'left' }} onClick={() => { setIsDropdownOpen(false); navigate('/coming-soon'); }}>
                  Support
                </button>
                <button type="button" className="modern-dropdown-item" style={{ textAlign: 'left' }} onClick={() => { setIsDropdownOpen(false); navigate('/coming-soon'); }}>
                  Help center
                </button>
                <button type="button" className="modern-dropdown-item" style={{ textAlign: 'left' }} onClick={() => { setIsDropdownOpen(false); navigate('/coming-soon'); }}>
                  Community
                </button>
                <button type="button" className="modern-dropdown-item" style={{ textAlign: 'left' }} onClick={() => { setIsDropdownOpen(false); navigate('/coming-soon'); }}>
                  What's New
                </button>
                <div style={{ height: 1, background: '#f3f4f6', margin: '0.5rem 0' }} />
                {/* OTHER Section */}
                <div style={{ fontSize: 12, color: '#888', fontWeight: 700, padding: '0.7rem 1.2rem 0.2rem 1.2rem', letterSpacing: 1 }}>OTHER</div>
                <button type="button" className="modern-dropdown-item" style={{ textAlign: 'left', position: 'relative' }} onClick={() => { setIsDropdownOpen(false); navigate('/coming-soon'); }}>
                  Refer friends, get rewards
                  <span style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, background: '#e11d48', borderRadius: '50%', display: 'inline-block' }}></span>
                </button>
                <button type="button" className="modern-dropdown-item" style={{ textAlign: 'left' }} onClick={() => { setIsDropdownOpen(false); navigate('/'); }}>
                  Homepage
                </button>
                <button type="button" className="modern-dropdown-item logout" style={{ color: '#e11d48', textAlign: 'left' }} onClick={handleLogout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Mobile Menu Toggle */}
        <button 
          className="navbar-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      {/* Mobile Menu (dashboard) */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <ul className="navbar-mobile-links">
            <li><Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link></li>
            <li><Link to="/create-form" onClick={() => setIsMobileMenuOpen(false)}>Create Form</Link></li>
            <li><span className="pricing-text">Pricing</span></li>
            <li>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiBell size={22} color="#18181b" />
                <span style={{ fontWeight: 600 }}>Notifications</span>
                {unreadCount > 0 && <span style={{ color: '#e11d48', fontWeight: 700, marginLeft: 4 }}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </div>
            </li>
            <li>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="user-avatar" />
                ) : (
                  <div className="user-avatar">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                )}
                <span style={{ fontWeight: 600 }}>{user?.displayName || user?.email}</span>
                <button onClick={handleLogout} className="mobile-logout" style={{ marginLeft: 10 }}>Sign Out</button>
              </div>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );

  // Return appropriate navbar based on authentication state
  return user ? <DashboardNavbar /> : <HomepageNavbar />;
};

export default Navbar; 