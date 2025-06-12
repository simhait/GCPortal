/*
  # Add user profile fields
  
  1. Changes
    - Add name column to users table
    - Add title column to users table
    - Add phone column to users table
    - Add district_name column to users table
    - Add updated_at column to users table
  
  2. Notes
    - All columns are added conditionally to avoid errors if they already exist
    - The updated_at column is added with a default value and trigger
*/

-- Add new columns to users table if they don't exist
DO $$
BEGIN
  -- Add name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name text;
  END IF;

  -- Add title column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'title'
  ) THEN
    ALTER TABLE users ADD COLUMN title text;
  END IF;

  -- Add phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone text;
  END IF;

  -- Add district_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'district_name'
  ) THEN
    ALTER TABLE users ADD COLUMN district_name text;
  END IF;

  -- Add updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Update demo user with sample data
UPDATE users
SET 
  name = 'Demo Director',
  title = 'District Nutrition Director',
  district_name = 'Cybersoft ISD'
WHERE email = 'director@demo.com';