/*
  # Add academic year KPI data

  1. Data Updates
    - Add monthly aggregated KPI values for each school
    - Include actual data from July through current month
    - Add projected data for remaining academic year
    - Data spans full academic year (July-June)
  
  2. KPI Patterns
    - Participation typically starts low in August
    - Peaks in September-October
    - Slight dip in winter months
    - Recovers in spring
    - Projections show gradual improvement trends
*/

-- Function to generate realistic monthly variations
CREATE OR REPLACE FUNCTION generate_monthly_factor(month_num integer)
RETURNS float AS $$
BEGIN
  RETURN CASE month_num
    WHEN 7 THEN 0.5  -- July (Summer school - low participation)
    WHEN 8 THEN 0.8  -- August (School start - building up)
    WHEN 9 THEN 1.1  -- September (Peak participation)
    WHEN 10 THEN 1.1 -- October (Maintained peak)
    WHEN 11 THEN 1.0 -- November (Slight decline)
    WHEN 12 THEN 0.9 -- December (Holiday season)
    WHEN 1 THEN 0.95 -- January (Post-holiday recovery)
    WHEN 2 THEN 1.0  -- February (Stable)
    WHEN 3 THEN 1.05 -- March (Spring increase)
    WHEN 4 THEN 1.0  -- April (Stable)
    WHEN 5 THEN 0.95 -- May (End of year decline)
    WHEN 6 THEN 0.6  -- June (Summer transition)
    ELSE 1.0
  END;
END;
$$ LANGUAGE plpgsql;

-- Generate monthly data for each school
WITH RECURSIVE months AS (
  SELECT 
    date '2024-07-01' + (n || ' month')::interval as month_date
  FROM generate_series(0, 11) n
),
school_base_metrics AS (
  SELECT 
    s.id as school_id,
    s.name,
    CASE 
      WHEN s.name LIKE '%High%' THEN 1500
      WHEN s.name LIKE '%Middle%' THEN 1000
      ELSE 750
    END as base_enrollment,
    CASE 
      WHEN s.name LIKE '%High%' THEN 0.60
      WHEN s.name LIKE '%Middle%' THEN 0.65
      ELSE 0.70
    END as base_free_reduced_rate
  FROM schools s
  WHERE s.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
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
  sm.school_id,
  m.month_date::date,
  sm.base_enrollment,
  (sm.base_enrollment * sm.base_free_reduced_rate)::int,
  (sm.base_enrollment * 0.25 * generate_monthly_factor(EXTRACT(MONTH FROM m.month_date)::integer))::int as breakfast_count,
  (sm.base_enrollment * 0.75 * generate_monthly_factor(EXTRACT(MONTH FROM m.month_date)::integer))::int as lunch_count,
  CASE 
    WHEN sm.name LIKE '%High%' THEN 6750.50
    WHEN sm.name LIKE '%Middle%' THEN 5125.75
    ELSE 4275.25
  END * generate_monthly_factor(EXTRACT(MONTH FROM m.month_date)::integer) as reimbursement_amount,
  CASE 
    WHEN sm.name LIKE '%High%' THEN 1525.50
    WHEN sm.name LIKE '%Middle%' THEN 875.25
    ELSE 425.75
  END * generate_monthly_factor(EXTRACT(MONTH FROM m.month_date)::integer) as alc_revenue,
  CASE 
    WHEN sm.name LIKE '%High%' THEN 1350
    WHEN sm.name LIKE '%Middle%' THEN 950
    ELSE 750
  END * generate_monthly_factor(EXTRACT(MONTH FROM m.month_date)::integer) as meal_equivalents,
  CASE 
    WHEN sm.name LIKE '%High%' THEN 72
    WHEN sm.name LIKE '%Middle%' THEN 48
    ELSE 40
  END as labor_hours,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2' as district_id
FROM months m
CROSS JOIN school_base_metrics sm
WHERE m.month_date <= CURRENT_DATE
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

-- Insert projected data for future months
WITH future_months AS (
  SELECT 
    date '2024-07-01' + (n || ' month')::interval as month_date
  FROM generate_series(0, 11) n
  WHERE date '2024-07-01' + (n || ' month')::interval > CURRENT_DATE
),
base_metrics AS (
  SELECT 
    k.id as kpi_id,
    k.name as kpi_name,
    m.month_date,
    CASE 
      WHEN k.name = 'Meals Served' THEN
        COALESCE(
          (SELECT SUM(breakfast_count + lunch_count)::float
           FROM school_daily_metrics 
           WHERE date_trunc('month', date) = date_trunc('month', m.month_date)),
          5000
        ) * 1.05 -- 5% projected improvement
      WHEN k.name = 'Cost per Meal' THEN 2.25 + (random() * 0.2)
      WHEN k.name = 'Food Waste' THEN 8 + (random() * 3)
      WHEN k.name = 'Student Satisfaction' THEN 85 + (random() * 5)
      WHEN k.name = 'Nutritional Compliance' THEN 95 + (random() * 3)
      WHEN k.name = 'Participation Rate' THEN 75 + (random() * 5)
      WHEN k.name = 'Meals Per Labor Hour' THEN 16 + (random() * 2)
      WHEN k.name = 'Revenue Per Meal' THEN 3.75 + (random() * 0.5)
      WHEN k.name = 'Local Food Usage' THEN 20 + (random() * 8)
      WHEN k.name = 'Inventory Turnover' THEN 2.5 + (random() * 0.8)
      WHEN k.name = 'Staff Training' THEN 6 + (random() * 3)
    END as metric_value
  FROM future_months m
  CROSS JOIN kpis k
  WHERE k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
INSERT INTO kpi_values (
  kpi_id,
  value,
  date,
  district_id
)
SELECT
  kpi_id,
  metric_value,
  month_date::date,
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2' as district_id
FROM base_metrics
WHERE metric_value IS NOT NULL
ON CONFLICT DO NOTHING;