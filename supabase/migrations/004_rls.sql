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
