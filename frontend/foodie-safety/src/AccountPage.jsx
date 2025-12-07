import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useAuth } from './context/AuthContext';
import config from './config';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const AccountPage = () => {
  const { user, loading, login, access_token, authenticatedFetch } = useAuth();

  const [editProfile, setEditProfile] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    zipCode: '',
    generalDiet: 'na',
    religiousCulturalDiets: 'na',
    allergens: [],
    password: '',
  });


  useEffect(() => {
    if (!loading && user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        zipCode: user.zip_code || '',
        generalDiet: user.general_diet || 'na',
        religiousCulturalDiets: user.religious_cultural_diets || 'na',
        allergens: user.allergens
          ? user.allergens.split(',').filter(a => a !== 'na')
          : [],
        password: '',
      });
    }
  }, [loading, user]);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSave = async () => {
    const updatedUser = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      zip_code: formData.zipCode,
      general_diet: formData.generalDiet,
      religious_cultural_diets: formData.religiousCulturalDiets,
      allergens:
        formData.allergens.length > 0
          ? formData.allergens.join(',')
          : 'na',
      password: formData.password,
    };

    try {
      const response = await authenticatedFetch(`${config.API_BASE_URL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        login(access_token);
        setEditProfile(false);
        setUpdateSuccess('Profile updated successfully');
        setUpdateError('');

        // 3 seconds later, auto hide success message
        setTimeout(() => {
          setUpdateSuccess('');
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData.detail);
        setUpdateError(errorData.detail || 'Update failed. Please check your information and try again.');
        setUpdateSuccess('');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError('An error occurred while updating the profile. Please retry.');
      setUpdateSuccess('');
    }
  };

  if (loading) return null;

  return (
    <div>
      <Navbar />

      <div className="hero-section text-center py-5" style={{ backgroundColor: '#FFD700' }}>
        <h1>Your Account Profile</h1>
        <p>Manage your personal details here.</p>
      </div>

      <div className="container text-center my-5">
        {/* Update Success Alert */}
        {updateSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Success!</strong> {updateSuccess}
            <button
              type="button"
              className="btn-close"
              onClick={() => setUpdateSuccess('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Update Error Alert */}
        {updateError && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Update Failed!</strong> {updateError}
            <button
              type="button"
              className="btn-close"
              onClick={() => setUpdateError('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        {!editProfile ? (
          <div>
            <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Zip Code:</strong> {formData.zipCode}</p>
            <p><strong>General Diet:</strong> {formData.generalDiet !== 'na' ? formData.generalDiet : 'N/A'}</p>
            <p><strong>Religious / Cultural Diet:</strong> {formData.religiousCulturalDiets !== 'na' ? formData.religiousCulturalDiets : 'N/A'}</p>
            <p><strong>Allergens:</strong> {formData.allergens.length > 0 ? formData.allergens.join(', ') : 'N/A'}</p>
            <p><strong>Password:</strong> •••••••••</p>
            <button className="btn btn-warning mt-3" onClick={() => setEditProfile(true)}>Edit Profile</button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProfileSave();
            }}
          >
            <div className="mb-3">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input type="text" className="form-control" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} autoComplete="given-name" />
            </div>
            <div className="mb-3">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input type="text" className="form-control" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} autoComplete="family-name" />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" />
            </div>
            <div className="mb-3">
              <label htmlFor="zipCode" className="form-label">Zip Code</label>
              <input type="text" className="form-control" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} autoComplete="postal-code" />
            </div>
            {/* New fields: General Diet */}
            <div className="mb-3">
              <label htmlFor="generalDiet" className="form-label">General Diet</label>
              <select
                className="form-select"
                id="generalDiet"
                name="generalDiet"
                value={formData.generalDiet}
                onChange={handleChange}
              >
                <option value="na">N/A</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="flexitarian">Flexitarian</option>
                <option value="plant_based">Plant-based</option>
                <option value="raw_food">Raw food</option>
                <option value="whole_food_diet">Whole-food diet</option>
              </select>
            </div>

            {/* New fields: Religious / Cultural Diet */}
            <div className="mb-3">
              <label htmlFor="religiousCulturalDiets" className="form-label">Religious / Cultural Diet</label>
              <select
                className="form-select"
                id="religiousCulturalDiets"
                name="religiousCulturalDiets"
                value={formData.religiousCulturalDiets}
                onChange={handleChange}
              >
                <option value="na">N/A</option>
                <option value="halal">Halal</option>
                <option value="kosher">Kosher</option>
                <option value="jain">Jain</option>
                <option value="hindu_vegetarian_no_eggs">Hindu Vegetarian (No eggs)</option>
                <option value="buddhist_vegetarian">Buddhist Vegetarian</option>
                <option value="seventh_day_adventist">Seventh-day Adventist</option>
              </select>
            </div>

            {/* New fields: Allergens (multi-select) */}
            <div className="mb-3">
              <label className="form-label">Allergens</label>
              {["peanuts", "tree_nuts", "milk", "eggs", "wheat", "soy", "fish", "shellfish", "sesame"].map((a) => (
                <div key={a} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={a}
                    checked={formData.allergens.includes(a)}
                    onChange={(e) => {
                      let updatedAllergens = [...formData.allergens];
                      if (e.target.checked) {
                        updatedAllergens.push(a);
                      } else {
                        updatedAllergens = updatedAllergens.filter(x => x !== a);
                      }
                      setFormData({ ...formData, allergens: updatedAllergens });
                    }}
                  />
                  <label className="form-check-label" htmlFor={a}>
                    {a.replace('_', ' ').toUpperCase()}
                  </label>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-success mt-3">Save Changes</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AccountPage;