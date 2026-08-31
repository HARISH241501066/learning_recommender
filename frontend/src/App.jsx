import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ProfileWizard from './components/ProfileWizard';
import Login from './components/Login';
import Register from './components/Register';
import BackgroundDecorations from './components/BackgroundDecorations';
import Careers from './components/Careers';
import './index.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userProfile, setUserProfile] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Fetch user data if token exists
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.has_path) {
            setRecommendation(data.learning_path_data);
          }
        } else {
          // Token invalid or expired
          handleLogout();
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRecommendation(null);
    setUserProfile(null);
  };

  const handleProfileSubmit = async (profile) => {
    setUserProfile(profile);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      setRecommendation(data);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
    }
  };

  if (isLoading) {
    return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  // Protected Route Wrapper
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app-container">
        <BackgroundDecorations />
        {token && <Sidebar onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />}
        <main className="main-content" style={{ gridColumn: token ? '2' : '1 / -1' }}>
          <Routes>
            <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />
            <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
            
            <Route path="/" element={<Navigate to={recommendation ? "/dashboard" : "/profile"} />} />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfileWizard onSubmit={handleProfileSubmit} currentProfile={userProfile} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/careers" 
              element={
                <ProtectedRoute>
                  <Careers userProfile={userProfile} token={token} setRecommendation={setRecommendation} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  {recommendation ? 
                    <Dashboard recommendation={recommendation} profile={userProfile} /> : 
                    <Navigate to="/profile" />
                  }
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <ChatInterface token={token} />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
