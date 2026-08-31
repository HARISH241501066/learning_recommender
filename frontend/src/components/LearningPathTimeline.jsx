import React from 'react';
import { PlayCircle, Circle, Briefcase, Award, Code, CheckCircle2, ExternalLink } from 'lucide-react';

// Platform config: label, brand color, and an SVG-free emoji/letter icon
const PLATFORM_CONFIG = {
  // Course platforms
  udemy:        { label: 'Udemy',        color: '#a435f0', bg: 'rgba(164,53,240,0.12)', border: 'rgba(164,53,240,0.35)', emoji: '🎓' },
  coursera:     { label: 'Coursera',     color: '#0056d2', bg: 'rgba(0,86,210,0.12)',   border: 'rgba(0,86,210,0.35)',   emoji: '📘' },
  youtube:      { label: 'YouTube',      color: '#ff4444', bg: 'rgba(255,68,68,0.12)',  border: 'rgba(255,68,68,0.35)',  emoji: '▶️' },
  freecodecamp: { label: 'freeCodeCamp', color: '#00b9a8', bg: 'rgba(0,185,168,0.12)', border: 'rgba(0,185,168,0.35)', emoji: '💻' },
  // Project platforms
  github:       { label: 'GitHub',       color: '#e6edf3', bg: 'rgba(230,237,243,0.1)', border: 'rgba(230,237,243,0.25)', emoji: '🐙' },
  devto:        { label: 'Dev.to',       color: '#a8b2d8', bg: 'rgba(168,178,216,0.1)', border: 'rgba(168,178,216,0.25)', emoji: '📝' },
  // Certification platforms
  linkedin:     { label: 'LinkedIn',     color: '#0a66c2', bg: 'rgba(10,102,194,0.12)', border: 'rgba(10,102,194,0.35)', emoji: '💼' },
  credly:       { label: 'Credly',       color: '#f68212', bg: 'rgba(246,130,18,0.12)', border: 'rgba(246,130,18,0.35)', emoji: '🏅' },
};

const PlatformButton = ({ platform, url }) => {
  const cfg = PLATFORM_CONFIG[platform];
  if (!cfg || !url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Find on ${cfg.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: '600',
        textDecoration: 'none',
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 4px 12px ${cfg.border}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span style={{ fontSize: '13px' }}>{cfg.emoji}</span>
      {cfg.label}
      <ExternalLink size={11} style={{ opacity: 0.7 }} />
    </a>
  );
};

const LearningPathTimeline = ({ path }) => {
  const getTypeConfig = (type) => {
    switch (type) {
      case 'Project':
        return { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', icon: <Code size={20} /> };
      case 'Certification':
        return { color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', icon: <Award size={20} /> };
      case 'Practice':
        return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', icon: <Briefcase size={20} /> };
      default: // Course
        return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <PlayCircle size={20} /> };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingLeft: '8px' }}>
      {path.map((item, index) => {
        const config = getTypeConfig(item.type);
        const links = item.links || {};
        const linkEntries = Object.entries(links);

        return (
          <div
            key={index}
            className="glass-panel animate-fade-in"
            style={{
              padding: '24px 32px',
              display: 'flex',
              gap: '24px',
              position: 'relative',
              animationDelay: `${0.1 * (index + 1)}s`,
              borderLeft: index === 0 ? '4px solid #10b981' : undefined
            }}
          >
            {/* Vertical connector line */}
            {index < path.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '46px',
                top: '70px',
                bottom: '-24px',
                width: '2px',
                background: 'linear-gradient(to bottom, var(--glass-border) 50%, transparent)',
                zIndex: 0
              }} />
            )}

            <div style={{ zIndex: 1, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: index === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
              {index === 0 ? (
                <CheckCircle2 size={24} color="#10b981" />
              ) : (
                <Circle size={16} color="var(--text-secondary)" />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Title row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '12px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: 'white' }}>{item.title}</h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  background: config.bg,
                  color: config.color,
                  border: `1px solid ${config.color}40`,
                  flexShrink: 0,
                }}>
                  {config.icon}
                  {item.type}
                </div>
              </div>

              {/* Duration */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '15px', marginBottom: linkEntries.length ? '16px' : '0' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-secondary)' }}></span>
                Estimated time to complete: <strong style={{ color: 'var(--text-primary)' }}>{item.duration}</strong>
              </div>

              {/* Platform links */}
              {linkEntries.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '4px', fontWeight: 500 }}>
                    Find on →
                  </span>
                  {linkEntries.map(([platform, url]) => (
                    <PlatformButton key={platform} platform={platform} url={url} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default LearningPathTimeline;
