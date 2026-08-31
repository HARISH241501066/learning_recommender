import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder = "Select an option", isMultiSelect = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (option, e) => {
    e.stopPropagation();
    if (isMultiSelect) {
      let newValue = Array.isArray(value) ? [...value] : [];
      if (newValue.includes(option)) {
        newValue = newValue.filter(item => item !== option);
      } else {
        newValue.push(option);
      }
      onChange(newValue);
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  const removeValue = (optionToRemove, e) => {
    e.stopPropagation();
    if (isMultiSelect && Array.isArray(value)) {
      onChange(value.filter(item => item !== optionToRemove));
    }
  };

  const renderValue = () => {
    if (isMultiSelect && Array.isArray(value) && value.length > 0) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {value.map(val => (
            <div key={val} style={{ 
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(79, 70, 229, 0.4)', padding: '2px 8px', 
              borderRadius: '12px', fontSize: '13px', color: 'white'
            }}>
              {val}
              <X size={14} style={{ cursor: 'pointer' }} onClick={(e) => removeValue(val, e)} />
            </div>
          ))}
        </div>
      );
    }
    if (!isMultiSelect && value) {
      return <span style={{ color: 'white' }}>{value}</span>;
    }
    return <span style={{ color: 'var(--text-secondary)' }}>{placeholder}</span>;
  };

  return (
    <div className="custom-select-container" ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className={`input-field ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          minHeight: '48px',
          height: 'auto'
        }}
      >
        <div style={{ flex: 1, paddingRight: '12px' }}>
          {renderValue()}
        </div>
        <ChevronDown 
          size={20} 
          style={{ 
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--text-secondary)',
            flexShrink: 0
          }} 
        />
      </div>

      {isOpen && (
        <div 
          className="glass-panel animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 50,
            maxHeight: '250px',
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {options.map((option, index) => {
            const isSelected = isMultiSelect 
              ? (Array.isArray(value) && value.includes(option))
              : value === option;

            return (
              <div
                key={index}
                onClick={(e) => handleOptionClick(option, e)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isSelected ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? '600' : '400',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {option}
                {isMultiSelect && isSelected && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
