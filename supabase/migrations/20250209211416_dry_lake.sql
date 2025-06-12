-- Add unique constraint to kpi_values if it doesn't exist
ALTER TABLE kpi_values 
ADD CONSTRAINT kpi_values_kpi_id_school_id_date_key 
UNIQUE (kpi_id, school_id, date);

-- Function to generate daily metrics for a school
CREATE OR REPLACE FUNCTION generate_daily_metrics(
  school_name text,
  base_enrollment integer,
  base_free_reduced_rate numeric,
  base_breakfast_rate numeric,
  base_lunch_rate numeric,
  check_date date,
  performance_factor numeric DEFAULT 1.0
) RETURNS TABLE (
  breakfast_count integer,
  lunch_count integer,
  reimbursement_amount numeric,
  alc_revenue numeric,
  meal_equivalents integer,
  labor_hours integer
) AS $$
DECLARE
  day_of_week integer;
  daily_factor numeric;
  variation_percent numeric := 0.1;
BEGIN
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_of_week := EXTRACT(DOW FROM check_date);
  
  -- Skip weekends and holidays
  IF day_of_week IN (0, 6) OR check_date IN (
    '2024-12-25', '2024-12-24', '2024-12-23',  -- Winter Break
    '2024-11-28', '2024-11-29',                 -- Thanksgiving
    '2024-01-01',                               -- New Year
    '2024-01-15',                               -- MLK Day
    '2024-02-19',                               -- Presidents Day
    '2024-03-11', '2024-03-12', '2024-03-13',  -- Spring Break
    '2024-03-14', '2024-03-15',
    '2024-05-27'                                -- Memorial Day
  ) THEN
    breakfast_count := 0;
    lunch_count := 0;
    reimbursement_amount := 0;
    alc_revenue := 0;
    meal_equivalents := 0;
    labor_hours := 0;
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
    WHEN EXTRACT(MONTH FROM check_date) = 8 THEN 0.9   -- August (start of year)
    WHEN EXTRACT(MONTH FROM check_date) = 9 THEN 1.1   -- September (peak)
    WHEN EXTRACT(MONTH FROM check_date) = 12 THEN 0.9  -- December (holiday season)
    WHEN EXTRACT(MONTH FROM check_date) = 1 THEN 0.95  -- January (post-holiday)
    ELSE 1.0                                           -- Normal months
  END;

  -- Apply performance factor and random variation
  daily_factor := daily_factor * performance_factor * (1 + (random() * variation_percent) - (variation_percent / 2));

  -- Calculate metrics
  breakfast_count := (base_enrollment * base_breakfast_rate * daily_factor)::integer;
  lunch_count := (base_enrollment * base_lunch_rate * daily_factor)::integer;
  
  -- Calculate revenue based on meal counts
  reimbursement_amount := (breakfast_count * 2.50 + lunch_count * 3.75) * daily_factor;
  alc_revenue := CASE 
    WHEN base_enrollment >= 1000 THEN 1200 * daily_factor
    ELSE 800 * daily_factor
  END;
  
  -- Calculate meal equivalents (lunch meals + breakfast meals * 0.67 + alc revenue / 4.00)
  meal_equivalents := (lunch_count + (breakfast_count * 0.67) + (alc_revenue / 4.00))::integer;
  
  -- Set labor hours based on school size
  labor_hours := CASE 
    WHEN base_enrollment >= 1000 THEN 60
    ELSE 40
  END;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Generate daily metrics for each school
DO $$
DECLARE
  school_record RECORD;
  date_cursor DATE;
  metrics_result RECORD;
BEGIN
  FOR school_record IN 
    SELECT 
      s.id as school_id,
      s.name,
      CASE 
        WHEN s.name = 'Cybersoft High' THEN 1500
        WHEN s.name = 'Cybersoft Middle' THEN 1000
        WHEN s.name = 'Cybersoft Elementary' THEN 750
        WHEN s.name = 'Primero High' THEN 1200
        WHEN s.name = 'Primero Elementary' THEN 600
      END as enrollment,
      CASE 
        WHEN s.name LIKE '%High%' THEN 0.55
        WHEN s.name LIKE '%Middle%' THEN 0.60
        ELSE 0.65
      END as free_reduced_rate,
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
    date_cursor := '2024-08-01'::date;
    WHILE date_cursor <= CURRENT_DATE LOOP
      -- Generate metrics for this day
      SELECT * FROM generate_daily_metrics(
        school_record.name,
        school_record.enrollment,
        school_record.free_reduced_rate,
        school_record.breakfast_rate,
        school_record.lunch_rate,
        date_cursor,
        school_record.performance_factor
      ) INTO metrics_result;

      -- Insert or update school_daily_metrics
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
      ) VALUES (
        school_record.school_id,
        date_cursor,
        school_record.enrollment,
        (school_record.enrollment * school_record.free_reduced_rate)::integer,
        metrics_result.breakfast_count,
        metrics_result.lunch_count,
        metrics_result.reimbursement_amount,
        metrics_result.alc_revenue,
        metrics_result.meal_equivalents,
        metrics_result.labor_hours,
        'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
      )
      ON CONFLICT (school_id, date) DO UPDATE SET
        total_enrollment = EXCLUDED.total_enrollment,
        free_reduced_count = EXCLUDED.free_reduced_count,
        breakfast_count = EXCLUDED.breakfast_count,
        lunch_count = EXCLUDED.lunch_count,
        reimbursement_amount = EXCLUDED.reimbursement_amount,
        alc_revenue = EXCLUDED.alc_revenue,
        meal_equivalents = EXCLUDED.meal_equivalents,
        labor_hours = EXCLUDED.labor_hours;

      -- Move to next day
      date_cursor := date_cursor + interval '1 day';
    END LOOP;
  END LOOP;
END $$;

-- Clear existing KPI values for the date range
DELETE FROM kpi_values
WHERE date >= '2024-08-01'
AND date <= CURRENT_DATE;

-- Generate KPI values for each school
DO $$
DECLARE
  school_record RECORD;
  kpi_record RECORD;
  date_cursor DATE;
  metric_value numeric;
BEGIN
  FOR school_record IN 
    SELECT s.id, s.name
    FROM schools s
    WHERE s.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  LOOP
    FOR kpi_record IN
      SELECT k.id, k.name, k.benchmark
      FROM kpis k
      WHERE k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
      AND k.is_hidden = false
    LOOP
      date_cursor := '2024-08-01'::date;
      WHILE date_cursor <= CURRENT_DATE LOOP
        -- Skip weekends and holidays
        IF EXTRACT(DOW FROM date_cursor) NOT IN (0, 6) AND date_cursor NOT IN (
          '2024-12-25', '2024-12-24', '2024-12-23',
          '2024-11-28', '2024-11-29',
          '2024-01-01',
          '2024-01-15',
          '2024-02-19',
          '2024-03-11', '2024-03-12', '2024-03-13',
          '2024-03-14', '2024-03-15',
          '2024-05-27'
        ) THEN
          -- Get the metric value based on KPI type
          SELECT
            CASE
              WHEN kpi_record.name = 'Meals Served' THEN
                COALESCE((SELECT breakfast_count + lunch_count FROM school_daily_metrics 
                 WHERE school_id = school_record.id AND date = date_cursor), 0)
              WHEN kpi_record.name = 'Participation Rate' THEN
                COALESCE((SELECT ((breakfast_count + lunch_count)::float / (total_enrollment * 2) * 100)
                 FROM school_daily_metrics 
                 WHERE school_id = school_record.id AND date = date_cursor), 0)
              WHEN kpi_record.name = 'Food Waste' THEN
                CASE 
                  WHEN school_record.name = 'Primero High' THEN 15 + (random() * 5)
                  ELSE 5 + (random() * 5)
                END
              WHEN kpi_record.name = 'Cost per Meal' THEN
                CASE
                  WHEN school_record.name = 'Primero High' THEN 2.75 + (random() * 0.5)
                  ELSE 2.25 + (random() * 0.25)
                END
              WHEN kpi_record.name = 'Meals Per Labor Hour' THEN
                COALESCE((SELECT meal_equivalents::float / NULLIF(labor_hours, 0)
                 FROM school_daily_metrics 
                 WHERE school_id = school_record.id AND date = date_cursor), 0)
              ELSE kpi_record.benchmark * 
                CASE 
                  WHEN school_record.name = 'Cybersoft High' THEN 1.1
                  WHEN school_record.name = 'Cybersoft Middle' THEN 1.0
                  WHEN school_record.name = 'Cybersoft Elementary' THEN 1.05
                  WHEN school_record.name = 'Primero High' THEN 0.75
                  WHEN school_record.name = 'Primero Elementary' THEN 0.9
                END * (1 + (random() * 0.1) - 0.05)
            END INTO metric_value;

          -- Insert the KPI value
          INSERT INTO kpi_values (
            kpi_id,
            value,
            date,
            school_id,
            district_id
          ) VALUES (
            kpi_record.id,
            metric_value,
            date_cursor,
            school_record.id,
            'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
          );
        END IF;

        date_cursor := date_cursor + interval '1 day';
      END LOOP;
    END LOOP;
  END LOOP;
END $$;