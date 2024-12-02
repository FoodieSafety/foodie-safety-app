import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Homepage';
import LoginForm from './LoginForm';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage user="John Doe" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/sign-up" element={<LoginForm />} />
      </Routes>
    </Router>
  );
};

export default App;