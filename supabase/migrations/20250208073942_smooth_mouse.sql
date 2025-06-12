/*
  # Fix RLS policies for dashboard access

  1. Changes
    - Add policies for users to access KPIs and KPI values
    - Update existing policies to use proper role checks
    - Ensure district-wide access for directors
    - Limit school managers to their school's data

  2. Security
    - Maintain RLS on all tables
    - Add proper role-based access control
    - Ensure data isolation between schools
*/

-- Update districts policy to check user role and district
DROP POLICY IF EXISTS "Users can view their district" ON districts;
CREATE POLICY "Users can view their district"
  ON districts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = districts.id
    )
  );

-- Update schools policy to check user role and district
DROP POLICY IF EXISTS "Users can view schools in their district" ON schools;
CREATE POLICY "Users can view schools in their district"
  ON schools FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = schools.district_id
      AND (
        users.role = 'director'
        OR (users.role = 'manager' AND users.school_id = schools.id)
      )
    )
  );

-- Update KPIs policy
DROP POLICY IF EXISTS "Users can view KPIs for their school/district" ON kpis;
CREATE POLICY "Users can view KPIs for their school/district"
  ON kpis FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = kpis.district_id
      AND (
        users.role = 'director'
        OR (
          users.role = 'manager'
          AND (
            kpis.school_id IS NULL
            OR kpis.school_id = users.school_id
          )
        )
      )
    )
  );

-- Update KPI values policy
DROP POLICY IF EXISTS "Users can view KPI values for their school/district" ON kpi_values;
CREATE POLICY "Users can view KPI values for their school/district"
  ON kpi_values FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = kpi_values.district_id
      AND (
        users.role = 'director'
        OR (
          users.role = 'manager'
          AND (
            kpi_values.school_id IS NULL
            OR kpi_values.school_id = users.school_id
          )
        )
      )
    )
  );

-- Update goals policy
DROP POLICY IF EXISTS "Users can view goals for their school/district" ON goals;
CREATE POLICY "Users can view goals for their school/district"
  ON goals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = goals.district_id
      AND (
        users.role = 'director'
        OR (
          users.role = 'manager'
          AND (
            goals.school_id IS NULL
            OR goals.school_id = users.school_id
          )
        )
      )
    )
  );