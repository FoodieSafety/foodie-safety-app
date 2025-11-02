import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useAuth } from './context/AuthContext';
import config from './config';

const PantryPage = () => {
    const [pantryItems, setPantryItems] = useState([]);
    const [error, setError] = useState(null);
    const { user, access_token, loading, authenticatedFetch } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [loading, user, navigate]);

    useEffect(() => {
        const fetchPantryItems = async () => {
            try {
                const response = await authenticatedFetch(`${config.API_BASE_URL}/products`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'Failed to fetch products');
                }

                const data = await response.json();
                setPantryItems(data);

                data.forEach(item => {
                    if (item.recall && user) {
                        const notification = new Notification('Food Recall Alert', {
                            body: `The item ${item.name} from ${item.brand} has been recalled. Please check your pantry.`,
                            icon: 'path/to/icon.png', // Optional icon path
                        });

                        notification.onclick = () => {
                            window.focus();
                        };
                    }
                });
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

    const handleDelete = async (barcode) => {
        try {
            const formData = new FormData();
            formData.append('str_barcodes', barcode);

            const response = await authenticatedFetch(`${config.API_BASE_URL}/products`, {
                method: 'DELETE',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Failed to delete product');
            }

            
            setPantryItems(prevItems => 
                prevItems.filter(item => item.code !== barcode)
            );
            
            alert('Product deleted successfully!');
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

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
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center">Loading...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="5" className="text-center text-danger">{error}</td>
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
                                        <td>
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(item.code)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">No items in your pantry yet.</td>
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