-- Add foreign key relationships for diet tables
ALTER TABLE diet_profiles
DROP CONSTRAINT IF EXISTS diet_profiles_category_id_fkey,
ADD CONSTRAINT diet_profiles_category_id_fkey
  FOREIGN KEY (category_id)
  REFERENCES diet_categories(id)
  ON DELETE CASCADE;

ALTER TABLE diet_restrictions
DROP CONSTRAINT IF EXISTS diet_restrictions_diet_profile_id_fkey,
ADD CONSTRAINT diet_restrictions_diet_profile_id_fkey
  FOREIGN KEY (diet_profile_id)
  REFERENCES diet_profiles(id)
  ON DELETE CASCADE;

ALTER TABLE diet_restrictions
DROP CONSTRAINT IF EXISTS diet_restrictions_ingredient_id_fkey,
ADD CONSTRAINT diet_restrictions_ingredient_id_fkey
  FOREIGN KEY (ingredient_id)
  REFERENCES diet_ingredients(id)
  ON DELETE CASCADE;

-- Add sample diet profiles
WITH allergy_category AS (
  SELECT id FROM diet_categories WHERE name = 'Food Allergy' LIMIT 1
),
peanut_ingredient AS (
  SELECT id FROM diet_ingredients WHERE name = 'Peanuts' LIMIT 1
),
milk_ingredient AS (
  SELECT id FROM diet_ingredients WHERE name = 'Milk' LIMIT 1
)
INSERT INTO diet_profiles (
  name,
  description,
  category_id,
  district_id
)
SELECT
  'Peanut Allergy',
  'Student has severe peanut allergy - no peanut products allowed',
  allergy_category.id,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
FROM allergy_category
UNION ALL
SELECT
  'Dairy Free',
  'Student cannot consume dairy products',
  allergy_category.id,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
FROM allergy_category;

-- Add restrictions for the profiles
WITH peanut_profile AS (
  SELECT id FROM diet_profiles WHERE name = 'Peanut Allergy' LIMIT 1
),
dairy_profile AS (
  SELECT id FROM diet_profiles WHERE name = 'Dairy Free' LIMIT 1
),
peanut_ingredient AS (
  SELECT id FROM diet_ingredients WHERE name = 'Peanuts' LIMIT 1
),
milk_ingredient AS (
  SELECT id FROM diet_ingredients WHERE name = 'Milk' LIMIT 1
)
INSERT INTO diet_restrictions (
  diet_profile_id,
  ingredient_id,
  notes,
  district_id
)
SELECT
  peanut_profile.id,
  peanut_ingredient.id,
  'Severe allergy - strict avoidance required',
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
FROM peanut_profile, peanut_ingredient
UNION ALL
SELECT
  dairy_profile.id,
  milk_ingredient.id,
  'No dairy products allowed',
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
FROM dairy_profile, milk_ingredient;

-- Add sample student assignments
WITH peanut_profile AS (
  SELECT id FROM diet_profiles WHERE name = 'Peanut Allergy' LIMIT 1
),
dairy_profile AS (
  SELECT id FROM diet_profiles WHERE name = 'Dairy Free' LIMIT 1
),
schools AS (
  SELECT id, name FROM schools WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
INSERT INTO student_diets (
  student_id,
  diet_profile_id,
  school_id,
  is_active,
  start_date,
  district_id
)
SELECT
  'S' || generate_series(1000, 1050)::text,
  CASE WHEN random() < 0.5 
    THEN (SELECT id FROM peanut_profile) 
    ELSE (SELECT id FROM dairy_profile) 
  END,
  schools.id,
  true,
  CURRENT_DATE - interval '30 days',
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
FROM schools
CROSS JOIN generate_series(1, 10);