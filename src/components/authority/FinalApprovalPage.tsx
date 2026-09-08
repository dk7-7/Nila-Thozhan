import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentPreview } from '../common/DocumentPreview';
import { StatusBadge } from '../common/StatusBadge';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Key,
  Download,
  QrCode,
  ArrowLeft,
  FileText,
  Lock,
  History,
  Check,
  RotateCcw,
} from 'lucide-react';

export const FinalApprovalPage: React.FC = () => {
  const {
    selectedDocument,
    documents,
    selectDocument,
    submitDigitalSignature,
    submitOfficerDecision,
    navigateTo,
    downloadFile,
  } = useApp();

  const currentDoc =
    selectedDocument ||
    documents.find((d) => d.status === 'READY_FOR_APPROVAL') ||
    documents[0];

  const [isSigningModalOpen, setIsSigningModalOpen] = useState(false);
  const [signingStep, setSigningStep] = useState<1 | 2 | 3>(1);
  const [securityPin, setSecurityPin] = useState('8492');
  const [isSigningLoading, setIsSigningLoading] = useState(false);
  const [clarificationNotes, setClarificationNotes] = useState('');

  const handleDownloadCertificate = () => {
    const fileName = `Certified_Land_Record_${currentDoc.surveyNumber.replace(/[/\\?%*:|"<>]/g, '_')}.txt`;
    const content = `================================================================================
DIGITAL LAND RECORD CERTIFICATE - STATE CADASTRAL AUTHORITY
================================================================================
Document ID      : ${currentDoc.id}
Document Title   : ${currentDoc.title}
Document No      : ${currentDoc.documentNumber}
Survey Number    : ${currentDoc.surveyNumber}
Land Owner       : ${currentDoc.ownerName}
Area Extent      : ${currentDoc.landArea}
Jurisdiction     : Village ${currentDoc.village}, Taluk ${currentDoc.taluk}, District ${currentDoc.district}

DIGITAL SIGNATURE & SEAL DETAILS:
Signer Name      : ${currentDoc.digitalSignature?.signerName || 'Dr. V. Narayanan, IAS'}
Designation      : ${currentDoc.digitalSignature?.signerDesignation || 'District Registrar & Cadastral Controller'}
Certificate ID   : ${currentDoc.digitalSignature?.certificateId || 'DSC-BHOOMI-894210'}
Signed Date      : ${currentDoc.digitalSignature?.signDate || new Date().toISOString().split('T')[0]}
SHA256 Hash      : ${currentDoc.digitalSignature?.hashSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}

STATUS           : CERTIFIED & OFFICIALLY RECOGNIZED
OFFICIAL SEAL    : Cryptographically signed via e-Mudhra Hardware Token
================================================================================`;
    downloadFile(fileName, content, 'text/plain');
  };

  if (!currentDoc) {
    return <div className="p-8 text-center text-slate-500">No document selected.</div>;
  }

  const handleOpenSigning = () => {
    setSigningStep(1);
    setIsSigningModalOpen(true);
  };

  const handleConfirmPrompt = () => {
    setSigningStep(2);
  };

  const handleApplySignature = () => {
    setIsSigningLoading(true);
    setTimeout(() => {
      setIsSigningLoading(false);
      submitDigitalSignature(currentDoc.id, {
        signerName: 'Dr. V. Narayanan, IAS',
        signerDesignation: 'District Registrar & Cadastral Controller',
        certificateId: `DSC-BHOOMI-${Math.floor(100000 + Math.random() * 900000)}`,
        hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        signDate: new Date().toISOString().split('T')[0],
      });
      setSigningStep(3);
    }, 1200);
  };

  const handleReject = () => {
    const reason = prompt('Please provide reason for executive rejection:', 'Boundary ambiguity noted in partition deed');
    if (reason) {
      submitOfficerDecision(currentDoc.id, 'REJECT', reason);
      navigateTo('approvals');
    }
  };

  const handleRequestClarification = () => {
    if (!clarificationNotes) {
      alert('Please enter clarification questions for the field surveyor.');
      return;
    }
    submitOfficerDecision(currentDoc.id, 'NEEDS_MANUAL_REVIEW', `Clarification Requested: ${clarificationNotes}`);
    alert('Clarification request dispatched to Digitization Officer & Surveyor.');
    navigateTo('approvals');
  };

  return (
    <div id="final-approval-page" className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <button
          onClick={() => navigateTo('approvals')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Approvals Queue</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Evaluating Record:</span>
          <select
            value={currentDoc.id}
            onChange={(e) => selectDocument(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 outline-none"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.surveyNumber} - {d.status}
              </option>
            ))}
          </select>
          <StatusBadge status={currentDoc.status} size="md" />
        </div>
      </div>

      {/* Already Signed Certificate Banner */}
      {currentDoc.digitalSignature && (
        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-emerald-900">
                Official Digital Certificate Issued
              </h3>
              <p className="text-xs text-emerald-800">
                Certified by {currentDoc.digitalSignature.signerName} • Certificate #{currentDoc.digitalSignature.certificateId}
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadCertificate}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Certified Record</span>
          </button>
        </div>
      )}

      {/* Main Split Grid: Left = Document, Right = Complete Legal Summary & Executive Signing Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Original Document Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Deed Archive Exhibit
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">{currentDoc.documentNumber}</span>
          </div>
          <DocumentPreview document={currentDoc} className="h-[550px]" />
        </div>

        {/* Right: Legal Summary & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Complete Legal Audit Summary (Section 20) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Executive Dossier
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Legal Cadastral Summary
                </h3>
              </div>
              <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-700 border border-slate-200">
                ID: {currentDoc.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 block text-xs">Title Holder / Grantee</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{currentDoc.ownerName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-xs">Cadastral Survey Number</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                  {currentDoc.surveyNumber}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-xs">Jurisdiction Location</span>
                <span className="font-medium text-slate-800 mt-0.5 block">
                  {currentDoc.village}, {currentDoc.taluk}, {currentDoc.district}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-xs">Land Extent Claimed / GIS</span>
                <span className="font-bold text-slate-900 font-mono mt-0.5 block">
                  {currentDoc.landArea} (GIS: {currentDoc.gisParcel?.areaAcres || 2.45} ac)
                </span>
              </div>

              <div className="col-span-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Digitalization Officer Recommendation
                </span>
                <p className="text-xs text-slate-800 font-medium italic">
                  "{currentDoc.officerNotes || 'All spatial attributes verified. Parcel boundaries match survey plan.'}"
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Officer: {currentDoc.verificationOfficer || 'Officer K. Sharma'}</span>
                  <span>Confidence: <strong>{currentDoc.confidenceScore}%</strong></span>
                </div>
              </div>

              {/* GIS Validation Status */}
              <div className="col-span-2 flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-950">
                    GIS Spatial Intersection, Overlap & Access Tests: PASSED
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-800 font-bold">
                  PostGIS Layer v2
                </span>
              </div>
            </div>

            {/* Audit Trail Summary (Section 20) */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" />
                Audit Trail Summary
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto text-xs">
                {currentDoc.auditTrail.slice(-3).map((event) => (
                  <div key={event.id} className="flex items-start justify-between text-slate-600 bg-slate-50 p-2 rounded">
                    <div>
                      <span className="font-semibold text-slate-800">{event.action}</span>
                      <span className="text-slate-400 ml-2 text-[11px]">by {event.userName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{event.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Three Executive Actions (Section 21) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Executive Certification Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Action 1: Approve & Digitally Sign */}
              <button
                id="btn-exec-approve-sign"
                onClick={handleOpenSigning}
                className="p-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm group"
              >
                <Award className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Approve & Digitally Sign</span>
              </button>

              {/* Action 2: Reject Document */}
              <button
                onClick={handleReject}
                className="p-3.5 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                <span>Reject Document</span>
              </button>

              {/* Action 3: Request Clarification */}
              <button
                onClick={() => setClarificationNotes('Please re-verify eastern boundary road alignment with local village map.')}
                className="p-3.5 rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-800 font-semibold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Request Clarification</span>
              </button>
            </div>

            {/* If clarification requested box */}
            {clarificationNotes && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 space-y-2 text-xs">
                <span className="font-bold text-amber-900">Clarification Request Note:</span>
                <textarea
                  value={clarificationNotes}
                  onChange={(e) => setClarificationNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 border rounded text-xs bg-white"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleRequestClarification}
                    className="px-3 py-1 bg-amber-700 text-white font-semibold rounded text-xs"
                  >
                    Send Clarification Notice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Digital Signature 3-Step Modal (Section 21) */}
      {isSigningModalOpen && (
        <div
          id="digital-signing-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            id="digital-signing-modal"
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">
                  Class-3 Digital Signature Certification
                </h3>
              </div>
              <button
                onClick={() => setIsSigningModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Step 1: Confirmation Prompt */}
              {signingStep === 1 && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-slate-900 text-base">
                      Confirm Final Certification
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      You are about to digitally sign and certify this land record. This action creates a legally binding record under the Information Technology Act & Cadastral Registration Code.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Record:</span>
                      <strong className="text-slate-800">{currentDoc.title}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Survey No:</span>
                      <strong className="font-mono text-slate-800">{currentDoc.surveyNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Grantee / Owner:</span>
                      <strong className="text-slate-800">{currentDoc.ownerName}</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsSigningModalOpen(false)}
                      className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-confirm-sign-step1"
                      onClick={handleConfirmPrompt}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      Proceed to Authorize
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: DSC Pin Verification */}
              {signingStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs">
                    <Key className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-bold text-blue-900 block">
                        Hardware DSC Token Detected
                      </span>
                      <span className="text-blue-700 text-[11px]">
                        e-Mudhra Class 3 Government Digital Signature (Active)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Enter DSC Security PIN
                    </label>
                    <input
                      id="dsc-pin-input"
                      type="password"
                      value={securityPin}
                      onChange={(e) => setSecurityPin(e.target.value)}
                      placeholder="Enter 4 or 6 digit PIN"
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono tracking-widest text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Signer: Dr. V. Narayanan, IAS (District Registrar)
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => setSigningStep(1)}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Back
                    </button>
                    <button
                      id="btn-apply-signature-step2"
                      onClick={handleApplySignature}
                      disabled={isSigningLoading || !securityPin}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs"
                    >
                      {isSigningLoading ? (
                        <span>Cryptographically Signing...</span>
                      ) : (
                        <>
                          <Award className="w-4 h-4" />
                          <span>Apply Digital Signature</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Generating Certified Document */}
              {signingStep === 3 && (
                <div className="space-y-4 text-center animate-in zoom-in-95">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-4 ring-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">
                      Certified Land Record Issued!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      The document has been sealed, hashed, and published to the citizen vault.
                    </p>
                  </div>

                  {/* Certified Seal Exhibit */}
                  <div className="p-4 bg-emerald-50/70 rounded-xl border-2 border-emerald-300 text-left text-xs space-y-2 relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                          Official Digital Seal
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm mt-0.5">
                          Department of Land Records & Cadastre
                        </h5>
                        <p className="text-[11px] text-slate-600">
                          Signer: Dr. V. Narayanan (District Registrar)
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded border border-slate-300 p-1 flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-slate-800" />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200 text-[10px] font-mono text-slate-500 break-all">
                      SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setIsSigningModalOpen(false);
                        navigateTo('approvals');
                      }}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                    >
                      Done & Return to Queue
                    </button>
                    <button
                      onClick={handleDownloadCertificate}
                      className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Certified Record</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
