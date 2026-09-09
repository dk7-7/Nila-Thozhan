-- fix_auth_triggers.sql
-- Run this in your Supabase SQL Editor to fix "Database error querying schema" (500) during login.

BEGIN;

-- 1. Fix handle_new_user function with explicit search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    default_role public.user_role := 'CITIZEN';
    user_full_name TEXT;
    user_phone TEXT;
    user_dept TEXT;
    user_desig TEXT;
    user_loc TEXT;
BEGIN
    -- Extract role from user_metadata if provided
    IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
        BEGIN
            default_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
        EXCEPTION WHEN OTHERS THEN
            default_role := 'CITIZEN';
        END;
    END IF;

    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    user_phone := NEW.raw_user_meta_data->>'phone';
    user_dept := NEW.raw_user_meta_data->>'department';
    user_desig := NEW.raw_user_meta_data->>'designation';
    user_loc := NEW.raw_user_meta_data->>'location';

    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role,
        department,
        designation,
        phone,
        location,
        is_active
    ) VALUES (
        NEW.id,
        user_full_name,
        NEW.email,
        default_role,
        user_dept,
        user_desig,
        user_phone,
        user_loc,
        TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- 2. Drop the problematic UPDATE trigger on auth.users (causes 500 error on login)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Re-create ONLY for AFTER INSERT
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
