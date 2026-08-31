import React from 'react';

const BackgroundDecorations = () => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
      
      {/* Glowing Cubes */}
      <div className="cube cube-1" style={{ background: 'var(--cube-bg)', borderColor: 'var(--cube-border)' }}></div>
      <div className="cube cube-2" style={{ background: 'var(--cube-bg)', borderColor: 'var(--cube-border)' }}></div>
      <div className="cube cube-3" style={{ background: 'var(--cube-bg)', borderColor: 'var(--cube-border)' }}></div>
      <div className="cube cube-4" style={{ background: 'var(--cube-bg)', borderColor: 'var(--cube-border)' }}></div>
      <div className="cube cube-5" style={{ background: 'var(--cube-bg)', borderColor: 'var(--cube-border)' }}></div>

      {/* Career Doodles (SVGs) */}
      <svg className="doodle doodle-1" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 50L40 70L80 30" stroke="var(--doodle-stroke)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      
      <svg className="doodle doodle-2" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="30" stroke="var(--doodle-stroke)" strokeWidth="4" strokeDasharray="10 10" />
      </svg>

      <svg className="doodle doodle-3" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="25" width="50" height="50" rx="10" stroke="var(--doodle-stroke)" strokeWidth="4" />
        <path d="M40 40H60M40 60H60" stroke="var(--doodle-stroke)" strokeWidth="4" strokeLinecap="round"/>
      </svg>
      
      <svg className="doodle doodle-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10L90 90H10L50 10Z" stroke="var(--doodle-stroke)" strokeWidth="4" strokeLinejoin="round"/>
      </svg>

      {/* Code Brackets Doodle */}
      <svg className="doodle doodle-5" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 20L10 50L30 80M70 20L90 50L70 80" stroke="var(--doodle-stroke)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      
    </div>
  );
};

export default BackgroundDecorations;
