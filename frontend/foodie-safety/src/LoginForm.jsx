import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Navbar from './Navbar';

const LoginForm = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginMode, setIsLoginMode] = useState(location.pathname === '/login');
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    zipCode: '',  // Added Zip Code field
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (location.pathname === '/login' && !isLoginMode) {
      setIsLoginMode(true);
    } else if (location.pathname !== '/login' && isLoginMode) {
      setIsLoginMode(false);
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser !== currentUser) {
      setCurrentUser(currentUser);
      onLogin(currentUser);
    }
  }, [location.pathname, onLogin, isLoginMode, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const toggleFormMode = () => {
    navigate(isLoginMode ? '/sign-up' : '/login');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoginMode) {
      const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
      const user = savedUsers.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        onLogin(user);
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert(`Welcome, ${user.FirstName}!`);
        navigate('/account');
      } else {
        alert('Invalid email or password');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      const newUser = {
        FirstName: formData.FirstName,
        LastName: formData.LastName,
        email: formData.email,
        password: formData.password,
        zipCode: formData.zipCode,  // Storing Zip Code
      };

      const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
      localStorage.setItem('users', JSON.stringify([...savedUsers, newUser]));
      alert('Sign up successful! Please log in.');
      navigate('/login');
    }
  };

  return (
    <div className="container-fluid p-0">
      <Navbar
        isLoggedIn={!!currentUser}
        user={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
        }}
      />
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card my-5">
            <div className="card-body">
              <h2 className="text-center">{isLoginMode ? 'Login' : 'Sign Up'}</h2>
              <form onSubmit={handleSubmit}>
                {!isLoginMode && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="FirstName"
                        value={formData.FirstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="LastName"
                        value={formData.LastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Zip Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </>
                )}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {!isLoginMode && (
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100">
                  {isLoginMode ? 'Login' : 'Sign Up'}
                </button>
                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={toggleFormMode}
                  >
                    {isLoginMode
                      ? 'Need an account? Sign up'
                      : 'Already have an account? Log in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;