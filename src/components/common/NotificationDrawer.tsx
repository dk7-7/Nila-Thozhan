import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, X, AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    currentRole,
    markNotificationRead,
    markAllNotificationsRead,
    navigateTo,
  } = useApp();

  if (!isOpen) return null;

  const relevantNotifications = notifications.filter((n) =>
    n.targetRoles.includes(currentRole)
  );

  const handleNotificationClick = (notifId: string, docId?: string) => {
    markNotificationRead(notifId);
    onClose();
    if (docId) {
      if (currentRole === 'CITIZEN') {
        navigateTo('document-details', docId);
      } else if (currentRole === 'OFFICER') {
        navigateTo('gis-validation', docId);
      } else {
        navigateTo('final-approval', docId);
      }
    }
  };

  return (
    <div
      id="notification-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        id="notification-drawer"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-700" />
            <h2 className="font-semibold text-slate-900 text-base">Notifications</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
              {relevantNotifications.filter((n) => !n.read).length} new
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={markAllNotificationsRead}
              title="Mark all as read"
              className="text-xs text-slate-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-slate-200 flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {relevantNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-slate-400 mt-1">
                You're all caught up on your land record updates.
              </p>
            </div>
          ) : (
            relevantNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id, notif.documentId)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-white border-slate-200 hover:bg-slate-50 opacity-80'
                    : 'bg-blue-50/40 border-blue-200 hover:bg-blue-50/80 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'SUCCESS' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    {notif.type === 'ACTION_REQUIRED' && (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                    {notif.type === 'WARNING' && (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    {notif.type === 'INFO' && <Info className="w-4 h-4 text-blue-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {notif.title}
                      </p>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.documentId && (
                      <div className="mt-2 text-xs font-medium text-blue-700 flex items-center gap-1 hover:underline">
                        <span>View Document Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
          Showing updates for role: <strong className="text-slate-800">{currentRole}</strong>
        </div>
      </div>
    </div>
  );
};
