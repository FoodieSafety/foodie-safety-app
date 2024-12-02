import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const LoginForm = ({ onLogin }) => {
    const navigate = useNavigate();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const toggleFormMode = () => {
        setIsLoginMode((prevMode) => !prevMode);
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
        });
        if (isLoginMode) {
            navigate('/sign-up');
        } else {
            navigate('/login');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLoginMode) {
            console.log('Logging in with:', formData);
            onLogin();
            navigate('/');
        } else {
            if (formData.password !== formData.confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            console.log('Signing up with:', formData);
            navigate('/login');
        }
    };    

    return (
        <div className="container-fluid p-0">
            <Navbar />
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card my-5">
                        <div className="card-body">
                            <h2 className="text-center">
                                {isLoginMode ? 'Login' : 'Sign Up'}
                            </h2>
                            <form onSubmit={handleSubmit}>
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