import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuditEvent,
  DemoScenarioType,
  DigitalSignatureData,
  GisParcelData,
  LandDocument,
  NavigationTab,
  NotificationItem,
  UserRole,
  CadastralBoundaries,
  TamilCadastralDetails,
} from '../types';
import { INITIAL_DOCUMENTS, INITIAL_GIS_PARCELS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import { AppLanguage, TRANSLATIONS, TranslationKey } from '../i18n/translations';

interface UserProfile {
  name: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  badgeLabel: string;
  avatarInitials: string;
  location: string;
}

export const ROLE_PROFILES: Record<UserRole, UserProfile> = {
  CITIZEN: {
    name: 'Ramesh Patel',
    role: 'CITIZEN',
    roleTitle: 'Citizen / Landowner (நில உரிமையாளர்)',
    department: 'Landholder Self-Service Portal',
    badgeLabel: 'Citizen',
    avatarInitials: 'RP',
    location: 'Vandalur, Chengalpattu',
  },
  OFFICER: {
    name: 'Officer K. Sharma',
    role: 'OFFICER',
    roleTitle: 'Village Officer / VAO (கிராம நிர்வாக அலுவலர்)',
    department: 'Land Records & Survey Division',
    badgeLabel: 'Village Officer',
    avatarInitials: 'KS',
    location: 'Chengalpattu Revenue Taluk',
  },
  HIGH_AUTHORITY: {
    name: 'Dr. V. Narayanan',
    role: 'HIGH_AUTHORITY',
    roleTitle: 'Sub-Registrar (பதிவு அதிகாரி)',
    department: 'Registration & Revenue Administration',
    badgeLabel: 'Sub-Registrar',
    avatarInitials: 'VN',
    location: 'Registration Secretariat',
  },
};

interface AppContextType {
  currentRole: UserRole;
  currentProfile: UserProfile;
  activeTab: NavigationTab;
  documents: LandDocument[];
  selectedDocumentId: string | null;
  selectedDocument: LandDocument | null;
  gisParcels: GisParcelData[];
  selectedParcelId: string | null;
  selectedParcel: GisParcelData | null;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  isSearchModalOpen: boolean;
  searchQuery: string;
  statusFilter: string | null;
  currentScenario: DemoScenarioType;

  // Language & i18n
  currentLanguage: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: TranslationKey, fallback?: string) => string;

  // Actions
  setRole: (role: UserRole) => void;
  setActiveTab: (tab: NavigationTab) => void;
  navigateTo: (tab: NavigationTab, docId?: string, parcelId?: string) => void;
  selectDocument: (docId: string) => void;
  selectParcel: (parcelId: string | null) => void;
  setStatusFilter: (filter: string | null) => void;
  loadScenario: (scenario: DemoScenarioType) => void;
  updateExtractedField: (docId: string, fieldKey: string, newValue: string, markVerified?: boolean) => void;
  updateDocumentField: (docId: string, fieldKey: string, newValue: string) => void;
  saveManualVerification: (docId: string, notes: string) => void;
  resolveDocumentConflict: (docId: string, resolution: 'ACCEPT_GIS' | 'FLAG_FIELD_INSPECTION', notes: string) => void;
  submitOfficerDecision: (
    docId: string,
    action: 'APPROVE' | 'RETURN' | 'REJECT' | 'NEEDS_MANUAL_REVIEW',
    reason?: string,
    comments?: string
  ) => void;
  submitDigitalSignature: (
    docId: string,
    signerNameOrData:
      | string
      | {
          signerName: string;
          signerDesignation: string;
          certificateId: string;
          hashSha256?: string;
          signDate?: string;
        },
    designation?: string,
    certificateId?: string
  ) => void;
  batchSubmitDigitalSignatures: (
    docIds: string[],
    signerName: string,
    signerDesignation: string,
    certificateId: string
  ) => void;
  addCitizenQuery: (docId: string, querySubject: string, queryMessage: string) => void;
  submitSupportTicket: (
    ticketOrSubject: { category: string; subject: string; message: string; contactEmail?: string } | string,
    message?: string,
    category?: string
  ) => void;
  downloadFile: (filename: string, content: string, mimeType?: string) => void;
  uploadNewDocument: (newDoc: Partial<LandDocument>) => string;
  updateCadastralDetails: (docId: string, details: Partial<TamilCadastralDetails>) => void;
  updateCadastralBoundaries: (docId: string, boundaries: Partial<CadastralBoundaries>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  openSearchModal: (initialQuery?: string) => void;
  closeSearchModal: () => void;
  uploadedFileUrl: string | null;
  uploadedFileName: string | null;
  attachFileToDocument: (docId: string, file: File) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('CITIZEN');
  const [activeTab, setActiveTab] = useState<NavigationTab>('my-documents');
  const [documents, setDocuments] = useState<LandDocument[]>(INITIAL_DOCUMENTS);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [gisParcels, setGisParcels] = useState<GisParcelData[]>(INITIAL_GIS_PARCELS);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState<DemoScenarioType>('NORMAL_VERIFIED');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Language state with localStorage persistence (defaults to Tamil)
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('nila_language');
    if (saved === 'ta' || saved === 'hi' || saved === 'en') return saved;
    return 'ta';
  });

  const setLanguage = (lang: AppLanguage) => {
    setCurrentLanguage(lang);
    localStorage.setItem('nila_language', lang);
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const langDict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    return (langDict as Record<string, string>)[key] || (TRANSLATIONS.en as Record<string, string>)[key] || fallback || key;
  };

  const attachFileToDocument = (docId: string, file: File): string => {
    const url = URL.createObjectURL(file);
    setUploadedFileUrl(url);
    setUploadedFileName(file.name);
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              fileUrl: url,
              fileName: file.name,
              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              fileType: file.type,
            }
          : d
      )
    );
    return url;
  };

  const currentProfile = ROLE_PROFILES[currentRole];

  const selectedDocument = documents.find((d) => d.id === selectedDocumentId) || documents[0] || null;
  const selectedParcel = gisParcels.find((p) => p.parcelId === selectedParcelId) || null;

  // Unread notifications for current role
  const unreadNotificationCount = notifications.filter(
    (n) => !n.read && n.targetRoles.includes(currentRole)
  ).length;

  const setRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    // When switching roles, redirect to that role's primary landing view
    if (newRole === 'CITIZEN') {
      setActiveTab('my-documents');
    } else if (newRole === 'OFFICER') {
      setActiveTab('queue');
    } else {
      setActiveTab('approvals');
    }
  };

  const CITIZEN_ALLOWED_TABS: NavigationTab[] = [
    'dashboard',
    'my-documents',
    'document-details',
    'gis-map',
    'file-to-gis',
    'upload',
    'help',
  ];

  const navigateTo = (tab: NavigationTab, docId?: string, parcelId?: string) => {
    let targetTab = tab;
    // Strict RBAC: Citizen cannot access administrative or verification queues
    if (currentRole === 'CITIZEN' && !CITIZEN_ALLOWED_TABS.includes(tab)) {
      targetTab = 'my-documents';
    }
    if (docId) setSelectedDocumentId(docId);
    if (parcelId) setSelectedParcelId(parcelId);
    setActiveTab(targetTab);
  };

  const selectDocument = (docId: string) => {
    setSelectedDocumentId(docId);
  };

  const selectParcel = (parcelId: string | null) => {
    setSelectedParcelId(parcelId);
  };

  const updateExtractedField = (
    docId: string,
    fieldKey: string,
    newValue: string,
    markVerified: boolean = true
  ) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id !== docId) return doc;

        const currentField = doc.extractedFields[fieldKey];
        if (!currentField) return doc;

        const updatedFields = {
          ...doc.extractedFields,
          [fieldKey]: {
            ...currentField,
            value: newValue,
            isVerified: markVerified,
            confidence: 'HIGH' as const,
            confidenceScore: 99,
          },
        };

        // Also update top-level survey/area if applicable
        const updatedDoc: LandDocument = {
          ...doc,
          extractedFields: updatedFields,
          surveyNumber: fieldKey === 'surveyNumber' ? newValue : doc.surveyNumber,
          ownerName: fieldKey === 'ownerName' ? newValue : doc.ownerName,
          village: fieldKey === 'village' ? newValue : doc.village,
          landArea: fieldKey === 'landArea' ? newValue : doc.landArea,
        };

        return updatedDoc;
      })
    );
  };

  const saveManualVerification = (docId: string, notes: string) => {
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id !== docId) return doc;

        const newAudit: AuditEvent = {
          id: `aud-${Date.now()}`,
          timestamp,
          actorName: currentProfile.name,
          actorRole: currentRole,
          action: 'Manual Officer Verification Completed',
          status: 'Fields Verified & Saved',
          comments: notes || 'Officer verified optical ambiguity against revenue volume register.',
        };

        // Mark all extracted fields verified
        const updatedFields = { ...doc.extractedFields };
        Object.keys(updatedFields).forEach((key) => {
          updatedFields[key] = {
            ...updatedFields[key],
            isVerified: true,
          };
        });

        return {
          ...doc,
          status: 'GIS_VERIFIED' as const,
          overallConfidence: 'HIGH' as const,
          confidenceScore: 95,
          extractedFields: updatedFields,
          validationReport: {
            ...doc.validationReport,
            status: 'VERIFIED' as const,
            deterministicRulesPassed: true,
            plainLanguageExplanation: 'Officer has resolved optical ambiguities. All fields confirmed.',
          },
          auditTrail: [...doc.auditTrail, newAudit],
        };
      })
    );
  };

  const updateDocumentField = (docId: string, fieldKey: string, newValue: string) => {
    updateExtractedField(docId, fieldKey, newValue, true);
  };

  const resolveDocumentConflict = (
    docId: string,
    resolution: 'ACCEPT_GIS' | 'FLAG_FIELD_INSPECTION',
    notes: string
  ) => {
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id !== docId) return doc;

        const newAudit: AuditEvent = {
          id: `aud-${Date.now()}`,
          timestamp,
          actorName: currentProfile.name,
          actorRole: currentRole,
          action: `Conflict Resolved: ${resolution}`,
          status: resolution === 'ACCEPT_GIS' ? 'GIS_VERIFIED' : 'NEEDS_ATTENTION',
          comments: notes,
        };

        return {
          ...doc,
          status: (resolution === 'ACCEPT_GIS' ? 'GIS_VERIFIED' : 'NEEDS_ATTENTION') as any,
          actionRequiredCitizen:
            resolution === 'FLAG_FIELD_INSPECTION'
              ? 'Physical field surveyor inspection requested for boundary resolution.'
              : undefined,
          auditTrail: [...doc.auditTrail, newAudit],
        };
      })
    );
  };

  const loadScenario = (scenario: DemoScenarioType) => {
    setCurrentScenario(scenario);
    // Find matching document for this scenario
    const matchingDoc = documents.find((d) => d.scenarioType === scenario);
    if (matchingDoc) {
      setSelectedDocumentId(matchingDoc.id);
      if (matchingDoc.gisParcel) {
        setSelectedParcelId(matchingDoc.gisParcel.parcelId);
      }
    }
  };

  const submitOfficerDecision = (
    docId: string,
    action: 'APPROVE' | 'RETURN' | 'REJECT' | 'NEEDS_MANUAL_REVIEW',
    reason?: string,
    comments?: string
  ) => {
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id !== docId) return doc;

        let nextStatus: LandDocument['status'] = 'READY_FOR_APPROVAL';
        if (action === 'REJECT') nextStatus = 'REJECTED';
        if (action === 'RETURN' || action === 'NEEDS_MANUAL_REVIEW') nextStatus = 'NEEDS_ATTENTION';

        const effectiveReason = reason || action;
        const effectiveComments = comments || 'Action recorded by officer';

        const newAudit: AuditEvent = {
          id: `aud-${Date.now()}`,
          timestamp,
          actorName: currentProfile.name,
          actorRole: currentRole,
          action: `Officer Decision: ${action}`,
          status: nextStatus,
          comments: `${effectiveReason} - ${effectiveComments}`,
        };

        return {
          ...doc,
          status: nextStatus,
          actionRequiredCitizen:
            action === 'RETURN'
              ? `Action Required: ${effectiveReason}. Please update or re-upload your document.`
              : doc.actionRequiredCitizen,
          officerRecommendation: {
            action: action === 'NEEDS_MANUAL_REVIEW' ? 'RETURN' : action,
            reason: effectiveReason,
            comments: effectiveComments,
            officerName: currentProfile.name,
            date: timestamp,
          },
          auditTrail: [...doc.auditTrail, newAudit],
        };
      })
    );
  };

  const submitDigitalSignature = (
    docId: string,
    signerNameOrData:
      | string
      | {
          signerName: string;
          signerDesignation: string;
          certificateId: string;
          hashSha256?: string;
          signDate?: string;
        },
    designation?: string,
    certificateId?: string
  ) => {
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isObj = typeof signerNameOrData === 'object';
    const signerName = isObj ? signerNameOrData.signerName : signerNameOrData;
    const signerDesignation = isObj
      ? signerNameOrData.signerDesignation
      : designation || 'Sub-Registrar & Executive Approver';
    const certId = isObj
      ? signerNameOrData.certificateId
      : certificateId || `DSC-${Date.now()}`;
    const sigHash = isObj && signerNameOrData.hashSha256
      ? signerNameOrData.hashSha256
      : `SHA256:${Array.from({ length: 16 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('')}`;

    const signatureData: DigitalSignatureData = {
      certificateId: certId,
      signerName,
      signerDesignation,
      signDate: timestamp,
      algorithm: 'RSA-PSS / SHA-256 (CCA India Compliant D-Sign Prototype)',
      signatureHash: sigHash,
      verificationUrl: `https://landrecords.gov.in/verify/dsign/${certId}`,
    };

    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id !== docId) return doc;

        const newAudit: AuditEvent = {
          id: `aud-${Date.now()}`,
          timestamp,
          actorName: signerName,
          actorRole: 'HIGH_AUTHORITY',
          action: 'Final Approval & Digital Signature',
          status: 'APPROVED',
          comments: `Digitally signed using Certificate ${certId}. Cryptographic integrity sealed.`,
          digitalSignatureId: certId,
        };

        return {
          ...doc,
          status: 'APPROVED' as const,
          actionRequiredCitizen: undefined,
          digitalSignature: signatureData,
          auditTrail: [...doc.auditTrail, newAudit],
        };
      })
    );
  };

  const batchSubmitDigitalSignatures = (
    docIds: string[],
    signerName: string,
    signerDesignation: string,
    certificateId: string
  ) => {
    docIds.forEach((id) => {
      submitDigitalSignature(id, {
        signerName,
        signerDesignation,
        certificateId,
      });
    });
  };

  const addCitizenQuery = (docId: string, querySubject: string, queryMessage: string) => {
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id !== docId) return doc;

        const newAudit: AuditEvent = {
          id: `aud-${Date.now()}`,
          timestamp,
          actorName: currentProfile.name,
          actorRole: 'CITIZEN',
          action: `Citizen Query Filed: ${querySubject}`,
          status: 'NEEDS_ATTENTION',
          comments: queryMessage,
        };

        return {
          ...doc,
          status: 'NEEDS_ATTENTION' as const,
          actionRequiredCitizen: `Query Pending Officer Response: "${querySubject}"`,
          auditTrail: [...doc.auditTrail, newAudit],
        };
      })
    );

    // Add officer notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Citizen Query on Survey ${documents.find((d) => d.id === docId)?.surveyNumber || 'Record'}`,
      message: `Ramesh Patel submitted a query: "${querySubject}"`,
      timestamp,
      read: false,
      targetRoles: ['OFFICER', 'HIGH_AUTHORITY'],
      type: 'WARNING',
      documentId: docId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const submitSupportTicket = (
    ticketOrSubject: { category: string; subject: string; message: string; contactEmail?: string } | string,
    messageStr?: string,
    categoryStr?: string
  ) => {
    let subj = '';
    let msg = '';
    let cat = 'General Support';
    let email = currentProfile.name;

    if (typeof ticketOrSubject === 'object') {
      subj = ticketOrSubject.subject;
      msg = ticketOrSubject.message;
      cat = ticketOrSubject.category;
      if (ticketOrSubject.contactEmail) email = ticketOrSubject.contactEmail;
    } else {
      subj = ticketOrSubject;
      msg = messageStr || '';
      cat = categoryStr || 'General Support';
    }

    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Support Ticket Dispatched: [${cat}] ${subj}`,
      message: `Ticket from ${email} logged ("${msg.slice(0, 40)}..."). Reference: TKT-2026-${Math.floor(1000 + Math.random() * 9000)}.`,
      timestamp,
      read: false,
      targetRoles: [currentRole, 'OFFICER'],
      type: 'INFO',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const downloadFile = (filename: string, content: string, mimeType: string = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateCadastralDetails = (docId: string, details: Partial<TamilCadastralDetails>) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          cadastralDetails: {
            ...doc.cadastralDetails,
            ...details,
          },
        };
      })
    );
  };

  const updateCadastralBoundaries = (docId: string, boundaries: Partial<CadastralBoundaries>) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          cadastralDetails: {
            ...doc.cadastralDetails,
            boundaries: {
              ...doc.cadastralDetails?.boundaries,
              ...boundaries,
            },
          },
        };
      })
    );
  };

  const uploadNewDocument = (newDocData: Partial<LandDocument>): string => {
    const newId = `doc-${Date.now()}`;
    const docNumber = `LR-2024-${Math.floor(100 + Math.random() * 900)}`;
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const fullDoc: LandDocument = {
      id: newId,
      documentNumber: newDocData.documentNumber || docNumber,
      title: newDocData.title || (newDocData.surveyNumber ? `Land Record - Survey ${newDocData.surveyNumber}` : (newDocData.fileName ? `Uploaded Deed (${newDocData.fileName})` : 'Uploaded Land Record')),
      documentType: newDocData.documentType || 'Patta / RoR',
      surveyNumber: newDocData.surveyNumber || 'Pending Extraction',
      ownerName: newDocData.ownerName || currentProfile.name,
      village: newDocData.village || 'Pending Verification',
      taluk: newDocData.taluk || 'Pending Verification',
      district: newDocData.district || 'Pending Verification',
      landArea: newDocData.landArea || 'Pending Verification',
      landAreaNumeric: newDocData.landAreaNumeric || 0,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'DIGITIZED',
      overallConfidence: newDocData.overallConfidence || 'HIGH',
      confidenceScore: newDocData.confidenceScore || 95,
      uploadedBy: currentProfile.name,
      citizenEmail: 'citizen@example.com',
      assignedOfficer: 'Officer K. Sharma',
      scenarioType: 'NORMAL_VERIFIED',
      fileUrl: newDocData.fileUrl,
      fileName: newDocData.fileName,
      fileSize: newDocData.fileSize,
      fileType: newDocData.fileType,
      cadastralDetails: newDocData.cadastralDetails || {
        pattaNumber: '640',
        landClassification: 'புன்செய் (Dry Land)',
        sroJurisdiction: 'Kangeyam SRO',
        documentRegistrationNumber: `LR-2024-${newDocData.surveyNumber?.replace(/[^0-9]/g, '') || '640'}`,
        relativeName: 'Palanisamy Gounder',
        tamilOwnerName: 'சுப்பிரமணியம், த/பெ பழனிச்சாமி கவுண்டர்',
        tamilVillage: 'லக்கமநாயக்கன்பட்டி',
        tamilTaluk: 'காங்கேயம்',
        tamilDistrict: 'திருப்பூர்',
        boundaries: {
          north: 'Survey Boundary 143-B',
          south: 'Village Access Road',
          east: 'Adjacent Survey 144',
          west: 'Public Canal',
          tamilNorth: 'வடக்கு: சர்வே எல்லை 143-B',
          tamilSouth: 'தெற்கு: கிராமப் பாதை',
          tamilEast: 'கிழக்கு: பக்கத்து சர்வே 144',
          tamilWest: 'மேற்கு: பொது வாய்க்கால்',
        },
      },
      // Use OCR-provided extractedFields if available, otherwise fall back to defaults
      extractedFields: (newDocData.extractedFields && Object.keys(newDocData.extractedFields).length > 0)
        ? newDocData.extractedFields
        : {
            ownerName: {
              fieldName: 'Owner Full Name',
              fieldKey: 'ownerName',
              value: newDocData.ownerName || currentProfile.name,
              confidence: 'HIGH' as const,
              confidenceScore: 96,
              isVerified: true,
            },
            surveyNumber: {
              fieldName: 'Survey Number',
              fieldKey: 'surveyNumber',
              value: newDocData.surveyNumber || 'Pending',
              confidence: 'HIGH' as const,
              confidenceScore: 94,
              isVerified: true,
            },
            village: {
              fieldName: 'Village',
              fieldKey: 'village',
              value: newDocData.village || 'Pending',
              confidence: 'HIGH' as const,
              confidenceScore: 97,
              isVerified: true,
            },
            landArea: {
              fieldName: 'Total Land Area',
              fieldKey: 'landArea',
              value: newDocData.landArea || 'Pending',
              confidence: 'HIGH' as const,
              confidenceScore: 92,
              isVerified: true,
            },
          },
      gisParcel: INITIAL_GIS_PARCELS[6],
      validationReport: {
        status: 'VERIFIED',
        plainLanguageExplanation:
          'Newly digitized Tamil land record has completed OCR and is ready for officer cross-verification.',
        conflictingFields: [],
        evidenceList: [
          {
            source: 'Document',
            extractedValue: `${newDocData.surveyNumber || '143-C'} (${newDocData.ownerName || currentProfile.name})`,
            status: 'MATCH',
            detail: 'Newly processed Tamil record upload',
          },
          {
            source: 'GIS',
            extractedValue: 'Parcel P-143C (2.43 Hectares)',
            status: 'MATCH',
            detail: 'Matches Tamil Nadu village survey layout',
          },
        ],
        recommendedAction: 'Proceed with officer verification check.',
        deterministicRulesPassed: true,
        aiExplanationText:
          'Automated pipeline processed document via Tamil OCR model. Nominal, boundary, and spatial features matched parcel polygon.',
      },
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp,
          actorName: currentProfile.name,
          actorRole: currentRole,
          action: 'Document Uploaded & Tamil OCR Digitized',
          status: 'DIGITIZED',
          comments: `Uploaded via Digitalization Officer Portal (${newDocData.fileName || 'document.pdf'}). Initial Tamil cadastral extraction completed with high optical confidence.`,
        },
      ],
    };

    setDocuments((prevDocs) => [fullDoc, ...prevDocs]);
    setSelectedDocumentId(newId);
    if (fullDoc.fileUrl) setUploadedFileUrl(fullDoc.fileUrl);
    if (fullDoc.fileName) setUploadedFileName(fullDoc.fileName);

    // Create a notification for the officer
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New Tamil Record Digitized: ${fullDoc.documentNumber}`,
      message: `${fullDoc.documentType} for Survey ${fullDoc.surveyNumber} (${fullDoc.ownerName}) processed and queued for verification.`,
      timestamp,
      read: false,
      targetRoles: ['OFFICER', 'HIGH_AUTHORITY'],
      type: 'INFO',
      documentId: newId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newId;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const openSearchModal = (initialQuery: string = '') => {
    setSearchQuery(initialQuery);
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        currentProfile,
        activeTab,
        currentLanguage,
        setLanguage,
        t,
        documents,
        selectedDocumentId,
        selectedDocument,
        gisParcels,
        selectedParcelId,
        selectedParcel,
        notifications,
        unreadNotificationCount,
        isSearchModalOpen,
        searchQuery,
        statusFilter,
        currentScenario,
        uploadedFileUrl,
        uploadedFileName,
        attachFileToDocument,
        setRole,
        setActiveTab,
        navigateTo,
        selectDocument,
        selectParcel,
        setStatusFilter,
        loadScenario,
        updateExtractedField,
        updateDocumentField,
        updateCadastralDetails,
        updateCadastralBoundaries,
        saveManualVerification,
        resolveDocumentConflict,
        submitOfficerDecision,
        submitDigitalSignature,
        batchSubmitDigitalSignatures,
        addCitizenQuery,
        submitSupportTicket,
        downloadFile,
        uploadNewDocument,
        markNotificationRead,
        markAllNotificationsRead,
        openSearchModal,
        closeSearchModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
