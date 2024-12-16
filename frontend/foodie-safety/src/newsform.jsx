import React, { useState } from "react";
import "./NewsForm.css"; // Extract styles into a CSS file if needed.

const NewsForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    zipcode: "",
    state: "",
  });

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
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h1 className="custom-title">Newsletter Subscription</h1>
        <p className="custom-text">
          To sign up for the newsletter, users must{" "}
          <a href="#">create an account.</a>
        </p>
        <hr className="custom-line" />
        <label htmlFor="email">Email Address:</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="zipcode">Zip Code:</label>
        <input
          type="text"
          id="zipcode"
          name="zipcode"
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

        <label htmlFor="state">State:</label>
        <input
          list="states"
          id="state"
          name="state"
          placeholder="Enter your state"
          value={formData.state}
          onChange={handleChange}
          required
        />
        <datalist id="states">
          {[
            
            "Alabama",
            "Alaska",
            "Arizona",
            "Arkansas",
            "California",
            "Colorado",
            "Connecticut",
            "Delaware",
            "Florida",
            "Georgia",
            "Hawaii",
            "Idaho",
            "Illinois",
            "Indiana",
            "Iowa",
            "Kansas",
            "Kentucky",
            "Louisiana",
            "Maine",
            "Maryland",
            "Massachusetts",
            "Michingan",
            "Minnesota",
            "Mississippi",
            "Missouri",
            "Montana",
            "Nebraska",
            "Nevada",
            "New Hampshire",
            "New Jersey",
            "New Mexico",
            "New York",
            "North Carolina",
            "North Carolina",
            "North Dakota",
            "Ohio",
            "Oklahoma",
            "Oregon",
            "Pennsylvania",
            "Rhode Island",
            "South Carolina",
            "South Dakota",
            "Tennessee",
            "Texas",
            "Utah",
            "Vermont",
            "Virginia",
            "Washington",
            "West Virginia",
            "Wisconsin",
            "Wyoming",
          ].map((state) => (
            <option key={state} value={state} />
          ))}
        </datalist>

        <button type="submit">Submit</button>
        <div className="tos">
          <p>
            By continuing, you agree to our <a href="">Terms of Service</a> and
            our <a href="">Privacy Policy</a>.
          </p>
        </div>
      </form>
    </div>
  );
};

export default NewsForm;
