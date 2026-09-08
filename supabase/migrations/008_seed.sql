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

-- 3. Seed Legacy Land Records
INSERT INTO public.legacy_land_records (record_number, owner_name, survey_number, subdivision, village, taluk, district, area_acres, mutation_year, record_status)
VALUES 
    ('LR-TN-1987-04421', 'Ramesh Patel', '124/3A', '3A', 'Vandalur', 'Vandalur', 'Chengalpattu', 2.45, 1987, 'ACTIVE'),
    ('LR-TN-1992-11082', 'K. Murugan', '124/4B', '4B', 'Vandalur', 'Vandalur', 'Chengalpattu', 1.85, 1992, 'ACTIVE'),
    ('LR-TN-2001-08734', 'S. Lakshmi', '88/2C', '2C', 'Padappai', 'Sriperumbudur', 'Kanchipuram', 3.10, 2001, 'ACTIVE'),
    ('LR-TN-1979-02115', 'R. Govindaraj', '152/1A', '1A', 'Guduvancheri', 'Vandalur', 'Chengalpattu', 3.80, 1979, 'DISPUTED')
ON CONFLICT (record_number) DO NOTHING;

-- 4. Seed Representative Documents for the Citizen
DO $$
DECLARE
    v_citizen_id UUID := '11111111-1111-1111-1111-111111111111';
    v_officer_id UUID := '22222222-2222-2222-2222-222222222222';
    v_doc1_id UUID := 'd1111111-1111-1111-1111-111111111111';
    v_doc2_id UUID := 'd2222222-2222-2222-2222-222222222222';
    v_doc3_id UUID := 'd3333333-3333-3333-3333-333333333333';
    v_parcel1_id UUID;
    v_parcel4_id UUID;
    v_rep1_id UUID;
    v_rep2_id UUID;
    v_rep3_id UUID;
BEGIN
    SELECT id INTO v_parcel1_id FROM public.gis_parcels WHERE parcel_id = 'TN-CGL-1243A' LIMIT 1;
    SELECT id INTO v_parcel4_id FROM public.gis_parcels WHERE parcel_id = 'TN-CGL-1521A' LIMIT 1;

    -- Document 1: GIS Verified / Ready for Approval
    IF NOT EXISTS (SELECT 1 FROM public.land_documents WHERE id = v_doc1_id) THEN
        INSERT INTO public.land_documents (
            id, document_number, title, document_type, survey_number, owner_name,
            village, taluk, district, land_area, land_area_numeric, submission_date,
            status, overall_confidence, confidence_score, uploaded_by, citizen_email,
            assigned_officer, gis_parcel_id, scenario_type
        ) VALUES (
            v_doc1_id, 'LR-2024-8841', 'Sale Deed - Survey 124/3A', 'Sale Deed', '124/3A', 'Ramesh Patel',
            'Vandalur', 'Vandalur', 'Chengalpattu', '2.45 acres', 2.45, CURRENT_DATE - INTERVAL '12 days',
            'GIS_VERIFIED', 'HIGH', 97, v_citizen_id, 'citizen@nilathozhan.tn.gov.in',
            v_officer_id, v_parcel1_id, 'NORMAL_VERIFIED'
        );

        -- Cadastral Details
        INSERT INTO public.cadastral_details (
            document_id, patta_number, land_classification, sro_jurisdiction,
            document_registration_number, relative_name, tamil_owner_name,
            tamil_village, tamil_taluk, tamil_district
        ) VALUES (
            v_doc1_id, '412', 'நன்செய் (Wetland)', 'Guduvancheri SRO',
            'Doc No. 1842/2024', 'Late Mohanlal Patel', 'ரமேஷ் படேல்',
            'வண்டலூர்', 'வண்டலூர்', 'செங்கல்பட்டு'
        );

        -- Cadastral Boundaries
        INSERT INTO public.cadastral_boundaries (
            document_id, north, south, east, west,
            tamil_north, tamil_south, tamil_east, tamil_west
        ) VALUES (
            v_doc1_id, 'Survey 124/2 (Arumugam Land)', 'Village Cart Track', 'Survey 124/3B (Channel)', 'GST Road Buffer',
            'வடக்கு: சர்வே 124/2 (ஆறுமுகம் நிலம்)', 'தெற்கு: வண்டிப் பாதை', 'கிழக்கு: சர்வே 124/3B (வாய்க்கால்)', 'மேற்கு: ஜி.எஸ்.டி சாலை எல்லை'
        );

        -- Extracted Fields
        INSERT INTO public.extracted_fields (document_id, field_name, field_key, value, confidence, confidence_score, is_verified)
        VALUES 
            (v_doc1_id, 'Owner Name', 'ownerName', 'Ramesh Patel', 'HIGH', 99, true),
            (v_doc1_id, 'Survey Number', 'surveyNumber', '124/3A', 'HIGH', 98, true),
            (v_doc1_id, 'Village', 'village', 'Vandalur', 'HIGH', 96, true),
            (v_doc1_id, 'Land Area', 'landArea', '2.45 acres', 'HIGH', 95, true),
            (v_doc1_id, 'Taluk', 'taluk', 'Vandalur', 'HIGH', 97, true),
            (v_doc1_id, 'District', 'district', 'Chengalpattu', 'HIGH', 99, true);

        -- Validation Report
        INSERT INTO public.validation_reports (
            id, document_id, status, plain_language_explanation, conflicting_fields,
            recommended_action, deterministic_rules_passed, ai_explanation_text
        ) VALUES (
            gen_random_uuid(), v_doc1_id, 'VERIFIED',
            'All OCR extracted fields match Tamil Nadu Revenue department records and GIS cadastral layer.',
            ARRAY[]::TEXT[], 'Ready for officer recommendation and Sub-Registrar approval.',
            true, 'Confidence: 97%. Deterministic matching passed across all legacy volume checks.'
        ) RETURNING id INTO v_rep1_id;

        INSERT INTO public.validation_evidence (report_id, source, extracted_value, status, detail)
        VALUES 
            (v_rep1_id, 'Document', 'Survey 124/3A (2.45 acres)', 'MATCH', 'Deed registration details confirmed'),
            (v_rep1_id, 'GIS', 'Parcel TN-CGL-1243A', 'MATCH', 'Boundary coordinates align with satellite survey');
    END IF;

    -- Document 2: Needs Attention / Survey Conflict
    IF NOT EXISTS (SELECT 1 FROM public.land_documents WHERE id = v_doc2_id) THEN
        INSERT INTO public.land_documents (
            id, document_number, title, document_type, survey_number, owner_name,
            village, taluk, district, land_area, land_area_numeric, submission_date,
            status, overall_confidence, confidence_score, uploaded_by, citizen_email,
            assigned_officer, gis_parcel_id, action_required_citizen, scenario_type
        ) VALUES (
            v_doc2_id, 'LR-2024-4192', 'Patta Record - Survey 152/1A', 'Patta / RoR', '152/1A', 'R. Govindaraj & Ramesh Patel',
            'Guduvancheri', 'Vandalur', 'Chengalpattu', '4.20 acres', 4.20, CURRENT_DATE - INTERVAL '5 days',
            'NEEDS_ATTENTION', 'MEDIUM', 74, v_citizen_id, 'citizen@nilathozhan.tn.gov.in',
            v_officer_id, v_parcel4_id, 'Discrepancy between stated deed area (4.20 acres) and legacy mutation entry (3.80 acres). Field inspection scheduled.', 'SURVEY_CONFLICT'
        );

        INSERT INTO public.cadastral_details (
            document_id, patta_number, land_classification, sro_jurisdiction,
            document_registration_number, relative_name, tamil_owner_name,
            tamil_village, tamil_taluk, tamil_district
        ) VALUES (
            v_doc2_id, '589', 'மானாவாரி (Rainfed)', 'Guduvancheri SRO',
            'Patta No. 589/2019', 'R. Govindaraj', 'ரமேஷ் படேல் / ஆர். கோவிந்தராஜ்',
            'கூடுவாஞ்சேரி', 'வண்டலூர்', 'செங்கல்பட்டு'
        );

        INSERT INTO public.cadastral_boundaries (
            document_id, north, south, east, west,
            tamil_north, tamil_south, tamil_east, tamil_west
        ) VALUES (
            v_doc2_id, 'Survey 151', 'Irrigation Lake Buffer', 'Survey 152/2B', 'Village Pathway',
            'வடக்கு: சர்வே 151', 'தெற்கு: ஏரி புறம்போக்கு எல்லை', 'கிழக்கு: சர்வே 152/2B', 'மேற்கு: கிராமப் பாதை'
        );

        INSERT INTO public.extracted_fields (document_id, field_name, field_key, value, confidence, confidence_score, is_verified)
        VALUES 
            (v_doc2_id, 'Owner Name', 'ownerName', 'R. Govindaraj & Ramesh Patel', 'MEDIUM', 76, false),
            (v_doc2_id, 'Survey Number', 'surveyNumber', '152/1A', 'HIGH', 94, true),
            (v_doc2_id, 'Village', 'village', 'Guduvancheri', 'HIGH', 95, true),
            (v_doc2_id, 'Land Area', 'landArea', '4.20 acres', 'LOW', 62, false);

        INSERT INTO public.validation_reports (
            id, document_id, status, primary_issue, plain_language_explanation,
            conflicting_fields, recommended_action, deterministic_rules_passed, ai_explanation_text
        ) VALUES (
            gen_random_uuid(), v_doc2_id, 'CONFLICT', 'Area Discrepancy & Water Body Buffer',
            'Area stated in submitted document (4.20 acres) exceeds historical A-Register area (3.80 acres) by 0.40 acres. Southern boundary touches water body buffer.',
            ARRAY['landArea', 'southernBoundary']::TEXT[], 'Field surveyor inspection required before any title mutation.',
            false, 'Spatial overlap detected on southern parcel segment with state water body preservation zone.'
        ) RETURNING id INTO v_rep2_id;
    END IF;

    -- Document 3: Approved & Digitally Signed
    IF NOT EXISTS (SELECT 1 FROM public.land_documents WHERE id = v_doc3_id) THEN
        INSERT INTO public.land_documents (
            id, document_number, title, document_type, survey_number, owner_name,
            village, taluk, district, land_area, land_area_numeric, submission_date,
            status, overall_confidence, confidence_score, uploaded_by, citizen_email,
            assigned_officer, scenario_type
        ) VALUES (
            v_doc3_id, 'LR-2024-1029', 'Inheritance Title - Survey 88/2C', 'Inheritance Title', '88/2C', 'Ramesh Patel',
            'Padappai', 'Sriperumbudur', 'Kanchipuram', '3.10 acres', 3.10, CURRENT_DATE - INTERVAL '30 days',
            'APPROVED', 'HIGH', 99, v_citizen_id, 'citizen@nilathozhan.tn.gov.in',
            v_officer_id, 'NORMAL_VERIFIED'
        );

        INSERT INTO public.cadastral_details (
            document_id, patta_number, land_classification, sro_jurisdiction,
            document_registration_number, relative_name, tamil_owner_name,
            tamil_village, tamil_taluk, tamil_district
        ) VALUES (
            v_doc3_id, '204', 'நன்செய் (Wetland)', 'Padappai SRO',
            'Doc No. 892/2021', 'Late Mohanlal Patel', 'ரமேஷ் படேல்',
            'படப்பை', 'ஸ்ரீபெரும்புதூர்', 'காஞ்சிபுரம்'
        );

        INSERT INTO public.digital_signatures (
            document_id, certificate_id, signer_id, signer_name, signer_designation,
            algorithm, signature_hash, document_hash, signed_at, verification_reference
        ) VALUES (
            v_doc3_id, 'DSC-TN-2024-99124', '33333333-3333-3333-3333-333333333333',
            'Dr. V. Narayanan', 'Sub-Registrar & Head of Approvals',
            'RSA-PSS / SHA-256 (CCA India Compliant)',
            'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
            'd41d8cd98f00b204e9800998ecf8427e',
            CURRENT_DATE - INTERVAL '15 days',
            'https://landrecords.tn.gov.in/verify/dsign/DSC-TN-2024-99124'
        );

        INSERT INTO public.validation_reports (
            id, document_id, status, plain_language_explanation, conflicting_fields,
            recommended_action, deterministic_rules_passed, ai_explanation_text
        ) VALUES (
            gen_random_uuid(), v_doc3_id, 'VERIFIED',
            'Document fully validated and digitally executed by Sub-Registrar.',
            ARRAY[]::TEXT[], 'Approved and legally effective.', true, 'Complete chain of custody verified.'
        );
    END IF;
END $$;
