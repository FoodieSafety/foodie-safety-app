import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from "./Homepage";
import LoginForm from "./LoginForm";
import AccountPage from "./AccountPage";
import Subscription from "./Subscription";
import ScanProduct from "./ScanProduct";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePageWithAuth />} />
          <Route path="/account" element={<AccountPageWithAuth />} />
          <Route path="/login" element={<LoginFormWithAuth />} />
          <Route path="/sign-up" element={<SignUpWithAuth />} />
          <Route path="/subscriptions" element={<SubscriptionWithAuth />} />
          <Route path="/scan" element={<ScanProductWithAuth />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const HomePageWithAuth = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <HomePage user={null} isLoggedIn={false} onLogout={logout} />;
  }

  return <HomePage user={user} isLoggedIn={true} onLogout={logout} />;
};

const AccountPageWithAuth = () => {
  const { user, logout } = useAuth();
  return user ? (
    <AccountPage user={user} isLoggedIn={true} onLogout={logout} />
  ) : (
    <Navigate to="/login" />
  );
};

const LoginFormWithAuth = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : <LoginForm />;
};

const SignUpWithAuth = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : <LoginForm />;
};

const SubscriptionWithAuth = () => {
  const { user, logout } = useAuth();
  return user ? (
    <Subscription user={user} isLoggedIn={true} onLogout={logout} />
  ) : (
    <Navigate to="/login" />
  );
};

const ScanProductWithAuth = () => {
  const { user, logout } = useAuth();
  return user ? (
    <ScanProduct user={user} isLoggedIn={true} onLogout={logout} />
  ) : (
    <Navigate to="/login" />
  );
};

export default App;