-- 002_core_tables.sql
-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'CITIZEN',
    department TEXT,
    designation TEXT,
    phone TEXT,
    location TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. GIS Parcels Table (PostGIS-enabled)
CREATE TABLE IF NOT EXISTS public.gis_parcels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcel_id TEXT NOT NULL UNIQUE,
    survey_number TEXT NOT NULL,
    village TEXT NOT NULL,
    area_acres NUMERIC(10, 4) NOT NULL,
    centroid_x NUMERIC(10, 4) NOT NULL,
    centroid_y NUMERIC(10, 4) NOT NULL,
    coordinates JSONB NOT NULL,
    geom geometry(Polygon, 4326),
    land_use TEXT NOT NULL,
    water_body_adjacent BOOLEAN NOT NULL DEFAULT FALSE,
    road_access BOOLEAN NOT NULL DEFAULT TRUE,
    historical_boundary_match BOOLEAN NOT NULL DEFAULT TRUE,
    spatial_conflict BOOLEAN NOT NULL DEFAULT FALSE,
    status gis_parcel_status NOT NULL DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Legacy Land Records (Government Reference Data)
CREATE TABLE IF NOT EXISTS public.legacy_land_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_number TEXT NOT NULL UNIQUE,
    owner_name TEXT NOT NULL,
    survey_number TEXT NOT NULL,
    subdivision TEXT,
    village TEXT NOT NULL,
    taluk TEXT NOT NULL,
    district TEXT NOT NULL,
    area_acres NUMERIC(10, 4) NOT NULL,
    mutation_year INTEGER NOT NULL,
    record_status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Land Documents (Core Document Registry)
CREATE TABLE IF NOT EXISTS public.land_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    document_type document_type NOT NULL,
    survey_number TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    village TEXT NOT NULL,
    taluk TEXT NOT NULL,
    district TEXT NOT NULL,
    land_area TEXT NOT NULL,
    land_area_numeric NUMERIC(10, 4) NOT NULL DEFAULT 0,
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status document_status NOT NULL DEFAULT 'PROCESSING',
    overall_confidence confidence_level NOT NULL DEFAULT 'HIGH',
    confidence_score INTEGER NOT NULL DEFAULT 95 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    citizen_email TEXT NOT NULL,
    assigned_officer UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    gis_parcel_id UUID REFERENCES public.gis_parcels(id) ON DELETE SET NULL,
    action_required_citizen TEXT,
    officer_notes TEXT,
    scenario_type TEXT DEFAULT 'NORMAL_VERIFIED',
    file_url TEXT,
    file_name TEXT,
    file_size TEXT,
    file_type TEXT,
    storage_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Extracted OCR Fields
CREATE TABLE IF NOT EXISTS public.extracted_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.land_documents(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_key TEXT NOT NULL,
    value TEXT NOT NULL,
    confidence confidence_level NOT NULL DEFAULT 'HIGH',
    confidence_score INTEGER NOT NULL DEFAULT 95 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_document_field_key UNIQUE(document_id, field_key)
);

-- 6. Tamil Cadastral Details
CREATE TABLE IF NOT EXISTS public.cadastral_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL UNIQUE REFERENCES public.land_documents(id) ON DELETE CASCADE,
    patta_number TEXT,
    land_classification TEXT,
    sro_jurisdiction TEXT,
    document_registration_number TEXT,
    relative_name TEXT,
    tamil_owner_name TEXT,
    tamil_village TEXT,
    tamil_taluk TEXT,
    tamil_district TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Cadastral Boundaries
CREATE TABLE IF NOT EXISTS public.cadastral_boundaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL UNIQUE REFERENCES public.land_documents(id) ON DELETE CASCADE,
    north TEXT,
    south TEXT,
    east TEXT,
    west TEXT,
    tamil_north TEXT,
    tamil_south TEXT,
    tamil_east TEXT,
    tamil_west TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Validation Reports
CREATE TABLE IF NOT EXISTS public.validation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL UNIQUE REFERENCES public.land_documents(id) ON DELETE CASCADE,
    status validation_status NOT NULL DEFAULT 'VERIFIED',
    primary_issue TEXT,
    plain_language_explanation TEXT NOT NULL,
    conflicting_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
    recommended_action TEXT NOT NULL,
    deterministic_rules_passed BOOLEAN NOT NULL DEFAULT TRUE,
    ai_explanation_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Validation Evidence
CREATE TABLE IF NOT EXISTS public.validation_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.validation_reports(id) ON DELETE CASCADE,
    source evidence_source NOT NULL,
    extracted_value TEXT NOT NULL,
    status evidence_status NOT NULL DEFAULT 'MATCH',
    detail TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Officer Recommendations
CREATE TABLE IF NOT EXISTS public.officer_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.land_documents(id) ON DELETE CASCADE,
    action recommendation_action NOT NULL,
    reason TEXT NOT NULL,
    comments TEXT,
    officer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    officer_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Digital Signatures (CCA India Compliant Audit Model)
CREATE TABLE IF NOT EXISTS public.digital_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL UNIQUE REFERENCES public.land_documents(id) ON DELETE CASCADE,
    certificate_id TEXT NOT NULL,
    signer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    signer_name TEXT NOT NULL,
    signer_designation TEXT NOT NULL,
    algorithm TEXT NOT NULL DEFAULT 'RSA-PSS / SHA-256 (CCA India Compliant)',
    signature_hash TEXT NOT NULL,
    document_hash TEXT NOT NULL,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_reference TEXT NOT NULL
);

-- 12. Audit Events (Append-Only)
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.land_documents(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_role user_role NOT NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    comments TEXT,
    digital_signature_id TEXT,
    previous_status document_status,
    new_status document_status,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_roles user_role[] NOT NULL DEFAULT ARRAY['CITIZEN']::user_role[],
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'INFO',
    document_id UUID REFERENCES public.land_documents(id) ON DELETE SET NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Citizen Queries
CREATE TABLE IF NOT EXISTS public.citizen_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.land_documents(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status query_status NOT NULL DEFAULT 'OPEN',
    officer_response TEXT,
    responded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    priority ticket_priority NOT NULL DEFAULT 'MEDIUM',
    status ticket_status NOT NULL DEFAULT 'OPEN',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Document Assignments
CREATE TABLE IF NOT EXISTS public.document_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.land_documents(id) ON DELETE CASCADE,
    officer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

-- 17. Workflow History
CREATE TABLE IF NOT EXISTS public.workflow_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.land_documents(id) ON DELETE CASCADE,
    from_status document_status,
    to_status document_status NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
