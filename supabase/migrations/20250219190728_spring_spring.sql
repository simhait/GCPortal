-- Add columns for meal counts by eligibility if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'school_daily_metrics' AND column_name = 'free_meal_lunch'
  ) THEN
    ALTER TABLE school_daily_metrics 
    ADD COLUMN free_meal_lunch integer,
    ADD COLUMN reduced_meal_lunch integer,
    ADD COLUMN paid_meal_lunch integer,
    ADD COLUMN free_meal_breakfast integer,
    ADD COLUMN reduced_meal_breakfast integer,
    ADD COLUMN paid_meal_breakfast integer;

    -- Add check constraints to ensure meal counts add up to totals
    ALTER TABLE school_daily_metrics
    ADD CONSTRAINT lunch_meal_count_check
    CHECK (
      (free_meal_lunch + reduced_meal_lunch + paid_meal_lunch = lunch_count)
      OR
      (free_meal_lunch IS NULL AND reduced_meal_lunch IS NULL AND paid_meal_lunch IS NULL)
    ),
    ADD CONSTRAINT breakfast_meal_count_check
    CHECK (
      (free_meal_breakfast + reduced_meal_breakfast + paid_meal_breakfast = breakfast_count)
      OR
      (free_meal_breakfast IS NULL AND reduced_meal_breakfast IS NULL AND paid_meal_breakfast IS NULL)
    );
  END IF;
END $$;

-- Function to calculate meal counts with realistic participation rates
CREATE OR REPLACE FUNCTION calculate_meal_counts(
  total_meals integer,
  free_count integer,
  reduced_count integer,
  total_enrollment integer,
  base_participation numeric DEFAULT 1.0
) RETURNS TABLE (
  free_meals integer,
  reduced_meals integer,
  paid_meals integer
) AS $$
DECLARE
  free_rate numeric;
  reduced_rate numeric;
  paid_rate numeric;
BEGIN
  -- Calculate base rates
  free_rate := free_count::numeric / NULLIF(total_enrollment, 0);
  reduced_rate := reduced_count::numeric / NULLIF(total_enrollment, 0);
  paid_rate := 1.0 - free_rate - reduced_rate;
  
  -- Add some variation to participation rates
  -- Free/reduced students typically participate at higher rates
  free_meals := ROUND(total_meals * free_rate * base_participation * 1.2);  -- 20% higher participation
  reduced_meals := ROUND(total_meals * reduced_rate * base_participation * 1.1);  -- 10% higher participation
  
  -- Paid meals get the remainder to ensure total adds up
  paid_meals := total_meals - free_meals - reduced_meals;
  
  -- Adjust if paid meals went negative
  IF paid_meals < 0 THEN
    -- Proportionally reduce free and reduced to make room for paid
    free_meals := ROUND(total_meals * 0.6);  -- 60% to free
    reduced_meals := ROUND(total_meals * 0.25);  -- 25% to reduced
    paid_meals := total_meals - free_meals - reduced_meals;  -- Remainder to paid
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Update all records with calculated meal counts
DO $$
DECLARE
  school_record RECORD;
  date_cursor DATE;
  meal_counts RECORD;
BEGIN
  -- For each school
  FOR school_record IN 
    SELECT 
      s.id,
      s.name,
      s.total_enrollment,
      s.free_count,
      s.reduced_count,
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
    -- For each day
    FOR date_cursor IN 
      SELECT generate_series 
      FROM generate_series('2024-08-01'::date, CURRENT_DATE, '1 day')
    LOOP
      -- Skip weekends
      IF EXTRACT(DOW FROM date_cursor) NOT IN (0, 6) THEN
        -- Update lunch counts
        SELECT * FROM calculate_meal_counts(
          (SELECT lunch_count FROM school_daily_metrics 
           WHERE school_id = school_record.id AND date = date_cursor),
          school_record.free_count,
          school_record.reduced_count,
          school_record.total_enrollment,
          school_record.performance_factor
        ) INTO meal_counts;

        UPDATE school_daily_metrics
        SET
          free_meal_lunch = meal_counts.free_meals,
          reduced_meal_lunch = meal_counts.reduced_meals,
          paid_meal_lunch = meal_counts.paid_meals
        WHERE school_id = school_record.id 
        AND date = date_cursor
        AND lunch_count > 0;

        -- Update breakfast counts
        SELECT * FROM calculate_meal_counts(
          (SELECT breakfast_count FROM school_daily_metrics 
           WHERE school_id = school_record.id AND date = date_cursor),
          school_record.free_count,
          school_record.reduced_count,
          school_record.total_enrollment,
          school_record.performance_factor * 0.9  -- Slightly lower participation at breakfast
        ) INTO meal_counts;

        UPDATE school_daily_metrics
        SET
          free_meal_breakfast = meal_counts.free_meals,
          reduced_meal_breakfast = meal_counts.reduced_meals,
          paid_meal_breakfast = meal_counts.paid_meals
        WHERE school_id = school_record.id 
        AND date = date_cursor
        AND breakfast_count > 0;
      END IF;
    END LOOP;
  END LOOP;
END $$;