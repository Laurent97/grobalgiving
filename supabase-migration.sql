-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('donor', 'nonprofit_admin', 'admin')) DEFAULT 'donor',
  nonprofit_id UUID,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nonprofits table
CREATE TABLE IF NOT EXISTS nonprofits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nonprofit_id UUID REFERENCES nonprofits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  goal_amount INT NOT NULL,
  current_amount INT DEFAULT 0,
  location TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending', -- pending, active, completed, rejected, draft, archived
  main_image_url TEXT,
  gallery_images TEXT[],
  video_url TEXT,
  subtitle TEXT,
  project_summary TEXT,
  challenge TEXT,
  solution TEXT,
  activities TEXT,
  donation_usage TEXT,
  minimum_donation INT DEFAULT 1,
  currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'en',
  location_country TEXT,
  location_city TEXT,
  location_region TEXT,
  project_details JSONB DEFAULT '{}',
  terms_accepted BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  currency TEXT DEFAULT 'USD',
  frequency TEXT CHECK (frequency IN ('once', 'monthly')) DEFAULT 'once',
  stripe_session_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'pending',
  donor_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

-- Updates table (impact reports)
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  media_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  action TEXT,
  target_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nonprofits ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- RLS Policies (created idempotently)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view own profile' AND polrelid = 'profiles'::regclass) THEN
    CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can update own profile' AND polrelid = 'profiles'::regclass) THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Public profiles visible' AND polrelid = 'profiles'::regclass) THEN
    CREATE POLICY "Public profiles visible" ON profiles FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can view verified nonprofits' AND polrelid = 'nonprofits'::regclass) THEN
    CREATE POLICY "Anyone can view verified nonprofits" ON nonprofits FOR SELECT USING (verified = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins manage all nonprofits' AND polrelid = 'nonprofits'::regclass) THEN
    CREATE POLICY "Admins manage all nonprofits" ON nonprofits FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Nonprofit admins view own nonprofit' AND polrelid = 'nonprofits'::regclass) THEN
    CREATE POLICY "Nonprofit admins view own nonprofit" ON nonprofits FOR SELECT USING (
      id IN (SELECT nonprofit_id FROM profiles WHERE id = auth.uid() AND role = 'nonprofit_admin')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can view active projects' AND polrelid = 'projects'::regclass) THEN
    CREATE POLICY "Anyone can view active projects" ON projects FOR SELECT USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Nonprofit admins manage own projects' AND polrelid = 'projects'::regclass) THEN
    CREATE POLICY "Nonprofit admins manage own projects" ON projects FOR ALL USING (
      nonprofit_id IN (SELECT nonprofit_id FROM profiles WHERE id = auth.uid() AND role = 'nonprofit_admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins manage all projects' AND polrelid = 'projects'::regclass) THEN
    CREATE POLICY "Admins manage all projects" ON projects FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can view donations to public projects' AND polrelid = 'donations'::regclass) THEN
    CREATE POLICY "Anyone can view donations to public projects" ON donations FOR SELECT USING (
      EXISTS (SELECT 1 FROM projects WHERE id = project_id AND status = 'active')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view own donations' AND polrelid = 'donations'::regclass) THEN
    CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (auth.uid() = donor_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Nonprofits view own donations' AND polrelid = 'donations'::regclass) THEN
    CREATE POLICY "Nonprofits view own donations" ON donations FOR SELECT USING (
      EXISTS (SELECT 1 FROM projects WHERE id = project_id AND nonprofit_id IN 
        (SELECT nonprofit_id FROM profiles WHERE id = auth.uid() AND role = 'nonprofit_admin'))
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users manage own favorites' AND polrelid = 'favorites'::regclass) THEN
    CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone view published updates' AND polrelid = 'updates'::regclass) THEN
    CREATE POLICY "Anyone view published updates" ON updates FOR SELECT USING (
      EXISTS (SELECT 1 FROM projects WHERE id = project_id AND status = 'active')
    );
  END IF;
END$$;

-- Automatically insert a profile row when a new auth user is created.
-- This creates a profiles record with the auth user's id and any provided full_name from user metadata.
-- Apply this SQL in the Supabase SQL editor (or run as a migration) so new signups populate `public.profiles`.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->> 'full_name', NEW.email),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'auth_user_created_trigger'
  ) THEN
    CREATE TRIGGER auth_user_created_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Authors manage own updates' AND polrelid = 'updates'::regclass) THEN
    CREATE POLICY "Authors manage own updates" ON updates FOR ALL USING (auth.uid() = author_id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins view audit log' AND polrelid = 'admin_audit_log'::regclass) THEN
    CREATE POLICY "Admins view audit log" ON admin_audit_log FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END$$;

-- Helper function to increment project amount
CREATE OR REPLACE FUNCTION increment_project_amount(project_id UUID, amount_to_add INT)
RETURNS VOID AS $$
BEGIN
  UPDATE projects SET current_amount = current_amount + amount_to_add WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;


-- Log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' THEN
    INSERT INTO admin_audit_log (admin_id, action, target_id, old_value, new_value)
    VALUES (auth.uid(), TG_ARGV[0], NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Seed Data Section
-- Insert nonprofits
INSERT INTO nonprofits (id, name, slug, description, verified)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'James Dean Byrd Foundation Inc', 'james-dean-byrd-foundation', 'Supporting education and child welfare worldwide', true),
  ('22222222-2222-2222-2222-222222222222', 'Global Education Fund', 'global-education-fund', 'Providing school supplies to children in need', true),
  ('33333333-3333-3333-3333-333333333333', 'African Child Relief', 'african-child-relief', 'Protecting and empowering children across Africa', true)
ON CONFLICT (id) DO NOTHING;

-- Insert projects
INSERT INTO projects (id, nonprofit_id, title, slug, description, goal_amount, current_amount, location, category, status, main_image_url)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 
   'Sponsor A Student at Los Algarrobos School', 
   'sponsor-student-los-algarrobos-ecuador',
   'By helping a child with education and opportunity, you contribute to their future and the community. The Los Algarrobos School is the only alternative to an over-burdened public school in Canoa, Ecuador. We offer English language, music, environmental education, a library, and a maximum class size of 20 students. Sponsorship allows families with little or unstable income to provide their children a more personalized and modern education.

Challenge: Canoa is a rural fishing village on the coast of Ecuador. With a population of about 8,000 residents, most of our families depend on an unstable income from tourism, artisanal fishing, or agriculture. Even though the foundation works tirelessly to raise the funds to cover costs at school, as a private institution, we must charge some tuition to the families. Current tuition, though less than $50 monthly, is too much for most of the families in Canoa who wish a better education for their children.

Solution: Half sponsorships are often awarded to families who are already members of the educative community, have demonstrated dedication and responsibility towards their children''s studies, and who have some source of income but would be greatly relieved by the help of a sponsorship. Full sponsorships are awarded to families with two or more children or families from outside the current educative community who would never have the opportunity to join us if it were not for the sponsorship.

Long-Term Impact: We truly believe that Los Algarrobos is delivering a quality of education that stands out from the standard curriculum provided by the government. We provide an environment of love and learning to form global citizens who put service and responsibility into action.',
   100000, 46752, 'Canoa, Ecuador', 'Education', 'active', 'https://picsum.photos/id/20/400/300'),

  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
   'School Supplies for Children in Canoa',
   'school-supplies-canoa-ecuador',
   'By helping a child with supplies that are required for attendance in school you will be contributing to their future and the future of the community. Your contribution will ensure children receive a quality education and are prepared for future learning. We believe that investing in a child''s education is an investment in their future, the community and the world.

Challenge: Children are unable to attend school without supplies purchased by parents and parents can not afford to pay for these items, this project will allow more children to attend school and relieve a quality education for their future learning.

Solution: Children of Canoa Ecuador will have the opportunity to attend school and receive a quality education. Without supplies students are not admitted to classes. Supplies include paper, pencils, notebooks and misc items required for grade levels according to curriculum.

Long-Term Impact: We truly believe that through education change can occur. Changes for the future of children in poverty.',
   10000, 0, 'Canoa, Ecuador', 'Education', 'active', 'https://picsum.photos/id/100/400/300'),

  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333',
   'Help Children Living with HIV in Hohoe',
   'help-children-hiv-hohoe-ghana',
   'Providing medical care, nutrition, and emotional support to children living with HIV in the Hohoe region of Ghana. This project helps ensure that children with HIV have access to life-saving antiretroviral therapy, nutritious food, and psychosocial support to help them live full, healthy lives.

Challenge: Many children in rural Ghana who are living with HIV lack access to adequate medical care, nutrition, and emotional support needed to manage their condition and thrive.

Solution: By supporting this project, you will provide direct medical care from trained healthcare professionals, nutritious meals to support immune health, and emotional counseling to help children cope with their diagnosis.

Long-Term Impact: With your support, children living with HIV will have better health outcomes, improved school attendance, and the opportunity to become healthy, productive members of their communities.',
   50000, 0, 'Hohoe, Ghana', 'Physical Health', 'active', 'https://picsum.photos/id/116/400/300'),

  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333',
   'Help 200 Babies Survive Premature Birth',
   'help-babies-survive-premature-birth-ghana',
   'Providing incubators, medical training, and neonatal care to save premature babies in rural Ghana. Premature birth complications are a leading cause of infant mortality in developing regions. This project provides hospitals with critical equipment and training to save newborn lives.

Challenge: Rural hospitals in Ghana lack incubators and trained neonatal specialists needed to care for premature babies, resulting in preventable deaths.

Solution: We will provide incubators, neonatal monitoring equipment, and comprehensive training for healthcare staff in neonatal care protocols.

Long-Term Impact: Premature babies will have access to life-saving care, reducing infant mortality and giving families hope for healthy children.',
   75000, 0, 'Accra, Ghana', 'Physical Health', 'active', 'https://picsum.photos/id/48/400/300'),

  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333',
   'Protect 500 Girls from Trafficking',
   'protect-girls-from-trafficking-ghana',
   'Rescue, rehabilitate, and provide safe housing for 500 girls at risk of human trafficking in Northern Ghana. Human trafficking is a devastating crime that exploits vulnerable children. This project provides safe havens, education, and vocational training to help girls rebuild their lives.

Challenge: Many girls in Northern Ghana face extreme poverty and lack education, making them vulnerable to traffickers who promise them jobs and opportunities.

Solution: We provide safe housing, comprehensive education and life skills training, psychological support, and vocational training to help girls become self-sufficient.

Long-Term Impact: Girls will escape the cycle of poverty and trafficking, gaining education and economic opportunities to build better futures.',
   120000, 0, 'Tamale, Ghana', 'Child Protection', 'active', 'https://picsum.photos/id/76/400/300')
ON CONFLICT (id) DO NOTHING;

-- Insert seed donations for the Ecuador education project (to show progress)
INSERT INTO donations (id, donor_id, project_id, amount, frequency, status, created_at)
VALUES 
  (gen_random_uuid(), NULL, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5000, 'once', 'completed', NOW() - INTERVAL '30 days'),
  (gen_random_uuid(), NULL, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 10000, 'once', 'completed', NOW() - INTERVAL '25 days'),
  (gen_random_uuid(), NULL, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 15000, 'once', 'completed', NOW() - INTERVAL '20 days'),
  (gen_random_uuid(), NULL, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5000, 'once', 'completed', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), NULL, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 6752, 'once', 'completed', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), NULL, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5000, 'once', 'completed', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins manage all projects' AND polrelid = 'projects'::regclass) THEN
    CREATE POLICY "Admins manage all projects" ON projects FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Donors view own donations' AND polrelid = 'donations'::regclass) THEN
    CREATE POLICY "Donors view own donations" ON donations FOR SELECT USING (auth.uid() = donor_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Nonprofits view donations to their projects' AND polrelid = 'donations'::regclass) THEN
    CREATE POLICY "Nonprofits view donations to their projects" ON donations FOR SELECT USING (
      project_id IN (SELECT id FROM projects WHERE nonprofit_id IN (SELECT nonprofit_id FROM profiles WHERE id = auth.uid()))
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins view all donations' AND polrelid = 'donations'::regclass) THEN
    CREATE POLICY "Admins view all donations" ON donations FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Donors manage own favorites' AND polrelid = 'favorites'::regclass) THEN
    CREATE POLICY "Donors manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
  END IF;
END$$;

-- Create storage bucket for images (idempotent)
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (created idempotently)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can view images' AND polrelid = 'storage.objects'::regclass) THEN
    CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Authenticated users upload images' AND polrelid = 'storage.objects'::regclass) THEN
    CREATE POLICY "Authenticated users upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');
  END IF;
END$$;

-- Create function to increment project amount
CREATE OR REPLACE FUNCTION increment_project_amount(project_id UUID, amount_to_add INT)
RETURNS VOID AS $$
BEGIN
  UPDATE projects SET current_amount = current_amount + amount_to_add WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Add enhanced project fields to existing projects table (idempotent)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_images TEXT[];
ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_preferences JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_summary TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS challenge TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS solution TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS activities TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS donation_usage TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS minimum_donation INT DEFAULT 1;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location_country TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location_region TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_details JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
