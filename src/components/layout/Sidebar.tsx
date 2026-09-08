import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import {
  Files,
  Map,
  Compass,
  FileUp,
  Sparkles,
  UserCheck,
  CheckSquare,
  BarChart3,
  History,
  Clock,
  ShieldCheck,
  FileCheck2,
  FileSpreadsheet,
  X,
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
  const { currentRole, activeTab, navigateTo, documents } = useApp();

  // Compute live badges
  const pendingOfficerVerificationCount = documents.filter(
    (d) => d.status === 'UNDER_VERIFICATION' || d.status === 'NEEDS_ATTENTION'
  ).length;

  const readyForApprovalCount = documents.filter(
    (d) => d.status === 'READY_FOR_APPROVAL'
  ).length;

  const myDocumentsCount = documents.length;

  // Build role-specific menu items
  const getNavItems = (): { category?: string; items: NavItemConfig[] }[] => {
    if (currentRole === 'CITIZEN') {
      return [
        {
          items: [
            {
              tab: 'my-documents',
              label: 'My Documents',
              icon: Files,
              badge: myDocumentsCount,
            },
            {
              tab: 'upload',
              label: 'Upload Document',
              icon: FileUp,
            },
            { tab: 'gis-map', label: 'GIS Map', icon: Map },
            {
              tab: 'file-to-gis',
              label: 'File → GIS Location',
              icon: Compass,
            },
          ],
        },
      ];
    }

    if (currentRole === 'OFFICER') {
      return [
        {
          category: 'Operations',
          items: [
            {
              tab: 'queue',
              label: 'Document Queue',
              icon: Clock,
              badge: documents.length,
            },
            {
              tab: 'upload',
              label: 'Upload Document',
              icon: FileUp,
            },
          ],
        },
        {
          category: 'Processing & Validation',
          items: [
            {
              tab: 'processing-validation',
              label: 'Processing & Validation',
              icon: Sparkles,
              badge: pendingOfficerVerificationCount > 0 ? pendingOfficerVerificationCount : undefined,
            },
            { tab: 'gis-map', label: 'GIS Cadastre Map Engine', icon: Map },
          ],
        },
        {
          category: 'Governance',
          items: [
            { tab: 'reports', label: 'Reports', icon: BarChart3 },
            { tab: 'audit-trail', label: 'Audit Trail', icon: History },
          ],
        },
      ];
    }

    // HIGH_AUTHORITY
    return [
      {
        category: 'Executive View',
        items: [
          {
            tab: 'approvals',
            label: 'Pending Approvals',
            icon: Clock,
            badge: readyForApprovalCount > 0 ? readyForApprovalCount : undefined,
          },
          { tab: 'my-documents', label: 'Document Review', icon: Files },
          {
            tab: 'final-approval',
            label: 'Final Approval & D-Sign',
            icon: ShieldCheck,
          },
          { tab: 'gis-map', label: 'GIS Map Cadastre', icon: Map },
        ],
      },
      {
        category: 'Oversight',
        items: [
          { tab: 'reports', label: 'Executive Reports', icon: BarChart3 },
          { tab: 'audit-trail', label: 'Full Audit Trail', icon: History },
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
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
        {/* Brand Banner (as in Professional Polish design) */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
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
            className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded"
            title="Return to Home"
          >
            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
              <img
              src="/assets/home-button-svgrepo-com.svg"
              alt="Home"
              className="h-6 w-6 text-white"
            />
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight text-base block leading-none">
                Nila Thozhan
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                நில தோழன்
              </span>
            </div>
          </button>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded text-slate-400 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Role Banner */}
          <div className="px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              Workspace Mode
            </div>
            <div className="text-xs font-bold text-white mt-0.5 flex items-center justify-between">
              <span>{currentRole === 'CITIZEN' ? 'Citizen Portal' : currentRole === 'OFFICER' ? 'Officer Workstation' : 'Executive Authority'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${currentRole === 'CITIZEN' ? 'bg-blue-400' : currentRole === 'OFFICER' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            </div>
          </div>

          {/* Sections */}
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.category && (
                <div className="text-xs font-semibold text-slate-500 uppercase px-3 py-1.5 mt-3 tracking-wider">
                  {section.category}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeTab === item.tab ||
                  (item.tab === 'processing-validation' &&
                    ['processing-validation', 'digitization', 'manual-verification', 'gis-validation', 'approvals'].includes(
                      activeTab
                    ));
                return (
                  <button
                    key={item.tab}
                    id={`nav-item-${item.tab}`}
                    onClick={() => handleNavClick(item.tab)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
                      isActive
                        ? 'bg-slate-800 text-white font-medium shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 opacity-70'}`} />
                    <span className="truncate text-left">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
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

        {/* Sidebar Footer Info with Professional Polish profile badge */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-600 shrink-0">
              <div className="w-full h-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                {currentRole === 'CITIZEN' ? 'RP' : currentRole === 'OFFICER' ? 'KS' : 'VN'}
              </div>
            </div>
            <div className="text-xs min-w-0">
              <p className="font-medium text-white truncate">
                {currentRole === 'CITIZEN' ? 'Ramesh Patel' : currentRole === 'OFFICER' ? 'Officer K. Sharma' : 'Dr. V. Narayanan'}
              </p>
              <p className="text-slate-500 text-[11px] truncate">
                {currentRole === 'CITIZEN' ? 'Citizen / Owner' : currentRole === 'OFFICER' ? 'Digitization Officer' : 'Sub-Registrar'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
