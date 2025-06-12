-- Create quiz_attempts table
CREATE TABLE quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  module_id text NOT NULL,
  score integer NOT NULL,
  passed boolean NOT NULL,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create staff_modules table
CREATE TABLE staff_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  module_id text NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  due_date date,
  completed_at timestamptz,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_modules ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_attempts
CREATE POLICY "Users can view their own quiz attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = quiz_attempts.district_id
      AND users.role = 'director'
    )
  );

CREATE POLICY "Users can insert their own quiz attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for staff_modules
CREATE POLICY "Users can view their assigned modules"
  ON staff_modules FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = staff_modules.district_id
      AND users.role = 'director'
    )
  );

CREATE POLICY "Directors can manage staff modules"
  ON staff_modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = staff_modules.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = staff_modules.district_id
      AND users.role = 'director'
    )
  );

-- Create indexes
CREATE INDEX idx_quiz_attempts_user_module 
ON quiz_attempts(user_id, module_id);

CREATE INDEX idx_quiz_attempts_district 
ON quiz_attempts(district_id);

CREATE INDEX idx_staff_modules_user_module 
ON staff_modules(user_id, module_id);

CREATE INDEX idx_staff_modules_district 
ON staff_modules(district_id);

-- Add updated_at triggers
CREATE TRIGGER update_quiz_attempts_updated_at
  BEFORE UPDATE ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_modules_updated_at
  BEFORE UPDATE ON staff_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get staff learning progress
CREATE OR REPLACE FUNCTION get_staff_learning_progress(p_district_id uuid)
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  email text,
  module_id text,
  assigned_at timestamptz,
  due_date date,
  completed_at timestamptz,
  quiz_attempts json
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    sm.module_id,
    sm.assigned_at,
    sm.due_date,
    sm.completed_at,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', qa.id,
            'score', qa.score,
            'passed', qa.passed,
            'created_at', qa.created_at
          )
          ORDER BY qa.created_at DESC
        )
        FROM quiz_attempts qa
        WHERE qa.user_id = u.id
        AND qa.module_id = sm.module_id
      ),
      '[]'::json
    ) as quiz_attempts
  FROM users u
  LEFT JOIN staff_modules sm ON sm.user_id = u.id
  WHERE u.role = 'manager'
  AND u.district_id = p_district_id;
END;
$$ LANGUAGE plpgsql;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_staff_learning_progress(uuid) TO authenticated;