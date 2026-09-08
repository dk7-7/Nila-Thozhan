import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  Award,
  Filter,
  CheckSquare,
  Square,
  Key,
  X,
  FileCheck2,
} from 'lucide-react';
import { LandDocument } from '../../types';

export const ApprovalsPage: React.FC = () => {
  const { documents, navigateTo, selectDocument, batchSubmitDigitalSignatures, currentProfile } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | 'READY' | 'RESOLVED_CONFLICT' | 'APPROVED'>('READY');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchSignerName, setBatchSignerName] = useState<string>(currentProfile.name);
  const [batchDesignation, setBatchDesignation] = useState<string>('Sub-Registrar & Revenue Divisional Officer');
  const [batchCertId, setBatchCertId] = useState<string>(`DSC-KAR-2026-${Math.floor(10000 + Math.random() * 90000)}`);
  const [batchToastSuccess, setBatchToastSuccess] = useState<boolean>(false);

  // Executive Metrics (Section 18)
  const pendingCount = documents.filter((d) => d.status === 'READY_FOR_APPROVAL').length;
  const approvedToday = documents.filter((d) => d.status === 'APPROVED').length;
  const rejectedToday = documents.filter((d) => d.status === 'REJECTED').length;
  const conflictsResolved = 4;
  const avgApprovalTime = '4.2 hrs';

  const filteredDocs = documents.filter((d) => {
    if (filterType === 'READY') return d.status === 'READY_FOR_APPROVAL';
    if (filterType === 'RESOLVED_CONFLICT') return d.scenarioType === 'SURVEY_CONFLICT' || d.scenarioType === 'AREA_ANOMALY';
    if (filterType === 'APPROVED') return d.status === 'APPROVED';
    return true;
  });

  const handleReviewClick = (doc: LandDocument) => {
    selectDocument(doc.id);
    navigateTo('final-approval', doc.id);
  };

  return (
    <div id="executive-approvals-page" className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 4 Executive Metric Cards (Professional Polish theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">
            Pending Final Sign-off
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {pendingCount < 10 ? `0${pendingCount}` : pendingCount}
          </div>
          <div className="mt-2 text-xs text-amber-600 font-medium">
            Requires executive seal
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">
            Approved & Issued
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {approvedToday + 148}
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            Certified with digital signature
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">
            GIS Conflicts Resolved
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {conflictsResolved + 12}
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium">
            Spatial harmony confirmed
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">
            Avg. Turnaround Time
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {avgApprovalTime}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Fast-track clearance
          </div>
        </div>
      </div>

      {/* Approvals Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800 text-base">Priority Approval Roster</h2>
            <p className="text-xs text-slate-500">
              Cadastral records verified by field officers awaiting high authority digital signature
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Batch Sign Selected Action Button */}
            {selectedDocIds.length > 0 && (
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs animate-in fade-in"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Batch Sign ({selectedDocIds.length})</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterType('READY')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  filterType === 'READY'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending Approval ({pendingCount})
              </button>
              <button
                onClick={() => setFilterType('RESOLVED_CONFLICT')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  filterType === 'RESOLVED_CONFLICT'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Conflicted / Resolved
              </button>
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Records ({documents.length})
              </button>
            </div>
          </div>
        </div>

        {batchToastSuccess && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center justify-between font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Batch Digital Signature applied to selected records! Cryptographic hashes generated.</span>
            </div>
            <button onClick={() => setBatchToastSuccess(false)} className="text-emerald-700 font-bold">✕</button>
          </div>
        )}

        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              No documents in this queue
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All pending records in this category have been processed. Switch filters to view other documents.
            </p>
            <button
              onClick={() => setFilterType('ALL')}
              className="mt-4 text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium shadow-xs"
            >
              View All Documents
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-white">
                  <th className="px-4 py-4 border-b border-slate-100 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedDocIds.length > 0 && selectedDocIds.length === filteredDocs.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocIds(filteredDocs.map((d) => d.id));
                        } else {
                          setSelectedDocIds([]);
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                  </th>
                  <th className="px-6 py-4 border-b border-slate-100">Document ID</th>
                  <th className="px-6 py-4 border-b border-slate-100">Grantee / Owner</th>
                  <th className="px-6 py-4 border-b border-slate-100">Survey No.</th>
                  <th className="px-6 py-4 border-b border-slate-100">Officer Finding</th>
                  <th className="px-6 py-4 border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
                {filteredDocs.map((doc) => {
                  const isChecked = selectedDocIds.includes(doc.id);
                  return (
                    <tr key={doc.id} className={`hover:bg-slate-50 transition-colors ${isChecked ? 'bg-blue-50/40' : ''}`}>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocIds((prev) => [...prev, doc.id]);
                            } else {
                              setSelectedDocIds((prev) => prev.filter((id) => id !== doc.id));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-blue-600 font-medium">
                        <div>{doc.documentNumber}</div>
                        <div className="text-xs font-semibold text-slate-800 font-sans mt-0.5">{doc.title}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {doc.ownerName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-medium text-slate-800">
                          {doc.surveyNumber}
                        </span>
                        <span className="text-slate-400 block text-xs mt-0.5">
                          {doc.village} ({doc.landArea})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {doc.officerNotes ? (
                          <span className="text-slate-700 block max-w-xs truncate" title={doc.officerNotes}>
                            {doc.officerNotes}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Clear for final sign-off</span>
                        )}
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          By {doc.verificationOfficer || 'Assigned Officer'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={doc.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          id={`btn-exec-review-${doc.id}`}
                          onClick={() => handleReviewClick(doc)}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-xs transition-colors"
                        >
                          Review & Sign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Batch DSC Signing Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Batch Executive Digital Signature (DSC)
                </h3>
              </div>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                You are about to digitally sign <strong>{selectedDocIds.length} land records</strong> using Class-3 Executive DSC token.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sub-Registrar Signer Name</label>
                <input
                  type="text"
                  value={batchSignerName}
                  onChange={(e) => setBatchSignerName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Designation</label>
                <input
                  type="text"
                  value={batchDesignation}
                  onChange={(e) => setBatchDesignation(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">DSC Certificate Serial Number</label>
                <input
                  type="text"
                  value={batchCertId}
                  onChange={(e) => setBatchCertId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  batchSubmitDigitalSignatures(selectedDocIds, batchSignerName, batchDesignation, batchCertId);
                  setIsBatchModalOpen(false);
                  setSelectedDocIds([]);
                  setBatchToastSuccess(true);
                  setTimeout(() => setBatchToastSuccess(false), 4500);
                }}
                className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Apply Batch Digital Signature</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
