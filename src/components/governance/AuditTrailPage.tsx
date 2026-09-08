import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, Shield, Filter, ArrowDownUp, Download } from 'lucide-react';

export const AuditTrailPage: React.FC = () => {
  const { documents, downloadFile } = useApp();
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Flatten all audit events from all documents
  const allEvents = documents.flatMap((doc) =>
    doc.auditTrail.map((ev) => ({
      ...ev,
      documentNumber: doc.documentNumber,
      documentTitle: doc.title,
      docId: doc.id,
    }))
  ).sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));

  const filteredEvents = allEvents.filter((ev) => {
    const matchesRole = filterRole === 'ALL' || ev.userRole === filterRole;
    const matchesSearch =
      !searchQuery ||
      ev.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleExportAuditLog = () => {
    const headers = "Timestamp,User,Role,Action,Document Number,Details\n";
    const rows = filteredEvents.map(e =>
      `"${e.timestamp}","${e.userName}","${e.userRole}","${e.action}","${e.documentNumber}","${e.details.replace(/"/g, '""')}"`
    ).join("\n");
    downloadFile("cadastral_system_audit_log.csv", headers + rows, "text/csv");
  };

  return (
    <div id="audit-trail-page" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Immutable Cadastral Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Cryptographically timestamped log of all uploads, automated OCR inferences, manual overrides, and digital certifications.
          </p>
        </div>

        <button
          onClick={handleExportAuditLog}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-700 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, officer, doc ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Role Filter:</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="CITIZEN">Citizen</option>
            <option value="OFFICER">Digitization Officer</option>
            <option value="HIGH_AUTHORITY">High Authority</option>
            <option value="SYSTEM">System AI Engine</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Actor & Role</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Document</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {ev.timestamp}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 block">{ev.userName}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{ev.userRole}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-blue-900">
                    {ev.action}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 font-medium">
                    {ev.documentNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-xs">
                    {ev.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
