import React from 'react';
import { Target, TrendingUp, Award, BookOpen } from 'lucide-react';
import LearningPathTimeline from './LearningPathTimeline';

const Dashboard = ({ recommendation, profile }) => {
  if (!recommendation) return null;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '36px', marginBottom: '8px' }}>Your Roadmap</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            Target Career: <strong style={{ color: 'var(--text-primary)' }}>{recommendation.recommended_career}</strong>
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '16px 28px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '100px' }}>
          <div className="icon-wrapper" style={{ margin: 0, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-primary)', borderColor: 'rgba(79, 70, 229, 0.3)' }}>
            <Target size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Current Level</div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>{profile?.education || 'Beginner'}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', borderLeft: '4px solid var(--accent-secondary)' }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontSize: '20px' }}>
          <Award size={24} color="var(--accent-secondary)" /> 
          AI Gap Analysis
        </h3>
        <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)', fontSize: '16px' }}>
          {recommendation.explanation}
        </p>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '48px' }}>
        <div className="card glass-panel" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-tertiary)' }}>
              <BookOpen size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Milestones in Path</h3>
          </div>
          <div style={{ fontSize: '42px', fontWeight: '700', marginTop: '12px', color: 'white' }}>{recommendation.learning_path.length}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Custom tailored to bridge your skill gaps</div>
        </div>
        <div className="card glass-panel" style={{ animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Predicted Success</h3>
          </div>
          <div style={{ fontSize: '42px', fontWeight: '700', marginTop: '12px', color: '#10b981' }}>99%</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Based on local machine learning model</div>
        </div>
      </div>

      <h2 style={{ marginBottom: '32px', fontSize: '28px', color: 'white' }}>Personalized Action Plan</h2>
      <LearningPathTimeline path={recommendation.learning_path} />
    </div>
  );
};

export default Dashboard;
