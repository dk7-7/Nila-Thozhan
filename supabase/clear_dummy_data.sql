-- clear_dummy_data.sql
-- Run this in your Supabase SQL Editor to wipe out all sample dummy documents and start fresh.

BEGIN;

-- 1. Delete all dummy validation and support records
DELETE FROM public.validation_evidence;
DELETE FROM public.validation_reports;
DELETE FROM public.officer_recommendations;
DELETE FROM public.digital_signatures;
DELETE FROM public.extracted_fields;
DELETE FROM public.cadastral_boundaries;
DELETE FROM public.cadastral_details;
DELETE FROM public.audit_events;
DELETE FROM public.notifications;
DELETE FROM public.citizen_queries;
DELETE FROM public.support_tickets;

-- 2. Delete all seeded land documents
DELETE FROM public.land_documents;

COMMIT;

-- Verification
SELECT count(*) AS remaining_documents FROM public.land_documents;
