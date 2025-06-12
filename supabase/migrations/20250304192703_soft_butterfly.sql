-- Create diet_recipes table
CREATE TABLE diet_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('entree', 'side', 'breakfast', 'snack', 'dessert')),
  ingredients jsonb NOT NULL DEFAULT '[]',
  nutrition_info jsonb,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create diet_profile_recipes table for mapping compatible recipes to profiles
CREATE TABLE diet_profile_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_profile_id uuid NOT NULL REFERENCES diet_profiles(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES diet_recipes(id) ON DELETE CASCADE,
  is_verified boolean DEFAULT false,
  notes text,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(diet_profile_id, recipe_id)
);

-- Enable RLS
ALTER TABLE diet_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_profile_recipes ENABLE ROW LEVEL SECURITY;

-- Create policies for diet_recipes
CREATE POLICY "Users can view recipes in their district"
  ON diet_recipes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_recipes.district_id
    )
  );

CREATE POLICY "Directors can manage recipes"
  ON diet_recipes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_recipes.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_recipes.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for diet_profile_recipes
CREATE POLICY "Users can view profile recipes in their district"
  ON diet_profile_recipes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_profile_recipes.district_id
    )
  );

CREATE POLICY "Directors can manage profile recipes"
  ON diet_profile_recipes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_profile_recipes.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = diet_profile_recipes.district_id
      AND users.role = 'director'
    )
  );

-- Create indexes
CREATE INDEX idx_diet_recipes_district 
ON diet_recipes(district_id);

CREATE INDEX idx_diet_profile_recipes_profile 
ON diet_profile_recipes(diet_profile_id);

CREATE INDEX idx_diet_profile_recipes_recipe 
ON diet_profile_recipes(recipe_id);

-- Add updated_at triggers
CREATE TRIGGER update_diet_recipes_updated_at
  BEFORE UPDATE ON diet_recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_profile_recipes_updated_at
  BEFORE UPDATE ON diet_profile_recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample recipes
INSERT INTO diet_recipes (
  name,
  description,
  category,
  ingredients,
  nutrition_info,
  district_id
)
VALUES
  (
    'Gluten-Free Chicken Sandwich',
    'Grilled chicken breast on gluten-free bun with lettuce and tomato',
    'entree',
    '[
      {"name": "Gluten-free bun", "amount": "1 each"},
      {"name": "Chicken breast", "amount": "4 oz"},
      {"name": "Lettuce", "amount": "1 leaf"},
      {"name": "Tomato", "amount": "2 slices"}
    ]'::jsonb,
    '{
      "calories": 350,
      "protein": 28,
      "carbs": 35,
      "fat": 12
    }'::jsonb,
    'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  ),
  (
    'Dairy-Free Mac and "Cheese"',
    'Pasta with dairy-free cheese sauce made from nutritional yeast',
    'entree',
    '[
      {"name": "Gluten-free pasta", "amount": "1 cup"},
      {"name": "Nutritional yeast", "amount": "2 tbsp"},
      {"name": "Plant-based milk", "amount": "1/2 cup"},
      {"name": "Olive oil", "amount": "1 tbsp"}
    ]'::jsonb,
    '{
      "calories": 320,
      "protein": 12,
      "carbs": 45,
      "fat": 14
    }'::jsonb,
    'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  ),
  (
    'Nut-Free Energy Bites',
    'Seed-based energy bites made with sunflower butter',
    'snack',
    '[
      {"name": "Sunflower butter", "amount": "1/2 cup"},
      {"name": "Oats", "amount": "1 cup"},
      {"name": "Honey", "amount": "1/4 cup"},
      {"name": "Seeds", "amount": "1/4 cup"}
    ]'::jsonb,
    '{
      "calories": 120,
      "protein": 4,
      "carbs": 15,
      "fat": 7
    }'::jsonb,
    'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  );

-- Map recipes to diet profiles
WITH profiles AS (
  SELECT id, name FROM diet_profiles WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
),
recipes AS (
  SELECT id, name FROM diet_recipes WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
INSERT INTO diet_profile_recipes (
  diet_profile_id,
  recipe_id,
  is_verified,
  district_id
)
SELECT 
  p.id,
  r.id,
  true,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
FROM profiles p
CROSS JOIN recipes r
WHERE 
  (p.name = 'Gluten Free' AND r.name = 'Gluten-Free Chicken Sandwich') OR
  (p.name = 'Dairy Free' AND r.name = 'Dairy-Free Mac and "Cheese"') OR
  (p.name = 'Peanut Allergy' AND r.name = 'Nut-Free Energy Bites');