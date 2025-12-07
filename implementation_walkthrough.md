## Database Migration Required

> [!IMPORTANT]
> Run the following SQL on your MySQL database to add the new columns:

```sql
ALTER TABLE users 
ADD COLUMN general_diet VARCHAR(50) DEFAULT 'na',
ADD COLUMN religious_cultural_diets VARCHAR(50) DEFAULT 'na',
ADD COLUMN allergens VARCHAR(500) DEFAULT 'na';
```

---

## New Data Fields

| Field | Type | Values |
|-------|------|--------|
| `general_diet` | Single value | `vegetarian`, `vegan`, `pescatarian`, `flexitarian`, `plant_based`, `raw_food`, `whole_food_diet`, `na` |
| `religious_cultural_diets` | Single value | `halal`, `kosher`, `jain`, `hindu_vegetarian_no_eggs`, `buddhist_vegetarian`, `seventh_day_adventist`, `na` |
| `allergens` | Comma-separated | `peanuts`, `tree_nuts`, `milk`, `eggs`, `wheat`, `soy`, `fish`, `shellfish`, `sesame`, `na` |

---

## Next Steps

1. **Run the SQL migration** on your MySQL database
2. **Update the frontend** [AccountPage.jsx](file:///Users/yuvaraj/Desktop/VT_Work/sem3/cap/foodie-safety-app/frontend/foodie-safety/src/AccountPage.jsx) to include UI controls for selecting preferences (see [Frontend Walkthrough](file:///Users/yuvaraj/.gemini/antigravity/brain/5c704c79-4798-46e9-9ef6-0863b7410b78/frontend_walkthrough.md))
3. **Test the API** by sending a PUT request to `/users` with the new fields
