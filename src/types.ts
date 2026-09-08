export type UserRole = 'CITIZEN' | 'OFFICER' | 'HIGH_AUTHORITY';

export type DocumentStatus =
  | 'PROCESSING'
  | 'DIGITIZED'
  | 'UNDER_VERIFICATION'
  | 'GIS_VERIFIED'
  | 'READY_FOR_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_ATTENTION';

export type ValidationStatus =
  | 'VERIFIED'
  | 'NEEDS_MANUAL_REVIEW'
  | 'CONFLICT'
  | 'PARTIALLY_VERIFIED'
  | 'REJECTED';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ExtractedField {
  fieldName: string;
  fieldKey: string;
  value: string;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0 - 100
  isVerified: boolean;
  notes?: string;
}

export interface LegacyLandRecord {
  recordNumber: string;
  ownerName: string;
  surveyNumber: string;
  subdivision?: string;
  village: string;
  taluk: string;
  district: string;
  areaAcres: number;
  mutationYear: number;
  recordStatus: 'ACTIVE' | 'ARCHIVED' | 'DISPUTED' | 'NOT_FOUND';
}

export interface GisParcelData {
  parcelId: string;
  surveyNumber: string;
  village: string;
  areaAcres: number;
  centroid: { x: number; y: number };
  coordinates: [number, number][]; // Polygon vertices
  landUse: string;
  waterBodyAdjacent: boolean;
  roadAccess: boolean;
  historicalBoundaryMatch: boolean;
  spatialConflict: boolean;
  status: 'VERIFIED' | 'PENDING' | 'CONFLICT' | 'BUFFER_RESTRICTED';
}

export interface ValidationEvidence {
  source: 'Document' | 'Land Record' | 'GIS' | 'Historical Record' | 'Field Survey';
  extractedValue: string;
  status: 'MATCH' | 'MISMATCH' | 'UNAVAILABLE' | 'REVIEW_NEEDED';
  detail: string;
}

export interface ValidationReport {
  status: ValidationStatus;
  primaryIssue?: string;
  plainLanguageExplanation: string;
  conflictingFields: string[];
  evidenceList: ValidationEvidence[];
  recommendedAction: string;
  deterministicRulesPassed: boolean;
  aiExplanationText: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  status: string;
  comments?: string;
  digitalSignatureId?: string;
}

export interface DigitalSignatureData {
  certificateId: string;
  signerName: string;
  signerDesignation: string;
  signDate: string;
  algorithm: string;
  signatureHash: string;
  verificationUrl: string;
}

export type DemoScenarioType =
  | 'NORMAL_VERIFIED'
  | 'LOW_CONFIDENCE'
  | 'SURVEY_CONFLICT'
  | 'NEW_RECORD_NOT_IN_DB'
  | 'PARTIAL_GIS'
  | 'AREA_ANOMALY';

export interface CadastralBoundaries {
  north?: string;
  south?: string;
  east?: string;
  west?: string;
  tamilNorth?: string;
  tamilSouth?: string;
  tamilEast?: string;
  tamilWest?: string;
}

export interface TamilCadastralDetails {
  pattaNumber?: string;
  landClassification?: string; // நன்செய் (Wet) | புன்செய் (Dry) | நத்தம் (Natham) | மானாவாரி | அரசு புறம்போக்கு
  sroJurisdiction?: string; // சார் பதிவாளர் அலுவலகம்
  documentRegistrationNumber?: string; // ஆவண எண்
  relativeName?: string; // தகப்பனார் / கணவர் பெயர் (e.g., s/o Palanisamy Gounder)
  tamilOwnerName?: string; // பட்டாதாரர் / கிரையதாரர் பெயர் (தமிழ்)
  tamilVillage?: string; // கிராமம் (தமிழ்)
  tamilTaluk?: string; // வட்டம் (தமிழ்)
  tamilDistrict?: string; // மாவட்டம் (தமிழ்)
  boundaries?: CadastralBoundaries;
}

export interface LandDocument {
  id: string;
  documentNumber: string;
  title: string;
  documentType:
    | 'Sale Deed'
    | 'Patta / RoR'
    | 'Gift Deed'
    | 'Partition Deed'
    | 'Inheritance Title'
    | 'A-Register'
    | 'Encumbrance Certificate'
    | 'Settlement Deed'
    | 'Lease Deed'
    | 'Mortgage Deed';
  surveyNumber: string;
  ownerName: string;
  village: string;
  taluk: string;
  district: string;
  landArea: string; // e.g. "2.45 acres" or "1 ஹெக்டேர் 43 ஏர்ஸ்"
  landAreaNumeric: number; // in acres
  submissionDate: string;
  status: DocumentStatus;
  overallConfidence: ConfidenceLevel;
  confidenceScore: number;
  uploadedBy: string;
  citizenEmail: string;
  assignedOfficer?: string;
  actionRequiredCitizen?: string;
  extractedFields: Record<string, ExtractedField>;
  legacyRecord?: LegacyLandRecord;
  gisParcel?: GisParcelData;
  validationReport: ValidationReport;
  officerRecommendation?: {
    action: 'APPROVE' | 'RETURN' | 'REJECT';
    reason: string;
    comments: string;
    officerName: string;
    date: string;
  };
  officerNotes?: string;
  cadastralDetails?: TamilCadastralDetails;
  digitalSignature?: DigitalSignatureData;
  auditTrail: AuditEvent[];
  scenarioType: DemoScenarioType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
}

export interface NotificationItem {
  id: string;
  targetRoles: UserRole[];
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  documentId?: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ACTION_REQUIRED';
}

export type NavigationTab =
  | 'dashboard'
  | 'my-documents'
  | 'document-details'
  | 'gis-map'
  | 'file-to-gis'
  | 'queue'
  | 'upload'
  | 'digitization'
  | 'manual-verification'
  | 'gis-validation'
  | 'approvals'
  | 'processing-validation'
  | 'final-approval'
  | 'reports'
  | 'audit-trail'
  | 'help';
