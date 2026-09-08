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
