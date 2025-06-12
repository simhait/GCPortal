/*
  # Add School Benchmarks

  1. New Tables
    - `school_benchmarks`
      - `id` (uuid, primary key)
      - `school_id` (uuid, references schools)
      - `kpi_id` (uuid, references kpis)
      - `benchmark` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `school_benchmarks` table
    - Add policies for authenticated users
*/

-- Create school_benchmarks table
CREATE TABLE school_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id),
  kpi_id uuid NOT NULL REFERENCES kpis(id),
  benchmark numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, kpi_id)
);

-- Enable RLS
ALTER TABLE school_benchmarks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view benchmarks for their district"
  ON school_benchmarks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = (
        SELECT district_id FROM schools WHERE id = school_benchmarks.school_id
      )
    )
  );

CREATE POLICY "Users can update benchmarks for their schools"
  ON school_benchmarks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role = 'director'
        OR (
          users.role = 'manager'
          AND users.school_id = school_benchmarks.school_id
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role = 'director'
        OR (
          users.role = 'manager'
          AND users.school_id = school_benchmarks.school_id
        )
      )
    )
  );

CREATE POLICY "Users can insert benchmarks for their schools"
  ON school_benchmarks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role = 'director'
        OR (
          users.role = 'manager'
          AND users.school_id = school_benchmarks.school_id
        )
      )
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_school_benchmarks_updated_at
  BEFORE UPDATE ON school_benchmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();