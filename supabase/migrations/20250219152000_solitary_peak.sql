-- Function to generate daily metrics for February 2025 with proper meal breakdowns
DO $$
DECLARE
  school_record RECORD;
  date_cursor DATE;
  base_enrollment INTEGER;
  free_reduced_rate NUMERIC;
  breakfast_rate NUMERIC;
  lunch_rate NUMERIC;
  performance_factor NUMERIC;
  daily_factor NUMERIC;
  total_enrollment INTEGER;
  free_reduced_count INTEGER;
  breakfast_count INTEGER;
  lunch_count INTEGER;
BEGIN
  -- For each school
  FOR school_record IN 
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
    -- For each day in February 2025
    date_cursor := '2025-02-01'::date;
    WHILE date_cursor <= '2025-02-28'::date LOOP
      -- Skip weekends
      IF EXTRACT(DOW FROM date_cursor) NOT IN (0, 6) THEN
        -- Calculate daily factor with some randomness
        daily_factor := school_record.performance_factor * (1 + (random() * 0.1) - 0.05);
        
        -- Calculate base metrics
        total_enrollment := school_record.enrollment;
        free_reduced_count := (total_enrollment * school_record.free_reduced_rate)::integer;
        breakfast_count := (total_enrollment * school_record.breakfast_rate * daily_factor)::integer;
        lunch_count := (total_enrollment * school_record.lunch_rate * daily_factor)::integer;

        -- Insert or update metrics
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
          school_record.id,
          date_cursor,
          total_enrollment,
          free_reduced_count,
          breakfast_count,
          lunch_count,
          (lunch_count * 3.75)::numeric(10,2), -- Average reimbursement rate
          (lunch_count * 0.50)::numeric(10,2), -- Average a la carte revenue per meal
          lunch_count, -- Using lunch count as meal equivalents for simplicity
          CASE 
            WHEN total_enrollment >= 1000 THEN 60
            ELSE 40
          END,
          'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
        )
        ON CONFLICT (school_id, date) 
        DO UPDATE SET
          total_enrollment = EXCLUDED.total_enrollment,
          free_reduced_count = EXCLUDED.free_reduced_count,
          breakfast_count = EXCLUDED.breakfast_count,
          lunch_count = EXCLUDED.lunch_count,
          reimbursement_amount = EXCLUDED.reimbursement_amount,
          alc_revenue = EXCLUDED.alc_revenue,
          meal_equivalents = EXCLUDED.meal_equivalents,
          labor_hours = EXCLUDED.labor_hours;

      END IF;
      date_cursor := date_cursor + interval '1 day';
    END LOOP;
  END LOOP;
END $$;