-- Migration: add website_url column to projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS website_url TEXT;
