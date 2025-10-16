import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Navbar from './Navbar';
import { useAuth } from './context/AuthContext';
import config from './config';

const Subscription = () => {
  const navigate = useNavigate();
  const { user, access_token, loading } = useAuth();

  const [subscriptions, setSubscriptions] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    state: '',
    subscription_type: '',
    status: 'active',
    zipCode: '',
  });
  const [message, setMessage] = useState('');

  const [editRowId, setEditRowId] = useState(null);
  const [tempEditData, setTempEditData] = useState({});

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      email: user.email ?? '',
      state: user.state ?? '',
      subscription_type: user.subscription_type ?? '',
      zipCode: user.zip_code ?? '',
    }));
  }, [user, loading, navigate]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/subscriptions`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  }, [access_token]);

  useEffect(() => {
    if (!loading && access_token && user) {
      fetchSubscriptions();
    }
  }, [loading, access_token, user, fetchSubscriptions]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isDuplicate = subscriptions.some(sub =>
      sub.email === formData.email &&
      sub.subscription_type === formData.subscription_type
    );

    if (isDuplicate) {
      setMessage('You already have a subscription and subscription type with these details.');
      return;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newSubscription = await response.json();
        setSubscriptions((prev) => [...prev, newSubscription]);
        setMessage('Subscription successful!');
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to add subscription');
      }
    } catch (error) {
      console.error("Error adding subscription:", error);
      setMessage('An error occurred while adding the subscription.');
    }
  };

  const handleToggleStatus = async (subscriptionId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'unsubscribed' : 'active';
    const target = subscriptions.find(sub => sub.subscription_id === subscriptionId);
    if (!target) return;

    try {
      const response = await fetch(`${config.API_BASE_URL}/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ ...target, status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      const updated = await response.json();

      setSubscriptions((prev) =>
        prev.map((sub) => (sub.subscription_id === subscriptionId ? updated : sub))
      );
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage('An error occurred while updating status.');
    }
  };

  // Inline Edit Functionality
  const handleEdit = (subscription) => {
    setEditRowId(subscription.subscription_id);
    setTempEditData({
      state: subscription.state,
      subscription_type: subscription.subscription_type,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setTempEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setEditRowId(null);
    setTempEditData({});
  };

  const handleSaveEdit = async (subscriptionId) => {
    const original = subscriptions.find(sub => sub.subscription_id === subscriptionId);
    if (!original) return;

    const isUnchanged =
      tempEditData.subscription_type === original.subscription_type &&
      tempEditData.state === original.state;

    if (isUnchanged) {
      setMessage('No changes were made to the subscription.');
      handleCancelEdit();
      return;
    }

    const isDuplicate = subscriptions.some(sub =>
      sub.subscription_id !== subscriptionId &&
      sub.email === original.email &&
      sub.subscription_type === tempEditData.subscription_type
    );

    if (isDuplicate) {
      setMessage('Another subscription with this email and subscription type already exists.');
      return;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ ...original, ...tempEditData, status: 'active' }),
      });

      if (!response.ok) throw new Error('Failed to update subscription');

      const updated = await response.json();

      setSubscriptions((prev) =>
        prev.map((sub) => (sub.subscription_id === subscriptionId ? updated : sub))
      );

      handleCancelEdit();
      setMessage('Subscription updated successfully!');
    } catch (error) {
      console.error("Update error:", error);
      setMessage('Failed to update subscription.');
    }
  };

  return (
    <div className="container-fluid p-0">
      <Navbar />
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
                readOnly
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="state" className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="subscription_type" className="form-label">Subscription Type</label>
              <select
                className="form-select"
                id="subscription_type"
                name="subscription_type"
                value={formData.subscription_type}
                onChange={handleChange}
                required
              >
                <option value="">Select One</option>
                <option value="food_recall">Food Recall</option>
                <option value="expiration_notice">Expiration Notice</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="zip_code" className="form-label">Zipcode</label>
              <input
                type="number"
                className="form-control"
                id="zip_code"
                name="zip_code"
                value={formData.zipCode}
                onChange={handleChange}
                readOnly
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
              <th>State</th>
              <th>Zipcode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => {
              const isEditing = editRowId === sub.subscription_id;

              return (
                <tr key={sub.subscription_id}>
                  <td>{sub.email}</td>
                  <td>
                    {isEditing ? (
                      <select
                        name="subscription_type"
                        value={tempEditData.subscription_type}
                        onChange={handleEditChange}
                        className="form-select form-select-sm"
                      >
                        <option value="food_recall">Food Recall</option>
                        <option value="expiration_notice">Expiration Notice</option>
                      </select>
                    ) : (
                      sub.subscription_type
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        name="state"
                        value={tempEditData.state}
                        onChange={handleEditChange}
                        className="form-control form-control-sm"
                      />
                    ) : (
                      sub.state
                    )}
                  </td>
                  <td>{sub.zip_code}</td>
                  <td>
                    <span className={`badge bg-${sub.status === 'active' ? 'success' : 'secondary'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button className="btn btn-sm btn-success me-1" onClick={() => handleSaveEdit(sub.subscription_id)}>Save</button>
                        <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-sm btn-primary me-1" onClick={() => handleEdit(sub)}>Edit</button>
                        <button
                          className={`btn btn-sm ${sub.status === 'active' ? 'btn-secondary' : 'btn-success'}`}
                          onClick={() => handleToggleStatus(sub.subscription_id, sub.status)}
                        >
                          {sub.status === 'active' ? 'Unsubscribe' : 'Activate'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscription;