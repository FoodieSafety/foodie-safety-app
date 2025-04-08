import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useAuth } from './context/AuthContext';

const PantryPage = () => {
    const [pantryItems, setPantryItems] = useState([]);
    const [error, setError] = useState(null);
    const { user, access_token, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [loading, user, navigate]);

    useEffect(() => {
        const fetchPantryItems = async () => {
            try {
                const response = await fetch('http://localhost:8000/products', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'Failed to fetch products');
                }

                const data = await response.json();
                setPantryItems(data);
            } catch (err) {
                setError(err.message);
            }
        };

        if (user && access_token) {
            fetchPantryItems();
        } else if (!loading) {
            setError('You must be logged in to view your pantry.');
        }
    }, [user, access_token, loading]);

    return (
        <div>
            <Navbar />

            <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
                <h1>{user ? `${user.first_name}'s Pantry` : 'Your Pantry'}</h1>
                <p>Manage your food items and stay informed on recalls.</p>
            </div>

            <div className="container my-5">
                <h3 className="text-center">Your Stored Food Goods</h3>

                <div className="table-responsive">
                    <table className="table table-bordered table-striped mt-4">
                        <thead className="table-dark">
                            <tr>
                                <th>Name</th>
                                <th>Brand</th>
                                <th>Code</th>
                                <th>Safety Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center">Loading...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="4" className="text-center text-danger">{error}</td>
                                </tr>
                            ) : pantryItems.length > 0 ? (
                                pantryItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.brand}</td>
                                        <td>{item.code}</td>
                                        <td className={item.recall ? 'text-danger' : 'text-success'}>
                                            {item.recall ? 'Recalled' : 'Safe'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">No items in your pantry yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PantryPage;