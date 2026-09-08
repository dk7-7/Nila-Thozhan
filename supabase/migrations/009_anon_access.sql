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
