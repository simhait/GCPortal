/*
  # Update Primero High KPI Values

  1. Changes
    - Generate underperforming KPI values for Primero High
    - Set values approximately 25% below benchmark
    - Add realistic daily variations
    - Include data from August 2024 through current date

  2. Details
    - Meals served: 25% below benchmark
    - Food waste: 50% above benchmark (worse performance)
    - Participation rates: 25% below benchmark
    - Cost per meal: 25% above benchmark (worse performance)
    - Revenue per meal: 25% below benchmark
    - MPLH: 25% below benchmark

  3. Notes
    - Excludes weekends and holidays
    - Includes random variations for realism
    - Shows recent improvement trends
*/

-- Function to generate underperforming values
CREATE OR REPLACE FUNCTION generate_underperforming_value(
  base_value numeric,
  performance_factor numeric DEFAULT 0.75,
  variation_percent numeric DEFAULT 0.1
) RETURNS numeric AS $$
DECLARE
  target_value numeric;
  random_variation numeric;
BEGIN
  target_value := base_value * performance_factor;
  random_variation := target_value * (random() * variation_percent - (variation_percent / 2));
  RETURN target_value + random_variation;
END;
$$ LANGUAGE plpgsql;

-- Get Primero High's school ID
WITH school_data AS (
  SELECT id 
  FROM schools 
  WHERE name = 'Primero High'
  AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  LIMIT 1
),
dates AS (
  SELECT generate_series(
    '2024-08-01'::date,
    CURRENT_DATE,
    '1 day'::interval
  )::date AS date
),
daily_values AS (
  SELECT 
    k.id as kpi_id,
    k.name as kpi_name,
    k.benchmark,
    d.date,
    s.id as school_id,
    CASE
      WHEN k.name = 'Meals Served' THEN
        generate_underperforming_value(k.benchmark, 0.75)
      WHEN k.name = 'Food Waste' THEN
        k.benchmark * 1.5 + (random() * 5) -- Higher waste is bad
      WHEN k.name = 'Participation Rate' THEN
        generate_underperforming_value(k.benchmark, 0.75)
      WHEN k.name = 'Cost per Meal' THEN
        k.benchmark * 1.25 + (random() * 0.2) -- Higher cost is bad
      WHEN k.name = 'Revenue Per Meal' THEN
        generate_underperforming_value(k.benchmark, 0.75)
      WHEN k.name = 'Meals Per Labor Hour' THEN
        generate_underperforming_value(k.benchmark, 0.75)
      ELSE
        generate_underperforming_value(k.benchmark)
    END as value
  FROM dates d
  CROSS JOIN school_data s
  CROSS JOIN kpis k
  WHERE k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  AND EXTRACT(DOW FROM d.date) NOT IN (0, 6) -- Exclude weekends
)
DELETE FROM kpi_values
WHERE school_id IN (SELECT id FROM school_data)
AND date >= '2024-08-01';

WITH school_data AS (
  SELECT id 
  FROM schools 
  WHERE name = 'Primero High'
  AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  LIMIT 1
),
dates AS (
  SELECT generate_series(
    '2024-08-01'::date,
    CURRENT_DATE,
    '1 day'::interval
  )::date AS date
),
daily_values AS (
  SELECT 
    k.id as kpi_id,
    k.name as kpi_name,
    k.benchmark,
    d.date,
    s.id as school_id,
    CASE
      WHEN k.name = 'Meals Served' THEN
        generate_underperforming_value(k.benchmark, 0.75)
      WHEN k.name = 'Food Waste' THEN
        k.benchmark * 1.5 + (random() * 5) -- Higher waste is bad
      WHEN k.name = 'Participation Rate' THEN
        generate_underperforming_value(k.benchmark, 0.75)
      WHEN k.name = 'Cost per Meal' THEN
        k.benchmark * 1.25 + (random() * 0.2) -- Higher cost is bad
      WHEN k.name = 'Revenue Per Meal' THEN
        generate_underperforming_value(k.benchmark, 0.75)
      WHEN k.name = 'Meals Per Labor Hour' THEN
        generate_underperforming_value(k.benchmark, 0.75)
      ELSE
        generate_underperforming_value(k.benchmark)
    END as value
  FROM dates d
  CROSS JOIN school_data s
  CROSS JOIN kpis k
  WHERE k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  AND EXTRACT(DOW FROM d.date) NOT IN (0, 6) -- Exclude weekends
)
INSERT INTO kpi_values (
  kpi_id,
  value,
  date,
  school_id,
  district_id
)
SELECT
  dv.kpi_id,
  dv.value,
  dv.date,
  dv.school_id,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
FROM daily_values dv;

-- Add some trending improvement in the last week
WITH recent_dates AS (
  SELECT generate_series(
    CURRENT_DATE - interval '7 days',
    CURRENT_DATE,
    '1 day'::interval
  )::date AS date
),
school_data AS (
  SELECT id 
  FROM schools 
  WHERE name = 'Primero High'
  AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  LIMIT 1
)
UPDATE kpi_values kv
SET value = CASE
  WHEN k.name = 'Meals Served' THEN
    kv.value * (1 + (EXTRACT(DAY FROM (kv.date - (CURRENT_DATE - interval '7 days'))) * 0.02))
  WHEN k.name = 'Food Waste' THEN
    kv.value * (1 - (EXTRACT(DAY FROM (kv.date - (CURRENT_DATE - interval '7 days'))) * 0.03))
  WHEN k.name = 'Participation Rate' THEN
    kv.value * (1 + (EXTRACT(DAY FROM (kv.date - (CURRENT_DATE - interval '7 days'))) * 0.015))
  ELSE
    kv.value
END
FROM kpis k, school_data s
WHERE k.id = kv.kpi_id
AND kv.school_id = s.id
AND kv.date >= CURRENT_DATE - interval '7 days';