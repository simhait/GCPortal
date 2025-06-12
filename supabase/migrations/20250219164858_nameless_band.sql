/*
  # Add meal count columns by eligibility

  1. New Columns
    - free_meal_lunch: Number of free lunch meals served
    - reduced_meal_lunch: Number of reduced-price lunch meals served
    - paid_meal_lunch: Number of paid lunch meals served
    - free_meal_breakfast: Number of free breakfast meals served
    - reduced_meal_breakfast: Number of reduced-price breakfast meals served
    - paid_meal_breakfast: Number of paid breakfast meals served

  2. Changes
    - Add columns to store meal counts by eligibility
    - Add check constraints to ensure meal counts add up to totals
    - Update existing records with calculated values
    - Add indexes for performance

  3. Security
    - Maintain existing RLS policies
*/

-- Add new columns for meal counts by eligibility
ALTER TABLE school_daily_metrics 
ADD COLUMN IF NOT EXISTS free_meal_lunch integer,
ADD COLUMN IF NOT EXISTS reduced_meal_lunch integer,
ADD COLUMN IF NOT EXISTS paid_meal_lunch integer,
ADD COLUMN IF NOT EXISTS free_meal_breakfast integer,
ADD COLUMN IF NOT EXISTS reduced_meal_breakfast integer,
ADD COLUMN IF NOT EXISTS paid_meal_breakfast integer;

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

-- Update existing records with calculated values based on eligibility percentages
UPDATE school_daily_metrics sdm
SET
  -- Lunch meal counts
  free_meal_lunch = CASE 
    WHEN lunch_count > 0 THEN
      ROUND((free_count::float / NULLIF(total_enrollment, 0)) * lunch_count)
    ELSE 0
  END,
  reduced_meal_lunch = CASE 
    WHEN lunch_count > 0 THEN
      ROUND((reduced_count::float / NULLIF(total_enrollment, 0)) * lunch_count)
    ELSE 0
  END,
  paid_meal_lunch = CASE 
    WHEN lunch_count > 0 THEN
      lunch_count - (
        ROUND((free_count::float / NULLIF(total_enrollment, 0)) * lunch_count) +
        ROUND((reduced_count::float / NULLIF(total_enrollment, 0)) * lunch_count)
      )
    ELSE 0
  END,
  
  -- Breakfast meal counts
  free_meal_breakfast = CASE 
    WHEN breakfast_count > 0 THEN
      ROUND((free_count::float / NULLIF(total_enrollment, 0)) * breakfast_count)
    ELSE 0
  END,
  reduced_meal_breakfast = CASE 
    WHEN breakfast_count > 0 THEN
      ROUND((reduced_count::float / NULLIF(total_enrollment, 0)) * breakfast_count)
    ELSE 0
  END,
  paid_meal_breakfast = CASE 
    WHEN breakfast_count > 0 THEN
      breakfast_count - (
        ROUND((free_count::float / NULLIF(total_enrollment, 0)) * breakfast_count) +
        ROUND((reduced_count::float / NULLIF(total_enrollment, 0)) * breakfast_count)
      )
    ELSE 0
  END
WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
AND date >= '2025-02-01'
AND date <= '2025-02-28';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_school_daily_metrics_lunch_counts 
ON school_daily_metrics(free_meal_lunch, reduced_meal_lunch, paid_meal_lunch);

CREATE INDEX IF NOT EXISTS idx_school_daily_metrics_breakfast_counts 
ON school_daily_metrics(free_meal_breakfast, reduced_meal_breakfast, paid_meal_breakfast);