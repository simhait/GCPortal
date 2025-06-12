/*
  # Add first and last name fields
  
  1. Changes
    - Add first_name column to users table
    - Add last_name column to users table
    - Update existing users to split name into first/last name
  
  2. Notes
    - Columns are added conditionally to avoid errors if they already exist
    - Existing name data is split into first and last name components
*/

-- Add first_name and last_name columns
DO $$
BEGIN
  -- Add first_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE users ADD COLUMN first_name text;
  END IF;

  -- Add last_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE users ADD COLUMN last_name text;
  END IF;
END $$;

-- Split existing name data into first and last name
UPDATE users
SET 
  first_name = CASE 
    WHEN name IS NOT NULL THEN 
      CASE 
        WHEN position(' ' in name) > 0 THEN 
          substring(name from 1 for position(' ' in name) - 1)
        ELSE name
      END
    ELSE NULL
  END,
  last_name = CASE 
    WHEN name IS NOT NULL AND position(' ' in name) > 0 THEN 
      substring(name from position(' ' in name) + 1)
    ELSE NULL
  END
WHERE (first_name IS NULL OR last_name IS NULL) AND name IS NOT NULL;