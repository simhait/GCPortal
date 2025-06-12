/*
  # Add Additional KPIs based on ICN recommendations

  1. New KPIs
    - Participation Rate
    - Staff Productivity (Meals per Labor Hour)
    - Revenue per Meal
    - Local Food Usage
    - Inventory Turnover
    - Staff Training Hours
*/

-- Insert additional KPIs
INSERT INTO kpis (id, name, description, unit, benchmark, goal, district_id)
VALUES
  (gen_random_uuid(), 'Participation Rate', 'Percentage of enrolled students participating in meal programs', '%', 70, 85, 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  (gen_random_uuid(), 'Meals Per Labor Hour', 'Number of meals served per labor hour', '#', 15, 18, 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  (gen_random_uuid(), 'Revenue Per Meal', 'Average revenue generated per meal served', '$', 3.75, 4.00, 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  (gen_random_uuid(), 'Local Food Usage', 'Percentage of food budget spent on local sources', '%', 15, 25, 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  (gen_random_uuid(), 'Inventory Turnover', 'Number of times inventory is used and replaced per month', '#', 2, 3, 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  (gen_random_uuid(), 'Staff Training', 'Average training hours per staff member per month', '#', 4, 8, 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2');

-- Insert sample KPI values for the last 30 days
WITH new_kpis AS (
  SELECT id, name
  FROM kpis
  WHERE name IN (
    'Participation Rate',
    'Meals Per Labor Hour',
    'Revenue Per Meal',
    'Local Food Usage',
    'Inventory Turnover',
    'Staff Training'
  )
),
dates AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE,
    '1 day'::interval
  )::date AS date
)
INSERT INTO kpi_values (kpi_id, value, date, district_id)
SELECT
  k.id as kpi_id,
  CASE
    WHEN k.name = 'Participation Rate' THEN
      65 + (random() * 20)
    WHEN k.name = 'Meals Per Labor Hour' THEN
      14 + (random() * 6)
    WHEN k.name = 'Revenue Per Meal' THEN
      3.50 + (random() * 0.75)
    WHEN k.name = 'Local Food Usage' THEN
      12 + (random() * 15)
    WHEN k.name = 'Inventory Turnover' THEN
      1.8 + (random() * 1.5)
    WHEN k.name = 'Staff Training' THEN
      3 + (random() * 6)
  END as value,
  dates.date,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2' as district_id
FROM dates
CROSS JOIN new_kpis k;