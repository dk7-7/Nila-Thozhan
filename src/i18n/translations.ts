export type AppLanguage = 'en' | 'ta' | 'hi';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🌐' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
];

export const TRANSLATIONS = {
  en: {
    // App Brand
    appName: 'Nila Thozhan',
    appTagline: 'Friend of the Land — Simple Land Records',
    systemStatus: 'System Online',
    footerCopyright: '© 2024 Nila Thozhan — Land Records Portal',

    // Roles
    roleCitizen: 'Citizen / Landowner',
    roleCitizenSubtitle: 'Check your land, view patta, and track applications',
    roleOfficer: 'Village Officer (VAO)',
    roleOfficerSubtitle: 'Verify survey numbers and field documents',
    roleAuthority: 'Sub-Registrar',
    roleAuthoritySubtitle: 'Final land approval and government seal',
    switchRole: 'Switch Role',
    workspaceMode: 'Current Workspace',

    // Navigation Tabs
    navMyDocuments: 'My Land Documents',
    navGisMap: 'Land Map (GIS)',
    navUpload: 'Upload Document',
    navFileToGis: 'Find Land on Map',
    navQueue: 'Document Queue',
    navValidation: 'Verify Document',
    navApprovals: 'Pending Approvals',
    navFinalApproval: 'Final Sign-off & Seal',
    navReports: 'Summary Reports',
    navAudit: 'Official Log',
    navHelp: 'Help & Guide',

    // Common Actions
    searchPlaceholder: 'Search survey number, owner name, or village...',
    searchButton: 'Search',
    clearFilters: 'Clear Filters',
    status: 'Status',
    allStatuses: 'All Statuses',
    village: 'Village',
    allVillages: 'All Villages',
    actions: 'Action',
    viewDetails: 'View Details',
    download: 'Download',
    back: 'Go Back',
    confirm: 'Confirm',
    cancel: 'Cancel',
    loading: 'Loading...',
    save: 'Save',
    submit: 'Submit',

    // Status Badges (Plain English)
    statusApproved: 'Verified & Registered',
    statusUnderVerification: 'Under Review',
    statusProcessing: 'Processing',
    statusNeedsAttention: 'Action Needed',
    statusRejected: 'Not Approved',

    // GIS Map
    mapTitle: 'Tamil Nadu Land Cadastre Map',
    mapSatellite: 'Satellite (HD)',
    mapStreet: 'Clear Map',
    mapHybrid: 'Satellite + Roads',
    mapFindMe: 'Find My Land',
    mapReset: 'Reset View',
    mapZoomIn: 'Zoom In',
    mapZoomOut: 'Zoom Out',
    mapLayers: 'Map View',
    mapParcelsLayer: 'Show Land Boundaries',
    mapSearchPlaceholder: 'Search Survey # or Village...',
    mapSelectPrompt: 'Click on any parcel boundary to see land details',

    // Parcel Card (Simple & Plain)
    parcelTitle: 'Land Parcel',
    surveyNumber: 'Survey Number',
    ownerName: 'Landholder Name',
    jurisdiction: 'Village / Taluk',
    landArea: 'Land Area',
    landType: 'Land Classification',
    roadAccess: 'Road Access',
    waterAccess: 'Water Proximity',
    roadYes: 'Direct Road Access',
    roadNo: 'No Direct Road',
    waterYes: 'Adjacent to Canal / Tank',
    waterNo: 'Dry / Away from Water',
    viewDocumentBtn: 'View Land Document',
    boundaryConflictAlert: 'Boundary needs checking against revenue record.',
    boundaryVerifiedNotice: 'Boundaries perfectly match registered revenue records.',

    // Land Types
    wetland: 'Wetland (Nanjai / Agricultural)',
    dryland: 'Dryland (Punjai / Agricultural)',
    residential: 'Village Settlement (Natham / Residential)',
    government: 'Government Land (Poramboke)',

    // Document Details
    docId: 'Document ID',
    docType: 'Type of Document',
    pattaNumber: 'Patta Number',
    registrationDate: 'Date of Submission',
    noDocsFound: 'No documents found matching your search.',
    uploadPrompt: 'Upload your Patta or registered deed to check your land on the map.',
  },

  ta: {
    // App Brand
    appName: 'நில தோழன்',
    appTagline: 'நில ஆவணங்கள் & வரைபட சேவை',
    systemStatus: 'சேவை செயல்பாட்டில் உள்ளது',
    footerCopyright: '© 2024 நில தோழன் — நில ஆவண தளம்',

    // Roles
    roleCitizen: 'நில உரிமையாளர் / பொது மக்கள்',
    roleCitizenSubtitle: 'நில விபரம், பட்டா பார்க்க & விண்ணப்பங்களை அறிய',
    roleOfficer: 'கிராம நிர்வாக அலுவலர் (VAO)',
    roleOfficerSubtitle: 'சர்வே எண் மற்றும் ஆவணங்களை சரிபார்க்க',
    roleAuthority: 'பதிவு அதிகாரி / மேலதிகாரி',
    roleAuthoritySubtitle: 'இறுதி ஒப்புதல் மற்றும் அரசு முத்திரை',
    switchRole: 'பயனர் முறை மாற்று',
    workspaceMode: 'தற்போதைய முறை',

    // Navigation Tabs
    navMyDocuments: 'என் நில ஆவணங்கள்',
    navGisMap: 'நில வரைபடம் (GIS)',
    navUpload: 'ஆவணம் பதிவேற்றம்',
    navFileToGis: 'வரைபடத்தில் நிலம் காண',
    navQueue: 'சரிபார்ப்பு வரிசை',
    navValidation: 'ஆவண சரிபார்ப்பு',
    navApprovals: 'ஒப்புதல் நிலுவை',
    navFinalApproval: 'இறுதி ஒப்புதல் & முத்திரை',
    navReports: 'சுருக்க அறிக்கைகள்',
    navAudit: 'அரசு பதிவேடு',
    navHelp: 'உதவி & வழிகாட்டி',

    // Common Actions
    searchPlaceholder: 'சர்வே எண், உரிமையாளர் பெயர் அல்லது கிராமம் தேடுக...',
    searchButton: 'தேடு',
    clearFilters: 'வடிகட்டிகளை நீக்கு',
    status: 'நிலை',
    allStatuses: 'அனைத்து நிலைகளும்',
    village: 'கிராமம்',
    allVillages: 'அனைத்து கிராமங்கள்',
    actions: 'செயல்',
    viewDetails: 'விவரம் பார்க்க',
    download: 'பதிவிறக்கு',
    back: 'பின்செல்க',
    confirm: 'உறுதி செய்',
    cancel: 'ரத்து செய்',
    loading: 'ஏற்றப்படுகிறது...',
    save: 'சேமி',
    submit: 'சமர்ப்பி',

    // Status Badges
    statusApproved: 'சரிபார்க்கப்பட்டு அங்கீகரிக்கப்பட்டது',
    statusUnderVerification: 'பரிசீலனையில் உள்ளது',
    statusProcessing: 'செயல்பாட்டில் உள்ளது',
    statusNeedsAttention: 'சரிபார்க்க வேண்டும்',
    statusRejected: 'நிராகரிக்கப்பட்டது',

    // GIS Map
    mapTitle: 'தமிழ்நாடு நில வரைபடம்',
    mapSatellite: 'செயற்கைக்கோள் பார்வை',
    mapStreet: 'தெளிவான சாலை வரைபடம்',
    mapHybrid: 'வானொலி + சாலைகள்',
    mapFindMe: 'என் நிலத்தை காட்டு',
    mapReset: 'மீண்டும் முதலில்',
    mapZoomIn: 'பெரிதாக்கு',
    mapZoomOut: 'சிறிதாக்கு',
    mapLayers: 'வரைபட அடுக்குகள்',
    mapParcelsLayer: 'நில எல்லைகளை காட்டு',
    mapSearchPlaceholder: 'சர்வே எண் அல்லது கிராமம் தேடுக...',
    mapSelectPrompt: 'நிலத்தின் விவரங்களைப் பார்க்க வரைபடத்தில் உள்ள நில எல்லையைத் தொடவும்',

    // Parcel Card
    parcelTitle: 'நிலப் பகுதி விவரம்',
    surveyNumber: 'சர்வே எண்',
    ownerName: 'பட்டாதாரர் பெயர்',
    jurisdiction: 'கிராமம் / வட்டம்',
    landArea: 'நிலப் பரப்பு',
    landType: 'நில வகைப்பாடு',
    roadAccess: 'பாதை வசதி',
    waterAccess: 'நீர்நிலை அருகாமை',
    roadYes: 'நேரடி பாதை வசதி உண்டு',
    roadNo: 'நேரடி பாதை இல்லை',
    waterYes: 'வாய்க்கால் / ஏரி அருகில் உள்ளது',
    waterNo: 'மானாவாரி / நீர்நிலை அருகில் இல்லை',
    viewDocumentBtn: 'ஆவணத்தைப் பார்க்க',
    boundaryConflictAlert: 'எல்லை விபரங்களை வருவாய்த் துறை ஆவணத்துடன் சரிபார்க்க வேண்டும்.',
    boundaryVerifiedNotice: 'நில எல்லைகள் அரசு பதிவேட்டுடன் துல்லியமாகப் பொருந்துகின்றன.',

    // Land Types
    wetland: 'நன்செய் (பாசன நிலம் / நெல்)',
    dryland: 'புன்செய் (மானாவாரி / புஞ்சை)',
    residential: 'கிராம நத்தம் (குடியிருப்பு பகுதி)',
    government: 'அரசு புறம்போக்கு நிலம்',

    // Document Details
    docId: 'ஆவண எண்',
    docType: 'ஆவண வகை',
    pattaNumber: 'பட்டா எண்',
    registrationDate: 'விண்ணப்பித்த தேதி',
    noDocsFound: 'நீங்கள் தேடிய ஆவணங்கள் எதுவும் கிடைக்கவில்லை.',
    uploadPrompt: 'உங்கள் பட்டா அல்லது கிரையப் பத்திரத்தை பதிவேற்றி வரைபடத்தில் உங்கள் நிலத்தைப் பாருங்கள்.',
  },

  hi: {
    // App Brand
    appName: 'नीला तोलन',
    appTagline: 'भूमि मित्र — सरल भूमि रिकॉर्ड सेवा',
    systemStatus: 'प्रणाली ऑनलाइन एवं सुरक्षित',
    footerCopyright: '© 2024 नीला तोलन — भूमि अभिलेख पोर्टल',

    // Roles
    roleCitizen: 'नागरिक / भूस्वामी',
    roleCitizenSubtitle: 'अपनी जमीन, पट्टा देखें और आवेदन की स्थिति जानें',
    roleOfficer: 'ग्राम राजस्व अधिकारी',
    roleOfficerSubtitle: 'खसरा नंबर एवं दस्तावेजों का सत्यापन करें',
    roleAuthority: 'उप-पंजीयक / प्राधिकारी',
    roleAuthoritySubtitle: 'अंतिम भूमि स्वीकृति एवं डिजिटल मुहर',
    switchRole: 'भूमिका बदलें',
    workspaceMode: 'वर्तमान मोड',

    // Navigation Tabs
    navMyDocuments: 'मेरी जमीन के दस्तावेज',
    navGisMap: 'भूमि नक्शा (GIS)',
    navUpload: 'दस्तावेज अपलोड करें',
    navFileToGis: 'नक्शे पर जमीन खोजें',
    navQueue: 'सत्यापन कतार',
    navValidation: 'दस्तावेज सत्यापन',
    navApprovals: 'लंबित स्वीकृतियां',
    navFinalApproval: 'अंतिम अनुमोदन एवं मुहर',
    navReports: 'सारांश रिपोर्ट',
    navAudit: 'ऑडिट लॉग',
    navHelp: 'सहायता एवं दिशानिर्देश',

    // Common Actions
    searchPlaceholder: 'खसरा नंबर, स्वामी का नाम या गाँव खोजें...',
    searchButton: 'खोजें',
    clearFilters: 'फ़िल्टर हटाएं',
    status: 'स्थिति',
    allStatuses: 'सभी स्थितियां',
    village: 'गाँव',
    allVillages: 'सभी गाँव',
    actions: 'कार्रवाई',
    viewDetails: 'विवरण देखें',
    download: 'डाउनलोड',
    back: 'वापस जाएं',
    confirm: 'पुष्टि करें',
    cancel: 'रद्द करें',
    loading: 'लोड हो रहा है...',
    save: 'सहेजें',
    submit: 'जमा करें',

    // Status Badges
    statusApproved: 'सत्यापित एवं स्वीकृत',
    statusUnderVerification: 'समीक्षाधीन है',
    statusProcessing: 'प्रक्रिया में है',
    statusNeedsAttention: 'जांच आवश्यक है',
    statusRejected: 'अस्वीकृत',

    // GIS Map
    mapTitle: 'तमिलनाडु भूमि भूकर नक्शा',
    mapSatellite: 'उपग्रह दृश्य (HD)',
    mapStreet: 'साफ नक्शा',
    mapHybrid: 'उपग्रह + सड़कें',
    mapFindMe: 'मेरी जमीन दिखाएं',
    mapReset: 'प्रारंभिक दृश्य',
    mapZoomIn: 'बड़ा करें',
    mapZoomOut: 'छोटा करें',
    mapLayers: 'नक्शा परतें',
    mapParcelsLayer: 'जमीन की सीमाएं दिखाएं',
    mapSearchPlaceholder: 'खसरा नंबर या गाँव खोजें...',
    mapSelectPrompt: 'जमीन का विवरण देखने के लिए नक्शे पर किसी भी भूखंड पर क्लिक करें',

    // Parcel Card
    parcelTitle: 'भूखंड का विवरण',
    surveyNumber: 'खसरा / सर्वे नंबर',
    ownerName: 'भूस्वामी का नाम',
    jurisdiction: 'गाँव / तहसील',
    landArea: 'क्षेत्रफल',
    landType: 'भूमि वर्गीकरण',
    roadAccess: 'रास्ता सुविधा',
    waterAccess: 'जल स्रोत निकटता',
    roadYes: 'सीधा रास्ता उपलब्ध है',
    roadNo: 'सीधा रास्ता नहीं है',
    waterYes: 'नहर / तालाब के पास स्थित',
    waterNo: 'असिंचित / जल स्रोत से दूर',
    viewDocumentBtn: 'भूमि दस्तावेज देखें',
    boundaryConflictAlert: 'सीमा विवरण का राजस्व अभिलेख से सत्यापन आवश्यक है।',
    boundaryVerifiedNotice: 'सीमाएं सरकारी राजस्व रिकॉर्ड से पूर्णतः मेल खाती हैं।',

    // Land Types
    wetland: 'सिंचित कृषि भूमि (धान/फसल)',
    dryland: 'असिंचित कृषि भूमि',
    residential: 'ग्रामीण आबादी / आवासीय भूमि',
    government: 'सरकारी भूमि',

    // Document Details
    docId: 'दस्तावेज संख्या',
    docType: 'दस्तावेज का प्रकार',
    pattaNumber: 'पट्टा नंबर',
    registrationDate: 'जमा करने की तिथि',
    noDocsFound: 'आपकी खोज से मेल खाता कोई दस्तावेज नहीं मिला।',
    uploadPrompt: 'अपना पट्टा या पंजीकृत विलेख अपलोड करें और नक्शे पर अपनी जमीन देखें।',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.en;
