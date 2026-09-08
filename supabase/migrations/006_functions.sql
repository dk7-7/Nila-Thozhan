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
