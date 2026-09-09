-- 008_seed.sql
-- Seed Demo Accounts and Authentic Tamil Nadu Cadastral Data

-- 1. Create Demo Auth Users if they don't already exist
DO $$
DECLARE
    v_citizen_id UUID := '11111111-1111-1111-1111-111111111111';
    v_officer_id UUID := '22222222-2222-2222-2222-222222222222';
    v_authority_id UUID := '33333333-3333-3333-3333-333333333333';
    v_password_hash TEXT := crypt('NilaThozhan2026!', gen_salt('bf'));
BEGIN
    -- Citizen User
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'citizen@nilathozhan.tn.gov.in') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            v_citizen_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'citizen@nilathozhan.tn.gov.in', v_password_hash, NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Ramesh Patel","role":"CITIZEN","phone":"+91 98401 23456","location":"Vandalur, Chengalpattu","department":"Landholder Self-Service Portal","designation":"Citizen / Landowner"}',
            NOW(), NOW()
        );

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
        ) VALUES (
            v_citizen_id, v_citizen_id,
            jsonb_build_object('sub', v_citizen_id::text, 'email', 'citizen@nilathozhan.tn.gov.in'),
            'email', v_citizen_id::text, NOW(), NOW(), NOW()
        ) ON CONFLICT (provider, provider_id) DO NOTHING;
    END IF;

    -- Officer User
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'officer@nilathozhan.tn.gov.in') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            v_officer_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'officer@nilathozhan.tn.gov.in', v_password_hash, NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Officer K. Sharma","role":"OFFICER","phone":"+91 94440 98765","location":"Chengalpattu Revenue Taluk","department":"Land Records & Survey Division","designation":"Village Officer / VAO"}',
            NOW(), NOW()
        );

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
        ) VALUES (
            v_officer_id, v_officer_id,
            jsonb_build_object('sub', v_officer_id::text, 'email', 'officer@nilathozhan.tn.gov.in'),
            'email', v_officer_id::text, NOW(), NOW(), NOW()
        ) ON CONFLICT (provider, provider_id) DO NOTHING;
    END IF;

    -- High Authority User
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'authority@nilathozhan.tn.gov.in') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            v_authority_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'authority@nilathozhan.tn.gov.in', v_password_hash, NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Dr. V. Narayanan","role":"HIGH_AUTHORITY","phone":"+91 94441 54321","location":"Registration Secretariat","department":"Registration & Revenue Administration","designation":"Sub-Registrar & Head of Approvals"}',
            NOW(), NOW()
        );

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
        ) VALUES (
            v_authority_id, v_authority_id,
            jsonb_build_object('sub', v_authority_id::text, 'email', 'authority@nilathozhan.tn.gov.in'),
            'email', v_authority_id::text, NOW(), NOW(), NOW()
        ) ON CONFLICT (provider, provider_id) DO NOTHING;
    END IF;
END $$;

-- 2. Seed GIS Parcels (Authentic Tamil Nadu Cadastral Layouts)
INSERT INTO public.gis_parcels (parcel_id, survey_number, village, area_acres, centroid_x, centroid_y, coordinates, land_use, water_body_adjacent, road_access, historical_boundary_match, spatial_conflict, status)
VALUES 
    ('TN-CGL-1243A', '124/3A', 'Vandalur', 2.45, 225, 130, '[[160, 80], [290, 75], [300, 185], [155, 190]]'::jsonb, 'Nanjai (Wetland Agricultural / Paddy)', true, true, true, false, 'VERIFIED'),
    ('TN-CGL-1244B', '124/4B', 'Vandalur', 1.85, 360, 130, '[[290, 75], [420, 70], [430, 180], [300, 185]]'::jsonb, 'Punjai (Dryland Agricultural)', false, true, true, false, 'VERIFIED'),
    ('TN-SRP-0882C', '88/2C', 'Padappai', 3.10, 90, 130, '[[30, 85], [160, 80], [155, 190], [25, 195]]'::jsonb, 'Nanjai (Wetland Agricultural)', true, false, true, false, 'VERIFIED'),
    ('TN-CGL-1521A', '152/1A', 'Guduvancheri', 4.20, 200, 280, '[[100, 220], [310, 210], [320, 340], [90, 350]]'::jsonb, 'Manavari (Rainfed Agricultural)', true, true, false, true, 'CONFLICT'),
    ('TN-CGL-1522B', '152/2B', 'Guduvancheri', 3.80, 370, 280, '[[310, 210], [440, 205], [450, 335], [320, 340]]'::jsonb, 'Punjai (Dryland Agricultural)', false, true, true, false, 'VERIFIED')
ON CONFLICT (parcel_id) DO NOTHING;

-- 3. Seed Legacy Land Records (Reference Data)
INSERT INTO public.legacy_land_records (record_number, owner_name, survey_number, subdivision, village, taluk, district, area_acres, mutation_year, record_status)
VALUES 
    ('LR-TN-1987-04421', 'Ramesh Patel', '124/3A', '3A', 'Vandalur', 'Vandalur', 'Chengalpattu', 2.45, 1987, 'ACTIVE'),
    ('LR-TN-1992-11082', 'K. Murugan', '124/4B', '4B', 'Vandalur', 'Vandalur', 'Chengalpattu', 1.85, 1992, 'ACTIVE'),
    ('LR-TN-2001-08734', 'S. Lakshmi', '88/2C', '2C', 'Padappai', 'Sriperumbudur', 'Kanchipuram', 3.10, 2001, 'ACTIVE'),
    ('LR-TN-1979-02115', 'R. Govindaraj', '152/1A', '1A', 'Guduvancheri', 'Vandalur', 'Chengalpattu', 3.80, 1979, 'DISPUTED')
ON CONFLICT (record_number) DO NOTHING;

