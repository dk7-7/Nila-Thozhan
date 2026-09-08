import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { SUPPORTED_LANGUAGES, AppLanguage } from '../../i18n/translations';
import {
  Bell,
  Search,
  ChevronDown,
  Globe,
  Menu,
  Check,
  LogOut,
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
    signOut,
    unreadNotificationCount,
    openSearchModal,
    currentLanguage,
    setLanguage,
    t,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Dynamic translated page title
  const getPageTitle = (): string => {
    switch (activeTab) {
      case 'dashboard':
      case 'my-documents':
        return t('navMyDocuments');
      case 'gis-map':
        return t('navGisMap');
      case 'upload':
        return t('navUpload');
      case 'file-to-gis':
        return t('navFileToGis');
      case 'queue':
        return t('navQueue');
      case 'processing-validation':
      case 'manual-verification':
      case 'gis-validation':
      case 'digitization':
        return t('navValidation');
      case 'approvals':
        return t('navApprovals');
      case 'final-approval':
        return t('navFinalApproval');
      case 'reports':
        return t('navReports');
      case 'audit-trail':
        return t('navAudit');
      case 'help':
        return t('navHelp');
      default:
        return t('appName');
    }
  };

  const roleOptions: { role: UserRole; title: string; subtitle: string; icon: string }[] = [
    {
      role: 'CITIZEN',
      title: t('roleCitizen'),
      subtitle: t('roleCitizenSubtitle'),
      icon: '👤',
    },
    {
      role: 'OFFICER',
      title: t('roleOfficer'),
      subtitle: t('roleOfficerSubtitle'),
      icon: '🛡️',
    },
    {
      role: 'HIGH_AUTHORITY',
      title: t('roleAuthority'),
      subtitle: t('roleAuthoritySubtitle'),
      icon: '🏛️',
    },
  ];

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      <header
        id="app-header"
        className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-3 sm:px-6 shrink-0 shadow-xs"
      >
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            id="sidebar-mobile-toggle"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="md:hidden h-8 w-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
              <img
                src="/assets/home-button-svgrepo-com.svg"
                alt="Nila Thozhan"
                className="h-5 w-5"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {getPageTitle()}
              </h1>
              <span className="hidden sm:block text-[11px] text-slate-500 font-medium">
                {t('appName')} • {currentProfile.location}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Search, Language Switcher, Role Selector, Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Universal Search (simplified) */}
          <div className="relative hidden md:block">
            <input
              id="header-search-input"
              type="text"
              readOnly
              onClick={() => openSearchModal('')}
              placeholder={t('searchPlaceholder')}
              className="pl-9 pr-3 py-1.5 bg-slate-100/90 border border-slate-200/60 rounded-xl text-xs w-48 lg:w-60 focus:ring-2 focus:ring-emerald-500 transition-all text-slate-800 placeholder:text-slate-400 cursor-pointer shadow-2xs hover:bg-slate-100"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <button
            id="header-search-btn-mobile"
            onClick={() => openSearchModal('')}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title={t('searchButton')}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* LANGUAGE SELECTOR DROPDOWN */}
          <div className="relative">
            <button
              id="lang-switcher-btn"
              onClick={() => {
                setIsLangDropdownOpen(!isLangDropdownOpen);
                setIsRoleDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-2xs"
              title="Change Language / மொழி மாற்று / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-slate-800">{currentLangObj.nativeLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95"
                onClick={() => setIsLangDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select Language / மொழி
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as AppLanguage);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                        isSelected ? 'bg-emerald-50/70 text-emerald-700 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <div>
                          <span className="font-semibold block">{lang.nativeLabel}</span>
                          <span className="text-[10px] text-slate-400">{lang.label}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ROLE SWITCHER DROPDOWN (RBAC Experience) */}
          <div className="relative">
            <button
              id="role-switcher-btn"
              onClick={() => {
                setIsRoleDropdownOpen(!isRoleDropdownOpen);
                setIsLangDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-all shadow-2xs"
              title={t('switchRole')}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  currentRole === 'CITIZEN'
                    ? 'bg-emerald-500'
                    : currentRole === 'OFFICER'
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
              />
              <span className="font-bold text-slate-800 hidden sm:inline">
                {currentRole === 'CITIZEN' ? t('roleCitizen').split('/')[0].trim() : currentRole === 'OFFICER' ? t('roleOfficer').split('(')[0].trim() : t('roleAuthority').split('/')[0].trim()}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95"
                onClick={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t('switchRole')}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                    RBAC
                  </span>
                </div>
                {roleOptions.map((opt) => {
                  const isActive = currentRole === opt.role;
                  return (
                    <button
                      key={opt.role}
                      onClick={() => {
                        setRole(opt.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                        isActive ? 'bg-emerald-50/60 font-medium' : ''
                      }`}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{opt.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isActive ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {opt.title}
                          </span>
                          {isActive && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {opt.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-4 py-2 flex items-center gap-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out / வெளியேறு</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <button
            id="header-notifications-btn"
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title={t('notifications')}
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
