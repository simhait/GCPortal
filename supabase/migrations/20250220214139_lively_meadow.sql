-- Add display_order column to kpis table
ALTER TABLE kpis
ADD COLUMN IF NOT EXISTS display_order integer;

-- Update display order for existing KPIs
UPDATE kpis
SET display_order = CASE name
  WHEN 'Program Access' THEN 1      -- Eco Dis
  WHEN 'Meals Served' THEN 2        -- Meals
  WHEN 'Revenue' THEN 3             -- Revenue
  WHEN 'Food Waste' THEN 4          -- Waste
  WHEN 'Breakfast Participation' THEN 5  -- Breakfast
  WHEN 'Lunch Participation' THEN 6      -- Lunch
  WHEN 'Snack Participation' THEN 7      -- Snack
  WHEN 'Meal Equivalents' THEN 8         -- MEQs
  ELSE 100  -- Put any other KPIs at the end
END
WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_kpis_display_order 
ON kpis(display_order);

-- Add NOT NULL constraint after setting values
ALTER TABLE kpis
ALTER COLUMN display_order SET NOT NULL;