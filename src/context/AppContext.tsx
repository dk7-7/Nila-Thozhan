import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
import { AppLanguage, TRANSLATIONS, TranslationKey } from '../i18n/translations';
import { authService, UserProfileData } from '../services/authService';
import { documentService } from '../services/documentService';
import { workflowService } from '../services/workflowService';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { gisService } from '../services/gisService';
import { ticketService } from '../services/ticketService';
import { queryService } from '../services/queryService';
import { supabase } from '../lib/supabase';

export interface UserProfile {
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

const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string }> = {
  CITIZEN: { email: 'citizen@nilathozhan.tn.gov.in', pass: 'NilaThozhan2026!' },
  OFFICER: { email: 'officer@nilathozhan.tn.gov.in', pass: 'NilaThozhan2026!' },
  HIGH_AUTHORITY: { email: 'authority@nilathozhan.tn.gov.in', pass: 'NilaThozhan2026!' },
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
  uploadNewDocument: (newDoc: Partial<LandDocument>) => Promise<string> | string;
  updateCadastralDetails: (docId: string, details: Partial<TamilCadastralDetails>) => void;
  updateCadastralBoundaries: (docId: string, boundaries: Partial<CadastralBoundaries>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  openSearchModal: (initialQuery?: string) => void;
  closeSearchModal: () => void;
  uploadedFileUrl: string | null;
  uploadedFileName: string | null;
  attachFileToDocument: (docId: string, file: File) => string;

  // Supabase Auth Integration
  userProfile: UserProfileData | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('CITIZEN');
  const [activeTab, setActiveTab] = useState<NavigationTab>('my-documents');
  const [documents, setDocuments] = useState<LandDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [gisParcels, setGisParcels] = useState<GisParcelData[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState<DemoScenarioType>('NORMAL_VERIFIED');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  // 1. Data refresh from Supabase with role-based filtering
  const refreshData = useCallback(async (activeRole?: UserRole, profile?: UserProfileData | null) => {
    try {
      const role = activeRole || currentRole;
      const prof = profile !== undefined ? profile : userProfile;

      const [allDocs, parcels, notifs] = await Promise.all([
        documentService.getAllDocuments(),
        gisService.getAllParcels(),
        notificationService.getNotifications(),
      ]);

      // Strict RBAC filtering: Citizens see only their own documents
      const docs = role === 'CITIZEN' && prof
        ? allDocs.filter((d) => d.uploadedBy === prof.id || d.citizenEmail === prof.email)
        : allDocs;

      setDocuments(docs);
      setGisParcels(parcels);
      setNotifications(notifs);

      if (docs.length > 0 && !selectedDocumentId) {
        setSelectedDocumentId(docs[0].id);
      }
      if (parcels.length > 0 && !selectedParcelId) {
        setSelectedParcelId(parcels[0].parcelId);
      }
    } catch (err) {
      console.error('Failed to refresh data from Supabase:', err);
    }
  }, [currentRole, userProfile, selectedDocumentId, selectedParcelId]);

  // 2. Initial Auth & Session Setup
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoading(true);
      let activeProfile: UserProfileData | null = null;
      let activeUserRole: UserRole = 'CITIZEN';

      try {
        const session = await authService.getCurrentSession();
        if (session?.user) {
          const profile = await authService.getProfile(session.user.id);
          if (profile) {
            activeProfile = profile;
            activeUserRole = profile.role;
          }
        } else {
          // Attempt demo login or query profiles directly
          try {
            const creds = DEMO_CREDENTIALS.CITIZEN;
            activeProfile = await authService.signIn(creds.email, creds.pass);
            activeUserRole = activeProfile.role;
          } catch {
            const { data: dbProfiles } = await supabase
              .from('profiles')
              .select('*')
              .eq('role', 'CITIZEN')
              .limit(1);

            if (dbProfiles && dbProfiles.length > 0) {
              const p = dbProfiles[0];
              activeProfile = {
                id: p.id,
                email: p.email,
                fullName: p.full_name,
                role: p.role as UserRole,
                department: p.department || undefined,
                designation: p.designation || undefined,
                phone: p.phone || undefined,
                location: p.location || undefined,
                avatarUrl: p.avatar_url || undefined,
                isActive: p.is_active,
              };
              activeUserRole = 'CITIZEN';
            }
          }
        }
      } catch (e) {
        console.error('Auth initialization check:', e);
      } finally {
        if (isMounted) {
          setUserProfile(activeProfile);
          setCurrentRole(activeUserRole);
          setIsLoading(false);
          refreshData(activeUserRole, activeProfile);
        }
      }
    }

    initAuth();

    // Subscribe to realtime notifications
    const unsubscribeNotifs = notificationService.subscribeToNotifications((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      isMounted = false;
      unsubscribeNotifs();
    };
  }, []);

  // When role changes, switch profile & enforce role views
  const setRole = async (newRole: UserRole) => {
    setIsLoading(true);
    setCurrentRole(newRole);
    let newProfile: UserProfileData | null = null;

    try {
      const creds = DEMO_CREDENTIALS[newRole];
      if (creds) {
        try {
          newProfile = await authService.signIn(creds.email, creds.pass);
        } catch {
          const { data: dbProfiles } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', newRole)
            .limit(1);

          if (dbProfiles && dbProfiles.length > 0) {
            const p = dbProfiles[0];
            newProfile = {
              id: p.id,
              email: p.email,
              fullName: p.full_name,
              role: p.role as UserRole,
              department: p.department || undefined,
              designation: p.designation || undefined,
              phone: p.phone || undefined,
              location: p.location || undefined,
              avatarUrl: p.avatar_url || undefined,
              isActive: p.is_active,
            };
          }
        }
        if (newProfile) {
          setUserProfile(newProfile);
        }
      }
    } catch (e) {
      console.error('Error switching role session:', e);
    } finally {
      setIsLoading(false);
      await refreshData(newRole, newProfile);
    }

    // Redirect to primary view for role
    if (newRole === 'CITIZEN') {
      setActiveTab('my-documents');
    } else if (newRole === 'OFFICER') {
      setActiveTab('queue');
    } else {
      setActiveTab('approvals');
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUserProfile(null);
    setDocuments([]);
  };

  const attachFileToDocument = (docId: string, file: File): string => {
    const url = URL.createObjectURL(file);
    setUploadedFileUrl(url);
    setUploadedFileName(file.name);
    setPendingFile(file);

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

  // Combine DB profile info with UI display metadata
  const baseProfile = ROLE_PROFILES[currentRole];
  const currentProfile: UserProfile = {
    ...baseProfile,
    name: userProfile?.fullName || baseProfile.name,
    location: userProfile?.location || baseProfile.location,
    department: userProfile?.department || baseProfile.department,
    roleTitle: userProfile?.designation || baseProfile.roleTitle,
  };

  const selectedDocument = documents.find((d) => d.id === selectedDocumentId) || documents[0] || null;
  const selectedParcel = gisParcels.find((p) => p.parcelId === selectedParcelId) || null;

  const unreadNotificationCount = notifications.filter(
    (n) => !n.read && n.targetRoles.includes(currentRole)
  ).length;

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

  const updateExtractedField = async (
    docId: string,
    fieldKey: string,
    newValue: string,
    markVerified: boolean = true
  ) => {
    // Optimistic UI update
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

        return {
          ...doc,
          extractedFields: updatedFields,
          surveyNumber: fieldKey === 'surveyNumber' ? newValue : doc.surveyNumber,
          ownerName: fieldKey === 'ownerName' ? newValue : doc.ownerName,
          village: fieldKey === 'village' ? newValue : doc.village,
          landArea: fieldKey === 'landArea' ? newValue : doc.landArea,
        };
      })
    );

    try {
      await documentService.updateExtractedField(docId, fieldKey, newValue, markVerified);
    } catch (e) {
      console.error('Failed to update field in Supabase:', e);
      refreshData();
    }
  };

  const updateDocumentField = (docId: string, fieldKey: string, newValue: string) => {
    updateExtractedField(docId, fieldKey, newValue, true);
  };

  const saveManualVerification = async (docId: string, notes: string) => {
    try {
      await documentService.saveManualVerification(docId, notes);
      await refreshData();
    } catch (e) {
      console.error('Failed to save manual verification in Supabase:', e);
    }
  };

  const resolveDocumentConflict = async (
    docId: string,
    resolution: 'ACCEPT_GIS' | 'FLAG_FIELD_INSPECTION',
    notes: string
  ) => {
    try {
      await workflowService.resolveGisConflict(docId, resolution, notes);
      await refreshData();
    } catch (e) {
      console.error('Failed to resolve conflict in Supabase:', e);
    }
  };

  const loadScenario = (scenario: DemoScenarioType) => {
    setCurrentScenario(scenario);
    const matchingDoc = documents.find((d) => d.scenarioType === scenario);
    if (matchingDoc) {
      setSelectedDocumentId(matchingDoc.id);
      if (matchingDoc.gisParcel) {
        setSelectedParcelId(matchingDoc.gisParcel.parcelId);
      }
    }
  };

  const submitOfficerDecision = async (
    docId: string,
    action: 'APPROVE' | 'RETURN' | 'REJECT' | 'NEEDS_MANUAL_REVIEW',
    reason?: string,
    comments?: string
  ) => {
    try {
      await workflowService.submitOfficerDecision(docId, action, reason, comments);
      await refreshData();
    } catch (e) {
      console.error('Failed to submit officer decision in Supabase:', e);
    }
  };

  const submitDigitalSignature = async (
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
    const isObj = typeof signerNameOrData === 'object';
    const signerName = isObj ? signerNameOrData.signerName : signerNameOrData;
    const signerDesignation = isObj
      ? signerNameOrData.signerDesignation
      : designation || 'Sub-Registrar & Head of Approvals';
    const certId = isObj
      ? signerNameOrData.certificateId
      : certificateId || `DSC-TN-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const sigHash = isObj && signerNameOrData.hashSha256 ? signerNameOrData.hashSha256 : undefined;

    try {
      await workflowService.approveDocumentAndSign(docId, {
        certificateId: certId,
        signerName,
        signerDesignation,
        signatureHash: sigHash,
      });
      await refreshData();
    } catch (e) {
      console.error('Failed to execute digital signature in Supabase:', e);
    }
  };

  const batchSubmitDigitalSignatures = async (
    docIds: string[],
    signerName: string,
    signerDesignation: string,
    certificateId: string
  ) => {
    for (const id of docIds) {
      await submitDigitalSignature(id, {
        signerName,
        signerDesignation,
        certificateId,
      });
    }
  };

  const addCitizenQuery = async (docId: string, querySubject: string, queryMessage: string) => {
    if (!userProfile) return;
    try {
      await queryService.submitCitizenQuery(docId, userProfile.id, querySubject, queryMessage);
      await refreshData();
    } catch (e) {
      console.error('Failed to submit query in Supabase:', e);
    }
  };

  const submitSupportTicket = async (
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

    try {
      await ticketService.submitSupportTicket(cat, subj, msg, email);
      await refreshData();
    } catch (e) {
      console.error('Failed to submit support ticket in Supabase:', e);
    }
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

  const updateCadastralDetails = async (docId: string, details: Partial<TamilCadastralDetails>) => {
    try {
      await documentService.updateCadastralDetails(docId, details);
      await refreshData();
    } catch (e) {
      console.error('Failed to update cadastral details in Supabase:', e);
    }
  };

  const updateCadastralBoundaries = async (docId: string, boundaries: Partial<CadastralBoundaries>) => {
    try {
      await documentService.updateCadastralBoundaries(docId, boundaries);
      await refreshData();
    } catch (e) {
      console.error('Failed to update boundaries in Supabase:', e);
    }
  };

  const uploadNewDocument = async (newDocData: Partial<LandDocument>): Promise<string> => {
    const userId = userProfile?.id || '11111111-1111-1111-1111-111111111111';

    let fileUrl = newDocData.fileUrl || uploadedFileUrl;
    let fileName = newDocData.fileName || uploadedFileName;
    let fileSize = newDocData.fileSize;
    let fileType = newDocData.fileType;

    // Real Supabase storage upload if a file was attached
    if (pendingFile) {
      try {
        const uploadRes = await storageService.uploadDocumentFile(pendingFile, userId);
        fileUrl = uploadRes.signedUrl;
        fileName = pendingFile.name;
        fileSize = `${(pendingFile.size / (1024 * 1024)).toFixed(1)} MB`;
        fileType = pendingFile.type;
      } catch (e) {
        console.warn('Storage upload encountered warning, proceeding with document creation:', e);
      }
    }

    try {
      const newDocId = await documentService.createDocument(
        {
          ...newDocData,
          fileUrl: fileUrl || undefined,
          fileName: fileName || undefined,
          fileSize: fileSize || undefined,
          fileType: fileType || undefined,
          citizenEmail: userProfile?.email || 'citizen@nilathozhan.tn.gov.in',
        },
        userId
      );

      await refreshData();
      setSelectedDocumentId(newDocId);
      setPendingFile(null);
      return newDocId;
    } catch (e) {
      console.error('Failed to upload document to Supabase:', e);
      throw e;
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await notificationService.markAsRead(id);
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await notificationService.markAllAsRead();
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
        userProfile,
        isLoading,
        refreshData,
        signOut,
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
