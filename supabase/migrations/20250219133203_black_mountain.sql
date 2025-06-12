/*
  # Add Program Access KPI

  1. Changes
    - Add new "Program Access" KPI to track economically disadvantaged students
    - Generate historical values based on free/reduced count vs total enrollment
  
  2. Security
    - Maintains existing RLS policies
    - Uses existing school_daily_metrics data
*/

-- Add Program Access KPI
DO $$ 
BEGIN
  -- Add new Program Access KPI if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM kpis WHERE name = 'Program Access'
  ) THEN
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
      'Program Access',
      'Percentage of students who are economically disadvantaged (free/reduced vs paid)',
      '%',
      60,  -- Benchmark: 60% program access
      75,  -- Goal: 75% program access
      district_id,
      false
    FROM kpis
    WHERE name = 'Lunch Participation'
    LIMIT 1;
  END IF;
END $$;

-- Generate historical values for program access
DO $$
DECLARE
  program_access_kpi_id uuid;
  school_record RECORD;
  date_cursor DATE;
BEGIN
  -- Get the program access KPI ID
  SELECT id INTO program_access_kpi_id
  FROM kpis
  WHERE name = 'Program Access'
  LIMIT 1;

  -- Only proceed if we have the KPI
  IF program_access_kpi_id IS NOT NULL THEN
    -- For each school
    FOR school_record IN 
      SELECT s.id, s.name
      FROM schools s
      INNER JOIN kpis k ON k.district_id = s.district_id
      WHERE k.id = program_access_kpi_id
      LIMIT 5  -- Assuming we have 5 schools
    LOOP
      -- For each date
      date_cursor := '2024-08-01'::date;
      WHILE date_cursor <= CURRENT_DATE LOOP
        -- Skip weekends
        IF EXTRACT(DOW FROM date_cursor) NOT IN (0, 6) THEN
          -- Insert program access data
          INSERT INTO kpi_values (
            kpi_id,
            value,
            date,
            school_id,
            district_id
          )
          SELECT
            program_access_kpi_id,
            CASE 
              WHEN sdm.school_id IS NOT NULL THEN
                (sdm.free_reduced_count::float / NULLIF(sdm.total_enrollment, 0) * 100)
              ELSE
                CASE 
                  WHEN school_record.name = 'Cybersoft High' THEN 60 * 1.0  -- At benchmark
                  WHEN school_record.name = 'Cybersoft Middle' THEN 65 * 1.0 -- Above benchmark
                  WHEN school_record.name = 'Cybersoft Elementary' THEN 70 * 1.0 -- Well above benchmark
                  WHEN school_record.name = 'Primero High' THEN 55 * 1.0 -- Below benchmark
                  WHEN school_record.name = 'Primero Elementary' THEN 58 * 1.0 -- Slightly below benchmark
                END * (1 + (random() * 0.05) - 0.025)  -- Less variation for this metric
            END as value,
            date_cursor,
            school_record.id,
            k.district_id
          FROM kpis k
          LEFT JOIN school_daily_metrics sdm ON 
            sdm.school_id = school_record.id 
            AND sdm.date = date_cursor
          WHERE k.id = program_access_kpi_id
          LIMIT 1
          ON CONFLICT (kpi_id, school_id, date) 
          DO UPDATE SET value = EXCLUDED.value;
        END IF;

        date_cursor := date_cursor + interval '1 day';
      END LOOP;
    END LOOP;
  END IF;
END $$;