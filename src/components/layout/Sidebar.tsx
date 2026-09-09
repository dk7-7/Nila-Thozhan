import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import {
  Files,
  Map,
  Compass,
  FileUp,
  Clock,
  ShieldCheck,
  BarChart3,
  History,
  HelpCircle,
  X,
  FileCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemConfig {
  tab: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentRole, activeTab, navigateTo, documents, t } = useApp();

  // Compute live badges
  const pendingOfficerVerificationCount = documents.filter(
    (d) => d.status === 'UNDER_VERIFICATION' || d.status === 'NEEDS_ATTENTION'
  ).length;

  const readyForApprovalCount = documents.filter(
    (d) => d.status === 'READY_FOR_APPROVAL'
  ).length;

  const myDocumentsCount = documents.length;

  // Build role-specific menu items with clean, simplified labels
  const getNavItems = (): { category?: string; items: NavItemConfig[] }[] => {
    if (currentRole === 'CITIZEN') {
      return [
        {
          items: [
            {
              tab: 'my-documents',
              label: t('navMyDocuments'),
              icon: Files,
              badge: myDocumentsCount,
            },
            {
              tab: 'gis-map',
              label: t('navGisMap'),
              icon: Map,
            },
            {
              tab: 'upload',
              label: t('navUpload'),
              icon: FileUp,
            },
            {
              tab: 'file-to-gis',
              label: t('navFileToGis'),
              icon: Compass,
            },
            {
              tab: 'help',
              label: t('navHelp'),
              icon: HelpCircle,
            },
          ],
        },
      ];
    }

    if (currentRole === 'OFFICER') {
      return [
        {
          items: [
            {
              tab: 'queue',
              label: t('navQueue'),
              icon: Clock,
              badge: documents.length,
            },
            {
              tab: 'processing-validation',
              label: t('navValidation'),
              icon: FileCheck,
              badge: pendingOfficerVerificationCount > 0 ? pendingOfficerVerificationCount : undefined,
            },
            {
              tab: 'upload',
              label: t('navUpload'),
              icon: FileUp,
            },
            {
              tab: 'gis-map',
              label: t('navGisMap'),
              icon: Map,
            },
            {
              tab: 'reports',
              label: t('navReports'),
              icon: BarChart3,
            },
            {
              tab: 'audit-trail',
              label: t('navAudit'),
              icon: History,
            },
            {
              tab: 'help',
              label: t('navHelp'),
              icon: HelpCircle,
            },
          ],
        },
      ];
    }

    // HIGH_AUTHORITY
    return [
      {
        items: [
          {
            tab: 'approvals',
            label: t('navApprovals'),
            icon: Clock,
            badge: readyForApprovalCount > 0 ? readyForApprovalCount : undefined,
          },
          {
            tab: 'final-approval',
            label: t('navFinalApproval'),
            icon: ShieldCheck,
          },
          {
            tab: 'gis-map',
            label: t('navGisMap'),
            icon: Map,
          },
          {
            tab: 'reports',
            label: t('navReports'),
            icon: BarChart3,
          },
          {
            tab: 'audit-trail',
            label: t('navAudit'),
            icon: History,
          },
          {
            tab: 'help',
            label: t('navHelp'),
            icon: HelpCircle,
          },
        ],
      },
    ];
  };

  const menuSections = getNavItems();

  const handleNavClick = (tab: NavigationTab) => {
    navigateTo(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Banner */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/90 shrink-0">
          <button
            onClick={() => {
              if (currentRole === 'CITIZEN') {
                handleNavClick('my-documents');
              } else if (currentRole === 'OFFICER') {
                handleNavClick('queue');
              } else {
                handleNavClick('approvals');
              }
            }}
            className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded-xl"
            title="Nila Thozhan — Home"
          >
            <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              <img
                src="/assets/home-button-svgrepo-com.svg"
                alt="Home"
                className="h-5 w-5 text-white"
              />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base block leading-tight">
                {t('appName')}
              </span>
              <span className="text-[11px] text-emerald-400/90 font-medium tracking-wide">
                நில தோழன்
              </span>
            </div>
          </button>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* Current Role Banner */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-xs">
            <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
              {t('workspaceMode')}
            </div>
            <div className="text-xs font-bold text-white mt-1 flex items-center justify-between">
              <span>
                {currentRole === 'CITIZEN'
                  ? t('roleCitizen').split('/')[0].trim()
                  : currentRole === 'OFFICER'
                  ? t('roleOfficer').split('(')[0].trim()
                  : t('roleAuthority').split('/')[0].trim()}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  currentRole === 'CITIZEN'
                    ? 'bg-emerald-400'
                    : currentRole === 'OFFICER'
                    ? 'bg-amber-400'
                    : 'bg-blue-400'
                }`}
              />
            </div>
          </div>

          {/* Navigation Items */}
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.category && (
                <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1 mt-3 tracking-wider">
                  {section.category}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeTab === item.tab ||
                  (item.tab === 'processing-validation' &&
                    ['processing-validation', 'digitization', 'manual-verification', 'gis-validation'].includes(
                      activeTab
                    ));
                return (
                  <button
                    key={item.tab}
                    id={`nav-item-${item.tab}`}
                    onClick={() => handleNavClick(item.tab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate text-left">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-emerald-800 text-emerald-100'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
              {currentRole === 'CITIZEN' ? 'RP' : currentRole === 'OFFICER' ? 'KS' : 'VN'}
            </div>
            <div className="text-xs min-w-0">
              <p className="font-semibold text-white truncate">
                {currentRole === 'CITIZEN' ? 'Ramesh Patel' : currentRole === 'OFFICER' ? 'Officer K. Sharma' : 'Dr. V. Narayanan'}
              </p>
              <p className="text-slate-400 text-[11px] truncate">
                {currentRole === 'CITIZEN' ? 'Landowner' : currentRole === 'OFFICER' ? 'Village Officer' : 'Sub-Registrar'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
