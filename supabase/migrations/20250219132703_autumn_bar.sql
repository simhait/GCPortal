/*
  # Split Participation Rate into Breakfast and Lunch KPIs

  1. Changes
    - Rename existing "Participation Rate" KPI to "Lunch Participation"
    - Add new "Breakfast Participation" KPI
    - Generate historical values for both KPIs
  
  2. Security
    - Maintains existing RLS policies
    - No data loss during migration
*/

-- First, safely update the existing KPI
DO $$ 
BEGIN
  -- Update existing Participation Rate KPI to be Lunch Participation
  UPDATE kpis 
  SET name = 'Lunch Participation',
      description = 'Percentage of enrolled students participating in lunch program'
  WHERE name = 'Participation Rate';

  -- Add new Breakfast Participation KPI if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM kpis WHERE name = 'Breakfast Participation'
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
      'Breakfast Participation',
      'Percentage of enrolled students participating in breakfast program',
      '%',
      35,  -- Lower benchmark for breakfast
      50,  -- Lower goal for breakfast
      district_id,
      false
    FROM kpis
    WHERE name = 'Lunch Participation'
    LIMIT 1;
  END IF;
END $$;

-- Generate historical values for breakfast participation
DO $$
DECLARE
  breakfast_kpi_id uuid;
  school_record RECORD;
  date_cursor DATE;
BEGIN
  -- Get the breakfast KPI ID
  SELECT id INTO breakfast_kpi_id
  FROM kpis
  WHERE name = 'Breakfast Participation'
  LIMIT 1;

  -- Only proceed if we have a breakfast KPI
  IF breakfast_kpi_id IS NOT NULL THEN
    -- For each school
    FOR school_record IN 
      SELECT s.id, s.name
      FROM schools s
      INNER JOIN kpis k ON k.district_id = s.district_id
      WHERE k.id = breakfast_kpi_id
      LIMIT 5  -- Assuming we have 5 schools
    LOOP
      -- For each date
      date_cursor := '2024-08-01'::date;
      WHILE date_cursor <= CURRENT_DATE LOOP
        -- Skip weekends
        IF EXTRACT(DOW FROM date_cursor) NOT IN (0, 6) THEN
          -- Insert breakfast participation data
          INSERT INTO kpi_values (
            kpi_id,
            value,
            date,
            school_id,
            district_id
          )
          SELECT
            breakfast_kpi_id,
            CASE 
              WHEN sdm.school_id IS NOT NULL THEN
                (sdm.breakfast_count::float / NULLIF(sdm.total_enrollment, 0) * 100)
              ELSE
                CASE 
                  WHEN school_record.name = 'Cybersoft High' THEN 35 * 1.1
                  WHEN school_record.name = 'Cybersoft Middle' THEN 35 * 1.0
                  WHEN school_record.name = 'Cybersoft Elementary' THEN 35 * 1.05
                  WHEN school_record.name = 'Primero High' THEN 35 * 0.75
                  WHEN school_record.name = 'Primero Elementary' THEN 35 * 0.9
                END * (1 + (random() * 0.1) - 0.05)
            END as value,
            date_cursor,
            school_record.id,
            k.district_id
          FROM kpis k
          LEFT JOIN school_daily_metrics sdm ON 
            sdm.school_id = school_record.id 
            AND sdm.date = date_cursor
          WHERE k.id = breakfast_kpi_id
          LIMIT 1
          ON CONFLICT (kpi_id, school_id, date) 
          DO UPDATE SET value = EXCLUDED.value;
        END IF;

        date_cursor := date_cursor + interval '1 day';
      END LOOP;
    END LOOP;
  END IF;
END $$;