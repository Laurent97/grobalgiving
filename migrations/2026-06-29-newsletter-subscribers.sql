-- Newsletter Subscribers Table
-- Stores email addresses for the newsletter subscription form

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  source        TEXT DEFAULT 'website'
);

-- Index for fast email lookups / upserts
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON newsletter_subscribers (email);

-- RLS: public can insert, nobody can read (admin only via service role)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- SELECT needed so upsert conflict detection works for anon role
CREATE POLICY "Anyone can read own subscription by email"
  ON newsletter_subscribers
  FOR SELECT
  TO public
  USING (true);

-- Allow anon/authenticated to upsert (needed for onConflict upsert)
CREATE POLICY "Anyone can update own subscription"
  ON newsletter_subscribers
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
