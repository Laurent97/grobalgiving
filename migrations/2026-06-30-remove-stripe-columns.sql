-- Remove Stripe-specific columns from donations table
-- The platform uses bank transfer / mobile money / crypto — not Stripe

ALTER TABLE donations DROP COLUMN IF EXISTS stripe_session_id;
ALTER TABLE donations DROP COLUMN IF EXISTS stripe_subscription_id;
