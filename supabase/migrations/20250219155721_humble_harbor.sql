-- Add enrollment columns to schools table
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS total_enrollment integer,
ADD COLUMN IF NOT EXISTS free_count integer,
ADD COLUMN IF NOT EXISTS reduced_count integer,
ADD COLUMN IF NOT EXISTS paid_count integer;

-- Update existing schools with their enrollment data
UPDATE schools
SET 
  total_enrollment = CASE 
    WHEN name = 'Cybersoft High' THEN 1500
    WHEN name = 'Cybersoft Middle' THEN 1000
    WHEN name = 'Cybersoft Elementary' THEN 750
    WHEN name = 'Primero High' THEN 1200
    WHEN name = 'Primero Elementary' THEN 600
  END,
  free_count = CASE 
    WHEN name = 'Cybersoft High' THEN 675     -- 45% free
    WHEN name = 'Cybersoft Middle' THEN 480   -- 48% free
    WHEN name = 'Cybersoft Elementary' THEN 390 -- 52% free
    WHEN name = 'Primero High' THEN 540       -- 45% free
    WHEN name = 'Primero Elementary' THEN 312  -- 52% free
  END,
  reduced_count = CASE 
    WHEN name = 'Cybersoft High' THEN 150     -- 10% reduced
    WHEN name = 'Cybersoft Middle' THEN 120   -- 12% reduced
    WHEN name = 'Cybersoft Elementary' THEN 98 -- 13% reduced
    WHEN name = 'Primero High' THEN 120       -- 10% reduced
    WHEN name = 'Primero Elementary' THEN 78   -- 13% reduced
  END,
  paid_count = CASE 
    WHEN name = 'Cybersoft High' THEN 675     -- 45% paid
    WHEN name = 'Cybersoft Middle' THEN 400   -- 40% paid
    WHEN name = 'Cybersoft Elementary' THEN 262 -- 35% paid
    WHEN name = 'Primero High' THEN 540       -- 45% paid
    WHEN name = 'Primero Elementary' THEN 210  -- 35% paid
  END
WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';

-- Add check constraint to ensure counts add up to total enrollment
ALTER TABLE schools
ADD CONSTRAINT school_enrollment_check
CHECK (
  (free_count + reduced_count + paid_count = total_enrollment)
  OR
  (free_count IS NULL AND reduced_count IS NULL AND paid_count IS NULL AND total_enrollment IS NULL)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_schools_enrollment 
ON schools(total_enrollment);

CREATE INDEX IF NOT EXISTS idx_schools_eligibility 
ON schools(free_count, reduced_count, paid_count);