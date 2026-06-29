-- ============================================
-- SLIDESHOW SLIDES TABLE
-- Custom slides managed by admins for the hero
-- ============================================

CREATE TABLE IF NOT EXISTS slideshow_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  alt_text TEXT,
  source TEXT NOT NULL DEFAULT 'custom',
  source_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS slideshow_slides_status_idx ON slideshow_slides (status);
CREATE INDEX IF NOT EXISTS slideshow_slides_order_idx ON slideshow_slides (display_order);

ALTER TABLE slideshow_slides ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins manage slideshow slides"
  ON slideshow_slides FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Public can read active slides (for the hero)
CREATE POLICY "Public can read active slides"
  ON slideshow_slides FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_slideshow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_slideshow_updated_at ON slideshow_slides;
CREATE TRIGGER trg_slideshow_updated_at
  BEFORE UPDATE ON slideshow_slides
  FOR EACH ROW EXECUTE FUNCTION update_slideshow_updated_at();
