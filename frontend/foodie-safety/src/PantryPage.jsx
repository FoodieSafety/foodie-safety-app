import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const PantryPage = ({ user, isLoggedIn, onLogout }) => {
    const [pantryItems, setPantryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isLoggedIn) {
            fetchPantryItems();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn]);

    const fetchPantryItems = async () => {
        try {
            const response = await fetch('http://54.183.230.236:8000/products', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pantry items');
            }

            const data = await response.json();
            setPantryItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />

            <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
                <h1>{user ? `${user}'s Pantry` : 'Your Pantry'}</h1>
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
                                    <td colSpan="4" className="text-center text-danger">
                                        {error} (Showing pantry layout)
                                    </td>
                                </tr>
                            ) : pantryItems.length > 0 ? (
                                pantryItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.brand}</td>
                                        <td>{item.code}</td>
                                        <td className={item.recall ? "text-danger" : "text-success"}>
                                            {item.recall ? "Recalled" : "Safe"}
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