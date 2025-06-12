/*
  # Update district name and schools

  1. Changes
    - Update district name to "Cybersoft ISD"
    - Remove existing schools
    - Add new schools for Cybersoft and Primero campuses
  
  2. Data Updates
    - District name changed
    - 5 new schools added:
      - Cybersoft High
      - Cybersoft Middle
      - Cybersoft Elementary
      - Primero High
      - Primero Elementary
*/

-- Update district name
UPDATE districts 
SET name = 'Cybersoft ISD'
WHERE id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';

-- Remove existing schools and their related data
DELETE FROM school_daily_metrics;
DELETE FROM eod_tasks;
DELETE FROM schools;

-- Insert new schools
INSERT INTO schools (id, name, district_id)
VALUES
  (gen_random_uuid(), 'Cybersoft High', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  (gen_random_uuid(), 'Cybersoft Middle', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  (gen_random_uuid(), 'Cybersoft Elementary', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  (gen_random_uuid(), 'Primero High', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  (gen_random_uuid(), 'Primero Elementary', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2');

-- Insert sample metrics for each school
WITH school_ids AS (
  SELECT id, name
  FROM schools
  WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
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
    WHEN name LIKE '%High%' THEN 1500
    WHEN name LIKE '%Middle%' THEN 1000
    ELSE 750
  END as total_enrollment,
  CASE 
    WHEN name LIKE '%High%' THEN 900
    WHEN name LIKE '%Middle%' THEN 650
    ELSE 525
  END as free_reduced_count,
  CASE 
    WHEN name LIKE '%High%' THEN 450
    WHEN name LIKE '%Middle%' THEN 400
    ELSE 375
  END as breakfast_count,
  CASE 
    WHEN name LIKE '%High%' THEN 1200
    WHEN name LIKE '%Middle%' THEN 850
    ELSE 675
  END as lunch_count,
  CASE 
    WHEN name LIKE '%High%' THEN 6750.50
    WHEN name LIKE '%Middle%' THEN 5125.75
    ELSE 4275.25
  END as reimbursement_amount,
  CASE 
    WHEN name LIKE '%High%' THEN 1525.50
    WHEN name LIKE '%Middle%' THEN 875.25
    ELSE 425.75
  END as alc_revenue,
  CASE 
    WHEN name LIKE '%High%' THEN 1350
    WHEN name LIKE '%Middle%' THEN 950
    ELSE 750
  END as meal_equivalents,
  CASE 
    WHEN name LIKE '%High%' THEN 72
    WHEN name LIKE '%Middle%' THEN 48
    ELSE 40
  END as labor_hours,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2' as district_id
FROM school_ids;

-- Insert EOD tasks completion
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
FROM schools
WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';