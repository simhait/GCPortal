/*
  # Add GL Mapping Support

  1. New Tables
    - gl_mapping_categories: Stores categories for GL mappings
    - gl_mapping_rules: Stores mapping rules and conditions
    - gl_mapping_templates: Stores reusable mapping templates

  2. Security
    - Enable RLS on all tables
    - Only directors can manage mappings
    - All users can view mappings
*/

-- Create gl_mapping_categories table
CREATE TABLE gl_mapping_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name, district_id)
);

-- Create gl_mapping_rules table
CREATE TABLE gl_mapping_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES gl_mapping_categories(id),
  data_point text NOT NULL,
  gl_account_id uuid NOT NULL REFERENCES gl_accounts(id),
  conditions jsonb DEFAULT '{}',
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gl_mapping_templates table
CREATE TABLE gl_mapping_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  mappings jsonb NOT NULL DEFAULT '[]',
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gl_mapping_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_mapping_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_mapping_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for gl_mapping_categories
CREATE POLICY "Users can view mapping categories in their district"
  ON gl_mapping_categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_mapping_categories.district_id
    )
  );

CREATE POLICY "Directors can manage mapping categories"
  ON gl_mapping_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_mapping_categories.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_mapping_categories.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for gl_mapping_rules
CREATE POLICY "Users can view mapping rules in their district"
  ON gl_mapping_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_mapping_rules.district_id
    )
  );

CREATE POLICY "Directors can manage mapping rules"
  ON gl_mapping_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_mapping_rules.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_mapping_rules.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for gl_mapping_templates
CREATE POLICY "Users can view mapping templates in their district"
  ON gl_mapping_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_mapping_templates.district_id
    )
  );

CREATE POLICY "Directors can manage mapping templates"
  ON gl_mapping_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_mapping_templates.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_mapping_templates.district_id
      AND users.role = 'director'
    )
  );

-- Create indexes
CREATE INDEX idx_gl_mapping_categories_district 
ON gl_mapping_categories(district_id);

CREATE INDEX idx_gl_mapping_rules_category 
ON gl_mapping_rules(category_id);

CREATE INDEX idx_gl_mapping_rules_account 
ON gl_mapping_rules(gl_account_id);

CREATE INDEX idx_gl_mapping_rules_district 
ON gl_mapping_rules(district_id);

CREATE INDEX idx_gl_mapping_templates_district 
ON gl_mapping_templates(district_id);

-- Add updated_at triggers
CREATE TRIGGER update_gl_mapping_categories_updated_at
  BEFORE UPDATE ON gl_mapping_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gl_mapping_rules_updated_at
  BEFORE UPDATE ON gl_mapping_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gl_mapping_templates_updated_at
  BEFORE UPDATE ON gl_mapping_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample mapping categories
INSERT INTO gl_mapping_categories (
  name,
  description,
  district_id
)
VALUES
  ('Revenue', 'Revenue mapping rules', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Expenses', 'Expense mapping rules', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Inventory', 'Inventory mapping rules', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('Labor', 'Labor cost mapping rules', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2')
ON CONFLICT DO NOTHING;

-- Insert sample mapping rules
WITH categories AS (
  SELECT id, name FROM gl_mapping_categories 
  WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
),
accounts AS (
  SELECT id, account_number FROM gl_accounts 
  WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
INSERT INTO gl_mapping_rules (
  category_id,
  data_point,
  gl_account_id,
  conditions,
  district_id
)
SELECT
  c.id,
  data_point,
  a.id,
  conditions::jsonb,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
FROM (
  VALUES
    ('Revenue', 'federal_reimbursement', '4100', '{"program": ["NSLP", "SBP"]}'),
    ('Revenue', 'state_reimbursement', '4200', '{"program": ["State Match"]}'),
    ('Revenue', 'alc_revenue', '4300', '{}'),
    ('Expenses', 'food_cost', '5100', '{}'),
    ('Labor', 'labor_cost', '5200', '{"type": ["Regular", "Overtime"]}')
) AS data(category_name, data_point, account_number, conditions)
JOIN categories c ON c.name = data.category_name
JOIN accounts a ON a.account_number = data.account_number
ON CONFLICT DO NOTHING;

-- Insert sample mapping template
INSERT INTO gl_mapping_templates (
  name,
  description,
  mappings,
  district_id
)
VALUES (
  'Standard Mapping',
  'Default mapping template for nutrition program',
  '[
    {
      "source": "federal_reimbursement",
      "target": "4100",
      "conditions": {
        "program": ["NSLP", "SBP"]
      }
    },
    {
      "source": "state_reimbursement",
      "target": "4200",
      "conditions": {
        "program": ["State Match"]
      }
    },
    {
      "source": "alc_revenue",
      "target": "4300",
      "conditions": {}
    },
    {
      "source": "food_cost",
      "target": "5100",
      "conditions": {}
    },
    {
      "source": "labor_cost",
      "target": "5200",
      "conditions": {
        "type": ["Regular", "Overtime"]
      }
    }
  ]'::jsonb,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
ON CONFLICT DO NOTHING;