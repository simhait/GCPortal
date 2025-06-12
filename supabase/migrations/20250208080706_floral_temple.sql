/*
  # Add sample school metrics data

  1. Changes
    - Insert sample daily metrics for each school
    - Add EOD task completion status
  
  2. Data Added
    - School daily metrics including:
      - Enrollment numbers
      - Meal counts
      - Revenue figures
      - Labor hours
    - EOD task completion status for each school
*/

-- Get school IDs for sample data
WITH school_ids AS (
  SELECT id, name
  FROM schools
  WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  LIMIT 3
)
-- Insert sample metrics for each school
INSERT INTO school_daily_metrics (
  school_id,
  date,
  total_enrollment,
  free_reduced_count,
  breakfast_count,
  lunch_count,
  reimbursement_amount,
  alc_revenue,
  meal_equivalents,
  labor_hours,
  district_id
)
SELECT
  id as school_id,
  CURRENT_DATE as date,
  CASE 
    WHEN name LIKE '%Elementary%' THEN 450
    WHEN name LIKE '%Middle%' THEN 750
    ELSE 1200
  END as total_enrollment,
  CASE 
    WHEN name LIKE '%Elementary%' THEN 315
    WHEN name LIKE '%Middle%' THEN 488
    ELSE 720
  END as free_reduced_count,
  CASE 
    WHEN name LIKE '%Elementary%' THEN 180
    WHEN name LIKE '%Middle%' THEN 263
    ELSE 360
  END as breakfast_count,
  CASE 
    WHEN name LIKE '%Elementary%' THEN 405
    WHEN name LIKE '%Middle%' THEN 600
    ELSE 840
  END as lunch_count,
  CASE 
    WHEN name LIKE '%Elementary%' THEN 2250.50
    WHEN name LIKE '%Middle%' THEN 3375.75
    ELSE 4725.25
  END as reimbursement_amount,
  CASE 
    WHEN name LIKE '%Elementary%' THEN 325.50
    WHEN name LIKE '%Middle%' THEN 675.25
    ELSE 1125.75
  END as alc_revenue,
  CASE 
    WHEN name LIKE '%Elementary%' THEN 450
    WHEN name LIKE '%Middle%' THEN 750
    ELSE 1050
  END as meal_equivalents,
  CASE 
    WHEN name LIKE '%Elementary%' THEN 24
    WHEN name LIKE '%Middle%' THEN 40
    ELSE 56
  END as labor_hours,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2' as district_id
FROM school_ids
ON CONFLICT (school_id, date) DO UPDATE
SET
  total_enrollment = EXCLUDED.total_enrollment,
  free_reduced_count = EXCLUDED.free_reduced_count,
  breakfast_count = EXCLUDED.breakfast_count,
  lunch_count = EXCLUDED.lunch_count,
  reimbursement_amount = EXCLUDED.reimbursement_amount,
  alc_revenue = EXCLUDED.alc_revenue,
  meal_equivalents = EXCLUDED.meal_equivalents,
  labor_hours = EXCLUDED.labor_hours;

-- Insert EOD task completion status
WITH school_ids AS (
  SELECT id
  FROM schools
  WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  LIMIT 3
)
INSERT INTO eod_tasks (
  school_id,
  date,
  completed,
  completed_at,
  district_id
)
SELECT
  id as school_id,
  CURRENT_DATE as date,
  true as completed,
  now() as completed_at,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2' as district_id
FROM school_ids
ON CONFLICT (school_id, date) DO UPDATE
SET
  completed = EXCLUDED.completed,
  completed_at = EXCLUDED.completed_at;