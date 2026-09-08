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
