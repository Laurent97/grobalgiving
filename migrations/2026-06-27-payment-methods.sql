-- Migration: Payment Methods and Enhanced Donation System
-- This migration adds support for Bank Transfer, Mobile Money, and Cryptocurrency payments

-- ============================================
-- BANK ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT,
  swift_bic TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('international', 'local', 'regional')),
  currency TEXT NOT NULL DEFAULT 'USD',
  country TEXT NOT NULL,
  branch_address TEXT,
  instructions TEXT,
  bank_logo_url TEXT,
  status BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index for bank accounts
CREATE INDEX IF NOT EXISTS idx_bank_accounts_status ON bank_accounts(status);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_display_order ON bank_accounts(display_order);

-- ============================================
-- MOBILE MONEY ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mobile_money_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  country TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  network_type TEXT NOT NULL,
  currency TEXT NOT NULL,
  fee_structure TEXT NOT NULL CHECK (fee_structure IN ('sender', 'receiver', 'shared')),
  instructions TEXT,
  status BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index for mobile money accounts
CREATE INDEX IF NOT EXISTS idx_mobile_money_status ON mobile_money_accounts(status);
CREATE INDEX IF NOT EXISTS idx_mobile_money_country ON mobile_money_accounts(country);
CREATE INDEX IF NOT EXISTS idx_mobile_money_display_order ON mobile_money_accounts(display_order);

-- ============================================
-- CRYPTOCURRENCY WALLETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_name TEXT NOT NULL,
  currency_symbol TEXT NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL,
  qr_code_url TEXT,
  min_amount DECIMAL(20, 8) DEFAULT 0,
  exchange_rate_source TEXT DEFAULT 'manual',
  status BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index for crypto wallets
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_status ON crypto_wallets(status);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_symbol ON crypto_wallets(currency_symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_display_order ON crypto_wallets(display_order);

-- ============================================
-- DONATION CART TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS donation_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest users
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD',
  dedication_type TEXT CHECK (dedication_type IN ('memory', 'honor', null)),
  dedication_name TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for donation cart
CREATE INDEX IF NOT EXISTS idx_donation_cart_user ON donation_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_donation_cart_session ON donation_cart(session_id);
CREATE INDEX IF NOT EXISTS idx_donation_cart_project ON donation_cart(project_id);

-- ============================================
-- ENHANCED DONATIONS TABLE
-- ============================================
-- Add new columns to existing donations table
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS payment_method_type TEXT CHECK (payment_method_type IN ('bank', 'mobile_money', 'crypto', 'card')),
ADD COLUMN IF NOT EXISTS payment_method_id UUID,
ADD COLUMN IF NOT EXISTS transaction_reference TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS dedication_type TEXT CHECK (dedication_type IN ('memory', 'honor', null)),
ADD COLUMN IF NOT EXISTS dedication_name TEXT,
ADD COLUMN IF NOT EXISTS donor_comment TEXT;

-- Add foreign key constraint for payment_method_id (will reference multiple tables)
-- Note: This is a polymorphic relationship, handled at application level

-- Index for enhanced donations
CREATE INDEX IF NOT EXISTS idx_donations_payment_method ON donations(payment_method_type, payment_method_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_verified ON donations(verified_by);

-- ============================================
-- PAYMENT AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'verified', 'rejected'
  entity_type TEXT NOT NULL, -- 'bank_account', 'mobile_money', 'crypto_wallet', 'donation'
  entity_id UUID NOT NULL,
  changes JSONB, -- Store old/new values
  performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON payment_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by ON payment_audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON payment_audit_log(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Bank Accounts RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all bank accounts"
  ON bank_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Public can view active bank accounts"
  ON bank_accounts FOR SELECT
  TO anon, authenticated
  USING (status = true);

CREATE POLICY "Admins can insert bank accounts"
  ON bank_accounts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update bank accounts"
  ON bank_accounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete bank accounts"
  ON bank_accounts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Mobile Money RLS
ALTER TABLE mobile_money_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all mobile money accounts"
  ON mobile_money_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Public can view active mobile money accounts"
  ON mobile_money_accounts FOR SELECT
  TO anon, authenticated
  USING (status = true);

CREATE POLICY "Admins can insert mobile money accounts"
  ON mobile_money_accounts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update mobile money accounts"
  ON mobile_money_accounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete mobile money accounts"
  ON mobile_money_accounts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Crypto Wallets RLS
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all crypto wallets"
  ON crypto_wallets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Public can view active crypto wallets"
  ON crypto_wallets FOR SELECT
  TO anon, authenticated
  USING (status = true);

CREATE POLICY "Admins can insert crypto wallets"
  ON crypto_wallets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update crypto wallets"
  ON crypto_wallets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete crypto wallets"
  ON crypto_wallets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Donation Cart RLS
ALTER TABLE donation_cart ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON donation_cart FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Guests can view cart by session"
  ON donation_cart FOR SELECT
  TO anon, authenticated
  USING (session_id IS NOT NULL);

CREATE POLICY "Users can insert own cart items"
  ON donation_cart FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Guests can insert cart items"
  ON donation_cart FOR INSERT
  TO anon, authenticated
  WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Users can update own cart items"
  ON donation_cart FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own cart items"
  ON donation_cart FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Guests can delete cart items"
  ON donation_cart FOR DELETE
  TO anon, authenticated
  USING (session_id IS NOT NULL);

-- Payment Audit Log RLS
ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON payment_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert audit log"
  ON payment_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mobile_money_updated_at
  BEFORE UPDATE ON mobile_money_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crypto_wallets_updated_at
  BEFORE UPDATE ON crypto_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donation_cart_updated_at
  BEFORE UPDATE ON donation_cart
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- Insert sample bank account
INSERT INTO bank_accounts (account_name, bank_name, account_number, routing_number, swift_bic, account_type, currency, country, branch_address, instructions, display_order)
VALUES (
  'GlobalGiving International Account',
  'Citibank',
  '1234567890',
  '021000021',
  'CITIUS33',
  'international',
  'USD',
  'United States',
  '388 Greenwich St, New York, NY 10013',
  'Please include project ID in reference field',
  1
) ON CONFLICT DO NOTHING;

-- Insert sample mobile money account
INSERT INTO mobile_money_accounts (provider_name, country, phone_number, account_name, network_type, currency, fee_structure, instructions, display_order)
VALUES (
  'M-Pesa',
  'Kenya',
  '+254712345678',
  'GlobalGiving Foundation',
  'Safaricom',
  'KES',
  'sender',
  'Include project code as reference',
  1
) ON CONFLICT DO NOTHING;

-- Insert sample crypto wallet
INSERT INTO crypto_wallets (currency_name, currency_symbol, wallet_address, network, min_amount, display_order)
VALUES (
  'Bitcoin',
  'BTC',
  '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  'Bitcoin Network',
  0.001,
  1
) ON CONFLICT DO NOTHING;
