import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentPreview } from '../common/DocumentPreview';
import { StatusBadge } from '../common/StatusBadge';
import { generatePattaPDF } from '../../services/pdfService';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Award,
  Download,
  Share2,
  HelpCircle,
  MessageSquare,
  X,
  Send,
} from 'lucide-react';

export const CitizenDocumentDetails: React.FC = () => {
  const { selectedDocument, navigateTo, selectParcel, downloadFile, addCitizenQuery } = useApp();

  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [querySubject, setQuerySubject] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [querySuccessToast, setQuerySuccessToast] = useState(false);

  if (!selectedDocument) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-600">No document selected.</p>
        <button
          onClick={() => navigateTo('my-documents')}
          className="mt-3 px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold"
        >
          Return to My Documents
        </button>
      </div>
    );
  }

  const doc = selectedDocument;

  const handleDownloadCertificate = async () => {
    await generatePattaPDF(doc);
  };

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!querySubject.trim() || !queryMessage.trim()) return;
    addCitizenQuery(doc.id, querySubject, queryMessage);
    setIsQueryModalOpen(false);
    setQuerySubject('');
    setQueryMessage('');
    setQuerySuccessToast(true);
    setTimeout(() => setQuerySuccessToast(false), 4500);
  };

  // Timeline steps computation
  const isDigitized =
    doc.status !== 'PROCESSING';
  const isVerified =
    doc.status === 'GIS_VERIFIED' ||
    doc.status === 'READY_FOR_APPROVAL' ||
    doc.status === 'APPROVED';
  const isGisPassed =
    doc.status === 'GIS_VERIFIED' ||
    doc.status === 'READY_FOR_APPROVAL' ||
    doc.status === 'APPROVED';
  const isApproved = doc.status === 'APPROVED';
  const hasIssue = doc.status === 'NEEDS_ATTENTION' || doc.status === 'REJECTED';

  const handleOpenGis = () => {
    if (doc.gisParcel) {
      selectParcel(doc.gisParcel.parcelId);
    }
    navigateTo('gis-map', doc.id, doc.gisParcel?.parcelId);
  };

  return (
    <div id="citizen-document-details" className="space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <button
          id="btn-back-to-docs"
          onClick={() => navigateTo('my-documents')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Documents</span>
        </button>

        <div className="flex items-center gap-2">
          <StatusBadge status={doc.status} size="md" />
          <button
            onClick={() => setIsQueryModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-200 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Raise Query / Objection</span>
          </button>
          <button
            onClick={handleOpenGis}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Locate on GIS Map</span>
          </button>
        </div>
      </div>

      {/* Query Toast Notification */}
      {querySuccessToast && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-300 text-blue-950 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 font-medium text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Your query has been logged and dispatched to the assigned revenue officer.</span>
          </div>
          <button onClick={() => setQuerySuccessToast(false)} className="text-blue-700 hover:text-blue-950 font-bold">✕</button>
        </div>
      )}

      {/* Action Required Banner in Plain Language if Flagged */}
      {doc.actionRequiredCitizen && (
        <div
          id="citizen-action-banner"
          className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <h4 className="font-bold text-amber-900 text-sm mb-0.5">
              Action Required / Verification Notice
            </h4>
            <p className="text-amber-800 leading-relaxed font-medium">
              {doc.actionRequiredCitizen}
            </p>
            <p className="text-[11px] text-amber-700 mt-1">
              You do not need to resubmit unless instructed by the revenue officer. For questions, contact the taluk survey desk.
            </p>
          </div>
        </div>
      )}

      {/* Approved Digital Certificate Banner */}
      {doc.digitalSignature && (
        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-900 text-sm">
                Official Digitally Certified Land Record
              </h4>
              <p className="text-xs text-emerald-800">
                Digitally signed by {doc.digitalSignature.signerName} ({doc.digitalSignature.signerDesignation}) on{' '}
                {doc.digitalSignature.signDate}.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadCertificate}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Patta PDF</span>
          </button>
        </div>
      )}

      {/* Main Split Layout: LEFT = Original Document, RIGHT = Land Record Info & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Original Scanned Document Preview (5 cols) */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Original Uploaded Document
            </h2>
            <span className="text-[11px] text-slate-400">Scanned Certified Copy</span>
          </div>

          <DocumentPreview document={doc} className="h-[520px]" />
        </div>

        {/* RIGHT: Land Record Information + Timeline (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Land Record Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Document Summary
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Land Record Details
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 block text-xs">Owner Name</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{doc.ownerName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-xs">Survey Number</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                  {doc.surveyNumber}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-xs">Village</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{doc.village}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-xs">Taluk & District</span>
                <span className="text-slate-800 mt-0.5 block">
                  {doc.taluk}, {doc.district}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-xs">Land Area</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{doc.landArea}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-xs">Document Type</span>
                <span className="text-slate-800 mt-0.5 block">{doc.documentType}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Submitted On: <strong>{doc.submissionDate}</strong></span>
              <span>Doc ID: <strong className="font-mono">{doc.documentNumber}</strong></span>
            </div>
          </div>

          {/* Verification Status Progress Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Verification Status
            </h3>

            <div className="space-y-4 pt-1">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-emerald-500/20">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Document Uploaded</h4>
                  <p className="text-[11px] text-slate-500">
                    Uploaded on {doc.submissionDate} by {doc.uploadedBy}
                  </p>
                </div>
              </div>

              {/* Vertical connector */}
              <div className="w-0.5 h-4 bg-slate-200 ml-3.5 -my-2" />

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isDigitized
                      ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'bg-sky-100 text-sky-800 animate-pulse'
                  }`}
                >
                  {isDigitized ? '✓' : '...'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Document Digitized</h4>
                  <p className="text-[11px] text-slate-500">
                    {isDigitized
                      ? 'Text and land particulars read by intelligent OCR engine'
                      : 'Processing image layers...'}
                  </p>
                </div>
              </div>

              {/* Vertical connector */}
              <div className="w-0.5 h-4 bg-slate-200 ml-3.5 -my-2" />

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isVerified
                      ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/20'
                      : hasIssue
                      ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-500/20'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isVerified ? '✓' : hasIssue ? '!' : '3'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Document Verified</h4>
                  <p className="text-[11px] text-slate-500">
                    {isVerified
                      ? 'Cross-checked with legacy Sub-Registrar volume archives'
                      : hasIssue
                      ? 'Review required by survey officer'
                      : 'Awaiting officer verification review'}
                  </p>
                </div>
              </div>

              {/* Vertical connector */}
              <div className="w-0.5 h-4 bg-slate-200 ml-3.5 -my-2" />

              {/* Step 4 */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isGisPassed
                      ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isGisPassed ? '✓' : '4'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">GIS Checked</h4>
                  <p className="text-[11px] text-slate-500">
                    {isGisPassed
                      ? 'Parcel boundary polygon mapped to cadastral village coordinate layer'
                      : 'Checking spatial intersection & boundary overlap'}
                  </p>
                </div>
              </div>

              {/* Vertical connector */}
              <div className="w-0.5 h-4 bg-slate-200 ml-3.5 -my-2" />

              {/* Step 5 */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isApproved
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isApproved ? '✓' : '5'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Final Approval</h4>
                  <p className="text-[11px] text-slate-500">
                    {isApproved
                      ? 'Approved & Digitally Signed by Sub-Registrar Authority'
                      : 'Pending final executive digital signature'}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                id="btn-view-parcel-gis"
                onClick={handleOpenGis}
                className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MapPin className="w-4 h-4" />
                <span>Find My Land on GIS Map</span>
              </button>

              <button
                onClick={() => setIsQueryModalOpen(true)}
                className="w-full py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>File Boundary Objection / Query</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Citizen Query / Objection Modal */}
      {isQueryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  File Land Record Query / Boundary Objection
                </h3>
              </div>
              <button
                onClick={() => setIsQueryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendQuery} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Query Subject / Type
                </label>
                <select
                  value={querySubject}
                  onChange={(e) => setQuerySubject(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  required
                >
                  <option value="">Select subject...</option>
                  <option value="Survey Boundary Discrepancy">Survey Boundary Discrepancy</option>
                  <option value="Owner Name Spelling Correction">Owner Name Spelling Correction</option>
                  <option value="Extent Area Mismatch">Extent Area Mismatch (+/- acres)</option>
                  <option value="Access Road Claim">Access Road Claim</option>
                  <option value="General Clarification">General Clarification</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Objection Details & Message for Revenue Officer
                </label>
                <textarea
                  rows={4}
                  value={queryMessage}
                  onChange={(e) => setQueryMessage(e.target.value)}
                  placeholder="Explain your land record query or boundary discrepancy in detail..."
                  className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-sans"
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-50 text-blue-900 text-[11px] leading-relaxed">
                💡 Filing a query logs an immutable entry in the system audit trail and alerts Officer K. Sharma for investigation.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQueryModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Query</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
