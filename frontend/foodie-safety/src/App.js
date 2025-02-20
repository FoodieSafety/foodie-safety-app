import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./Homepage";
import LoginForm from "./LoginForm";
import Subscription from "./Subscription";
import AccountPage from "./AccountPage";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("currentUser");
  });

  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("currentUser"));
  }); 

  const handleLogin = (formData) => {
    setIsLoggedIn(true);
    setUser(formData);
    localStorage.setItem("currentUser", JSON.stringify(formData));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={<HomePage user={user?.FirstName} isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
        />

        {/* Account Page */}
        <Route
          path="/account"
          element={isLoggedIn ? <AccountPage user={user?.FirstName} isLoggedIn={isLoggedIn} onLogout={handleLogout} /> : <Navigate to="/" />}
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" /> : <LoginForm onLogin={handleLogin} />}
        />

        {/* Sign-up Page - Also redirects to Home */}
        <Route
          path="/sign-up"
          element={isLoggedIn ? <Navigate to="/" /> : <LoginForm onLogin={handleLogin} />}
        />

        {/* Subscription Page - Restricted to Logged-in Users */}
        <Route path="/subscriptions" element={isLoggedIn ? <Subscription /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

// Placeholder for UserProfile Component
const UserProfile = ({ user, onLogout }) => (
  <div className="container mt-4">
    <h2>Welcome, {user?.FirstName}!</h2>
    <p>Email: {user?.Email}</p>
    <button className="btn btn-danger" onClick={onLogout}>
      Log Out
    </button>
  </div>
);

export default App;