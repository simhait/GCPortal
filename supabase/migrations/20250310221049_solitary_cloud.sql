/*
  # Course Module Mapping RLS Policies

  1. Security
    - Enable RLS on sys_course_module_mapping table
    - Add policies for:
      - Insert: Allow directors to add module mappings
      - Select: Allow authenticated users to view module mappings
      - Delete: Allow directors to delete module mappings

  2. Changes
    - Enable RLS
    - Add insert policy
    - Add select policy
    - Add delete policy
*/

-- Enable RLS
ALTER TABLE sys_course_module_mapping ENABLE ROW LEVEL SECURITY;

-- Allow directors to insert module mappings
CREATE POLICY "Directors can insert course module mappings"
  ON sys_course_module_mapping
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'director'
    )
  );

-- Allow all authenticated users to view module mappings
CREATE POLICY "Authenticated users can view course module mappings"
  ON sys_course_module_mapping
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow directors to delete module mappings
CREATE POLICY "Directors can delete course module mappings"
  ON sys_course_module_mapping
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'director'
    )
  );