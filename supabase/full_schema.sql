-- 001_enums_and_extensions.sql
-- Enable PostGIS & cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. User Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CITIZEN', 'OFFICER', 'HIGH_AUTHORITY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Document Status State Machine
DO $$ BEGIN
    CREATE TYPE document_status AS ENUM (
        'PROCESSING',
        'DIGITIZED',
        'UNDER_VERIFICATION',
        'GIS_VERIFIED',
        'READY_FOR_APPROVAL',
        'APPROVED',
        'REJECTED',
        'NEEDS_ATTENTION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Document Types
DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'Sale Deed',
        'Patta / RoR',
        'Gift Deed',
        'Partition Deed',
        'Inheritance Title',
        'A-Register',
        'Encumbrance Certificate',
        'Settlement Deed',
        'Lease Deed',
        'Mortgage Deed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Validation Status
DO $$ BEGIN
    CREATE TYPE validation_status AS ENUM (
        'VERIFIED',
        'NEEDS_MANUAL_REVIEW',
        'CONFLICT',
        'PARTIALLY_VERIFIED',
        'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Confidence Level
DO $$ BEGIN
    CREATE TYPE confidence_level AS ENUM ('HIGH', 'MEDIUM', 'LOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. GIS Parcel Status
DO $$ BEGIN
    CREATE TYPE gis_parcel_status AS ENUM (
        'VERIFIED',
        'PENDING',
        'CONFLICT',
        'BUFFER_RESTRICTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Notification Type
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'INFO',
        'WARNING',
        'SUCCESS',
        'ACTION_REQUIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 8. Ticket Priority & Status
DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. Query Status
DO $$ BEGIN
    CREATE TYPE query_status AS ENUM ('OPEN', 'RESOLVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 10. Evidence Source & Status
DO $$ BEGIN
    CREATE TYPE evidence_source AS ENUM (
        'Document',
        'Land Record',
        'GIS',
        'Historical Record',
        'Field Survey'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_status AS ENUM (
        'MATCH',
        'MISMATCH',
        'UNAVAILABLE',
        'REVIEW_NEEDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 11. Officer Recommendation Action
DO $$ BEGIN
    CREATE TYPE recommendation_action AS ENUM (
        'APPROVE',
        'RETURN',
        'REJECT',
        'NEEDS_MANUAL_REVIEW'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
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
-- 003_indexes.sql
-- Performance Indexes for Nila Thozhan

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Land Documents
CREATE INDEX IF NOT EXISTS idx_land_docs_status ON public.land_documents(status);
CREATE INDEX IF NOT EXISTS idx_land_docs_uploaded_by ON public.land_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_land_docs_assigned_officer ON public.land_documents(assigned_officer);
CREATE INDEX IF NOT EXISTS idx_land_docs_survey_number ON public.land_documents(survey_number);
CREATE INDEX IF NOT EXISTS idx_land_docs_document_number ON public.land_documents(document_number);
CREATE INDEX IF NOT EXISTS idx_land_docs_owner_name ON public.land_documents(owner_name);
CREATE INDEX IF NOT EXISTS idx_land_docs_village ON public.land_documents(village);
CREATE INDEX IF NOT EXISTS idx_land_docs_created_at ON public.land_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_land_docs_submission_date ON public.land_documents(submission_date DESC);

-- Extracted Fields
CREATE INDEX IF NOT EXISTS idx_extracted_fields_doc_id ON public.extracted_fields(document_id);
CREATE INDEX IF NOT EXISTS idx_extracted_fields_key ON public.extracted_fields(field_key);

-- GIS Parcels (Spatial GIST index + B-Tree)
CREATE INDEX IF NOT EXISTS idx_gis_parcels_survey_num ON public.gis_parcels(survey_number);
CREATE INDEX IF NOT EXISTS idx_gis_parcels_village ON public.gis_parcels(village);
CREATE INDEX IF NOT EXISTS idx_gis_parcels_status ON public.gis_parcels(status);
CREATE INDEX IF NOT EXISTS idx_gis_parcels_geom ON public.gis_parcels USING GIST(geom);

-- Cadastral Details & Boundaries
CREATE INDEX IF NOT EXISTS idx_cadastral_doc_id ON public.cadastral_details(document_id);
CREATE INDEX IF NOT EXISTS idx_boundaries_doc_id ON public.cadastral_boundaries(document_id);

-- Validation Reports & Evidence
CREATE INDEX IF NOT EXISTS idx_val_reports_doc_id ON public.validation_reports(document_id);
CREATE INDEX IF NOT EXISTS idx_val_reports_status ON public.validation_reports(status);
CREATE INDEX IF NOT EXISTS idx_val_evidence_report_id ON public.validation_evidence(report_id);

-- Officer Recommendations & Signatures
CREATE INDEX IF NOT EXISTS idx_officer_rec_doc_id ON public.officer_recommendations(document_id);
CREATE INDEX IF NOT EXISTS idx_digital_signatures_doc_id ON public.digital_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_digital_signatures_cert ON public.digital_signatures(certificate_id);

-- Audit Events
CREATE INDEX IF NOT EXISTS idx_audit_events_doc_id ON public.audit_events(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor_id ON public.audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events(created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(recipient_id) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Citizen Queries & Tickets
CREATE INDEX IF NOT EXISTS idx_queries_doc_id ON public.citizen_queries(document_id);
CREATE INDEX IF NOT EXISTS idx_queries_citizen_id ON public.citizen_queries(citizen_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON public.citizen_queries(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON public.support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);

-- Workflow & Assignments
CREATE INDEX IF NOT EXISTS idx_workflow_doc_id ON public.workflow_history(document_id);
CREATE INDEX IF NOT EXISTS idx_workflow_created_at ON public.workflow_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignments_officer ON public.document_assignments(officer_id);
-- 004_rls.sql
-- Row Level Security (RLS) Policies for Nila Thozhan

-- 1. Helper function to fetch current user's role securely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadastral_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadastral_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_land_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gis_parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_history ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- PROFILES POLICIES
--------------------------------------------------------------------------------
-- Any authenticated user can view profiles (to display officer/citizen names)
CREATE POLICY "profiles_select_all_authenticated"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can update their own profile (name, phone, avatar, location), but not role directly
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Insert allowed for self on signup
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

--------------------------------------------------------------------------------
-- LAND DOCUMENTS POLICIES
--------------------------------------------------------------------------------
-- SELECT:
-- Citizen: Only documents uploaded by themselves
-- Officer: Assigned documents or unassigned queue documents
-- High Authority: All documents
CREATE POLICY "land_documents_select"
ON public.land_documents FOR SELECT
TO authenticated
USING (
    (public.get_current_user_role() = 'CITIZEN' AND uploaded_by = auth.uid())
    OR (public.get_current_user_role() = 'OFFICER' AND (assigned_officer IS NULL OR assigned_officer = auth.uid() OR status IN ('DIGITIZED', 'UNDER_VERIFICATION', 'GIS_VERIFIED', 'NEEDS_ATTENTION')))
    OR (public.get_current_user_role() = 'HIGH_AUTHORITY')
);

-- INSERT:
-- Citizen can insert documents for themselves
-- Officers can also upload digitized documents on behalf of landowners
CREATE POLICY "land_documents_insert"
ON public.land_documents FOR INSERT
TO authenticated
WITH CHECK (
    (public.get_current_user_role() = 'CITIZEN' AND uploaded_by = auth.uid())
    OR (public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY'))
);

-- UPDATE:
-- Citizen can update only if document is in PROCESSING or NEEDS_ATTENTION
-- Officer can update when under verification / queue
-- High Authority can update for approval
CREATE POLICY "land_documents_update"
ON public.land_documents FOR UPDATE
TO authenticated
USING (
    (public.get_current_user_role() = 'CITIZEN' AND uploaded_by = auth.uid() AND status IN ('PROCESSING', 'NEEDS_ATTENTION'))
    OR (public.get_current_user_role() = 'OFFICER')
    OR (public.get_current_user_role() = 'HIGH_AUTHORITY')
)
WITH CHECK (
    (public.get_current_user_role() = 'CITIZEN' AND uploaded_by = auth.uid())
    OR (public.get_current_user_role() = 'OFFICER')
    OR (public.get_current_user_role() = 'HIGH_AUTHORITY')
);

--------------------------------------------------------------------------------
-- EXTRACTED FIELDS POLICIES
--------------------------------------------------------------------------------
CREATE POLICY "extracted_fields_select"
ON public.extracted_fields FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.land_documents d
        WHERE d.id = extracted_fields.document_id
        AND (
            (public.get_current_user_role() = 'CITIZEN' AND d.uploaded_by = auth.uid())
            OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
        )
    )
);

CREATE POLICY "extracted_fields_insert"
ON public.extracted_fields FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.land_documents d
        WHERE d.id = extracted_fields.document_id
        AND (
            (public.get_current_user_role() = 'CITIZEN' AND d.uploaded_by = auth.uid())
            OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
        )
    )
);

CREATE POLICY "extracted_fields_update"
ON public.extracted_fields FOR UPDATE
TO authenticated
USING (
    public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
    OR EXISTS (
        SELECT 1 FROM public.land_documents d
        WHERE d.id = extracted_fields.document_id
        AND d.uploaded_by = auth.uid()
        AND d.status = 'PROCESSING'
    )
);

--------------------------------------------------------------------------------
-- CADASTRAL DETAILS & BOUNDARIES
--------------------------------------------------------------------------------
CREATE POLICY "cadastral_details_select"
ON public.cadastral_details FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.land_documents d
        WHERE d.id = cadastral_details.document_id
        AND (
            (public.get_current_user_role() = 'CITIZEN' AND d.uploaded_by = auth.uid())
            OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
        )
    )
);

CREATE POLICY "cadastral_details_insert"
ON public.cadastral_details FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "cadastral_details_update"
ON public.cadastral_details FOR UPDATE
TO authenticated
USING (
    public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
    OR EXISTS (
        SELECT 1 FROM public.land_documents d
        WHERE d.id = cadastral_details.document_id
        AND d.uploaded_by = auth.uid()
        AND d.status IN ('PROCESSING', 'NEEDS_ATTENTION')
    )
);

CREATE POLICY "cadastral_boundaries_select"
ON public.cadastral_boundaries FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.land_documents d
        WHERE d.id = cadastral_boundaries.document_id
        AND (
            (public.get_current_user_role() = 'CITIZEN' AND d.uploaded_by = auth.uid())
            OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
        )
    )
);

CREATE POLICY "cadastral_boundaries_insert"
ON public.cadastral_boundaries FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "cadastral_boundaries_update"
ON public.cadastral_boundaries FOR UPDATE
TO authenticated
USING (
    public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
    OR EXISTS (
        SELECT 1 FROM public.land_documents d
        WHERE d.id = cadastral_boundaries.document_id
        AND d.uploaded_by = auth.uid()
        AND d.status IN ('PROCESSING', 'NEEDS_ATTENTION')
    )
);

--------------------------------------------------------------------------------
-- VALIDATION REPORTS & EVIDENCE
--------------------------------------------------------------------------------
CREATE POLICY "val_reports_select"
ON public.validation_reports FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.land_documents d
        WHERE d.id = validation_reports.document_id
        AND (
            (public.get_current_user_role() = 'CITIZEN' AND d.uploaded_by = auth.uid())
            OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
        )
    )
);

CREATE POLICY "val_reports_modify"
ON public.validation_reports FOR ALL
TO authenticated
USING (public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY'))
WITH CHECK (public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY'));

CREATE POLICY "val_evidence_select"
ON public.validation_evidence FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.validation_reports vr
        JOIN public.land_documents d ON d.id = vr.document_id
        WHERE vr.id = validation_evidence.report_id
        AND (
            (public.get_current_user_role() = 'CITIZEN' AND d.uploaded_by = auth.uid())
            OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
        )
    )
);

CREATE POLICY "val_evidence_modify"
ON public.validation_evidence FOR ALL
TO authenticated
USING (public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY'))
WITH CHECK (public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY'));

--------------------------------------------------------------------------------
-- OFFICER RECOMMENDATIONS
--------------------------------------------------------------------------------
CREATE POLICY "officer_rec_select"
ON public.officer_recommendations FOR SELECT
TO authenticated
USING (
    public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
    OR EXISTS (
        SELECT 1 FROM public.land_documents d
        WHERE d.id = officer_recommendations.document_id
        AND d.uploaded_by = auth.uid()
    )
);

CREATE POLICY "officer_rec_insert"
ON public.officer_recommendations FOR INSERT
TO authenticated
WITH CHECK (
    public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
    AND officer_id = auth.uid()
);

--------------------------------------------------------------------------------
-- DIGITAL SIGNATURES
--------------------------------------------------------------------------------
CREATE POLICY "digital_signatures_select"
ON public.digital_signatures FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.land_documents d
        WHERE d.id = digital_signatures.document_id
        AND (
            (public.get_current_user_role() = 'CITIZEN' AND d.uploaded_by = auth.uid())
            OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
        )
    )
);

-- Only HIGH_AUTHORITY can apply digital signatures
CREATE POLICY "digital_signatures_insert"
ON public.digital_signatures FOR INSERT
TO authenticated
WITH CHECK (
    public.get_current_user_role() = 'HIGH_AUTHORITY'
    AND signer_id = auth.uid()
);

--------------------------------------------------------------------------------
-- AUDIT EVENTS (IMMUTABLE - APPEND ONLY)
--------------------------------------------------------------------------------
CREATE POLICY "audit_events_select"
ON public.audit_events FOR SELECT
TO authenticated
USING (
    public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
    OR (
        document_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.land_documents d
            WHERE d.id = audit_events.document_id
            AND d.uploaded_by = auth.uid()
        )
    )
);

CREATE POLICY "audit_events_insert"
ON public.audit_events FOR INSERT
TO authenticated
WITH CHECK (true);

-- NO UPDATE OR DELETE POLICY ON audit_events (Strictly Immutable)

--------------------------------------------------------------------------------
-- NOTIFICATIONS
--------------------------------------------------------------------------------
CREATE POLICY "notifications_select"
ON public.notifications FOR SELECT
TO authenticated
USING (
    recipient_id = auth.uid()
    OR public.get_current_user_role() = ANY(target_roles)
);

CREATE POLICY "notifications_update"
ON public.notifications FOR UPDATE
TO authenticated
USING (
    recipient_id = auth.uid()
    OR public.get_current_user_role() = ANY(target_roles)
)
WITH CHECK (
    recipient_id = auth.uid()
    OR public.get_current_user_role() = ANY(target_roles)
);

CREATE POLICY "notifications_insert"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

--------------------------------------------------------------------------------
-- CITIZEN QUERIES
--------------------------------------------------------------------------------
CREATE POLICY "queries_select"
ON public.citizen_queries FOR SELECT
TO authenticated
USING (
    citizen_id = auth.uid()
    OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
);

CREATE POLICY "queries_insert"
ON public.citizen_queries FOR INSERT
TO authenticated
WITH CHECK (
    citizen_id = auth.uid()
);

CREATE POLICY "queries_update"
ON public.citizen_queries FOR UPDATE
TO authenticated
USING (
    citizen_id = auth.uid()
    OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
);

--------------------------------------------------------------------------------
-- SUPPORT TICKETS
--------------------------------------------------------------------------------
CREATE POLICY "tickets_select"
ON public.support_tickets FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
);

CREATE POLICY "tickets_insert"
ON public.support_tickets FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "tickets_update"
ON public.support_tickets FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
    OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
);

--------------------------------------------------------------------------------
-- REFERENCE TABLES (GIS PARCELS & LEGACY RECORDS)
--------------------------------------------------------------------------------
CREATE POLICY "gis_parcels_select"
ON public.gis_parcels FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "gis_parcels_modify"
ON public.gis_parcels FOR ALL
TO authenticated
USING (public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY'))
WITH CHECK (public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY'));

CREATE POLICY "legacy_records_select"
ON public.legacy_land_records FOR SELECT
TO authenticated
USING (true);

--------------------------------------------------------------------------------
-- WORKFLOW HISTORY & ASSIGNMENTS
--------------------------------------------------------------------------------
CREATE POLICY "workflow_history_select"
ON public.workflow_history FOR SELECT
TO authenticated
USING (
    public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
    OR EXISTS (
        SELECT 1 FROM public.land_documents d
        WHERE d.id = workflow_history.document_id
        AND d.uploaded_by = auth.uid()
    )
);

CREATE POLICY "workflow_history_insert"
ON public.workflow_history FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "document_assignments_all"
ON public.document_assignments FOR ALL
TO authenticated
USING (public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY'))
WITH CHECK (public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY'));
-- 005_triggers.sql
-- Database Triggers for Nila Thozhan

-- 1. Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_land_docs_updated_at ON public.land_documents;
CREATE TRIGGER set_land_docs_updated_at
BEFORE UPDATE ON public.land_documents
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_extracted_fields_updated_at ON public.extracted_fields;
CREATE TRIGGER set_extracted_fields_updated_at
BEFORE UPDATE ON public.extracted_fields
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_cadastral_details_updated_at ON public.cadastral_details;
CREATE TRIGGER set_cadastral_details_updated_at
BEFORE UPDATE ON public.cadastral_details
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_cadastral_boundaries_updated_at ON public.cadastral_boundaries;
CREATE TRIGGER set_cadastral_boundaries_updated_at
BEFORE UPDATE ON public.cadastral_boundaries
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_val_reports_updated_at ON public.validation_reports;
CREATE TRIGGER set_val_reports_updated_at
BEFORE UPDATE ON public.validation_reports
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_queries_updated_at ON public.citizen_queries;
CREATE TRIGGER set_queries_updated_at
BEFORE UPDATE ON public.citizen_queries
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER set_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------------------
-- 2. Auth User -> Profile Auto-Creation Trigger
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role user_role := 'CITIZEN';
    user_full_name TEXT;
    user_phone TEXT;
    user_dept TEXT;
    user_desig TEXT;
    user_loc TEXT;
BEGIN
    -- Extract role from user_metadata if provided
    IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
        BEGIN
            default_role := (NEW.raw_user_meta_data->>'role')::user_role;
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------------------------------------
-- 3. Document State Machine & Workflow History & Notification Automation
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_document_status_change()
RETURNS TRIGGER AS $$
DECLARE
    actor_id UUID := auth.uid();
    actor_name TEXT := 'System';
    actor_role user_role := 'OFFICER';
BEGIN
    -- Only act if status actually changed
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR TG_OP = 'INSERT' THEN
        -- Get actor details if available
        IF actor_id IS NOT NULL THEN
            SELECT full_name, role INTO actor_name, actor_role FROM public.profiles WHERE id = actor_id;
        END IF;

        -- 1. Insert Workflow History Record
        INSERT INTO public.workflow_history (
            document_id,
            from_status,
            to_status,
            changed_by,
            comments
        ) VALUES (
            NEW.id,
            CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
            NEW.status,
            actor_id,
            COALESCE(NEW.officer_notes, 'Status transitioned to ' || NEW.status)
        );

        -- 2. Insert Audit Event Record
        INSERT INTO public.audit_events (
            document_id,
            actor_id,
            actor_name,
            actor_role,
            action,
            status,
            previous_status,
            new_status,
            comments
        ) VALUES (
            NEW.id,
            actor_id,
            COALESCE(actor_name, 'System Process'),
            COALESCE(actor_role, 'OFFICER'),
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'Document Uploaded & Initialized'
                ELSE 'Status Changed to ' || NEW.status
            END,
            NEW.status::text,
            CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
            NEW.status,
            COALESCE(NEW.officer_notes, 'Workflow transition recorded')
        );

        -- 3. Automated Notification Dispatch
        IF NEW.status = 'READY_FOR_APPROVAL' THEN
            -- Notify High Authority
            INSERT INTO public.notifications (
                target_roles,
                title,
                message,
                type,
                document_id
            ) VALUES (
                ARRAY['HIGH_AUTHORITY']::user_role[],
                'Document Awaiting Approval: ' || NEW.document_number,
                'Survey ' || NEW.survey_number || ' (' || NEW.village || ') has been verified and is ready for final approval.',
                'ACTION_REQUIRED',
                NEW.id
            );
        ELSIF NEW.status = 'APPROVED' THEN
            -- Notify Citizen
            INSERT INTO public.notifications (
                recipient_id,
                target_roles,
                title,
                message,
                type,
                document_id
            ) VALUES (
                NEW.uploaded_by,
                ARRAY['CITIZEN']::user_role[],
                'Document Approved: ' || NEW.document_number,
                'Congratulations! Your land document for Survey ' || NEW.survey_number || ' has been approved and digitally signed.',
                'SUCCESS',
                NEW.id
            );
        ELSIF NEW.status = 'NEEDS_ATTENTION' THEN
            -- Notify Citizen
            INSERT INTO public.notifications (
                recipient_id,
                target_roles,
                title,
                message,
                type,
                document_id
            ) VALUES (
                NEW.uploaded_by,
                ARRAY['CITIZEN']::user_role[],
                'Action Required: ' || NEW.document_number,
                COALESCE(NEW.action_required_citizen, 'Officer has requested review or field inspection on Survey ' || NEW.survey_number || '.'),
                'WARNING',
                NEW.id
            );
        ELSIF NEW.status = 'REJECTED' THEN
            -- Notify Citizen
            INSERT INTO public.notifications (
                recipient_id,
                target_roles,
                title,
                message,
                type,
                document_id
            ) VALUES (
                NEW.uploaded_by,
                ARRAY['CITIZEN']::user_role[],
                'Document Rejected: ' || NEW.document_number,
                COALESCE(NEW.officer_notes, 'Your submission for Survey ' || NEW.survey_number || ' could not be verified.'),
                'WARNING',
                NEW.id
            );
        ELSIF NEW.status IN ('DIGITIZED', 'UNDER_VERIFICATION') AND TG_OP = 'INSERT' THEN
            -- Notify Officers of new upload
            INSERT INTO public.notifications (
                target_roles,
                title,
                message,
                type,
                document_id
            ) VALUES (
                ARRAY['OFFICER']::user_role[],
                'New Document in Queue: ' || NEW.document_number,
                'New ' || NEW.document_type || ' for Survey ' || NEW.survey_number || ' (' || NEW.owner_name || ') has been submitted.',
                'INFO',
                NEW.id
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_document_status_changed ON public.land_documents;
CREATE TRIGGER on_document_status_changed
AFTER INSERT OR UPDATE ON public.land_documents
FOR EACH ROW EXECUTE FUNCTION public.handle_document_status_change();
-- 006_functions.sql
-- RPC & Transactional Workflow Functions for Nila Thozhan

--------------------------------------------------------------------------------
-- 1. Submit Officer Decision (Transactional)
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_officer_decision(
    p_doc_id UUID,
    p_action recommendation_action,
    p_reason TEXT,
    p_comments TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_role user_role;
    v_caller_name TEXT;
    v_current_status document_status;
    v_next_status document_status;
    v_action_required TEXT := NULL;
BEGIN
    -- 1. Check Caller Role
    SELECT role, full_name INTO v_caller_role, v_caller_name 
    FROM public.profiles WHERE id = auth.uid();

    IF v_caller_role NOT IN ('OFFICER', 'HIGH_AUTHORITY') THEN
        RAISE EXCEPTION 'Access denied. Only authorized officers can submit verification decisions.';
    END IF;

    -- 2. Verify Document
    SELECT status INTO v_current_status
    FROM public.land_documents WHERE id = p_doc_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Land document % not found.', p_doc_id;
    END IF;

    -- 3. Determine Next Status based on Action
    IF p_action = 'APPROVE' THEN
        v_next_status := 'READY_FOR_APPROVAL';
    ELSIF p_action = 'REJECT' THEN
        v_next_status := 'REJECTED';
    ELSIF p_action = 'RETURN' OR p_action = 'NEEDS_MANUAL_REVIEW' THEN
        v_next_status := 'NEEDS_ATTENTION';
        v_action_required := 'Action Required: ' || p_reason || '. Please address officer notes and re-submit.';
    ELSE
        RAISE EXCEPTION 'Invalid recommendation action: %', p_action;
    END IF;

    -- 4. Record Officer Recommendation
    INSERT INTO public.officer_recommendations (
        document_id,
        action,
        reason,
        comments,
        officer_id,
        officer_name
    ) VALUES (
        p_doc_id,
        p_action,
        p_reason,
        p_comments,
        auth.uid(),
        v_caller_name
    );

    -- 5. Update Land Document State
    UPDATE public.land_documents
    SET 
        status = v_next_status,
        officer_notes = COALESCE(p_comments, p_reason),
        action_required_citizen = v_action_required,
        assigned_officer = auth.uid(),
        updated_at = NOW()
    WHERE id = p_doc_id;

    RETURN jsonb_build_object(
        'success', true,
        'document_id', p_doc_id,
        'action', p_action,
        'new_status', v_next_status
    );
END;
$$;

--------------------------------------------------------------------------------
-- 2. Final Approval & Digital Signature (High Authority Only)
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_document_and_sign(
    p_doc_id UUID,
    p_certificate_id TEXT,
    p_signer_name TEXT,
    p_signer_designation TEXT,
    p_signature_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_role user_role;
    v_doc RECORD;
    v_computed_doc_hash TEXT;
    v_sig_hash TEXT;
    v_sig_id UUID;
BEGIN
    -- 1. Check Caller Role
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role != 'HIGH_AUTHORITY' THEN
        RAISE EXCEPTION 'Access denied. Only High Authority / Sub-Registrars can execute final digital signature approval.';
    END IF;

    -- 2. Fetch Document
    SELECT * INTO v_doc FROM public.land_documents WHERE id = p_doc_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Document % not found.', p_doc_id;
    END IF;

    IF v_doc.status NOT IN ('READY_FOR_APPROVAL', 'GIS_VERIFIED', 'UNDER_VERIFICATION') THEN
        RAISE EXCEPTION 'Document % cannot be approved from current status %.', p_doc_id, v_doc.status;
    END IF;

    -- 3. Calculate Cryptographic Document Hash (SHA-256)
    v_computed_doc_hash := encode(digest(
        v_doc.document_number || '|' || 
        v_doc.survey_number || '|' || 
        v_doc.owner_name || '|' || 
        v_doc.village || '|' || 
        v_doc.land_area || '|' || 
        v_doc.submission_date::text,
        'sha256'
    ), 'hex');

    -- Signature Hash
    v_sig_hash := COALESCE(p_signature_hash, 'SHA256:' || encode(digest(v_computed_doc_hash || p_certificate_id || now()::text, 'sha256'), 'hex'));

    -- 4. Insert Digital Signature Record
    INSERT INTO public.digital_signatures (
        document_id,
        certificate_id,
        signer_id,
        signer_name,
        signer_designation,
        algorithm,
        signature_hash,
        document_hash,
        signed_at,
        verification_reference
    ) VALUES (
        p_doc_id,
        p_certificate_id,
        auth.uid(),
        p_signer_name,
        p_signer_designation,
        'RSA-PSS / SHA-256 (CCA India Compliant)',
        v_sig_hash,
        v_computed_doc_hash,
        NOW(),
        'https://landrecords.tn.gov.in/verify/dsign/' || p_certificate_id
    ) RETURNING id INTO v_sig_id;

    -- 5. Update Document Status to APPROVED
    UPDATE public.land_documents
    SET 
        status = 'APPROVED',
        action_required_citizen = NULL,
        officer_notes = 'Approved and sealed with CCA India Compliant Digital Signature Certificate: ' || p_certificate_id,
        updated_at = NOW()
    WHERE id = p_doc_id;

    RETURN jsonb_build_object(
        'success', true,
        'document_id', p_doc_id,
        'certificate_id', p_certificate_id,
        'signature_id', v_sig_id,
        'document_hash', v_computed_doc_hash,
        'signature_hash', v_sig_hash,
        'status', 'APPROVED'
    );
END;
$$;

--------------------------------------------------------------------------------
-- 3. Resolve GIS Conflict (Transactional)
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_gis_conflict(
    p_doc_id UUID,
    p_resolution TEXT, -- 'ACCEPT_GIS' or 'FLAG_FIELD_INSPECTION'
    p_notes TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_role user_role;
    v_next_status document_status;
    v_action_required TEXT := NULL;
BEGIN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role NOT IN ('OFFICER', 'HIGH_AUTHORITY') THEN
        RAISE EXCEPTION 'Access denied. Only officers can resolve spatial conflicts.';
    END IF;

    IF p_resolution = 'ACCEPT_GIS' THEN
        v_next_status := 'GIS_VERIFIED';
    ELSE
        v_next_status := 'NEEDS_ATTENTION';
        v_action_required := 'Physical field surveyor inspection requested for boundary resolution.';
    END IF;

    UPDATE public.land_documents
    SET 
        status = v_next_status,
        action_required_citizen = v_action_required,
        officer_notes = 'Conflict Resolution (' || p_resolution || '): ' || p_notes,
        updated_at = NOW()
    WHERE id = p_doc_id;

    RETURN jsonb_build_object(
        'success', true,
        'document_id', p_doc_id,
        'resolution', p_resolution,
        'new_status', v_next_status
    );
END;
$$;

--------------------------------------------------------------------------------
-- 4. Generate Support Ticket Number (Sequence-safe)
--------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.seq_ticket_number START 1001;

CREATE OR REPLACE FUNCTION public.create_support_ticket(
    p_category TEXT,
    p_subject TEXT,
    p_message TEXT,
    p_contact_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ticket_num TEXT;
    v_email TEXT;
    v_ticket_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Must be authenticated to submit support tickets.';
    END IF;

    SELECT COALESCE(p_contact_email, email) INTO v_email
    FROM public.profiles WHERE id = auth.uid();

    v_ticket_num := 'TKT-' || to_char(CURRENT_DATE, 'YYYY') || '-' || nextval('public.seq_ticket_number');

    INSERT INTO public.support_tickets (
        ticket_number,
        user_id,
        category,
        subject,
        message,
        contact_email,
        priority,
        status
    ) VALUES (
        v_ticket_num,
        auth.uid(),
        p_category,
        p_subject,
        p_message,
        v_email,
        'MEDIUM',
        'OPEN'
    ) RETURNING id INTO v_ticket_id;

    RETURN jsonb_build_object(
        'id', v_ticket_id,
        'ticket_number', v_ticket_num,
        'status', 'OPEN'
    );
END;
$$;

--------------------------------------------------------------------------------
-- 5. Aggregate Dashboard & Reports Statistics
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_system_reports_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_role user_role;
    v_stats JSONB;
BEGIN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role NOT IN ('OFFICER', 'HIGH_AUTHORITY') THEN
        RAISE EXCEPTION 'Access denied. Reports are restricted to authorized personnel.';
    END IF;

    SELECT jsonb_build_object(
        'total_documents', COUNT(*),
        'processing_count', COUNT(*) FILTER (WHERE status = 'PROCESSING'),
        'digitized_count', COUNT(*) FILTER (WHERE status = 'DIGITIZED'),
        'under_verification_count', COUNT(*) FILTER (WHERE status = 'UNDER_VERIFICATION'),
        'gis_verified_count', COUNT(*) FILTER (WHERE status = 'GIS_VERIFIED'),
        'ready_for_approval_count', COUNT(*) FILTER (WHERE status = 'READY_FOR_APPROVAL'),
        'approved_count', COUNT(*) FILTER (WHERE status = 'APPROVED'),
        'rejected_count', COUNT(*) FILTER (WHERE status = 'REJECTED'),
        'needs_attention_count', COUNT(*) FILTER (WHERE status = 'NEEDS_ATTENTION'),
        'avg_confidence_score', ROUND(COALESCE(AVG(confidence_score), 0), 1),
        'high_confidence_count', COUNT(*) FILTER (WHERE overall_confidence = 'HIGH'),
        'medium_confidence_count', COUNT(*) FILTER (WHERE overall_confidence = 'MEDIUM'),
        'low_confidence_count', COUNT(*) FILTER (WHERE overall_confidence = 'LOW')
    ) INTO v_stats
    FROM public.land_documents;

    RETURN v_stats;
END;
$$;
-- 007_storage.sql
-- Storage Buckets & Policies for Nila Thozhan

-- 1. Create Buckets if not existing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('land-documents', 'land-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/tiff']),
    ('processed-documents', 'processed-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    ('generated-reports', 'generated-reports', false, 52428800, ARRAY['application/pdf', 'text/csv', 'application/json'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies for land-documents bucket
CREATE POLICY "Authenticated users can upload land documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'land-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own or authorized documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'land-documents'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
    )
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'land-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'land-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Storage Policies for processed-documents & generated-reports
CREATE POLICY "Officers and High Authority can access processed documents"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id IN ('processed-documents', 'generated-reports')
    AND public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
)
WITH CHECK (
    bucket_id IN ('processed-documents', 'generated-reports')
    AND public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
);
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

-- 009_anon_access.sql
-- Allow anon key access for demo role-switching & public portal interaction

-- 1. Profiles
CREATE POLICY "anon_select_profiles" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_profiles" ON public.profiles FOR UPDATE TO anon USING (true);

-- 2. Land Documents
CREATE POLICY "anon_select_land_documents" ON public.land_documents FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_land_documents" ON public.land_documents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_land_documents" ON public.land_documents FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 3. Extracted Fields
CREATE POLICY "anon_select_extracted_fields" ON public.extracted_fields FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_extracted_fields" ON public.extracted_fields FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_extracted_fields" ON public.extracted_fields FOR UPDATE TO anon USING (true);

-- 4. Cadastral Details & Boundaries
CREATE POLICY "anon_select_cadastral_details" ON public.cadastral_details FOR SELECT TO anon USING (true);
CREATE POLICY "anon_modify_cadastral_details" ON public.cadastral_details FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_cadastral_boundaries" ON public.cadastral_boundaries FOR SELECT TO anon USING (true);
CREATE POLICY "anon_modify_cadastral_boundaries" ON public.cadastral_boundaries FOR ALL TO anon USING (true) WITH CHECK (true);

-- 5. Validation Reports & Evidence
CREATE POLICY "anon_select_validation_reports" ON public.validation_reports FOR SELECT TO anon USING (true);
CREATE POLICY "anon_modify_validation_reports" ON public.validation_reports FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_validation_evidence" ON public.validation_evidence FOR SELECT TO anon USING (true);
CREATE POLICY "anon_modify_validation_evidence" ON public.validation_evidence FOR ALL TO anon USING (true) WITH CHECK (true);

-- 6. Officer Recommendations & Signatures
CREATE POLICY "anon_select_officer_recommendations" ON public.officer_recommendations FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_officer_recommendations" ON public.officer_recommendations FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_digital_signatures" ON public.digital_signatures FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_digital_signatures" ON public.digital_signatures FOR INSERT TO anon WITH CHECK (true);

-- 7. Audit Events
CREATE POLICY "anon_select_audit_events" ON public.audit_events FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_audit_events" ON public.audit_events FOR INSERT TO anon WITH CHECK (true);

-- 8. Notifications
CREATE POLICY "anon_select_notifications" ON public.notifications FOR SELECT TO anon USING (true);
CREATE POLICY "anon_modify_notifications" ON public.notifications FOR ALL TO anon USING (true) WITH CHECK (true);

-- 9. Citizen Queries & Support Tickets
CREATE POLICY "anon_select_citizen_queries" ON public.citizen_queries FOR SELECT TO anon USING (true);
CREATE POLICY "anon_modify_citizen_queries" ON public.citizen_queries FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_support_tickets" ON public.support_tickets FOR SELECT TO anon USING (true);
CREATE POLICY "anon_modify_support_tickets" ON public.support_tickets FOR ALL TO anon USING (true) WITH CHECK (true);

-- 10. GIS Parcels & Legacy Records
CREATE POLICY "anon_select_gis_parcels" ON public.gis_parcels FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_legacy_records" ON public.legacy_land_records FOR SELECT TO anon USING (true);
