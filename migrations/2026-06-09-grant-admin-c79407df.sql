-- Migration: Grant admin role to specific user
-- Run this in Supabase SQL editor or include in your migration pipeline.

BEGIN;

-- Upsert profile and set role to 'admin'
INSERT INTO public.profiles (id, full_name, role, nonprofit_id, avatar_url, created_at)
VALUES (
  'c79407df-5100-443b-b3da-105c5cdb6702',
  'lkn;',
  'admin',
  NULL,
  NULL,
  '2026-06-08 17:43:08.718048+00'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Record audit log for granting admin role (idempotent)
INSERT INTO public.admin_audit_log (id, admin_id, action, target_id, old_value, new_value, created_at)
SELECT gen_random_uuid(), p.id, 'grant_admin_role', p.id, NULL, jsonb_build_object('role', 'admin'), now()
FROM (SELECT 'c79407df-5100-443b-b3da-105c5cdb6702'::uuid AS id) AS p
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_audit_log WHERE admin_id = p.id AND action = 'grant_admin_role' AND target_id = p.id
);

COMMIT;
