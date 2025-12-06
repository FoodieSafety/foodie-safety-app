# User Preferences - Frontend Integration Guide

This document provides the frontend team with all the information needed to integrate the new user preferences feature.

---

## Updated User Profile JSON Schema

The following shows the **before and after** JSON structure for user profile data:

````carousel
### Before (Old Schema)
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "zip_code": "12345",
  "created_at": "2025-12-06T14:00:00"
}
```
<!-- slide -->
### After (New Schema)
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "zip_code": "12345",
  "general_diet": "vegetarian",
  "religious_cultural_diets": "halal",
  "allergens": "peanuts,milk,eggs",
  "created_at": "2025-12-06T14:00:00"
}
```
````

---

## API Endpoints

### GET `/users` - Response Schema

When fetching the user profile, the API will return the following structure:

```json
{
  "first_name": "string",
  "last_name": "string",
  "zip_code": "string",
  "email": "string",
  "general_diet": "string",            // NEW - Single value, defaults to "na"
  "religious_cultural_diets": "string", // NEW - Single value, defaults to "na"
  "allergens": "string",               // NEW - Comma-separated, defaults to "na"
  "created_at": "datetime"
}
```

---

### PUT `/users` - Request Schema

When updating the user profile, send the following JSON body:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "zip_code": "12345",
  "password": "securepassword",
  "general_diet": "vegetarian",
  "religious_cultural_diets": "na",
  "allergens": "peanuts,milk"
}
```

> [!NOTE]
> The preference fields are **optional**. If not provided, they default to `"na"`.

---

### POST `/users` - Create User Request

New users can optionally include preferences during registration:

```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "zip_code": "54321",
  "password": "newpassword",
  "general_diet": "vegan",              // Optional, defaults to "na"
  "religious_cultural_diets": "kosher", // Optional, defaults to "na"
  "allergens": "tree_nuts,soy"          // Optional, defaults to "na"
}
```

---

## Valid Values Reference

Use this JSON as a reference for available options in dropdowns and checkboxes:

```json
{
  "general_diets": [
    { "key": "vegetarian", "display_text": "Vegetarian" },
    { "key": "vegan", "display_text": "Vegan" },
    { "key": "pescatarian", "display_text": "Pescatarian" },
    { "key": "flexitarian", "display_text": "Flexitarian" },
    { "key": "plant_based", "display_text": "Plant-based" },
    { "key": "raw_food", "display_text": "Raw food" },
    { "key": "whole_food_diet", "display_text": "Whole-food diet" },
    { "key": "na", "display_text": "N/A" }
  ],
  "religious_cultural_diets": [
    { "key": "halal", "display_text": "Halal" },
    { "key": "kosher", "display_text": "Kosher" },
    { "key": "jain", "display_text": "Jain" },
    { "key": "hindu_vegetarian_no_eggs", "display_text": "Hindu vegetarian (no eggs)" },
    { "key": "buddhist_vegetarian", "display_text": "Buddhist vegetarian" },
    { "key": "seventh_day_adventist", "display_text": "Seventh-day Adventist diet" },
    { "key": "na", "display_text": "N/A" }
  ],
  "allergens": [
    { "key": "peanuts", "display_text": "Peanuts" },
    { "key": "tree_nuts", "display_text": "Tree nuts (almond, cashew, walnut, pecan, hazelnut, pistachio, etc.)" },
    { "key": "milk", "display_text": "Milk" },
    { "key": "eggs", "display_text": "Eggs" },
    { "key": "wheat", "display_text": "Wheat" },
    { "key": "soy", "display_text": "Soy" },
    { "key": "fish", "display_text": "Fish" },
    { "key": "shellfish", "display_text": "Shellfish (shrimp, crab, lobster, etc.)" },
    { "key": "sesame", "display_text": "Sesame" },
    { "key": "na", "display_text": "N/A" }
  ]
}
```

---

## UI Component Recommendations

| Field | UI Component | Selection Type |
|-------|--------------|----------------|
| `general_diet` | Dropdown or Radio buttons | Single selection only |
| `religious_cultural_diets` | Dropdown or Radio buttons | Single selection only |
| `allergens` | Checkboxes or Multi-select | Multiple selections allowed |

---

## Code Snippets

### Parsing Allergens on Load

When loading user data, convert the comma-separated string to an array:

```javascript
const allergensArray = user.allergens 
  ? user.allergens.split(',').filter(a => a !== 'na' && a !== '')
  : [];
```

### Formatting Allergens on Save

When saving, convert the selected array back to a comma-separated string:

```javascript
const allergensString = selectedAllergens.length > 0 
  ? selectedAllergens.join(',') 
  : 'na';
```

### Example State in AccountPage.jsx

```javascript
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  zipCode: '',
  password: '',
  // NEW: Diet and Allergy Preferences
  generalDiet: 'na',
  religiousCulturalDiets: 'na',
  allergens: [],  // Array for UI, convert to string on save
});
```

### Example useEffect for Loading Preferences

```javascript
useEffect(() => {
  if (!loading && user) {
    setFormData({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      zipCode: user.zip_code || '',
      password: '',
      generalDiet: user.general_diet || 'na',
      religiousCulturalDiets: user.religious_cultural_diets || 'na',
      allergens: user.allergens 
        ? user.allergens.split(',').filter(a => a !== 'na') 
        : [],
    });
  }
}, [loading, user]);
```

### Example Save Handler

```javascript
const handleProfileSave = async () => {
  const updatedUser = {
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    zip_code: formData.zipCode,
    password: formData.password,
    // NEW: Include preferences
    general_diet: formData.generalDiet,
    religious_cultural_diets: formData.religiousCulturalDiets,
    allergens: formData.allergens.length > 0 
      ? formData.allergens.join(',') 
      : 'na',
  };
  
  // ... rest of save logic
};
```

---

## Related Files

- Backend implementation details: [Implementation Walkthrough](file:///Users/yuvaraj/.gemini/antigravity/brain/5c704c79-4798-46e9-9ef6-0863b7410b78/walkthrough.md)
- Frontend file to modify: [AccountPage.jsx](file:///Users/yuvaraj/Desktop/VT_Work/sem3/cap/foodie-safety-app/frontend/foodie-safety/src/AccountPage.jsx)
