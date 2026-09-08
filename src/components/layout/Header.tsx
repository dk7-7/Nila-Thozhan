import React, { useState } from 'react';
import { useApp, ROLE_PROFILES } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Bell,
  HelpCircle,
  Search,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
  Sparkles,
  Menu,
} from 'lucide-react';
import { NotificationDrawer } from '../common/NotificationDrawer';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    currentRole,
    currentProfile,
    activeTab,
    setRole,
    unreadNotificationCount,
    openSearchModal,
    navigateTo,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const tabTitles: Record<string, string> = {
    'dashboard': currentRole === 'OFFICER' ? 'Officer Workstation' : 'Executive Dashboard',
    'my-documents': 'Land Document Repository',
    'document-details': 'Document Verification Details',
    'file-to-gis': 'File → GIS Cadastre Alignment',
    'gis-map': 'GIS Cadastral Map View',
    'queue': 'Active Work Queue',
    'upload': 'Document Ingestion & Upload',
    'digitization': 'AI Extraction & Digitization',
    'manual-verification': 'Manual Document Verification',
    'gis-validation': 'GIS Validation & Boundary Check',
    'approvals': 'Pending Approvals Queue',
    'final-approval': 'Executive Review & Digital Signature',
    'reports': 'Digitization Reports & Analytics',
    'audit-trail': 'System Audit Trail',
    'help': 'User Guidance & Help Center',
  };
  const pageTitle = tabTitles[activeTab] || 'Officer Dashboard';

  const roleOptions: { role: UserRole; title: string; subtitle: string; icon: string }[] = [
    {
      role: 'CITIZEN',
      title: 'Citizen / Landholder',
      subtitle: 'Ramesh Patel (Simple self-service portal)',
      icon: '👤',
    },
    {
      role: 'OFFICER',
      title: 'Digitization Officer',
      subtitle: 'Officer K. Sharma (OCR, manual verification, GIS)',
      icon: '🛡️',
    },
    {
      role: 'HIGH_AUTHORITY',
      title: 'High Approving Authority',
      subtitle: 'Dr. V. Narayanan (Final decisions & Digital Signatures)',
      icon: '🏛️',
    },
  ];

  return (
    <>
      <header
        id="app-header"
        className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-xs"
      >
        {/* Left: Branding on Mobile / Page Title on Desktop */}
        <div className="flex items-center gap-3">
          <button
            id="sidebar-mobile-toggle"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="md:hidden h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white shrink-0 shadow-xs">
              <img
                src="/assets/home-button-svgrepo-com.svg"
                alt="Nila Thozhan"
                className="h-6 w-6"
              />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Universal Search Input */}
          <div className="relative hidden sm:block">
            <input
              id="header-search-input"
              type="text"
              readOnly
              onClick={() => openSearchModal('')}
              placeholder="Search survey number..."
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-48 md:w-64 focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 placeholder:text-slate-400 cursor-pointer"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          <button
            id="header-search-btn-mobile"
            onClick={() => openSearchModal('')}
            className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              id="role-switcher-btn"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
              title="Switch user role"
            >
              <span className={`w-2 h-2 rounded-full ${currentRole === 'CITIZEN' ? 'bg-blue-600' : currentRole === 'OFFICER' ? 'bg-amber-500' : 'bg-emerald-600'}`} />
              <span className="font-semibold">{currentProfile.badgeLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Dropdown */}
            {isRoleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95"
                onClick={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Switch User Role (RBAC Simulation)
                </div>
                {roleOptions.map((opt) => (
                  <button
                    key={opt.role}
                    onClick={() => {
                      setRole(opt.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                      currentRole === opt.role ? 'bg-slate-50 font-medium text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {opt.title}
                        </span>
                        {currentRole === opt.role && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold uppercase tracking-tight">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {opt.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <button
            id="header-notifications-btn"
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            )}
          </button>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              id="header-profile-btn"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-600 flex items-center justify-center text-xs font-bold text-blue-400 bg-blue-500/20">
                {currentProfile.avatarInitials}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <p className="font-semibold text-slate-800 leading-tight">{currentProfile.name}</p>
                <p className="text-slate-500 text-[11px]">{currentProfile.roleTitle}</p>
              </div>
            </button>

            {isProfileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in"
                onClick={() => setIsProfileDropdownOpen(false)}
              >
                <div className="px-4 pb-3 border-b border-slate-100">
                  <p className="font-semibold text-sm text-slate-900">{currentProfile.name}</p>
                  <p className="text-xs text-slate-500">{currentProfile.roleTitle}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{currentProfile.department}</p>
                  <p className="text-[11px] text-blue-600 font-medium mt-1">📍 {currentProfile.location}</p>
                </div>
                <div className="pt-2 px-2">
                  <button
                    onClick={() => navigateTo('audit-trail')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-md flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    View Audit Log
                  </button>
                  <button
                    onClick={() => setRole(currentRole === 'CITIZEN' ? 'OFFICER' : 'CITIZEN')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-md flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-slate-400" />
                    Switch Persona
                  </button>
                  <button
                    onClick={() => alert('Logged out.')}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-md flex items-center gap-2 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
