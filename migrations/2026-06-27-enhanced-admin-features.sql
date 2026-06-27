-- Enhanced Admin Features Migration
-- Adds fields for comprehensive project management

-- Add new columns to projects table
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS amount_received INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_left INT GENERATED ALWAYS AS (goal_amount - COALESCE(amount_received, 0)) STORED;

-- Create admin settings table for platform-wide controls
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES profiles(id)
);

-- Insert default admin settings
INSERT INTO admin_settings (key, value, description) VALUES
  ('max_goal_limit', '{"value": 1000000}', 'Maximum funding goal per project in USD'),
  ('daily_project_limit', '{"value": 10}', 'Maximum projects an admin can create per day'),
  ('platform_fee_percentage', '{"value": 0}', 'Platform fee percentage (0 = no fee)')
ON CONFLICT (key) DO NOTHING;

-- Create function to check daily project creation limit
CREATE OR REPLACE FUNCTION check_daily_project_limit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  today_count INT;
  limit_value INT;
BEGIN
  -- Get the daily limit from admin settings
  SELECT (value->>'value')::INT INTO limit_value
  FROM admin_settings
  WHERE key = 'daily_project_limit';
  
  -- If no limit set, allow
  IF limit_value IS NULL THEN
    RETURN true;
  END IF;
  
  -- Count projects created today by this user
  SELECT COUNT(*) INTO today_count
  FROM projects
  WHERE created_at >= CURRENT_DATE
  AND nonprofit_id IN (SELECT nonprofit_id FROM profiles WHERE id = user_id);
  
  RETURN today_count < limit_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate goal amount against limit
CREATE OR REPLACE FUNCTION validate_goal_amount(goal_amount INT)
RETURNS BOOLEAN AS $$
DECLARE
  max_limit INT;
BEGIN
  -- Get the max goal limit from admin settings
  SELECT (value->>'value')::INT INTO max_limit
  FROM admin_settings
  WHERE key = 'max_goal_limit';
  
  -- If no limit set, allow
  IF max_limit IS NULL THEN
    RETURN true;
  END IF;
  
  RETURN goal_amount <= max_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS policy for admin_settings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins manage settings' AND polrelid = 'admin_settings'::regclass) THEN
    CREATE POLICY "Admins manage settings" ON admin_settings FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END$$;

-- Update RLS policy for projects to respect is_visible
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Public can view visible active projects' AND polrelid = 'projects'::regclass) THEN
    CREATE POLICY "Public can view visible active projects" ON projects FOR SELECT USING (
      status = 'active' AND is_visible = true
    );
  END IF;
END$$;

-- Add comment to document the new columns
COMMENT ON COLUMN projects.start_date IS 'Project fundraising start date';
COMMENT ON COLUMN projects.end_date IS 'Project fundraising end date';
COMMENT ON COLUMN projects.featured IS 'Whether project is featured on homepage';
COMMENT ON COLUMN projects.is_visible IS 'Whether project is publicly visible';
COMMENT ON COLUMN projects.tags IS 'Array of category/tag strings for filtering';
COMMENT ON COLUMN projects.video_url IS 'URL to project video (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN projects.amount_received IS 'Total amount received (manually adjustable by admin)';
COMMENT ON COLUMN projects.amount_left IS 'Computed: goal_amount - amount_received';
