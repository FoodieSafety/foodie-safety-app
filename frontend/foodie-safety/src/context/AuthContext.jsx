import React, { createContext, useContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [access_token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const response = await fetch('http://54.183.230.236:8000/users', {
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

  return (
    <AuthContext.Provider value={{ user, access_token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);