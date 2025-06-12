/*
  # Add School Performance KPIs and Daily Tasks

  1. New KPIs
    - Program Access (Free/Reduced vs Paid)
    - Breakfast Participation
    - Lunch Participation
    - Daily Reimbursement
    - ALC Revenue
    - MEQ (Meal Equivalent)
    - MPLH (Meals per Labor Hour)
    - EOD Tasks Completion

  2. New Tables
    - school_daily_metrics: Stores daily performance metrics for each school
    - eod_tasks: Stores end-of-day task completion status
*/

-- Create end of day tasks table
CREATE TABLE IF NOT EXISTS eod_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id),
  date date NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(school_id, date)
);

-- Create school daily metrics table
CREATE TABLE IF NOT EXISTS school_daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id),
  date date NOT NULL,
  total_enrollment int NOT NULL,
  free_reduced_count int NOT NULL,
  breakfast_count int NOT NULL,
  lunch_count int NOT NULL,
  reimbursement_amount decimal(10,2) NOT NULL,
  alc_revenue decimal(10,2) NOT NULL,
  meal_equivalents decimal(10,2) NOT NULL,
  labor_hours decimal(10,2) NOT NULL,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(school_id, date)
);

-- Add computed columns for derived metrics
ALTER TABLE school_daily_metrics ADD COLUMN IF NOT EXISTS program_access_rate 
  decimal(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_enrollment > 0 
    THEN (free_reduced_count::decimal / total_enrollment::decimal * 100) 
    ELSE 0 END
  ) STORED;

ALTER TABLE school_daily_metrics ADD COLUMN IF NOT EXISTS breakfast_participation_rate 
  decimal(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_enrollment > 0 
    THEN (breakfast_count::decimal / total_enrollment::decimal * 100) 
    ELSE 0 END
  ) STORED;

ALTER TABLE school_daily_metrics ADD COLUMN IF NOT EXISTS lunch_participation_rate 
  decimal(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_enrollment > 0 
    THEN (lunch_count::decimal / total_enrollment::decimal * 100) 
    ELSE 0 END
  ) STORED;

ALTER TABLE school_daily_metrics ADD COLUMN IF NOT EXISTS mplh 
  decimal(5,2) GENERATED ALWAYS AS (
    CASE WHEN labor_hours > 0 
    THEN (meal_equivalents / labor_hours) 
    ELSE 0 END
  ) STORED;

-- Enable RLS
ALTER TABLE eod_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_daily_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view EOD tasks for their district"
  ON eod_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = eod_tasks.district_id
      AND (
        users.role = 'director'
        OR (users.role = 'manager' AND users.school_id = eod_tasks.school_id)
      )
    )
  );

CREATE POLICY "Users can view school metrics for their district"
  ON school_daily_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = school_daily_metrics.district_id
      AND (
        users.role = 'director'
        OR (users.role = 'manager' AND users.school_id = school_daily_metrics.school_id)
      )
    )
  );

-- Insert sample schools
INSERT INTO schools (id, name, district_id)
VALUES
  (gen_random_uuid(), 'Washington Elementary', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  (gen_random_uuid(), 'Lincoln Middle School', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  (gen_random_uuid(), 'Roosevelt High School', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2')
ON CONFLICT DO NOTHING;