import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileCheck2,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Filter,
  FileUp,
} from 'lucide-react';
import { LandDocument } from '../../types';

export const OfficerDashboard: React.FC = () => {
  const { documents, navigateTo, selectDocument, downloadFile, t } = useApp();
  const [activeQueueTab, setActiveQueueTab] = useState<
    'HIGH_PRIORITY' | 'MANUAL_VERIFICATION' | 'GIS_CONFLICTS' | 'READY_APPROVAL'
  >('HIGH_PRIORITY');

  // Metrics computation
  const total = documents.length;
  const processing = documents.filter((d) => d.status === 'PROCESSING' || d.status === 'DIGITIZED').length;
  const highConfidence = documents.filter((d) => d.overallConfidence === 'HIGH').length;
  const needsManualReview = documents.filter(
    (d) => d.validationReport.status === 'NEEDS_MANUAL_REVIEW' || d.overallConfidence === 'LOW'
  ).length;
  const gisConflicts = documents.filter(
    (d) => d.validationReport.status === 'CONFLICT' || d.scenarioType === 'SURVEY_CONFLICT' || d.scenarioType === 'AREA_ANOMALY'
  ).length;
  const readyForSignCount = documents.filter((d) => d.status === 'READY_FOR_APPROVAL').length;
  const approved = documents.filter((d) => d.status === 'APPROVED').length;
  const rejected = documents.filter((d) => d.status === 'REJECTED').length;

  const handleExportCsv = () => {
    const headers = ['Document ID', 'Survey Number', 'Owner Name', 'Village', 'District', 'Land Area', 'Status', 'Confidence Score %'];
    const rows = queueDocs.map((d) => [
      d.documentNumber,
      d.surveyNumber,
      `"${d.ownerName}"`,
      d.village,
      d.district,
      `"${d.landArea}"`,
      d.status,
      `${d.confidenceScore}%`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(`land_records_work_queue_${activeQueueTab.toLowerCase()}.csv`, csvContent, 'text/csv;charset=utf-8');
  };

  // Filter queues
  const getQueueDocuments = (): LandDocument[] => {
    switch (activeQueueTab) {
      case 'HIGH_PRIORITY':
        return documents.filter(
          (d) =>
            d.validationReport.status === 'CONFLICT' ||
            d.validationReport.status === 'NEEDS_MANUAL_REVIEW' ||
            d.status === 'READY_FOR_APPROVAL'
        );
      case 'MANUAL_VERIFICATION':
        return documents.filter(
          (d) =>
            d.validationReport.status === 'NEEDS_MANUAL_REVIEW' ||
            d.overallConfidence === 'LOW' ||
            d.status === 'UNDER_VERIFICATION'
        );
      case 'GIS_CONFLICTS':
        return documents.filter(
          (d) =>
            d.validationReport.status === 'CONFLICT' ||
            d.scenarioType === 'SURVEY_CONFLICT' ||
            d.scenarioType === 'AREA_ANOMALY'
        );
      case 'READY_APPROVAL':
        return documents.filter((d) => d.status === 'READY_FOR_APPROVAL');
      default:
        return documents;
    }
  };

  const queueDocs = getQueueDocuments();

  const handleOpenDocumentWorkflow = (doc: LandDocument) => {
    selectDocument(doc.id);
    navigateTo('processing-validation', doc.id);
  };

  return (
    <div id="officer-dashboard" className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 4 Primary Metric Cards (Interactive Filters) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => setActiveQueueTab('HIGH_PRIORITY')}
          className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
            activeQueueTab === 'HIGH_PRIORITY'
              ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-300 shadow-md'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">
            {t('totalQueue')}
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {total}
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium">
            {t('clickHighPriority')}
          </div>
        </button>

        <button
          onClick={() => setActiveQueueTab('GIS_CONFLICTS')}
          className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
            activeQueueTab === 'GIS_CONFLICTS'
              ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-300 shadow-md'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">
            {t('awaitingGis')}
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {gisConflicts}
          </div>
          <div className="mt-2 text-xs text-amber-600 font-medium font-semibold">
            {gisConflicts} {t('spatialConflictsActive')}
          </div>
        </button>

        <button
          onClick={() => setActiveQueueTab('MANUAL_VERIFICATION')}
          className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
            activeQueueTab === 'MANUAL_VERIFICATION'
              ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-300 shadow-md'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">
            {t('lowConfidence')}
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {needsManualReview < 10 ? `0${needsManualReview}` : needsManualReview}
          </div>
          <div className="mt-2 text-xs text-rose-600 font-medium font-semibold">
            {t('requiresManualVerification')}
          </div>
        </button>

        <button
          onClick={() => setActiveQueueTab('READY_APPROVAL')}
          className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
            activeQueueTab === 'READY_APPROVAL'
              ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-300 shadow-md'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">
            {t('readyForSign')}
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {readyForSignCount}
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium font-semibold">
            {t('sentToHighAuthority')}
          </div>
        </button>
      </div>

      {/* Active Work Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="font-semibold text-slate-800 text-base">{t('activeWorkQueue')}</h2>
            <p className="text-xs text-slate-500">
              {t('activeWorkQueueDesc')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
              <button
                id="tab-queue-high-priority"
                onClick={() => setActiveQueueTab('HIGH_PRIORITY')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeQueueTab === 'HIGH_PRIORITY'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('highPriority')}
              </button>
              <button
                id="tab-queue-manual"
                onClick={() => setActiveQueueTab('MANUAL_VERIFICATION')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeQueueTab === 'MANUAL_VERIFICATION'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('manualReview')} ({needsManualReview})
              </button>
              <button
                id="tab-queue-conflicts"
                onClick={() => setActiveQueueTab('GIS_CONFLICTS')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeQueueTab === 'GIS_CONFLICTS'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('gisCheck')} ({gisConflicts})
              </button>
              <button
                id="tab-queue-ready"
                onClick={() => setActiveQueueTab('READY_APPROVAL')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeQueueTab === 'READY_APPROVAL'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('readySign')} ({readyForSignCount})
              </button>
            </div>
            <button
              onClick={handleExportCsv}
              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-medium transition-colors"
            >
              {t('exportCsv')}
            </button>
            <button
              onClick={() => navigateTo('upload')}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium shadow-xs"
            >
              {t('batchUpload')}
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-white">
                <th className="px-6 py-4 border-b border-slate-100">{t('tableDocId')}</th>
                <th className="px-6 py-4 border-b border-slate-100">{t('tableSurveyNo')}</th>
                <th className="px-6 py-4 border-b border-slate-100">{t('tableOwner')}</th>
                <th className="px-6 py-4 border-b border-slate-100">{t('tableAiConfidence')}</th>
                <th className="px-6 py-4 border-b border-slate-100">{t('tableStatus')}</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">{t('tableAction')}</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
              {queueDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-xs">
                    {t('noDocsInQueue')}
                  </td>
                </tr>
              ) : (
                queueDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-blue-600 font-medium">
                    {doc.documentNumber}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {doc.surveyNumber}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {doc.ownerName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            doc.confidenceScore >= 85
                              ? 'bg-emerald-500'
                              : doc.confidenceScore >= 65
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${doc.confidenceScore}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          doc.confidenceScore >= 85
                            ? 'text-emerald-600'
                            : doc.confidenceScore >= 65
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {doc.confidenceScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={doc.validationReport.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      id={`btn-review-queue-${doc.id}`}
                      onClick={() => handleOpenDocumentWorkflow(doc)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-xs transition-colors"
                    >
                      {doc.overallConfidence === 'LOW' ? t('verifyManual') : doc.validationReport.status === 'CONFLICT' ? t('openMap') : t('review')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {t('showingDocs')} {queueDocs.length} {t('ofPendingDocs')}
          </span>
          <div className="flex gap-1">
            <button
              disabled
              className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 cursor-not-allowed text-xs"
            >
              ←
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs transition-colors">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
