-- First delete any KPI values associated with Cost per Meal
DELETE FROM kpi_values
WHERE kpi_id IN (
  SELECT id 
  FROM kpis 
  WHERE name = 'Cost per Meal'
  AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
);

-- Then we can safely delete the Cost per Meal KPI
DELETE FROM kpis
WHERE name = 'Cost per Meal'
AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';

-- Update any KPI relationships that might reference Cost per Meal
DELETE FROM kpi_relationships
WHERE source_kpi_id IN (
  SELECT id 
  FROM kpis 
  WHERE name = 'Cost per Meal'
  AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
OR target_kpi_id IN (
  SELECT id 
  FROM kpis 
  WHERE name = 'Cost per Meal'
  AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
);

-- Delete any school benchmarks for Cost per Meal
DELETE FROM school_benchmarks
WHERE kpi_id IN (
  SELECT id 
  FROM kpis 
  WHERE name = 'Cost per Meal'
  AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
);