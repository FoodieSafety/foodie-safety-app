import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import HomePage from "./Homepage";
import LoginForm from "./LoginForm";
import AccountPage from "./AccountPage";
import Subscription from "./Subscription";
import ScanProduct from "./ScanProduct";
import PantryPage from "./PantryPage";
import SettingsPage from "./SettingPage";
import History from "./History";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/sign-up" element={<LoginForm />} />
          <Route path="/subscriptions" element={<Subscription />} />
          <Route path="/scan" element={<ScanProduct />} />
          <Route path="/my-products" element={<PantryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;