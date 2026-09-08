import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Search, Filter, FileUp, ArrowRight, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { DocumentStatus } from '../../types';

export const MyDocumentsPage: React.FC = () => {
  const { documents, navigateTo, selectDocument, statusFilter, setStatusFilter } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('ALL');

  // Distinct villages
  const villages = Array.from(new Set(documents.map((d) => d.village)));

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter
      ? statusFilter === 'PROCESSING'
        ? doc.status === 'PROCESSING' || doc.status === 'DIGITIZED'
        : statusFilter === 'UNDER_VERIFICATION'
        ? doc.status === 'UNDER_VERIFICATION' || doc.status === 'READY_FOR_APPROVAL'
        : statusFilter === 'NEEDS_ATTENTION'
        ? doc.status === 'NEEDS_ATTENTION' || doc.status === 'REJECTED'
        : doc.status === statusFilter
      : true;

    const matchesVillage = selectedVillage === 'ALL' || doc.village === selectedVillage;

    return matchesSearch && matchesStatus && matchesVillage;
  });

  return (
    <div id="my-documents-page" className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          My Land Documents
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          View, track verification status, and access digitally signed land records.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="my-docs-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, survey no, ID..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              id="filter-status-select"
              value={statusFilter || 'ALL'}
              onChange={(e) => setStatusFilter(e.target.value === 'ALL' ? null : e.target.value)}
              className="text-xs font-medium py-1.5 px-2.5 rounded border border-slate-300 bg-slate-50 text-slate-800 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="PROCESSING">Processing</option>
              <option value="NEEDS_ATTENTION">Needs Attention</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Village Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Village:</span>
            <select
              id="filter-village-select"
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="text-xs font-medium py-1.5 px-2.5 rounded border border-slate-300 bg-slate-50 text-slate-800 outline-none"
            >
              <option value="ALL">All Villages</option>
              {villages.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {(statusFilter || searchQuery || selectedVillage !== 'ALL') && (
            <button
              onClick={() => {
                setStatusFilter(null);
                setSearchQuery('');
                setSelectedVillage('ALL');
              }}
              className="text-xs text-blue-700 hover:underline px-2 py-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {documents.length === 0
              ? "You haven't uploaded any documents yet."
              : 'No documents match your filter criteria.'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {documents.length === 0
              ? 'Upload your registered deed, sale deed, or Patta document to begin automated digitization.'
              : 'Try clearing your search query or selecting "All Statuses".'}
          </p>
          <button
            onClick={() => navigateTo('file-to-gis')}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold"
          >
            <FileUp className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-white">
                  <th className="px-6 py-4 border-b border-slate-100">Document</th>
                  <th className="px-6 py-4 border-b border-slate-100">Document ID</th>
                  <th className="px-6 py-4 border-b border-slate-100">Survey No.</th>
                  <th className="px-6 py-4 border-b border-slate-100">Village</th>
                  <th className="px-6 py-4 border-b border-slate-100">Submitted</th>
                  <th className="px-6 py-4 border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
                {filteredDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{doc.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{doc.documentType} • {doc.landArea}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 font-medium">
                      {doc.documentNumber}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">
                      {doc.surveyNumber}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div>{doc.village}</div>
                      <div className="text-xs text-slate-400">{doc.district}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {doc.submissionDate}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        id={`action-view-${doc.id}`}
                        onClick={() => {
                          selectDocument(doc.id);
                          navigateTo('document-details', doc.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-xs transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{doc.title}</h3>
                    <p className="text-[11px] text-slate-500">
                      {doc.documentType} • {doc.documentNumber}
                    </p>
                  </div>
                  <StatusBadge status={doc.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Survey Number
                    </span>
                    <span className="font-bold text-slate-900 font-mono">{doc.surveyNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Village & Area
                    </span>
                    <span className="text-slate-800">
                      {doc.village} ({doc.landArea})
                    </span>
                  </div>
                </div>

                {doc.actionRequiredCitizen && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                    ⚠️ {doc.actionRequiredCitizen}
                  </p>
                )}

                <button
                  onClick={() => {
                    selectDocument(doc.id);
                    navigateTo('document-details', doc.id);
                  }}
                  className="w-full py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
