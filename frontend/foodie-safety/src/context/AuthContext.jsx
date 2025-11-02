import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import config from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [access_token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    const storedToken = localStorage.getItem("access_token");

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const login = async (token) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
  
      const userData = await response.json();
      setUser(userData);
      setToken(token);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("access_token", token);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("access_token");
    sessionStorage.clear();
  };

  /**
   * Authenticated fetch wrapper
   * Automatically adds Authorization header and handles 401 responses
   */
  const authenticatedFetch = useCallback(async (url, options = {}) => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${access_token}`,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        if (!isRedirectingRef.current) {
          isRedirectingRef.current = true;
          logout();
          alert('Session expired. Please login again.');
          window.location.href = '/login';
        }
        throw new Error('Authentication expired');
      }

      return response;
    } catch (error) {
      if (error.message !== 'Authentication expired') {
        console.error('API request error:', error);
      }
      throw error;
    }
  }, [access_token]);

  return (
    <AuthContext.Provider value={{ user, access_token, login, logout, loading, authenticatedFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);