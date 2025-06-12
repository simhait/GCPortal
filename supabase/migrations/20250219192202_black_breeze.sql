-- Add columns for production tracking
ALTER TABLE school_daily_metrics 
ADD COLUMN IF NOT EXISTS planned_meals integer,
ADD COLUMN IF NOT EXISTS produced_meals integer,
ADD COLUMN IF NOT EXISTS served_meals integer,
ADD COLUMN IF NOT EXISTS production_accuracy numeric GENERATED ALWAYS AS (
  CASE 
    WHEN produced_meals > 0 THEN
      -- Calculate how close production was to actual service
      -- 100% means perfect accuracy, lower means over/under production
      (1 - ABS(produced_meals - served_meals)::numeric / produced_meals) * 100
    ELSE NULL
  END
) STORED;

-- Add Production Accuracy KPI
INSERT INTO kpis (
  name,
  description,
  unit,
  benchmark,
  goal,
  district_id,
  is_hidden
)
SELECT
  'Production Accuracy',
  'Measures how accurately we produce the right amount of food compared to what is served. Higher percentage means better accuracy, with 100% being perfect.',
  '%',
  85, -- Benchmark: 85% accuracy
  95, -- Goal: 95% accuracy
  district_id,
  false
FROM kpis
WHERE name = 'Meal Equivalents'
AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Function to generate realistic production numbers
CREATE OR REPLACE FUNCTION generate_production_metrics(
  actual_meals integer,
  performance_factor numeric
) RETURNS TABLE (
  planned integer,
  produced integer,
  served integer
) AS $$
DECLARE
  planning_accuracy numeric;
  production_variance numeric;
BEGIN
  -- Calculate base planning accuracy based on performance factor
  planning_accuracy := CASE
    WHEN performance_factor >= 1.1 THEN 0.95  -- Excellent planners
    WHEN performance_factor >= 1.0 THEN 0.90  -- Good planners
    WHEN performance_factor >= 0.9 THEN 0.85  -- Average planners
    ELSE 0.80                                 -- Struggling planners
  END;
  
  -- Add some random variation to planning
  planning_accuracy := planning_accuracy * (1 + (random() * 0.1 - 0.05));
  
  -- Calculate planned meals with some variation
  planned := ROUND(actual_meals * (1 + (random() * 0.2 - 0.1)));
  
  -- Production usually aims to match planned amount but with some variation
  production_variance := random() * 0.1 - 0.05; -- -5% to +5% variance
  produced := ROUND(planned * (1 + production_variance));
  
  -- Served meals is the actual count we started with
  served := actual_meals;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Update historical data with production metrics
DO $$
DECLARE
  school_record RECORD;
  date_cursor DATE;
  production_metrics RECORD;
BEGIN
  -- For each school
  FOR school_record IN 
    SELECT 
      s.id,
      s.name,
      CASE 
        WHEN s.name = 'Cybersoft High' THEN 1.1    -- Excellent performance
        WHEN s.name = 'Cybersoft Middle' THEN 1.0  -- Good performance
        WHEN s.name = 'Cybersoft Elementary' THEN 1.05  -- Very good performance
        WHEN s.name = 'Primero High' THEN 0.75     -- Struggling
        WHEN s.name = 'Primero Elementary' THEN 0.9 -- Below average
      END as performance_factor
    FROM schools s
    WHERE s.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  LOOP
    -- For each day
    FOR date_cursor IN 
      SELECT generate_series 
      FROM generate_series('2024-08-01'::date, CURRENT_DATE, '1 day')
    LOOP
      -- Skip weekends
      IF EXTRACT(DOW FROM date_cursor) NOT IN (0, 6) THEN
        -- Generate production metrics based on actual meals served
        SELECT * FROM generate_production_metrics(
          (
            SELECT lunch_count 
            FROM school_daily_metrics 
            WHERE school_id = school_record.id 
            AND date = date_cursor
          ),
          school_record.performance_factor
        ) INTO production_metrics;

        -- Update metrics
        UPDATE school_daily_metrics
        SET
          planned_meals = production_metrics.planned,
          produced_meals = production_metrics.produced,
          served_meals = production_metrics.served
        WHERE school_id = school_record.id 
        AND date = date_cursor;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Generate KPI values from production accuracy
INSERT INTO kpi_values (
  kpi_id,
  value,
  date,
  school_id,
  district_id
)
SELECT
  k.id as kpi_id,
  sdm.production_accuracy as value,
  sdm.date,
  sdm.school_id,
  k.district_id
FROM school_daily_metrics sdm
CROSS JOIN kpis k
WHERE k.name = 'Production Accuracy'
AND k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
AND sdm.production_accuracy IS NOT NULL
ON CONFLICT (kpi_id, school_id, date) 
DO UPDATE SET value = EXCLUDED.value;