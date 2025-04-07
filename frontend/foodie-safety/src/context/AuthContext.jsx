import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [access_token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    const storedToken = localStorage.getItem("access_token");

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  const login = (user, access_token) => {
    setUser(user);
    setToken(access_token);
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("access_token", access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider value={{ user, access_token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};