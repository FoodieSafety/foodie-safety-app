import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Navbar from './Navbar';
import axios from 'axios';

const Subscription = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [formData, setFormData] = useState({ email: '', subscriptionType: '', zipcode: '' });
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(storedUser);

    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get('/api/subscriptions');
        setSubscriptions(response.data);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the user is registered
    try {
      const userResponse = await axios.get(`/api/users?email=${formData.email}`);
      const userData = userResponse.data;

      if (!userData.exists) {
        setMessage('This email is not registered. Please register before subscribing.');
        return;
      }

      // Check if email already exists in subscriptions
      const existingSubscription = subscriptions.find(sub => sub.email === formData.email);
      if (existingSubscription) {
        setMessage('This email is already subscribed.');
        return;
      }

      // Add subscription
      const response = await axios.post('/api/subscriptions', formData);

      if (response.status === 200) {
        const newSubscription = response.data;
        setSubscriptions([...subscriptions, newSubscription]);
        setFormData({ email: '', subscriptionType: '', zipcode: '' });
        setMessage('Subscription successful!');
      } else {
        throw new Error('Failed to add subscription');
      }
    } catch (error) {
      console.error("Error adding subscription:", error);
      setMessage('An error occurred while adding subscription.');
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.get(`/api/subscriptions/${id}`);
      const subscription = response.data;
      setFormData(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await axios.delete(`/api/subscriptions/${id}`);
        setSubscriptions(subscriptions.filter(sub => sub.subscription_id !== id));
      } catch (error) {
        console.error("Error deleting subscription:", error);
      }
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
          navigate('/login');
        }}
      />
      <div className="container">
        <h1 className="my-4">Manage Subscriptions</h1>

        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit} className="mb-4">
          <div className="row">
            <div className="col-md-4">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="subscriptionType" className="form-label">Subscription Type</label>
              <select
                className="form-select"
                id="subscriptionType"
                name="subscriptionType"
                value={formData.subscriptionType}
                onChange={handleChange}
                required
              >
                <option value="food_recall">Food Recall</option>
                <option value="expiration_notice">Expiration Notice</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="zipcode" className="form-label">Zipcode</label>
              <input
                type="number"
                className="form-control"
                id="zipcode"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary mt-3">Save Subscription</button>
        </form>

        <hr />

        <table className="table table-striped table-bordered mt-4">
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscription Type</th>
              <th>Zipcode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.subscription_id}>
                <td>{sub.email}</td>
                <td>{sub.subscription_type}</td>
                <td>{sub.zipcode}</td>
                <td>{sub.status}</td>
                <td>
                  <button className="btn btn-warning btn-sm" onClick={() => handleEdit(sub.subscription_id)}>Edit</button>
                  <button className="btn btn-danger btn-sm ml-2" onClick={() => handleDelete(sub.subscription_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscription;