-- Add group_size column to guests table
ALTER TABLE guests ADD COLUMN IF NOT EXISTS group_size integer DEFAULT 1;

-- Update existing rows to have group_size = 1
UPDATE guests SET group_size = 1 WHERE group_size IS NULL;
