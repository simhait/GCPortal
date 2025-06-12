/*
  # Add Budget Management Support

  1. New Tables
    - budgets: Stores annual budget information
    - budget_line_items: Stores individual budget items
    - budget_allocations: Stores monthly budget allocations
    - budget_revisions: Tracks budget changes
    - budget_forecasts: Stores enrollment-based forecasts

  2. Security
    - Enable RLS on all tables
    - Only directors can manage budgets
    - All users can view budgets
*/

-- Create budgets table
CREATE TABLE budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year integer NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  district_id uuid NOT NULL REFERENCES districts(id),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(fiscal_year, district_id)
);

-- Create budget_line_items table
CREATE TABLE budget_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('food', 'labor', 'equipment', 'overhead')),
  subcategory text,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  notes text,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create budget_allocations table
CREATE TABLE budget_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  line_item_id uuid NOT NULL REFERENCES budget_line_items(id) ON DELETE CASCADE,
  month date NOT NULL,
  amount numeric(12,2) NOT NULL,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(line_item_id, month)
);

-- Create budget_revisions table
CREATE TABLE budget_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  line_item_id uuid NOT NULL REFERENCES budget_line_items(id) ON DELETE CASCADE,
  previous_amount numeric(12,2) NOT NULL,
  new_amount numeric(12,2) NOT NULL,
  reason text NOT NULL,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Create budget_forecasts table
CREATE TABLE budget_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  enrollment_count integer NOT NULL,
  food_cost_per_meal numeric(12,2) NOT NULL,
  labor_cost_per_meal numeric(12,2) NOT NULL,
  overhead_percentage numeric(5,2) NOT NULL,
  total_forecast numeric(12,2) NOT NULL,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_forecasts ENABLE ROW LEVEL SECURITY;

-- Create policies for budgets
CREATE POLICY "Users can view budgets in their district"
  ON budgets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budgets.district_id
    )
  );

CREATE POLICY "Directors can manage budgets"
  ON budgets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budgets.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budgets.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for budget_line_items
CREATE POLICY "Users can view budget line items in their district"
  ON budget_line_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budget_line_items.district_id
    )
  );

CREATE POLICY "Directors can manage budget line items"
  ON budget_line_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budget_line_items.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budget_line_items.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for budget_allocations
CREATE POLICY "Users can view budget allocations in their district"
  ON budget_allocations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budget_allocations.district_id
    )
  );

CREATE POLICY "Directors can manage budget allocations"
  ON budget_allocations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budget_allocations.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budget_allocations.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for budget_revisions
CREATE POLICY "Users can view budget revisions in their district"
  ON budget_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budget_revisions.district_id
    )
  );

CREATE POLICY "Directors can manage budget revisions"
  ON budget_revisions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budget_revisions.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budget_revisions.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for budget_forecasts
CREATE POLICY "Users can view budget forecasts in their district"
  ON budget_forecasts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budget_forecasts.district_id
    )
  );

CREATE POLICY "Directors can manage budget forecasts"
  ON budget_forecasts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budget_forecasts.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = budget_forecasts.district_id
      AND users.role = 'director'
    )
  );

-- Create indexes
CREATE INDEX idx_budgets_district 
ON budgets(district_id);

CREATE INDEX idx_budgets_fiscal_year 
ON budgets(fiscal_year);

CREATE INDEX idx_budget_line_items_budget 
ON budget_line_items(budget_id);

CREATE INDEX idx_budget_line_items_district 
ON budget_line_items(district_id);

CREATE INDEX idx_budget_allocations_budget 
ON budget_allocations(budget_id);

CREATE INDEX idx_budget_allocations_line_item 
ON budget_allocations(line_item_id);

CREATE INDEX idx_budget_revisions_budget 
ON budget_revisions(budget_id);

CREATE INDEX idx_budget_revisions_line_item 
ON budget_revisions(line_item_id);

CREATE INDEX idx_budget_forecasts_budget 
ON budget_forecasts(budget_id);

-- Add updated_at triggers
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_line_items_updated_at
  BEFORE UPDATE ON budget_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_allocations_updated_at
  BEFORE UPDATE ON budget_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_forecasts_updated_at
  BEFORE UPDATE ON budget_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample budget data
WITH new_budget AS (
  INSERT INTO budgets (
    fiscal_year,
    total_amount,
    status,
    district_id,
    created_by
  )
  SELECT
    2025,
    1500000.00,
    'active',
    'd7c01812-80ae-4662-8f5e-4ab37a46f3e2',
    (SELECT id FROM users WHERE email = 'director@demo.com' LIMIT 1)
  RETURNING id
)
INSERT INTO budget_line_items (
  budget_id,
  category,
  subcategory,
  description,
  amount,
  district_id
)
SELECT
  new_budget.id,
  category,
  subcategory,
  description,
  amount,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
FROM new_budget,
(VALUES
  ('food', 'ingredients', 'Raw Food Cost', 600000.00),
  ('food', 'processing', 'Food Processing', 100000.00),
  ('labor', 'salaries', 'Kitchen Staff Salaries', 450000.00),
  ('labor', 'benefits', 'Employee Benefits', 150000.00),
  ('equipment', 'maintenance', 'Equipment Maintenance', 75000.00),
  ('equipment', 'replacement', 'Equipment Replacement', 50000.00),
  ('overhead', 'utilities', 'Utilities', 45000.00),
  ('overhead', 'supplies', 'Kitchen Supplies', 30000.00)
) AS data(category, subcategory, description, amount);