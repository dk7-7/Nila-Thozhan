import { supabase } from '../lib/supabase';
import {
  AuditEvent,
  ConfidenceLevel,
  DigitalSignatureData,
  DocumentStatus,
  ExtractedField,
  GisParcelData,
  LandDocument,
  TamilCadastralDetails,
  CadastralBoundaries,
  ValidationReport,
  ValidationEvidence,
  UserRole,
} from '../types';

export const documentService = {
  // Helper to map DB rows to frontend LandDocument object
  mapDbToLandDocument(
    doc: any,
    extractedFields: any[] = [],
    cadastralDetails: any = null,
    cadastralBoundaries: any = null,
    validationReport: any = null,
    validationEvidence: any[] = [],
    officerRecommendation: any = null,
    digitalSignature: any = null,
    auditEvents: any[] = [],
    gisParcel: any = null
  ): LandDocument {
    // 1. Extracted fields map
    const fieldsMap: Record<string, ExtractedField> = {};
    extractedFields.forEach((f) => {
      fieldsMap[f.field_key] = {
        fieldName: f.field_name,
        fieldKey: f.field_key,
        value: f.value,
        confidence: f.confidence as ConfidenceLevel,
        confidenceScore: f.confidence_score,
        isVerified: f.is_verified,
        notes: f.notes || undefined,
      };
    });

    // 2. Cadastral details
    let cadastral: TamilCadastralDetails | undefined = undefined;
    if (cadastralDetails || cadastralBoundaries) {
      cadastral = {
        pattaNumber: cadastralDetails?.patta_number || undefined,
        landClassification: cadastralDetails?.land_classification || undefined,
        sroJurisdiction: cadastralDetails?.sro_jurisdiction || undefined,
        documentRegistrationNumber: cadastralDetails?.document_registration_number || undefined,
        relativeName: cadastralDetails?.relative_name || undefined,
        tamilOwnerName: cadastralDetails?.tamil_owner_name || undefined,
        tamilVillage: cadastralDetails?.tamil_village || undefined,
        tamilTaluk: cadastralDetails?.tamil_taluk || undefined,
        tamilDistrict: cadastralDetails?.tamil_district || undefined,
        boundaries: cadastralBoundaries
          ? {
              north: cadastralBoundaries.north || undefined,
              south: cadastralBoundaries.south || undefined,
              east: cadastralBoundaries.east || undefined,
              west: cadastralBoundaries.west || undefined,
              tamilNorth: cadastralBoundaries.tamil_north || undefined,
              tamilSouth: cadastralBoundaries.tamil_south || undefined,
              tamilEast: cadastralBoundaries.tamil_east || undefined,
              tamilWest: cadastralBoundaries.tamil_west || undefined,
            }
          : undefined,
      };
    }

    // 3. Validation report
    const evidenceList: ValidationEvidence[] = validationEvidence.map((e) => ({
      source: e.source,
      extractedValue: e.extracted_value,
      status: e.status,
      detail: e.detail,
    }));

    const valReport: ValidationReport = validationReport
      ? {
          status: validationReport.status,
          primaryIssue: validationReport.primary_issue || undefined,
          plainLanguageExplanation: validationReport.plain_language_explanation,
          conflictingFields: validationReport.conflicting_fields || [],
          evidenceList,
          recommendedAction: validationReport.recommended_action,
          deterministicRulesPassed: validationReport.deterministic_rules_passed,
          aiExplanationText: validationReport.ai_explanation_text || '',
        }
      : {
          status: 'VERIFIED',
          plainLanguageExplanation: 'Document records initialized.',
          conflictingFields: [],
          evidenceList: [],
          recommendedAction: 'Proceed with officer verification check.',
          deterministicRulesPassed: true,
          aiExplanationText: 'Standard pipeline automated validation complete.',
        };

    // 4. Digital signature
    let signatureData: DigitalSignatureData | undefined = undefined;
    if (digitalSignature) {
      signatureData = {
        certificateId: digitalSignature.certificate_id,
        signerName: digitalSignature.signer_name,
        signerDesignation: digitalSignature.signer_designation,
        signDate: new Date(digitalSignature.signed_at).toLocaleString(),
        algorithm: digitalSignature.algorithm,
        signatureHash: digitalSignature.signature_hash,
        verificationUrl: digitalSignature.verification_reference,
      };
    }

    // 5. Audit Trail
    const auditTrail: AuditEvent[] = auditEvents.map((a) => ({
      id: a.id,
      timestamp: new Date(a.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      actorName: a.actor_name,
      actorRole: a.actor_role,
      action: a.action,
      status: a.status,
      comments: a.comments || undefined,
      digitalSignatureId: a.digital_signature_id || undefined,
    }));

    // 6. GIS Parcel Data
    let parcelData: GisParcelData | undefined = undefined;
    if (gisParcel) {
      parcelData = {
        parcelId: gisParcel.parcel_id,
        surveyNumber: gisParcel.survey_number,
        village: gisParcel.village,
        areaAcres: Number(gisParcel.area_acres),
        centroid: { x: Number(gisParcel.centroid_x), y: Number(gisParcel.centroid_y) },
        coordinates: gisParcel.coordinates as [number, number][],
        landUse: gisParcel.land_use,
        waterBodyAdjacent: gisParcel.water_body_adjacent,
        roadAccess: gisParcel.road_access,
        historicalBoundaryMatch: gisParcel.historical_boundary_match,
        spatialConflict: gisParcel.spatial_conflict,
        status: gisParcel.status,
      };
    }

    // 7. Officer Recommendation
    let officerRec = undefined;
    if (officerRecommendation) {
      officerRec = {
        action: officerRecommendation.action as 'APPROVE' | 'RETURN' | 'REJECT',
        reason: officerRecommendation.reason,
        comments: officerRecommendation.comments || '',
        officerName: officerRecommendation.officer_name,
        date: new Date(officerRecommendation.created_at).toLocaleString(),
      };
    }

    return {
      id: doc.id,
      documentNumber: doc.document_number,
      title: doc.title,
      documentType: doc.document_type,
      surveyNumber: doc.survey_number,
      ownerName: doc.owner_name,
      village: doc.village,
      taluk: doc.taluk,
      district: doc.district,
      landArea: doc.land_area,
      landAreaNumeric: Number(doc.land_area_numeric) || 0,
      submissionDate: doc.submission_date,
      status: doc.status as DocumentStatus,
      overallConfidence: doc.overall_confidence as ConfidenceLevel,
      confidenceScore: doc.confidence_score,
      uploadedBy: doc.uploaded_by,
      citizenEmail: doc.citizen_email,
      assignedOfficer: doc.assigned_officer || undefined,
      actionRequiredCitizen: doc.action_required_citizen || undefined,
      extractedFields: fieldsMap,
      cadastralDetails: cadastral,
      validationReport: valReport,
      officerRecommendation: officerRec,
      officerNotes: doc.officer_notes || undefined,
      digitalSignature: signatureData,
      auditTrail,
      scenarioType: (doc.scenario_type as any) || 'NORMAL_VERIFIED',
      fileUrl: doc.file_url || undefined,
      fileName: doc.file_name || undefined,
      fileSize: doc.file_size || undefined,
      fileType: doc.file_type || undefined,
      gisParcel: parcelData,
    };
  },

  async getAllDocuments(): Promise<LandDocument[]> {
    // 1. Fetch documents respecting RLS
    const { data: docs, error: docsError } = await supabase
      .from('land_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      throw docsError;
    }

    if (!docs || docs.length === 0) return [];

    const docIds = docs.map((d) => d.id);
    const parcelIds = docs.map((d) => d.gis_parcel_id).filter(Boolean) as string[];

    // 2. Concurrently fetch all associated child entities
    const [
      { data: fields },
      { data: cadastrals },
      { data: boundaries },
      { data: reports },
      { data: signatures },
      { data: recommendations },
      { data: audits },
      { data: parcels },
    ] = await Promise.all([
      supabase.from('extracted_fields').select('*').in('document_id', docIds),
      supabase.from('cadastral_details').select('*').in('document_id', docIds),
      supabase.from('cadastral_boundaries').select('*').in('document_id', docIds),
      supabase.from('validation_reports').select('*').in('document_id', docIds),
      supabase.from('digital_signatures').select('*').in('document_id', docIds),
      supabase.from('officer_recommendations').select('*').in('document_id', docIds).order('created_at', { ascending: false }),
      supabase.from('audit_events').select('*').in('document_id', docIds).order('created_at', { ascending: true }),
      parcelIds.length > 0 ? supabase.from('gis_parcels').select('*').in('id', parcelIds) : Promise.resolve({ data: [] }),
    ]);

    // Fetch evidence for reports
    const reportIds = (reports || []).map((r) => r.id);
    const { data: evidences } = reportIds.length > 0
      ? await supabase.from('validation_evidence').select('*').in('report_id', reportIds)
      : { data: [] };

    // Group children by document_id
    const fieldsByDoc: Record<string, any[]> = {};
    (fields || []).forEach((f) => {
      if (!fieldsByDoc[f.document_id]) fieldsByDoc[f.document_id] = [];
      fieldsByDoc[f.document_id].push(f);
    });

    const cadastralByDoc = new Map((cadastrals || []).map((c) => [c.document_id, c]));
    const boundaryByDoc = new Map((boundaries || []).map((b) => [b.document_id, b]));
    const reportByDoc = new Map((reports || []).map((r) => [r.document_id, r]));
    const signatureByDoc = new Map((signatures || []).map((s) => [s.document_id, s]));
    const parcelById = new Map((parcels || []).map((p) => [p.id, p]));

    const recByDoc = new Map();
    (recommendations || []).forEach((r) => {
      if (!recByDoc.has(r.document_id)) recByDoc.set(r.document_id, r);
    });

    const auditsByDoc: Record<string, any[]> = {};
    (audits || []).forEach((a) => {
      if (a.document_id) {
        if (!auditsByDoc[a.document_id]) auditsByDoc[a.document_id] = [];
        auditsByDoc[a.document_id].push(a);
      }
    });

    const evidenceByReport: Record<string, any[]> = {};
    (evidences || []).forEach((e) => {
      if (!evidenceByReport[e.report_id]) evidenceByReport[e.report_id] = [];
      evidenceByReport[e.report_id].push(e);
    });

    // 3. Map into LandDocument objects
    return docs.map((doc) => {
      const rep = reportByDoc.get(doc.id);
      const evs = rep ? evidenceByReport[rep.id] || [] : [];
      const gis = doc.gis_parcel_id ? parcelById.get(doc.gis_parcel_id) : null;

      return this.mapDbToLandDocument(
        doc,
        fieldsByDoc[doc.id] || [],
        cadastralByDoc.get(doc.id) || null,
        boundaryByDoc.get(doc.id) || null,
        rep || null,
        evs,
        recByDoc.get(doc.id) || null,
        signatureByDoc.get(doc.id) || null,
        auditsByDoc[doc.id] || [],
        gis
      );
    });
  },

  async createDocument(newDocData: Partial<LandDocument>, userId: string): Promise<string> {
    const docNumber = newDocData.documentNumber || `LR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Insert land_documents row
    const { data: doc, error: docError } = await supabase
      .from('land_documents')
      .insert({
        document_number: docNumber,
        title: newDocData.title || `Land Record - Survey ${newDocData.surveyNumber || 'Pending'}`,
        document_type: (newDocData.documentType as any) || 'Patta / RoR',
        survey_number: newDocData.surveyNumber || 'Pending Extraction',
        owner_name: newDocData.ownerName || 'Unknown Owner',
        village: newDocData.village || 'Pending Verification',
        taluk: newDocData.taluk || 'Pending Verification',
        district: newDocData.district || 'Pending Verification',
        land_area: newDocData.landArea || '0 acres',
        land_area_numeric: newDocData.landAreaNumeric || 0,
        submission_date: newDocData.submissionDate || new Date().toISOString().split('T')[0],
        status: (newDocData.status as any) || 'DIGITIZED',
        overall_confidence: (newDocData.overallConfidence as any) || 'HIGH',
        confidence_score: newDocData.confidenceScore || 95,
        uploaded_by: userId,
        citizen_email: newDocData.citizenEmail || 'citizen@nilathozhan.tn.gov.in',
        scenario_type: newDocData.scenarioType || 'NORMAL_VERIFIED',
        file_url: newDocData.fileUrl || null,
        file_name: newDocData.fileName || null,
        file_size: newDocData.fileSize || null,
        file_type: newDocData.fileType || null,
      })
      .select('id')
      .single();

    if (docError) {
      console.error('Error creating land document:', docError);
      throw docError;
    }

    const docId = doc.id;

    // 2. Insert Extracted Fields if provided
    if (newDocData.extractedFields) {
      const fieldInserts = Object.entries(newDocData.extractedFields).map(([key, f]) => ({
        document_id: docId,
        field_name: f.fieldName,
        field_key: f.fieldKey || key,
        value: f.value,
        confidence: f.confidence as any,
        confidence_score: f.confidenceScore,
        is_verified: f.isVerified,
      }));

      if (fieldInserts.length > 0) {
        await supabase.from('extracted_fields').insert(fieldInserts);
      }
    }

    // 3. Insert Cadastral Details
    if (newDocData.cadastralDetails) {
      const cd = newDocData.cadastralDetails;
      await supabase.from('cadastral_details').insert({
        document_id: docId,
        patta_number: cd.pattaNumber,
        land_classification: cd.landClassification,
        sro_jurisdiction: cd.sroJurisdiction,
        document_registration_number: cd.documentRegistrationNumber,
        relative_name: cd.relativeName,
        tamil_owner_name: cd.tamilOwnerName,
        tamil_village: cd.tamilVillage,
        tamil_taluk: cd.tamilTaluk,
        tamil_district: cd.tamilDistrict,
      });

      if (cd.boundaries) {
        const b = cd.boundaries;
        await supabase.from('cadastral_boundaries').insert({
          document_id: docId,
          north: b.north,
          south: b.south,
          east: b.east,
          west: b.west,
          tamil_north: b.tamilNorth,
          tamil_south: b.tamilSouth,
          tamil_east: b.tamilEast,
          tamil_west: b.tamilWest,
        });
      }
    }

    // 4. Insert Validation Report
    const vr = newDocData.validationReport || {
      status: 'VERIFIED',
      plainLanguageExplanation: 'Newly digitized Tamil land record has completed OCR.',
      recommendedAction: 'Proceed with officer verification check.',
      deterministicRulesPassed: true,
      aiExplanationText: 'Standard pipeline automated validation complete.',
    };

    const { data: repData } = await supabase
      .from('validation_reports')
      .insert({
        document_id: docId,
        status: (vr.status as any) || 'VERIFIED',
        plain_language_explanation: vr.plainLanguageExplanation || 'Record initialized.',
        recommended_action: vr.recommendedAction || 'Review verification queue.',
        deterministic_rules_passed: vr.deterministicRulesPassed ?? true,
        ai_explanation_text: vr.aiExplanationText || '',
      })
      .select('id')
      .single();

    const evidenceItems = ('evidenceList' in vr && Array.isArray(vr.evidenceList)) ? vr.evidenceList : [];
    if (repData && evidenceItems.length > 0) {
      const evInserts = evidenceItems.map((e) => ({
        report_id: repData.id,
        source: e.source as any,
        extracted_value: e.extractedValue,
        status: e.status as any,
        detail: e.detail,
      }));
      await supabase.from('validation_evidence').insert(evInserts);
    }

    return docId;
  },

  async updateExtractedField(
    docId: string,
    fieldKey: string,
    newValue: string,
    markVerified: boolean = true
  ): Promise<void> {
    // 1. Update extracted field in DB
    const { error } = await supabase
      .from('extracted_fields')
      .update({
        value: newValue,
        is_verified: markVerified,
        confidence: 'HIGH',
        confidence_score: 99,
        updated_at: new Date().toISOString(),
      })
      .eq('document_id', docId)
      .eq('field_key', fieldKey);

    if (error) {
      console.error('Error updating extracted field:', error);
      throw error;
    }

    // 2. Also update top-level field on land_documents if applicable
    const docUpdate: {
      survey_number?: string;
      owner_name?: string;
      village?: string;
      land_area?: string;
    } = {};
    if (fieldKey === 'surveyNumber') docUpdate.survey_number = newValue;
    if (fieldKey === 'ownerName') docUpdate.owner_name = newValue;
    if (fieldKey === 'village') docUpdate.village = newValue;
    if (fieldKey === 'landArea') docUpdate.land_area = newValue;

    if (Object.keys(docUpdate).length > 0) {
      await supabase.from('land_documents').update(docUpdate).eq('id', docId);
    }
  },

  async updateCadastralDetails(
    docId: string,
    details: Partial<TamilCadastralDetails>
  ): Promise<void> {
    const updatePayload: Record<string, any> = {};
    if (details.pattaNumber !== undefined) updatePayload.patta_number = details.pattaNumber;
    if (details.landClassification !== undefined) updatePayload.land_classification = details.landClassification;
    if (details.sroJurisdiction !== undefined) updatePayload.sro_jurisdiction = details.sroJurisdiction;
    if (details.documentRegistrationNumber !== undefined) updatePayload.document_registration_number = details.documentRegistrationNumber;
    if (details.relativeName !== undefined) updatePayload.relative_name = details.relativeName;
    if (details.tamilOwnerName !== undefined) updatePayload.tamil_owner_name = details.tamilOwnerName;
    if (details.tamilVillage !== undefined) updatePayload.tamil_village = details.tamilVillage;
    if (details.tamilTaluk !== undefined) updatePayload.tamil_taluk = details.tamilTaluk;
    if (details.tamilDistrict !== undefined) updatePayload.tamil_district = details.tamilDistrict;

    if (Object.keys(updatePayload).length > 0) {
      await supabase
        .from('cadastral_details')
        .upsert({ document_id: docId, ...updatePayload }, { onConflict: 'document_id' });
    }
  },

  async updateCadastralBoundaries(
    docId: string,
    boundaries: Partial<CadastralBoundaries>
  ): Promise<void> {
    const updatePayload: Record<string, any> = {};
    if (boundaries.north !== undefined) updatePayload.north = boundaries.north;
    if (boundaries.south !== undefined) updatePayload.south = boundaries.south;
    if (boundaries.east !== undefined) updatePayload.east = boundaries.east;
    if (boundaries.west !== undefined) updatePayload.west = boundaries.west;
    if (boundaries.tamilNorth !== undefined) updatePayload.tamil_north = boundaries.tamilNorth;
    if (boundaries.tamilSouth !== undefined) updatePayload.tamil_south = boundaries.tamilSouth;
    if (boundaries.tamilEast !== undefined) updatePayload.tamil_east = boundaries.tamilEast;
    if (boundaries.tamilWest !== undefined) updatePayload.tamil_west = boundaries.tamilWest;

    if (Object.keys(updatePayload).length > 0) {
      await supabase
        .from('cadastral_boundaries')
        .upsert({ document_id: docId, ...updatePayload }, { onConflict: 'document_id' });
    }
  },

  async saveManualVerification(docId: string, notes: string): Promise<void> {
    // 1. Mark all fields verified
    await supabase
      .from('extracted_fields')
      .update({ is_verified: true, confidence: 'HIGH', confidence_score: 95 })
      .eq('document_id', docId);

    // 2. Update document status to GIS_VERIFIED
    const { error } = await supabase
      .from('land_documents')
      .update({
        status: 'GIS_VERIFIED',
        overall_confidence: 'HIGH',
        confidence_score: 95,
        officer_notes: notes || 'Officer verified optical ambiguity against revenue volume register.',
      })
      .eq('id', docId);

    if (error) {
      console.error('Error saving manual verification:', error);
      throw error;
    }
  },
};
