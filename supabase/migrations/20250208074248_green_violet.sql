/*
  # Add sample KPI data for nutrition dashboard

  1. New Data
    - Create core KPIs for nutrition program
    - Add sample KPI values for trending data
    - Include district-wide metrics

  2. KPI Categories
    - Meals Served
    - Cost per Meal
    - Food Waste
    - Student Satisfaction
    - Nutritional Compliance
*/

-- Insert core KPIs
INSERT INTO kpis (id, name, description, unit, benchmark, goal, district_id)
VALUES
  ('c47c3e3d-4e44-4c42-9407-b6d3e814d936', 'Meals Served', 'Daily number of meals served across all programs', '#', 1000, 1200, 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('f6aa6a8d-d7c9-4682-9a80-c5a6c5777776', 'Cost per Meal', 'Average cost per meal including labor and ingredients', '$', 2.50, 2.25, 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('8d8e8fef-0cf5-4b53-9a1b-987654321000', 'Food Waste', 'Percentage of prepared food that goes to waste', '%', 15, 10, 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('a1b2c3d4-e5f6-4a5b-9c8d-111222333000', 'Student Satisfaction', 'Student satisfaction rating from surveys', '%', 85, 90, 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'),
  ('b5c6d7e8-f9a0-4b5c-9d8e-555666777000', 'Nutritional Compliance', 'Compliance with USDA nutrition guidelines', '%', 95, 100, 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2')
ON CONFLICT (id) DO NOTHING;

-- Insert sample KPI values for the last 30 days
WITH dates AS (
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
    WHEN k.name = 'Meals Served' THEN
      1000 + (random() * 400)::int
    WHEN k.name = 'Cost per Meal' THEN
      2.25 + (random() * 0.5)
    WHEN k.name = 'Food Waste' THEN
      8 + (random() * 10)
    WHEN k.name = 'Student Satisfaction' THEN
      80 + (random() * 15)
    WHEN k.name = 'Nutritional Compliance' THEN
      90 + (random() * 10)
  END as value,
  dates.date,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2' as district_id
FROM dates
CROSS JOIN (
  SELECT id, name
  FROM kpis
  WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
) k
ON CONFLICT DO NOTHING;