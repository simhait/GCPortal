-- Create learning_resources table
CREATE TABLE learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('video', 'document', 'link')),
  url text NOT NULL,
  thumbnail_url text,
  duration text,
  size text,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create learning_module_resources table for associating resources with modules
CREATE TABLE learning_module_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text NOT NULL,
  resource_id uuid NOT NULL REFERENCES learning_resources(id),
  order_index integer NOT NULL,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(module_id, resource_id)
);

-- Enable RLS
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_module_resources ENABLE ROW LEVEL SECURITY;

-- Create policies for learning_resources
CREATE POLICY "Users can view resources in their district"
  ON learning_resources FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = learning_resources.district_id
    )
  );

CREATE POLICY "Directors can manage resources"
  ON learning_resources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = learning_resources.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = learning_resources.district_id
      AND users.role = 'director'
    )
  );

-- Create policies for learning_module_resources
CREATE POLICY "Users can view module resources in their district"
  ON learning_module_resources FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = learning_module_resources.district_id
    )
  );

CREATE POLICY "Directors can manage module resources"
  ON learning_module_resources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = learning_module_resources.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = learning_module_resources.district_id
      AND users.role = 'director'
    )
  );

-- Create indexes
CREATE INDEX idx_learning_resources_district 
ON learning_resources(district_id);

CREATE INDEX idx_learning_module_resources_module 
ON learning_module_resources(module_id);

CREATE INDEX idx_learning_module_resources_district 
ON learning_module_resources(district_id);

-- Add updated_at triggers
CREATE TRIGGER update_learning_resources_updated_at
  BEFORE UPDATE ON learning_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_module_resources_updated_at
  BEFORE UPDATE ON learning_module_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();