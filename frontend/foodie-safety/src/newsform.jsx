import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from './Navbar';

const newsform = ({ isLoggedIn, onLogout }) => {
  const [formData, setFormData] = useState({
    email: "",
    zipcode: "",
    state: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }
    console.log("Form submitted", formData);
    setSubmitted(true);
  };

  const fetchStateFromZip = (zipCode) => {
    if (zipCode.length === 5) {
      fetch(`https://api.zippopotam.us/us/${zipCode}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Invalid ZIP code");
          }
          return response.json();
        })
        .then((data) => {
          const state = data.places[0]["state"];
          setFormData((prevState) => ({ ...prevState, state }));
        })
        .catch((error) => console.error("Error fetching state data:", error));
    }
  };

  return (
    <div style={{ backgroundImage: "linear-gradient(135deg, #7799f4, #e36a32)" }}>
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} onShowLoginForm={() => window.location.href = '/login'} />
      <div className="container d-flex flex-column align-items-center vh-100">
        <div className="card p-4 shadow-lg w-50 mt-5">
          <h1 className="text-center mb-3">Sign up for Recall Email Alerts (No account needed)</h1>
          <br />
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address:</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="zipcode" className="form-label">Zip Code:</label>
              <input
                type="text"
                id="zipcode"
                name="zipcode"
                className="form-control"
                placeholder="Enter your ZIP code"
                value={formData.zipcode}
                onChange={(e) => {
                  handleChange(e);
                  fetchStateFromZip(e.target.value);
                }}
                pattern="\d{5}"
                title="Please enter a valid 5-digit ZIP code"
                maxLength="5"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="state" className="form-label">State:</label>
              <input
                list="states"
                id="state"
                name="state"
                className="form-control"
                placeholder="Enter your state"
                value={formData.state}
                onChange={handleChange}
                required
              />
              <datalist id="states">
                {["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"].map((state) => (
                  <option key={state} value={state} />
                ))}
              </datalist>
            </div>

            <button type="submit" className="btn btn-primary w-100">Submit</button>
          </form>

          {submitted && (
            <div className="alert alert-success mt-3 text-center">
              🎉 You're subscribed! Watch your inbox for weekly alerts.
            </div>
          )}

          <hr className="mt-4" />

          <div className="text-center mt-3">
            <p className="text-center text-muted small mt-2">
              Want to track recalls and customize your alerts? <a href="/sign-up">Create an account</a> — it's optional!
            </p>
            <p>
              By continuing, you agree to our <a href="/terms">Terms of Service</a> and our <a href="/privacy">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default newsform;