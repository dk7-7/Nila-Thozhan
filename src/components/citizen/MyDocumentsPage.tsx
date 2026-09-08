import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Search, Filter, FileUp, Map, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

export const MyDocumentsPage: React.FC = () => {
  const { documents, navigateTo, selectDocument, selectParcel, statusFilter, setStatusFilter, t } = useApp();
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
    <div id="my-documents-page" className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-700 to-emerald-900 rounded-3xl p-5 sm:p-7 text-white shadow-sm">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-200 block mb-1">
            {t('appName')}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {t('navMyDocuments')}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
            {t('roleCitizenSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('upload')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-all shadow-xs"
          >
            <FileUp className="w-4 h-4 text-emerald-700" />
            <span>{t('navUpload')}</span>
          </button>
          <button
            onClick={() => navigateTo('gis-map')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs transition-all border border-emerald-600/60 shadow-xs"
          >
            <Map className="w-4 h-4 text-emerald-300" />
            <span>{t('navGisMap')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="my-docs-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">{t('status')}:</span>
            <select
              id="filter-status-select"
              value={statusFilter || 'ALL'}
              onChange={(e) => setStatusFilter(e.target.value === 'ALL' ? null : e.target.value)}
              className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">{t('allStatuses')}</option>
              <option value="APPROVED">{t('statusApproved')}</option>
              <option value="UNDER_VERIFICATION">{t('statusUnderVerification')}</option>
              <option value="PROCESSING">{t('statusProcessing')}</option>
              <option value="NEEDS_ATTENTION">{t('statusNeedsAttention')}</option>
              <option value="REJECTED">{t('statusRejected')}</option>
            </select>
          </div>

          {/* Village Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">{t('village')}:</span>
            <select
              id="filter-village-select"
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">{t('allVillages')}</option>
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
              className="text-xs text-emerald-700 font-bold hover:underline px-2 py-1"
            >
              {t('clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center shadow-xs">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {documents.length === 0 ? t('uploadPrompt') : t('noDocsFound')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {t('uploadPrompt')}
          </p>
          <button
            onClick={() => navigateTo('upload')}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <FileUp className="w-4 h-4" />
            <span>{t('navUpload')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                      {doc.documentNumber}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                      {doc.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {doc.documentType} • {doc.submissionDate}
                    </p>
                  </div>
                  <StatusBadge status={doc.status} size="sm" />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3.5 text-xs">
                  <div className="bg-slate-50/80 p-2.5 rounded-xl">
                    <span className="text-slate-500 text-[10px] font-medium block">
                      {t('surveyNumber')}
                    </span>
                    <span className="font-mono font-bold text-emerald-800 text-sm">
                      {doc.surveyNumber}
                    </span>
                  </div>

                  <div className="bg-slate-50/80 p-2.5 rounded-xl">
                    <span className="text-slate-500 text-[10px] font-medium block">
                      {t('landArea')}
                    </span>
                    <span className="font-bold text-slate-800">
                      {doc.landArea}
                    </span>
                  </div>

                  <div className="bg-slate-50/80 p-2.5 rounded-xl">
                    <span className="text-slate-500 text-[10px] font-medium block">
                      {t('ownerName')}
                    </span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {doc.ownerName}
                    </span>
                  </div>

                  <div className="bg-slate-50/80 p-2.5 rounded-xl">
                    <span className="text-slate-500 text-[10px] font-medium block">
                      {t('village')}
                    </span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {doc.village}, {doc.district}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    selectDocument(doc.id);
                    navigateTo('document-details', doc.id);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t('viewDetails')}</span>
                </button>

                <button
                  onClick={() => {
                    selectDocument(doc.id);
                    if (doc.gisParcel?.parcelId) {
                      selectParcel(doc.gisParcel.parcelId);
                    }
                    navigateTo('gis-map', doc.id);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>{t('navGisMap')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
