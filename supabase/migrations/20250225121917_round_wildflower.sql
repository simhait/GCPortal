/*
  # Fix Staff Modules Table

  1. Changes
    - Safely check and update staff_modules table structure
    - Add missing columns and constraints
    - Update RLS policies
    - Add stored procedure for staff progress

  2. Security
    - Maintain existing RLS policies
    - Add additional security checks
*/

-- Safely update staff_modules table
DO $$ 
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'staff_modules' 
    AND column_name = 'district_id'
  ) THEN
    ALTER TABLE staff_modules 
    ADD COLUMN district_id uuid REFERENCES districts(id);

    -- Update existing records with district_id from users table
    UPDATE staff_modules sm
    SET district_id = u.district_id
    FROM users u
    WHERE sm.user_id = u.id;

    -- Make the column NOT NULL after updating existing records
    ALTER TABLE staff_modules 
    ALTER COLUMN district_id SET NOT NULL;
  END IF;

  -- Add other columns if they don't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'staff_modules' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE staff_modules 
    ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  -- Ensure unique constraint exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'staff_modules_user_id_module_id_key'
  ) THEN
    ALTER TABLE staff_modules
    ADD CONSTRAINT staff_modules_user_id_module_id_key 
    UNIQUE (user_id, module_id);
  END IF;

  -- Ensure indexes exist
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE indexname = 'idx_staff_modules_user_module'
  ) THEN
    CREATE INDEX idx_staff_modules_user_module 
    ON staff_modules(user_id, module_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE indexname = 'idx_staff_modules_district'
  ) THEN
    CREATE INDEX idx_staff_modules_district 
    ON staff_modules(district_id);
  END IF;
END $$;

-- Drop and recreate RLS policies to ensure they're up to date
DROP POLICY IF EXISTS "Users can view their assigned modules" ON staff_modules;
DROP POLICY IF EXISTS "Directors can manage staff modules" ON staff_modules;

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

-- Drop and recreate the function with improved error handling
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
  -- Verify the district exists
  IF NOT EXISTS (SELECT 1 FROM districts WHERE id = p_district_id) THEN
    RAISE EXCEPTION 'District not found';
  END IF;

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

-- Ensure the function is accessible
GRANT EXECUTE ON FUNCTION get_staff_learning_progress(uuid) TO authenticated;