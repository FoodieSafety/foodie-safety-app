import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import config from './config';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './Navbar';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(location.pathname === '/login');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    zipCode: '',
  });
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setIsLoginMode(location.pathname === '/login');
  }, [location.pathname]);

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

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    } else {
      setEmailError('');
    }

    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    } else {
      setPasswordError('');
    }

    if (isLoginMode) {
      const loginForm = new URLSearchParams();
      loginForm.append('grant_type', 'password');
      loginForm.append('username', formData.email);
      loginForm.append('password', formData.password);

      const response = await fetch(`${config.API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginForm.toString(),
      });

      const data = await response.json();
      if (response.ok) {
        const token = data.access_token;

        await login(token);
        alert('Login successful!');
        navigate('/');
      } else {
        alert('Login failed: ' + data.detail);
      }
    } else {
      const createUserForm = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        zip_code: formData.zipCode,
      };

      try {
        const response = await fetch(`${config.API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createUserForm),
        });

        if (response.ok) {
          alert('Sign-up successful! Please log in.');
          navigate('/login');
        } else {
          const errorData = await response.json();
          alert('Sign-up failed: ' + errorData.detail);
        }
      } catch (error) {
        console.error('Error during sign-up:', error);
        alert('An error occurred during sign-up.');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container-fluid p-0">
      <Navbar />
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card my-5">
            <div className="card-body">
              <h2 className="text-center">{isLoginMode ? 'Login' : 'Sign Up'}</h2>
              <div className="text-center mt-3">
                <button type="button" className="btn btn-link" onClick={toggleFormMode}>
                  {isLoginMode ? 'Need an account? Sign up' : 'Already have an account? Log in'}
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                {!isLoginMode && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={formData.lastName}
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
                  {emailError && <div className="text-danger">{emailError}</div>}
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
                    {passwordError && <div className="text-danger">{passwordError}</div>}
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100">
                  {isLoginMode ? 'Login' : 'Sign Up'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;