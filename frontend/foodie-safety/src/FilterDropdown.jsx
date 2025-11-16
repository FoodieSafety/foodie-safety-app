import React, { useState, useEffect, useRef } from "react";

const FilterDropdown = ({ onSelect, onOpenChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        if (onOpenChange) {
          onOpenChange(false);
        }
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onOpenChange]);

  const handleToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleSelect = (option) => {
    onSelect(option);
    setOpen(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Blue colors to match the design
  const blueColor = '#3b82f6';
  const blueHover = '#2563eb';
  const borderColor = '#1e40af'; 
  const buttonMinWidth = '180px';

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: buttonMinWidth }}> 
      <button
        onClick={handleToggle}
        style={{ 
            backgroundColor: blueColor,
            color: 'white',
            fontWeight: '500',
            padding: '0.5rem 0.75rem', 
            minWidth: buttonMinWidth,  
            width: '100%',
            border: `1px solid ${borderColor}`,
            borderRadius: open ? '6px 6px 0 0' : '6px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '0.875rem',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = blueHover}
        onMouseLeave={(e) => e.target.style.backgroundColor = blueColor}
      >
        <span style={{ flexGrow: 1, textAlign: 'left' }}>Display data from</span>
        <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
          ▼
        </span>
      </button>

      {open && (
        <div 
          style={{ 
              position: 'absolute',
              backgroundColor: blueColor,
              minWidth: buttonMinWidth, 
              width: '100%',
              top: '100%', 
              right: '0',
              zIndex: 10,
              border: `1px solid ${borderColor}`,
              borderTop: 'none', 
              borderRadius: '0 0 6px 6px', 
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden'
          }}
        >
          {["Last week", "Last two weeks", "Last month"].map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              style={{ 
                  width: '100%',
                  display: 'block', 
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem', 
                  borderTop: index === 0 ? 'none' : `1px solid ${borderColor}`,
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = blueHover}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;