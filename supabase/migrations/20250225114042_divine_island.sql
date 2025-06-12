/*
  # Add district_id to quiz_attempts

  1. Changes
    - Add district_id column to quiz_attempts table
    - Add foreign key constraint to districts table
    - Update existing records with district_id from users table
*/

-- Add district_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'quiz_attempts' 
    AND column_name = 'district_id'
  ) THEN
    -- Add the column
    ALTER TABLE quiz_attempts 
    ADD COLUMN district_id uuid REFERENCES districts(id);

    -- Update existing records with district_id from users table
    UPDATE quiz_attempts qa
    SET district_id = u.district_id
    FROM users u
    WHERE qa.user_id = u.id;

    -- Make the column NOT NULL after updating existing records
    ALTER TABLE quiz_attempts 
    ALTER COLUMN district_id SET NOT NULL;
  END IF;
END $$;