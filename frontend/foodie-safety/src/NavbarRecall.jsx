import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const NavbarRecall = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav style={{ 
      backgroundColor: 'white', 
      padding: '0.75rem 1.5rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      {/* Logo/Brand Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Orange "F" Logo */}
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: '#f97316',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          borderRadius: '4px'
        }}>
          F
        </div>
        <span style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: '#1f2937'
        }}>
          FoodieSafety
        </span>
      </div>
      
      {/* Navigation Links and Menu Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '0.375rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            backgroundColor: '#e5e7eb',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Home
        </button>
        <button 
          onClick={() => navigate('/account')}
          style={{
            padding: '0.375rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            backgroundColor: '#e5e7eb',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Account
        </button>
        <button 
          onClick={() => navigate('/settings')}
          style={{
            padding: '0.375rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            backgroundColor: '#e5e7eb',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Settings
        </button>
        {/* Hamburger Menu Icon */}
        <button 
          style={{
            padding: '0.5rem',
            color: '#374151',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default NavbarRecall;