import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './Homepage';
import LoginForm from './LoginForm';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('currentUser');
  });
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('currentUser'));
  });

  const handleLogin = (formData) => {
    setIsLoggedIn(true);
    setUser(formData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<HomePage user={user?.FirstName} isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
        />
        <Route
          path="/account"
          element={
            isLoggedIn ? (
              <HomePage user={`${user?.FirstName}`} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/account" />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/sign-up"
          element={
            isLoggedIn ? (
              <Navigate to="/account" />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;