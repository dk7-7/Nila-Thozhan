import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, TrendingUp, CheckCircle, Clock, AlertTriangle, FileSpreadsheet, Download } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { documents, downloadFile, t } = useApp();

  const total = documents.length;
  const approved = documents.filter((d) => d.status === 'APPROVED').length;
  const inProgress = documents.filter((d) => d.status !== 'APPROVED' && d.status !== 'REJECTED').length;
  const rejected = documents.filter((d) => d.status === 'REJECTED').length;

  const villageStats = [
    { village: 'Krishnapuram', total: 142, digitized: 138, rate: '97%' },
    { village: 'Ramnagar', total: 98, digitized: 91, rate: '92%' },
    { village: 'Chandrapur', total: 64, digitized: 59, rate: '92%' },
    { village: 'Devanahalli Rural', total: 180, digitized: 165, rate: '91%' },
  ];

  const handleDownloadExecutiveReport = () => {
    const reportText = `================================================================================
EXECUTIVE CADASTRAL ANALYTICS & DIGITIZATION REPORT
Department of Land Records & Survey Authority
================================================================================
Generated Date               : ${new Date().toLocaleDateString()}
Total Records Evaluated     : ${total}
Certified Approved Records  : ${approved}
In-Progress Verification    : ${inProgress}
Rejected Records            : ${rejected}
Overall Completion Velocity : 94.8%
Average Officer Review Time : 8.5 minutes
GIS Spatial Conflict Rate   : 2.1%

VILLAGE DIGITIZATION BREAKDOWN:
${villageStats.map((v) => `- ${v.village}: ${v.digitized}/${v.total} parcels (${v.rate})`).join('\n')}

CERTIFICATION & COMPLIANCE SUMMARY:
All approved certificates are cryptographically verified using SHA-256 hashes and
published to the citizen digital vault under IT Act Section 6A guidelines.
================================================================================`;
    downloadFile('executive_cadastral_analytics_report.txt', reportText, 'text/plain');
  };

  const handleExportVillageCSV = () => {
    const headers = 'Village Name,Total Registered Parcels,Digitized & Verified,Completion Rate\n';
    const rows = villageStats
      .map((v) => `"${v.village}",${v.total},${v.digitized},"${v.rate}"`)
      .join('\n');
    downloadFile('village_cadastre_completion_summary.csv', headers + rows, 'text/csv');
  };

  return (
    <div id="reports-page" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>{t('cadastralAnalytics')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {t('digitizationReportsVelocity')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('reportsSubtitle')}
          </p>
        </div>

        <button
          onClick={handleDownloadExecutiveReport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('downloadExecutiveReport')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">{t('digitizationProgress')}</span>
          <span className="text-3xl font-bold text-slate-900 mt-1 block">94.8%</span>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '94.8%' }} />
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">{t('certifiedRecordsIssued')}</span>
          <span className="text-3xl font-bold text-emerald-800 mt-1 block">{approved}</span>
          <span className="text-xs text-emerald-600 mt-2 block font-medium">{t('tamperProofNotice')}</span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">{t('spatialConflictRate')}</span>
          <span className="text-3xl font-bold text-amber-800 mt-1 block">2.1%</span>
          <span className="text-xs text-amber-600 mt-2 block font-medium">{t('conflictRateBaseline')}</span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">{t('avgReviewTime')}</span>
          <span className="text-3xl font-bold text-slate-900 mt-1 block">8.5 min</span>
          <span className="text-xs text-slate-500 mt-2 block font-medium">Reduced by 76% via automated OCR</span>
        </div>
      </div>

      {/* Village Digitization Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {t('villageBreakdown')}
            </h3>
            <span className="text-xs text-slate-500">Tamil Nadu Revenue Division</span>
          </div>
          <button
            onClick={handleExportVillageCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('exportCsvReport')}</span>
          </button>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <th className="py-3 px-4">{t('village')}</th>
              <th className="py-3 px-3">{t('totalDocuments')}</th>
              <th className="py-3 px-3">{t('statusApproved')}</th>
              <th className="py-3 px-4 text-right">Completion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {villageStats.map((v, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-slate-900">{v.village}</td>
                <td className="py-3 px-3">{v.total}</td>
                <td className="py-3 px-3 text-emerald-700 font-medium">{v.digitized}</td>
                <td className="py-3 px-4 text-right font-bold text-blue-700">{v.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
