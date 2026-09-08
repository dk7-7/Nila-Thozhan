import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { UniversalSearchModal } from './components/common/UniversalSearchModal';

// Role-specific view components
import { MyDocumentsPage } from './components/citizen/MyDocumentsPage';
import { CitizenDocumentDetails } from './components/citizen/CitizenDocumentDetails';
import { FileToGisWizard } from './components/citizen/FileToGisWizard';
import { GisMapPage } from './components/gis/GisMapPage';

import { OfficerDashboard } from './components/officer/OfficerDashboard';
import { OfficerUploadPage } from './components/officer/OfficerUploadPage';
import { ManualVerificationPage } from './components/officer/ManualVerificationPage';
import { GisValidationPage } from './components/officer/GisValidationPage';
import { ProcessingValidationPage } from './components/officer/ProcessingValidationPage';

import { ApprovalsPage } from './components/authority/ApprovalsPage';
import { FinalApprovalPage } from './components/authority/FinalApprovalPage';

import { AuditTrailPage } from './components/governance/AuditTrailPage';
import { ReportsPage } from './components/governance/ReportsPage';
import { HelpFaqPage } from './components/help/HelpFaqPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';



const MainAppContent: React.FC = () => {
  const {
    currentRole,
    activeTab,
    t,
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Render view router based on tab and role
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        if (currentRole === 'CITIZEN') return <MyDocumentsPage />;
        if (currentRole === 'OFFICER') return <OfficerDashboard />;
        return <ApprovalsPage />;

      case 'my-documents':
        return <MyDocumentsPage />;

      case 'document-details':
        if (currentRole === 'HIGH_AUTHORITY') return <FinalApprovalPage />;
        return <CitizenDocumentDetails />;

      case 'file-to-gis':
        return <FileToGisWizard />;

      case 'gis-map':
        return <GisMapPage />;

      case 'queue':
        return <OfficerDashboard />;

      case 'upload':
        if (currentRole === 'HIGH_AUTHORITY') return <ApprovalsPage />;
        return <OfficerUploadPage />;

      case 'processing-validation':
      case 'digitization':
      case 'manual-verification':
      case 'gis-validation':
        if (currentRole === 'OFFICER') {
          return <ProcessingValidationPage />;
        }
        return <ManualVerificationPage />;

      case 'approvals':
        if (currentRole === 'OFFICER') {
          return <ProcessingValidationPage />;
        }
        return <ApprovalsPage />;

      case 'final-approval':
        return <FinalApprovalPage />;

      case 'reports':
        return <ReportsPage />;

      case 'audit-trail':
        return <AuditTrailPage />;

      case 'help':
        return <HelpFaqPage />;

      default:
        if (currentRole === 'CITIZEN') return <MyDocumentsPage />;
        if (currentRole === 'OFFICER') return <OfficerDashboard />;
        return <ApprovalsPage />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar on Left */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Main Scrollable Content */}
        <main
          id="main-content-canvas"
          className="flex-1 min-w-0 overflow-y-auto bg-slate-50"
        >
          {renderCurrentView()}
        </main>

        {/* Clean Footer */}
        <footer className="h-9 bg-white/80 backdrop-blur-xs border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="font-semibold text-slate-700">{t('footerCopyright')}</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-emerald-700">{t('systemStatus')}</span>
          </div>
        </footer>
      </div>

      {/* Universal Search Modal (Hot-keyed / Search button triggered) */}
      <UniversalSearchModal />
    </div>
  );
};

const AuthGate: React.FC = () => {
  const { userProfile, isLoading } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Connecting to Nila Thozhan...</span>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    if (authMode === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
  }

  return <MainAppContent />;
};

export default function App() {
  return (
    <AppProvider>
      <AuthGate />
    </AppProvider>
  );
}
