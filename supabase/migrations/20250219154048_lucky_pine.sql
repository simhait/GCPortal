-- Add columns for detailed eligibility breakdown
ALTER TABLE school_daily_metrics 
ADD COLUMN IF NOT EXISTS free_count integer,
ADD COLUMN IF NOT EXISTS reduced_count integer;

-- Update existing records to split free_reduced_count
-- Assuming 80% free, 20% reduced based on typical distributions
UPDATE school_daily_metrics
SET 
  free_count = (free_reduced_count * 0.8)::integer,
  reduced_count = (free_reduced_count * 0.2)::integer
WHERE free_count IS NULL OR reduced_count IS NULL;

-- Add check constraint to ensure counts add up
ALTER TABLE school_daily_metrics
ADD CONSTRAINT eligibility_count_check
CHECK (
  (free_count + reduced_count = free_reduced_count)
  OR
  (free_count IS NULL AND reduced_count IS NULL)
);

-- Function to generate daily metrics with detailed eligibility breakdown
CREATE OR REPLACE FUNCTION generate_daily_metrics_with_eligibility(
  p_school_id uuid,
  p_enrollment integer,
  p_free_rate numeric,
  p_reduced_rate numeric,
  p_breakfast_rate numeric,
  p_lunch_rate numeric,
  p_check_date date,
  p_performance_factor numeric DEFAULT 1.0
) RETURNS TABLE (
  free_count integer,
  reduced_count integer,
  paid_count integer,
  breakfast_count integer,
  lunch_count integer
) AS $$
DECLARE
  day_of_week integer;
  daily_factor numeric;
  variation_percent numeric := 0.1;
BEGIN
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_of_week := EXTRACT(DOW FROM p_check_date);
  
  -- Skip weekends and holidays
  IF day_of_week IN (0, 6) OR p_check_date IN (
    '2024-12-25', '2024-12-24', '2024-12-23',  -- Winter Break
    '2024-11-28', '2024-11-29',                 -- Thanksgiving
    '2024-01-01',                               -- New Year
    '2024-01-15',                               -- MLK Day
    '2024-02-19',                               -- Presidents Day
    '2024-03-11', '2024-03-12', '2024-03-13',  -- Spring Break
    '2024-03-14', '2024-03-15',
    '2024-05-27'                                -- Memorial Day
  ) THEN
    free_count := 0;
    reduced_count := 0;
    paid_count := 0;
    breakfast_count := 0;
    lunch_count := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Base factor from day of week
  daily_factor := CASE
    WHEN day_of_week = 1 THEN 1.1    -- Monday (higher)
    WHEN day_of_week = 5 THEN 0.9    -- Friday (lower)
    ELSE 1.0
  END;

  -- Add seasonal variation
  daily_factor := daily_factor * CASE 
    WHEN EXTRACT(MONTH FROM p_check_date) = 8 THEN 0.9   -- August (start of year)
    WHEN EXTRACT(MONTH FROM p_check_date) = 9 THEN 1.1   -- September (peak)
    WHEN EXTRACT(MONTH FROM p_check_date) = 12 THEN 0.9  -- December (holiday season)
    WHEN EXTRACT(MONTH FROM p_check_date) = 1 THEN 0.95  -- January (post-holiday)
    ELSE 1.0                                           -- Normal months
  END;

  -- Apply performance factor and random variation
  daily_factor := daily_factor * p_performance_factor * (1 + (random() * variation_percent) - (variation_percent / 2));

  -- Calculate eligibility counts
  free_count := (p_enrollment * p_free_rate)::integer;
  reduced_count := (p_enrollment * p_reduced_rate)::integer;
  paid_count := p_enrollment - free_count - reduced_count;
  
  -- Calculate meal counts
  breakfast_count := (p_enrollment * p_breakfast_rate * daily_factor)::integer;
  lunch_count := (p_enrollment * p_lunch_rate * daily_factor)::integer;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Generate updated metrics for February 2025
DO $$
DECLARE
  v_school RECORD;
  v_date DATE;
  v_metrics RECORD;
BEGIN
  -- For each school
  FOR v_school IN 
    SELECT 
      s.id,
      s.name,
      CASE 
        WHEN s.name = 'Cybersoft High' THEN 1500
        WHEN s.name = 'Cybersoft Middle' THEN 1000
        WHEN s.name = 'Cybersoft Elementary' THEN 750
        WHEN s.name = 'Primero High' THEN 1200
        WHEN s.name = 'Primero Elementary' THEN 600
      END as enrollment,
      CASE 
        WHEN s.name LIKE '%High%' THEN 0.45  -- 45% free
        WHEN s.name LIKE '%Middle%' THEN 0.48 -- 48% free
        ELSE 0.52                            -- 52% free for elementary
      END as free_rate,
      CASE 
        WHEN s.name LIKE '%High%' THEN 0.10  -- 10% reduced
        WHEN s.name LIKE '%Middle%' THEN 0.12 -- 12% reduced
        ELSE 0.13                            -- 13% reduced for elementary
      END as reduced_rate,
      CASE 
        WHEN s.name LIKE '%High%' THEN 0.25
        WHEN s.name LIKE '%Middle%' THEN 0.30
        ELSE 0.35
      END as breakfast_rate,
      CASE 
        WHEN s.name LIKE '%High%' THEN 0.65
        WHEN s.name LIKE '%Middle%' THEN 0.70
        ELSE 0.75
      END as lunch_rate,
      CASE 
        WHEN s.name = 'Cybersoft High' THEN 1.1    -- Exceeding
        WHEN s.name = 'Cybersoft Middle' THEN 1.0  -- Meeting
        WHEN s.name = 'Cybersoft Elementary' THEN 1.05  -- Above average
        WHEN s.name = 'Primero High' THEN 0.75     -- Struggling
        WHEN s.name = 'Primero Elementary' THEN 0.9 -- Below average
      END as performance_factor
    FROM schools s
    WHERE s.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  LOOP
    -- For each day in February 2025
    v_date := '2025-02-01'::date;
    WHILE v_date <= '2025-02-28'::date LOOP
      -- Generate metrics for this day
      SELECT * FROM generate_daily_metrics_with_eligibility(
        v_school.id,
        v_school.enrollment,
        v_school.free_rate,
        v_school.reduced_rate,
        v_school.breakfast_rate,
        v_school.lunch_rate,
        v_date,
        v_school.performance_factor
      ) INTO v_metrics;

      -- Update school_daily_metrics
      UPDATE school_daily_metrics
      SET
        total_enrollment = v_school.enrollment,
        free_count = v_metrics.free_count,
        reduced_count = v_metrics.reduced_count,
        free_reduced_count = v_metrics.free_count + v_metrics.reduced_count,
        breakfast_count = v_metrics.breakfast_count,
        lunch_count = v_metrics.lunch_count
      WHERE school_id = v_school.id
      AND date = v_date;

      -- If no record exists, insert one
      IF NOT FOUND THEN
        INSERT INTO school_daily_metrics (
          school_id,
          date,
          total_enrollment,
          free_count,
          reduced_count,
          free_reduced_count,
          breakfast_count,
          lunch_count,
          reimbursement_amount,
          alc_revenue,
          meal_equivalents,
          labor_hours,
          district_id
        ) VALUES (
          v_school.id,
          v_date,
          v_school.enrollment,
          v_metrics.free_count,
          v_metrics.reduced_count,
          v_metrics.free_count + v_metrics.reduced_count,
          v_metrics.breakfast_count,
          v_metrics.lunch_count,
          (v_metrics.lunch_count * 3.75)::numeric(10,2),
          (v_metrics.lunch_count * 0.50)::numeric(10,2),
          v_metrics.lunch_count,
          CASE 
            WHEN v_school.enrollment >= 1000 THEN 60
            ELSE 40
          END,
          'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
        );
      END IF;

      v_date := v_date + interval '1 day';
    END LOOP;
  END LOOP;
END $$;