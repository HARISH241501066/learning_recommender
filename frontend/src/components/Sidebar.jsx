import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCircle, MessageSquare, LogOut, Briefcase, Sun, Moon } from 'lucide-react';

const Sidebar = ({ onLogout, theme, toggleTheme }) => {
  return (
    <aside className="sidebar glass-panel" style={{ height: '100vh', borderRadius: '0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 className="gradient-text">LearnAI</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Personalized Paths</p>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <UserCircle size={20} />
          Profile Wizard
        </NavLink>
        <NavLink 
          to="/careers" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <Briefcase size={20} />
          Careers
        </NavLink>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink 
          to="/chat" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <MessageSquare size={20} />
          AI Assistant
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={toggleTheme}
          className="nav-item" 
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)' }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button 
          onClick={onLogout}
          className="nav-item" 
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#ef4444' }}
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
