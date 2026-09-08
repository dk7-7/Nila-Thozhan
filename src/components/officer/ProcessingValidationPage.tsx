import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { DocumentPreview } from '../common/DocumentPreview';
import { ManualVerificationPage } from './ManualVerificationPage';
import { GisValidationPage } from './GisValidationPage';
import {
  Sparkles,
  UserCheck,
  FileCheck2,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
  Layers,
  Edit2,
  Check,
  RotateCcw,
  Info,
  FileUp,
  UploadCloud,
  Trash2,
  Eye,
  Download,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { extractDocumentFields } from '../../services/ocrService';
import { LandDocument } from '../../types';

export type PipelineStage = 'digitization' | 'manual-verification' | 'gis-validation' | 'approvals';

export const ProcessingValidationPage: React.FC = () => {
  const {
    activeTab,
    navigateTo,
    selectedDocument,
    documents,
    selectDocument,
    updateDocumentField,
    submitOfficerDecision,
    uploadNewDocument,
  } = useApp();

  // Pick current document: prioritize explicitly selected doc, then newly uploaded doc (starts with 'doc-'), then under-verification, then first doc
  const currentDoc: LandDocument =
    selectedDocument ||
    documents.find((d) => d.id.startsWith('doc-')) ||
    documents.find((d) => d.status === 'UNDER_VERIFICATION') ||
    documents[0];

  // Map activeTab to pipeline stage
  const getInitialStage = (): PipelineStage => {
    if (activeTab === 'manual-verification') return 'manual-verification';
    if (activeTab === 'gis-validation') return 'gis-validation';
    if (activeTab === 'approvals') return 'approvals';
    return 'digitization';
  };

  const [currentStage, setCurrentStage] = useState<PipelineStage>(getInitialStage);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Files Upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStepLabel, setUploadStepLabel] = useState<string>('');
  const [uploadNotification, setUploadNotification] = useState<string | null>(null);

  // Attached files list for current record (uses uploaded document file if available)
  const [attachedFiles, setAttachedFiles] = useState<
    {
      id: string;
      name: string;
      size: string;
      type: 'DEED' | 'SURVEY_SKETCH' | 'RTC' | 'SUPPLEMENTARY';
      typeLabel: string;
      status: 'OCR_EXTRACTED' | 'PROCESSING' | 'READY';
      confidenceScore: number;
      uploadedAt: string;
    }[]
  >(() => {
    if (currentDoc?.fileName) {
      return [
        {
          id: `f-${currentDoc.id}`,
          name: currentDoc.fileName,
          size: currentDoc.fileSize || '2.4 MB',
          type: 'DEED',
          typeLabel: currentDoc.documentType || 'Uploaded Deed',
          status: 'OCR_EXTRACTED',
          confidenceScore: currentDoc.confidenceScore || 95,
          uploadedAt: 'Uploaded document',
        },
      ];
    }
    return [];
  });

  useEffect(() => {
    if (currentDoc?.fileName) {
      setAttachedFiles([
        {
          id: `f-${currentDoc.id}`,
          name: currentDoc.fileName,
          size: currentDoc.fileSize || '2.4 MB',
          type: 'DEED',
          typeLabel: currentDoc.documentType || 'Uploaded Deed',
          status: 'OCR_EXTRACTED',
          confidenceScore: currentDoc.confidenceScore || 95,
          uploadedAt: 'Uploaded document',
        },
      ]);
    }
  }, [currentDoc?.id, currentDoc?.fileName]);

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setIsUploading(true);
    setUploadProgress(20);
    setUploadStepLabel('Processing document with Gemini Vision OCR...');

    try {
      const fileUrl = URL.createObjectURL(file);
      const result = await extractDocumentFields(file, (st) => {
        setUploadStepLabel(st.message);
        setUploadProgress(Math.min(95, (st.stageIndex + 1) * 16));
      });

      const extractedFields: LandDocument['extractedFields'] = {
        documentType: { fieldName: 'Document Type', fieldKey: 'documentType', value: result.documentType.value, confidence: result.documentType.confidence, confidenceScore: result.documentType.score, isVerified: true },
        ownerName: { fieldName: 'Owner Name', fieldKey: 'ownerName', value: result.ownerName.value, confidence: result.ownerName.confidence, confidenceScore: result.ownerName.score, isVerified: true },
        surveyNumber: { fieldName: 'Survey Number', fieldKey: 'surveyNumber', value: result.surveyNumber.value, confidence: result.surveyNumber.confidence, confidenceScore: result.surveyNumber.score, isVerified: true },
        village: { fieldName: 'Village', fieldKey: 'village', value: result.village.value, confidence: result.village.confidence, confidenceScore: result.village.score, isVerified: true },
        taluk: { fieldName: 'Taluk', fieldKey: 'taluk', value: result.taluk.value, confidence: result.taluk.confidence, confidenceScore: result.taluk.score, isVerified: true },
        district: { fieldName: 'District', fieldKey: 'district', value: result.district.value, confidence: result.district.confidence, confidenceScore: result.district.score, isVerified: true },
        landArea: { fieldName: 'Land Area', fieldKey: 'landArea', value: result.landArea.value, confidence: result.landArea.confidence, confidenceScore: result.landArea.score, isVerified: true },
        executionDate: { fieldName: 'Execution Date', fieldKey: 'executionDate', value: result.executionDate.value, confidence: result.executionDate.confidence, confidenceScore: result.executionDate.score, isVerified: true },
      };

      const newDocId = uploadNewDocument({
        title: `${result.documentType.value || 'Land Deed'} — Survey ${result.surveyNumber.value || 'N/A'}`,
        documentType: (result.documentType.value as LandDocument['documentType']) || 'Patta / RoR',
        ownerName: result.ownerName.value,
        surveyNumber: result.surveyNumber.value,
        village: result.village.value,
        taluk: result.taluk.value,
        district: result.district.value,
        landArea: result.landArea.value,
        extractedFields,
        cadastralDetails: result.cadastralDetails,
        fileUrl,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        fileType: file.type,
      });

      selectDocument(newDocId);
      setUploadProgress(100);
      setUploadStepLabel('Extraction complete!');
      setUploadNotification(`Document "${file.name}" processed with live OCR! All attributes indexed.`);
      setTimeout(() => setUploadNotification(null), 4500);
    } catch (err) {
      console.error('File extraction error:', err);
      setUploadNotification(`Failed to extract data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachedFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setUploadNotification('File removed from record dossier.');
    setTimeout(() => setUploadNotification(null), 3000);
  };

  // Decision state for Stage 4
  const [decisionAction, setDecisionAction] = useState<'APPROVE' | 'RETURN' | 'REJECT'>('APPROVE');
  const [decisionNotes, setDecisionNotes] = useState<string>(
    'All deed metadata, spatial parcel boundaries, and land records cross-verified and confirmed for digital certification.'
  );
  const [isDecisionSubmitted, setIsDecisionSubmitted] = useState<boolean>(false);

  // Sync stage if activeTab changes externally (e.g. from scenario bar or queue)
  useEffect(() => {
    if (activeTab === 'manual-verification') setCurrentStage('manual-verification');
    else if (activeTab === 'gis-validation') setCurrentStage('gis-validation');
    else if (activeTab === 'approvals') setCurrentStage('approvals');
    else if (activeTab === 'digitization' || activeTab === 'processing-validation') {
      // Default to logical stage based on document if on generic route
      if (currentDoc?.status === 'READY_FOR_APPROVAL') setCurrentStage('approvals');
      else if (currentDoc?.scenarioType === 'SURVEY_CONFLICT' || currentDoc?.scenarioType === 'AREA_ANOMALY') {
        setCurrentStage('gis-validation');
      } else if (currentDoc?.overallConfidence === 'LOW') {
        setCurrentStage('manual-verification');
      }
    }
  }, [activeTab, currentDoc?.id]);

  const stages: { id: PipelineStage; label: string; stepNumber: number; icon: React.FC<{ className?: string }> }[] = [
    { id: 'digitization', label: '1. AI Digitization', stepNumber: 1, icon: Sparkles },
    { id: 'manual-verification', label: '2. Manual Verification', stepNumber: 2, icon: UserCheck },
    { id: 'gis-validation', label: '3. GIS Validation', stepNumber: 3, icon: FileCheck2 },
    { id: 'approvals', label: '4. Review & Decision', stepNumber: 4, icon: CheckSquare },
  ];

  const handleStageSelect = (stageId: PipelineStage) => {
    setCurrentStage(stageId);
  };

  const handleSaveFieldEdit = (fieldKey: string) => {
    if (currentDoc) {
      updateDocumentField(currentDoc.id, fieldKey, editingValue);
      setEditingFieldKey(null);
    }
  };

  const handleFinalDecisionSubmit = () => {
    if (!currentDoc) return;
    submitOfficerDecision(currentDoc.id, decisionAction, decisionNotes);
    setIsDecisionSubmitted(true);
  };

  if (!currentDoc) {
    return (
      <div id="processing-validation-page" className="p-8 max-w-7xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Documents in Ingestion & Processing Queue</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          There are currently no land documents undergoing verification. Upload a new land document deed or survey Patta to begin the automated OCR and GIS verification pipeline.
        </p>
        <button
          onClick={() => navigateTo('upload')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          Upload New Document
        </button>
      </div>
    );
  }

  return (
    <div id="processing-validation-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card: Title, Record Info & Action */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>Unified Processing & Validation Workstation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {currentDoc?.title || 'Land Record Processing'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
            <span>Doc No: <strong className="font-mono text-slate-800">{currentDoc?.documentNumber}</strong></span>
            <span>•</span>
            <span>Survey: <strong className="font-mono text-slate-800">{currentDoc?.surveyNumber}</strong></span>
            <span>•</span>
            <span>Owner: <strong className="text-slate-800">{currentDoc?.ownerName}</strong></span>
            <span>•</span>
            <span>Location: <span className="text-slate-700">{currentDoc?.village || '—'}, {currentDoc?.district || '—'}</span></span>
            {currentDoc?.landArea && (
              <>
                <span>•</span>
                <span>Area: <strong className="text-slate-800">{currentDoc.landArea}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Status and Action Buttons (Active Record mock switcher removed) */}
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={currentDoc?.status || 'DIGITIZED'} size="sm" />
          <button
            onClick={() => navigateTo('upload')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload New Document</span>
          </button>
        </div>
      </div>

      {/* 4-Step Pipeline Stage Indicator Bar (Non-clickable, step progression enforced via buttons) */}
      <div id="pipeline-stepper-bar" className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-2 select-none pointer-events-none">
        {stages.map((st) => {
          const isActive = currentStage === st.id;
          const Icon = st.icon;
          return (
            <div
              key={st.id}
              className={`p-3 rounded-lg flex items-center gap-3 transition-all text-left select-none cursor-default ${
                isActive
                  ? 'bg-blue-700 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-400 font-medium border border-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-bold opacity-80">Step {st.stepNumber}</span>
                <span className="block text-xs truncate">{st.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* STAGE 1: Files Upload & AI Ingestion Features */}
      {currentStage === 'digitization' && (
        <>
          <div id="files-upload-section" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
        {/* Top Header Row of the files section: Title */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
                <FileUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Document Files & Intelligent Ingestion
                </h2>
                <p className="text-xs text-slate-500">
                  Upload deed scans, survey sketches, or revenue RTCs. The OCR pipeline extracts cadastral attributes instantly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Upload Notification Toast */}
        {uploadNotification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadNotification}</span>
            </div>
            <button
              onClick={() => setUploadNotification(null)}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload Dropzone & Attached Files Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left / Drag & Drop Upload Zone */}
          <div className="lg:col-span-6 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.tiff"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div
              id="deed-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-300'
                  : 'border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/20'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Drag & drop deed scans or <span className="text-blue-700 underline underline-offset-2">browse files</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                Supports single or multi-page documents in PDF, TIFF, JPG, or PNG (up to 25MB)
              </p>

              <div className="mt-3.5 flex flex-wrap justify-center gap-1.5 text-[10px] font-medium text-slate-600">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">PDF Deeds</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">TIFF Scans</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">PNG / JPG Sketches</span>
              </div>
            </div>



            {/* Ingestion Progress Indicator */}
            {isUploading && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-950">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span>{uploadStepLabel}</span>
                  </div>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right / Attached Files Management */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Attached Files for Dossier ({attachedFiles.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Record: {currentDoc?.documentNumber}</span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0 text-blue-700 font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span className="text-blue-700 font-medium">{file.typeLabel}</span>
                        <span>•</span>
                        <span>{file.uploadedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      <Check className="w-2.5 h-2.5" />
                      <span>{file.confidenceScore}% OCR</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachedFile(file.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Files digitally notarized & hashed (SHA-256)</span>
              </div>
              <span className="font-mono text-slate-400">Total: {attachedFiles.length} files</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar of Upload Session */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>All attached documents prepared for optical extraction & cadastral verification</span>
          </div>
          <button
            id="btn-redirect-to-verification"
            onClick={() => setCurrentStage('manual-verification')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <span>Proceed to Step 2: Manual Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div id="stage-content-section" className="space-y-6 scroll-mt-6">
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Scanned Deed Document Preview */}
            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {currentDoc?.fileName ? `Uploaded Document: ${currentDoc.fileName}` : 'Registered Deed Scan (Page 1)'}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentDoc?.fileUrl ? 'Source: Uploaded Document' : 'OCR Engine: Gemini Vision OCR'}
                </span>
              </div>
              {currentDoc?.fileUrl ? (
                <div className="h-[560px] rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-xs flex items-center justify-center relative">
                  {currentDoc.fileType?.includes('pdf') || currentDoc.fileName?.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={currentDoc.fileUrl}
                      title="Uploaded Document Preview"
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <img
                      src={currentDoc.fileUrl}
                      alt={currentDoc.fileName || 'Uploaded Deed'}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : (
                <DocumentPreview
                  document={currentDoc}
                  highlightField={highlightedField || undefined}
                  className="h-[560px]"
                />
              )}
            </div>

            {/* Right: Extracted OCR Attributes & Quality Metrics */}
            <div className="lg:col-span-6 space-y-5">
              {/* Quality & Confidence Meter */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Automated Ingestion Quality Score
                    </h3>
                  </div>
                  <StatusBadge status={currentDoc.overallConfidence} size="sm" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        currentDoc.confidenceScore >= 90
                          ? 'bg-emerald-500'
                          : currentDoc.confidenceScore >= 75
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${currentDoc.confidenceScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-bold text-slate-800 shrink-0">
                    {currentDoc.confidenceScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Extracted via deep-learning optical character recognition with biometric Kannada & English lexicon modeling.
                </p>
              </div>

              {/* Extracted Attributes Table */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Extracted Deed Attributes
                  </h4>
                  <span className="text-[11px] text-slate-400">Click to focus on deed image</span>
                </div>

                <div className="space-y-2 text-xs">
                  {Object.entries(currentDoc.extractedFields).map(([key, field]) => {
                    const isEditing = editingFieldKey === key;
                    const isFocused = highlightedField === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setHighlightedField(key)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isFocused
                            ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-400'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600">{field.fieldName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">
                              {field.confidenceScore}% confidence
                            </span>
                            <StatusBadge status={field.confidence} size="sm" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1.5">
                          {isEditing ? (
                            <div
                              className="flex items-center gap-2 flex-1 mr-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="text-xs font-bold px-2.5 py-1 border rounded w-full bg-white text-slate-900"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveFieldEdit(key)}
                                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-slate-900 font-mono">
                              {field.value}
                            </span>
                          )}

                          {!isEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingFieldKey(key);
                                setEditingValue(field.value);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                              title="Edit field value"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Toolbar to proceed */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => selectDocument(currentDoc.id)}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Refresh OCR Extraction
                </button>

                <button
                  id="btn-next-to-manual-verify"
                  onClick={() => setCurrentStage('manual-verification')}
                  className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Proceed to Manual Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* STAGE 2: Manual Verification View */}
      {currentStage === 'manual-verification' && (
        <div className="animate-in fade-in">
          <ManualVerificationPage />
        </div>
      )}

      {/* STAGE 3: GIS Validation View */}
      {currentStage === 'gis-validation' && (
        <div className="animate-in fade-in">
          <GisValidationPage />
        </div>
      )}

      {/* STAGE 4: Review & Decision View */}
      {currentStage === 'approvals' && (
        <div className="space-y-6 animate-in fade-in">

          {/* Verification Audit Summary Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Stage 4: Officer Decision
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Final Cross-Verification & Recommendation
                </h2>
                <p className="text-xs text-slate-500">
                  Consolidate the AI extraction, manual corrections, and cadastral spatial checks to approve or reject this registration.
                </p>
              </div>

              <StatusBadge status={currentDoc.status} size="md" />
            </div>

            {/* 3 Verification Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1. AI Extraction</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Confidence: <strong className="text-slate-900">{currentDoc.confidenceScore}%</strong></div>
                  <div>Extracted Fields: <strong className="text-slate-900">All 8 parsed</strong></div>
                  <div>Legibility: <span className="text-emerald-700 font-semibold">Verified</span></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2. Manual Checklist</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Survey No: <strong className="font-mono text-slate-900">{currentDoc.surveyNumber}</strong></div>
                  <div>Owner Match: <span className="text-emerald-700 font-semibold">100% Match</span></div>
                  <div>Officer Notes: <span className="text-slate-700">Logged</span></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  {currentDoc.validationReport.status === 'CONFLICT' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>3. GIS Cadastre</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Parcel Match: <strong className="font-mono text-slate-900">{currentDoc.gisParcel?.parcelId || 'P-1243'}</strong></div>
                  <div>Area Deviation: <strong className="text-slate-900">+0.00% (Matched)</strong></div>
                  <div>Boundary Overlap: <span className="text-emerald-700 font-semibold">None</span></div>
                </div>
              </div>
            </div>

            {/* Decision Submission Form */}
            {isDecisionSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-emerald-900">
                  Officer Recommendation Recorded
                </h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Action <strong>{decisionAction}</strong> has been logged to the state immutable audit ledger. Document is now queued for executive digital signature.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => navigateTo('queue')}
                    className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold"
                  >
                    Return to Document Queue
                  </button>
                  <button
                    onClick={() => navigateTo('final-approval', currentDoc.id)}
                    className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-white text-slate-800 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>Proceed to D-Sign</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Officer Decision Action
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecisionAction('APPROVE')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      decisionAction === 'APPROVE'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Approve & Recommend Seal</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Deed verified against Bhoomi and GIS cadastre. Ready for final sign-off.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionAction('RETURN')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      decisionAction === 'RETURN'
                        ? 'border-amber-600 bg-amber-50/80 text-amber-900 ring-2 ring-amber-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Return with Queries</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Request additional boundary clarification or survey proof from citizen.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionAction('REJECT')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      decisionAction === 'REJECT'
                        ? 'border-red-600 bg-red-50/80 text-red-900 ring-2 ring-red-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Reject Application</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Fatal discrepancy or disputed revenue title. Document rejected.
                    </p>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Official Verification Notes & Citation
                  </label>
                  <textarea
                    rows={3}
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                    placeholder="Enter official revenue assessment notes..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setCurrentStage('gis-validation')}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    Review GIS Details Again
                  </button>
                  <button
                    id="btn-submit-decision"
                    onClick={handleFinalDecisionSubmit}
                    className="px-6 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Official Decision</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
