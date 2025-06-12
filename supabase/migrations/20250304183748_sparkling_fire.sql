-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS student_diets CASCADE;
DROP TABLE IF EXISTS diet_restrictions CASCADE;
DROP TABLE IF EXISTS diet_profiles CASCADE;
DROP TABLE IF EXISTS diet_ingredients CASCADE;
DROP TABLE IF EXISTS diet_categories CASCADE;

-- Recreate tables with proper relationships
CREATE TABLE diet_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, district_id)
);

CREATE TABLE diet_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, district_id)
);

CREATE TABLE diet_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid NOT NULL REFERENCES diet_categories(id),
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE diet_restrictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_profile_id uuid NOT NULL REFERENCES diet_profiles(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES diet_ingredients(id),
  notes text,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(diet_profile_id, ingredient_id)
);

CREATE TABLE student_diets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL,
  diet_profile_id uuid NOT NULL REFERENCES diet_profiles(id),
  school_id uuid NOT NULL REFERENCES schools(id),
  is_active boolean DEFAULT true,
  start_date date NOT NULL,
  end_date date,
  notes text,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, diet_profile_id)
);

-- Enable RLS
ALTER TABLE diet_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_diets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view categories in their district"
  ON diet_categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_categories.district_id
    )
  );

CREATE POLICY "Users can view ingredients in their district"
  ON diet_ingredients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_ingredients.district_id
    )
  );

CREATE POLICY "Users can view profiles in their district"
  ON diet_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_profiles.district_id
    )
  );

CREATE POLICY "Users can view restrictions in their district"
  ON diet_restrictions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_restrictions.district_id
    )
  );

CREATE POLICY "Users can view student diets in their district"
  ON student_diets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = student_diets.district_id
    )
  );

-- Insert initial categories
INSERT INTO diet_categories (name, description, district_id)
VALUES 
  ('Food Allergy', 'Dietary restrictions due to food allergies', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Religious', 'Dietary restrictions based on religious requirements', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Medical', 'Dietary restrictions for medical conditions', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Lifestyle', 'Dietary choices such as vegetarian or vegan', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2')
ON CONFLICT DO NOTHING;

-- Insert common allergens
INSERT INTO diet_ingredients (name, description, district_id)
VALUES
  ('Peanuts', 'Peanuts and peanut-derived ingredients', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Tree Nuts', 'All tree nuts including almonds, walnuts, etc.', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Milk', 'Dairy milk and milk products', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Eggs', 'Eggs and egg-derived ingredients', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Soy', 'Soybeans and soy-derived ingredients', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Wheat', 'Wheat and wheat-derived ingredients', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Fish', 'Fish and fish products', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Shellfish', 'Shellfish and shellfish products', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Pork', 'Pork and pork products', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Beef', 'Beef and beef products', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2')
ON CONFLICT DO NOTHING;

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