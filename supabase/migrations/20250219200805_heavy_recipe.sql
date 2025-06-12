/*
  # Update KPI Visibility

  1. Changes
    - Hide Inventory Turnover, Cost per Meal, and Meals Per Labor Hour KPIs
    - Ensure Enrollment KPI is visible

  2. Security
    - Uses existing RLS policies
    - No changes to permissions required
*/

-- Update KPI visibility
UPDATE kpis
SET is_hidden = true
WHERE name IN (
  'Inventory Turnover',
  'Cost per Meal',
  'Meals Per Labor Hour'
)
AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';

-- Ensure Enrollment KPI is visible
UPDATE kpis
SET is_hidden = false
WHERE name = 'Enrollment'
AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';