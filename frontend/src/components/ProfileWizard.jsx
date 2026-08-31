import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomSelect from './CustomSelect';
import { API_BASE } from '../api';

const ProfileWizard = ({ onSubmit, currentProfile }) => {
  const [formData, setFormData] = useState(currentProfile || {
    education: "Bachelor's",
    specialization: "Computer Science",
    skills: [],
    certifications: "None",
    cgpa: 80
  });
  const navigate = useNavigate();

  const [metadata, setMetadata] = useState({
    specializations: ["Computer Science", "Engineering", "Business", "Commerce", "None"],
    skills: ["Python", "SQL", "Communication", "Data Analysis"],
    certifications: ["None", "AWS Certified", "PMP"]
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/metadata`)
      .then(res => res.json())
      .then(data => {
        if (data && data.specializations.length > 0) {
          setMetadata(data);
        }
      })
      .catch(err => console.error("Failed to fetch metadata:", err));
  }, []);

  const educationLevels = ["Matric", "Intermediate", "Bachelor's", "Master's", "PhD"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'cgpa' ? parseInt(value) : value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    navigate('/dashboard');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
      <h2 style={{ marginBottom: '24px' }} className="gradient-text">Tell us about yourself</h2>
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Education Level</label>
          <CustomSelect 
            options={educationLevels}
            value={formData.education}
            onChange={(val) => handleSelectChange('education', val)}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Specialization</label>
          <CustomSelect 
            options={metadata.specializations}
            value={formData.specialization}
            onChange={(val) => handleSelectChange('specialization', val)}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Skills</label>
          <CustomSelect 
            options={metadata.skills}
            value={formData.skills}
            onChange={(val) => handleSelectChange('skills', val)}
            isMultiSelect={true}
            placeholder="Select your skills"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Certifications</label>
          <CustomSelect 
            options={metadata.certifications}
            value={formData.certifications}
            onChange={(val) => handleSelectChange('certifications', val)}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>CGPA / Percentage</label>
          <input 
            type="number" 
            name="cgpa" 
            value={formData.cgpa} 
            onChange={handleChange}
            min="0" max="100"
            className="input-field"
          />
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '16px', justifyContent: 'center' }}>
          Generate Learning Path
        </button>
      </form>
    </div>
  );
};

export default ProfileWizard;
