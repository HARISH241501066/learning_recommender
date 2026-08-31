import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase } from 'lucide-react';

const Careers = ({ userProfile, token, setRecommendation }) => {
  const [careers, setCareers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/careers')
      .then(res => res.json())
      .then(data => {
        setCareers(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch careers:", err);
        setIsLoading(false);
      });
  }, []);

  const handleSelectCareer = async (careerTitle) => {
    if (!token) {
      // If not logged in, they can't save a path. 
      // We could redirect to login, but since this is protected route in App.jsx, token should exist.
      return;
    }
    
    // Use user's current skills if available, else empty array
    const skills = userProfile?.skills || [];

    try {
      const response = await fetch('/api/select_career', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ career: careerTitle, skills: skills }),
      });
      const data = await response.json();
      setRecommendation(data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error selecting career:', error);
    }
  };

  const filteredCareers = careers.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Loading all 371 careers...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Explore Careers</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '800px' }}>
          Browse through hundreds of professional pathways. See the required skills, and instantly generate a customized learning path based on your current profile to achieve your dream job.
        </p>
      </div>

      <div style={{ position: 'relative', marginBottom: '40px', maxWidth: '600px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input 
          type="text" 
          placeholder="Search by career title or skill (e.g. Data Analyst, Python)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '48px', fontSize: '16px' }}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '24px' 
      }}>
        {filteredCareers.map((career, idx) => (
          <div key={idx} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div className="icon-wrapper" style={{ marginBottom: 0, padding: '10px' }}>
                  <Briefcase size={24} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{career.title}</h3>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>Required Skills:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {career.skills.map((skill, sIdx) => (
                    <span key={sIdx} style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--glass-border)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <button 
              className="btn-secondary" 
              onClick={() => handleSelectCareer(career.title)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Pursue this Career
            </button>
          </div>
        ))}
      </div>
      
      {filteredCareers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          No careers found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default Careers;
