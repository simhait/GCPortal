-- Create diet_categories table
CREATE TABLE diet_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, district_id)
);

-- Create diet_ingredients table
CREATE TABLE diet_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, district_id)
);

-- Create diet_profiles table
CREATE TABLE diet_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid NOT NULL REFERENCES diet_categories(id),
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create diet_restrictions table
CREATE TABLE diet_restrictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_profile_id uuid NOT NULL REFERENCES diet_profiles(id),
  ingredient_id uuid NOT NULL REFERENCES diet_ingredients(id),
  notes text,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(diet_profile_id, ingredient_id)
);

-- Create student_diets table
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

-- Create policies for diet_categories
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

CREATE POLICY "Directors can manage categories"
  ON diet_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_categories.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_categories.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for diet_ingredients
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

CREATE POLICY "Directors can manage ingredients"
  ON diet_ingredients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_ingredients.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_ingredients.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for diet_profiles
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

CREATE POLICY "Directors can manage profiles"
  ON diet_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_profiles.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_profiles.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for diet_restrictions
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

CREATE POLICY "Directors can manage restrictions"
  ON diet_restrictions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_restrictions.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_restrictions.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for student_diets
CREATE POLICY "Users can view student diets in their district/school"
  ON student_diets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = student_diets.district_id
      AND (
        users.role = 'director'
        OR (
          users.role = 'manager'
          AND users.school_id = student_diets.school_id
        )
      )
    )
  );

CREATE POLICY "Directors can manage student diets"
  ON student_diets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = student_diets.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = student_diets.district_id
      AND users.role = 'director'
    )
  );

-- Create indexes
CREATE INDEX idx_diet_categories_district 
ON diet_categories(district_id);

CREATE INDEX idx_diet_ingredients_district 
ON diet_ingredients(district_id);

CREATE INDEX idx_diet_profiles_district 
ON diet_profiles(district_id);

CREATE INDEX idx_diet_profiles_category 
ON diet_profiles(category_id);

CREATE INDEX idx_diet_restrictions_profile 
ON diet_restrictions(diet_profile_id);

CREATE INDEX idx_diet_restrictions_ingredient 
ON diet_restrictions(ingredient_id);

CREATE INDEX idx_student_diets_student 
ON student_diets(student_id);

CREATE INDEX idx_student_diets_school 
ON student_diets(school_id);

CREATE INDEX idx_student_diets_profile 
ON student_diets(diet_profile_id);

CREATE INDEX idx_student_diets_district 
ON student_diets(district_id);

-- Add updated_at triggers
CREATE TRIGGER update_diet_categories_updated_at
  BEFORE UPDATE ON diet_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_ingredients_updated_at
  BEFORE UPDATE ON diet_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_profiles_updated_at
  BEFORE UPDATE ON diet_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_restrictions_updated_at
  BEFORE UPDATE ON diet_restrictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_diets_updated_at
  BEFORE UPDATE ON student_diets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial diet categories
INSERT INTO diet_categories (name, description, district_id)
VALUES 
  ('Food Allergy', 'Dietary restrictions due to food allergies', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Religious', 'Dietary restrictions based on religious requirements', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Medical', 'Dietary restrictions for medical conditions', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Lifestyle', 'Dietary choices such as vegetarian or vegan', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2')
ON CONFLICT DO NOTHING;

-- Insert common allergens/ingredients
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