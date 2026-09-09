import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileUp,
  Files,
  MapPin,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const CitizenDashboard: React.FC = () => {
  const {
    currentProfile,
    documents,
    navigateTo,
    selectDocument,
    setStatusFilter,
    statusFilter,
    t,
  } = useApp();

  // Metrics
  const total = documents.length;
  const processing = documents.filter(
    (d) => d.status === 'PROCESSING' || d.status === 'DIGITIZED'
  ).length;
  const underVerification = documents.filter(
    (d) => d.status === 'UNDER_VERIFICATION' || d.status === 'READY_FOR_APPROVAL'
  ).length;
  const approved = documents.filter((d) => d.status === 'APPROVED').length;
  const needsAttention = documents.filter((d) => d.status === 'NEEDS_ATTENTION' || d.status === 'REJECTED').length;

  const handleCardClick = (filter: string | null) => {
    setStatusFilter(statusFilter === filter ? null : filter);
    navigateTo('my-documents');
  };

  const recentDocs = documents.slice(0, 4);

  return (
    <div id="citizen-dashboard" className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 4 Status Metric Cards (Professional Polish theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => handleCardClick(null)}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left hover:border-slate-300 transition-colors"
        >
          <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">
            {t('totalDocuments')}
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {total}
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium">
            {t('cadastralRepository')}
          </div>
        </button>

        <button
          onClick={() => handleCardClick('PROCESSING')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left hover:border-slate-300 transition-colors"
        >
          <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">
            {t('aiIngestion')}
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {processing < 10 ? `0${processing}` : processing}
          </div>
          <div className="mt-2 text-xs text-sky-600 font-medium">
            {t('processingOcrExtraction')}
          </div>
        </button>

        <button
          onClick={() => handleCardClick('UNDER_VERIFICATION')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left hover:border-slate-300 transition-colors"
        >
          <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">
            {t('verificationQueue')}
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {underVerification < 10 ? `0${underVerification}` : underVerification}
          </div>
          <div className="mt-2 text-xs text-amber-600 font-medium">
            {t('officerGisReview')}
          </div>
        </button>

        <button
          onClick={() => handleCardClick('APPROVED')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left hover:border-slate-300 transition-colors"
        >
          <div className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">
            {t('approvedSealed')}
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {approved < 10 ? `0${approved}` : approved}
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            {t('readyInstantDownload')}
          </div>
        </button>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Action 1: Upload Document */}
        <div
          id="action-upload-doc"
          onClick={() => navigateTo('file-to-gis')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <FileUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              {t('navUpload')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('uploadDeedDesc')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
            <span>{t('startUpload')}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </div>

        {/* Action 2: View My Documents */}
        <div
          id="action-view-docs"
          onClick={() => navigateTo('my-documents')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
              <Files className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              {t('documentVault')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('docVaultDesc')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-slate-700">
            <span>{t('openVault')} ({total})</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </div>

        {/* Action 3: Find My Land */}
        <div
          id="action-find-land"
          onClick={() => navigateTo('file-to-gis')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              {t('findMyLandGis')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('findLandGisDesc')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600">
            <span>{t('openGisMap')}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              {t('recentLandDocs')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('liveTrackingDesc')}
            </p>
          </div>
          <button
            onClick={() => navigateTo('my-documents')}
            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium shadow-xs"
          >
            {t('viewAllDocuments')}
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-white">
              <th className="px-6 py-4 border-b border-slate-100">{t('tableDocId')}</th>
              <th className="px-6 py-4 border-b border-slate-100">{t('tableSurveyNo')}</th>
              <th className="px-6 py-4 border-b border-slate-100">{t('villageArea')}</th>
              <th className="px-6 py-4 border-b border-slate-100">{t('tableStatus')}</th>
              <th className="px-6 py-4 border-b border-slate-100 text-right">{t('tableAction')}</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
            {recentDocs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-xs">
                  {t('noDocsUploadedYet')}
                </td>
              </tr>
            ) : (
              recentDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-blue-600 font-medium">
                      {doc.documentNumber}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-0.5">
                      {doc.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-800">
                    {doc.surveyNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800 font-medium">{doc.village}</div>
                    <div className="text-xs text-slate-400">{doc.landArea}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={doc.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      id={`btn-view-details-${doc.id}`}
                      onClick={() => {
                        selectDocument(doc.id);
                        navigateTo('document-details', doc.id);
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-xs"
                    >
                      {t('viewDetails')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
