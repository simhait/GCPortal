/*
  # Add GL Mapping Support

  1. New Tables
    - gl_accounts: Stores GL account information
    - gl_mappings: Maps financial data points to GL accounts
    - gl_export_configs: Stores export file configuration
    - gl_export_logs: Tracks export history

  2. Security
    - Enable RLS on all tables
    - Only directors can manage GL configurations
    - All users can view configurations
*/

-- Create gl_accounts table
CREATE TABLE gl_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number text NOT NULL,
  description text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_number, district_id)
);

-- Create gl_mappings table
CREATE TABLE gl_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_point text NOT NULL,
  data_type text NOT NULL CHECK (data_type IN ('revenue', 'expense')),
  gl_account_id uuid NOT NULL REFERENCES gl_accounts(id),
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(data_point, data_type, district_id)
);

-- Create gl_export_configs table
CREATE TABLE gl_export_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  file_format text NOT NULL CHECK (file_format IN ('csv', 'json', 'xml')),
  delimiter text,
  date_format text,
  field_mappings jsonb NOT NULL DEFAULT '{}',
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gl_export_logs table
CREATE TABLE gl_export_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid NOT NULL REFERENCES gl_export_configs(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'error', 'processing')),
  error_message text,
  file_url text,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gl_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_export_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_export_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for gl_accounts
CREATE POLICY "Users can view GL accounts in their district"
  ON gl_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_accounts.district_id
    )
  );

CREATE POLICY "Directors can manage GL accounts"
  ON gl_accounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_accounts.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_accounts.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for gl_mappings
CREATE POLICY "Users can view GL mappings in their district"
  ON gl_mappings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_mappings.district_id
    )
  );

CREATE POLICY "Directors can manage GL mappings"
  ON gl_mappings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_mappings.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_mappings.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for gl_export_configs
CREATE POLICY "Users can view export configs in their district"
  ON gl_export_configs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_export_configs.district_id
    )
  );

CREATE POLICY "Directors can manage export configs"
  ON gl_export_configs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_export_configs.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_export_configs.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for gl_export_logs
CREATE POLICY "Users can view export logs in their district"
  ON gl_export_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_export_logs.district_id
    )
  );

CREATE POLICY "Directors can manage export logs"
  ON gl_export_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_export_logs.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = gl_export_logs.district_id
      AND users.role = 'director'
    )
  );

-- Create indexes
CREATE INDEX idx_gl_accounts_district 
ON gl_accounts(district_id);

CREATE INDEX idx_gl_mappings_district 
ON gl_mappings(district_id);

CREATE INDEX idx_gl_mappings_account 
ON gl_mappings(gl_account_id);

CREATE INDEX idx_gl_export_configs_district 
ON gl_export_configs(district_id);

CREATE INDEX idx_gl_export_logs_district 
ON gl_export_logs(district_id);

CREATE INDEX idx_gl_export_logs_config 
ON gl_export_logs(config_id);

-- Add updated_at triggers
CREATE TRIGGER update_gl_accounts_updated_at
  BEFORE UPDATE ON gl_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gl_mappings_updated_at
  BEFORE UPDATE ON gl_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gl_export_configs_updated_at
  BEFORE UPDATE ON gl_export_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gl_export_logs_updated_at
  BEFORE UPDATE ON gl_export_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample GL accounts
INSERT INTO gl_accounts (
  account_number,
  description,
  account_type,
  district_id
)
VALUES
  ('4100', 'Federal Reimbursements', 'revenue', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('4200', 'State Reimbursements', 'revenue', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('4300', 'A La Carte Sales', 'revenue', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('4400', 'Catering Revenue', 'revenue', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('5100', 'Food Costs', 'expense', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('5200', 'Labor Costs', 'expense', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('5300', 'Supplies', 'expense', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('5400', 'Equipment', 'expense', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2')
ON CONFLICT DO NOTHING;

-- Insert sample GL mappings
INSERT INTO gl_mappings (
  data_point,
  data_type,
  gl_account_id,
  district_id
)
SELECT
  data_point,
  data_type,
  gl_accounts.id,
  gl_accounts.district_id
FROM (
  VALUES
    ('federal_reimbursement', 'revenue', '4100'),
    ('state_reimbursement', 'revenue', '4200'),
    ('alc_revenue', 'revenue', '4300'),
    ('catering_revenue', 'revenue', '4400'),
    ('food_cost', 'expense', '5100'),
    ('labor_cost', 'expense', '5200'),
    ('supplies_cost', 'expense', '5300'),
    ('equipment_cost', 'expense', '5400')
) AS data(data_point, data_type, account_number)
JOIN gl_accounts ON gl_accounts.account_number = data.account_number
WHERE gl_accounts.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
ON CONFLICT DO NOTHING;

-- Insert sample export config
INSERT INTO gl_export_configs (
  name,
  description,
  file_format,
  delimiter,
  date_format,
  field_mappings,
  district_id
)
VALUES (
  'Default Export',
  'Standard GL export configuration',
  'csv',
  ',',
  'YYYY-MM-DD',
  '{
    "header": true,
    "fields": [
      {"name": "date", "source": "transaction_date", "format": "YYYY-MM-DD"},
      {"name": "account", "source": "gl_account"},
      {"name": "description", "source": "transaction_description"},
      {"name": "amount", "source": "amount", "format": "decimal"}
    ]
  }'::jsonb,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
ON CONFLICT DO NOTHING;