/**
 * OfficerUploadPage.tsx
 * Two-column processing workstation:
 *   LEFT  — persistent document preview (real file or demo card)
 *   RIGHT — 4-stage pipeline: AI Digitization → Manual Verification → GIS Validation → Decision
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Edit2,
  FileCheck2,
  FileText,
  FileUp,
  Info,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import {
  PIPELINE_STAGES,
  extractDocumentFields,
  type OcrExtractedField,
  type OcrPipelineState,
  type OcrResult,
} from '../../services/ocrService';
import type { ExtractedField, LandDocument } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type PagePhase =
  | 'upload'
  | 'ocr-running'
  | 'ocr-complete'
  | 'digitization'
  | 'manual-verification'
  | 'gis-validation'
  | 'review-decision'
  | 'submitted';

type PipelineStageId = 'digitization' | 'manual-verification' | 'gis-validation' | 'review-decision';
type DecisionAction  = 'APPROVE' | 'RETURN' | 'REJECT';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.tiff,.tif,.webp';
const MAX_SIZE_MB    = 25;

const PHASE_ORDER: PagePhase[] = [
  'upload','ocr-running','ocr-complete',
  'digitization','manual-verification','gis-validation','review-decision','submitted',
];

const PIPELINE_STEPS: { id: PipelineStageId; phase: PagePhase; label: string; Icon: React.ElementType }[] = [
  { id: 'digitization',        phase: 'digitization',        label: '1. AI Digitization',    Icon: Sparkles    },
  { id: 'manual-verification', phase: 'manual-verification', label: '2. Manual Verification', Icon: UserCheck   },
  { id: 'gis-validation',      phase: 'gis-validation',      label: '3. GIS Validation',      Icon: FileCheck2  },
  { id: 'review-decision',     phase: 'review-decision',     label: '4. Review & Decision',   Icon: CheckSquare },
];

const VALID_DOC_TYPES: LandDocument['documentType'][] = [
  'Sale Deed','Patta / RoR','Gift Deed','Partition Deed','Inheritance Title',
];

const FIELD_CONFIG: [string, keyof OcrResult, boolean][] = [
  ['Document Type',  'documentType',  false],
  ['Owner Name',     'ownerName',     false],
  ['Survey Number',  'surveyNumber',  true ],
  ['Village',        'village',       false],
  ['Taluk',          'taluk',         false],
  ['District',       'district',      false],
  ['Land Area',      'landArea',      true ],
  ['Execution Date', 'executionDate', true ],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

function confBar(s: number) {
  if (s >= 85) return 'bg-emerald-500';
  if (s >= 60) return 'bg-amber-400';
  return 'bg-red-400';
}

function toExtractedField(fieldName: string, fieldKey: string, ocr: OcrExtractedField): ExtractedField {
  return { fieldName, fieldKey, value: ocr.value, confidence: ocr.confidence, confidenceScore: ocr.score, isVerified: false };
}

function buildGisMock(surveyNumber: string, landArea: string) {
  const docArea = parseFloat(landArea.replace(/[^0-9.]/g, '')) || 2.10;
  const conflict = /[89]A?$/.test(surveyNumber.trim());
  const gisArea  = conflict ? +(docArea * 0.91).toFixed(2) : +docArea.toFixed(2);
  return {
    parcelId: `P-${surveyNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '1244'}`,
    gisArea: gisArea.toFixed(2), docArea: docArea.toFixed(2),
    areaMatch: !conflict, boundaryStatus: conflict ? 'CONFLICT' : 'VERIFIED',
    landUse: 'Dryland Agricultural', spatialConflict: conflict,
    encroachmentRisk: conflict ? 'MEDIUM' : 'LOW',
    coordinates: `N 13°04'11" E 77°47'33"`,
  };
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────

interface FieldRowProps {
  label: string; fieldKey: string; field: OcrExtractedField; mono?: boolean;
  onEdit: (k: string) => void; onSave: (k: string, v: string) => void;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, fieldKey, field, mono, onEdit, onSave }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50/70 transition-colors">
      {/* Label + bar */}
      <div className="w-[130px] shrink-0">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block leading-tight">{label}</span>
        <div className="flex items-center gap-1 mt-1">
          <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${confBar(field?.score ?? 0)}`} style={{ width: `${field?.score ?? 0}%`, transition:'width .6s' }} />
          </div>
          <span className="text-[10px] font-mono text-slate-400 shrink-0">{field?.score ?? 0}%</span>
        </div>
      </div>
      {/* Value */}
      <div className="flex-1 min-w-0">
        {field?.isEditing ? (
          <div className="flex items-center gap-1.5">
            <input ref={ref} type="text" defaultValue={field.value} autoFocus
              className={`flex-1 px-2 py-1 text-sm border border-blue-500 rounded outline-none ${mono?'font-mono':'font-semibold'}`}
              onKeyDown={e => {
                if (e.key==='Enter') onSave(fieldKey,(e.target as HTMLInputElement).value);
                if (e.key==='Escape') onSave(fieldKey,field.value);
              }} />
            <button onClick={()=>onSave(fieldKey,ref.current?.value??field.value)} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"><Check className="w-3 h-3"/></button>
            <button onClick={()=>onSave(fieldKey,field.value)} className="p-1.5 bg-slate-200 rounded hover:bg-slate-300"><X className="w-3 h-3"/></button>
          </div>
        ) : (
          <span className={`text-sm text-slate-900 ${mono?'font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200':'font-semibold'}`}>
            {field?.value || <span className="italic text-slate-400 font-normal text-xs">Not detected</span>}
          </span>
        )}
      </div>
      {/* Badge + edit */}
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={field?.confidence ?? 'LOW'} size="sm" />
        {!field?.isEditing && (
          <button onClick={()=>onEdit(fieldKey)} className="text-[11px] text-blue-700 hover:text-blue-900 font-medium flex items-center gap-0.5 transition-colors">
            <Edit2 className="w-3 h-3"/>Edit
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Document Preview Panel (LEFT column) ────────────────────────────────────

interface DocPreviewPanelProps {
  file: File | null;
  fileObjectUrl: string | null;
  fields: OcrResult;
  ocrResult: OcrResult | null;
}

const DocPreviewPanel: React.FC<DocPreviewPanelProps> = ({ file, fileObjectUrl, fields, ocrResult }) => {
  const isImg = file ? /\.(jpg|jpeg|png|webp|tiff?)$/i.test(file.name) : false;
  const isPdf = file ? /\.pdf$/i.test(file.name) : false;
  const fv = (k: string) => ((fields as unknown as Record<string,OcrExtractedField>)[k]?.value ?? '');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col h-full min-h-[520px]">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 shrink-0">
        <div className="min-w-0">
          <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">
            Uploaded Document
          </span>
          <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
            {file?.name ?? 'No file selected'}
          </p>
          {file
            ? <p className="text-xs text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
            : <p className="text-xs text-slate-400 mt-0.5">Please upload a document</p>
          }
        </div>
        {ocrResult && (
          <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            ocrResult.overallConfidence >= 85 ? 'bg-emerald-100 text-emerald-700' :
            ocrResult.overallConfidence >= 60 ? 'bg-amber-100 text-amber-700'    : 'bg-red-100 text-red-600'
          }`}>OCR {ocrResult.overallConfidence}%</span>
        )}
      </div>

      {/* ── Preview area ── */}
      <div className="flex-1 min-h-0 my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
        {fileObjectUrl && isImg && (
          <img src={fileObjectUrl} alt="Document preview" className="w-full h-full object-contain" />
        )}
        {fileObjectUrl && isPdf && (
          <iframe src={fileObjectUrl} title="Document Preview" className="w-full h-full border-0" />
        )}
        {!fileObjectUrl && (
          <div className="flex items-center justify-center h-full text-slate-500 italic">
            No document selected – preview will appear here.
          </div>
        )}
      </div>

      {/* ── Extracted field mini-summary ── */}
      {ocrResult && (
        <div className="shrink-0 grid grid-cols-2 gap-1.5">
          {[
            ['Survey', fv('surveyNumber')],
            ['Owner',  fv('ownerName')],
            ['Area',   fv('landArea')],
            ['Type',   fv('documentType')],
          ].map(([label, value]) => (
            <div key={label} className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2 min-w-0">
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">{label}</p>
              <p className="text-[11px] font-semibold text-slate-800 truncate mt-0.5">{value || '—'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const OfficerUploadPage: React.FC = () => {
  const { uploadNewDocument, navigateTo, selectDocument, saveManualVerification, submitOfficerDecision } = useApp();

  // ── File ──
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const [fileError, setFileError]       = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── OCR ──
  const [pipelineState, setPipelineState] = useState<OcrPipelineState>({ stage:'idle', stageIndex:-1, message:'' });
  const [ocrResult, setOcrResult]         = useState<OcrResult | null>(null);
  const emptyFields: OcrResult = {
    documentType: {value:'', score:0, confidence:'LOW', isEditing:false},
    ownerName: {value:'', score:0, confidence:'LOW', isEditing:false},
    surveyNumber: {value:'', score:0, confidence:'LOW', isEditing:false},
    village: {value:'', score:0, confidence:'LOW', isEditing:false},
    taluk: {value:'', score:0, confidence:'LOW', isEditing:false},
    district: {value:'', score:0, confidence:'LOW', isEditing:false},
    landArea: {value:'', score:0, confidence:'LOW', isEditing:false},
    executionDate: {value:'', score:0, confidence:'LOW', isEditing:false},
    overallConfidence: 0,
    rawText: '',
    isDemo: false,
  };
  const [fields, setFields] = useState<OcrResult>(emptyFields);

  // ── Page phase ──
  const [pagePhase, setPagePhase] = useState<PagePhase>('upload');
  const [countdown, setCountdown] = useState(2);

  // ── Created document ──
  const [createdDocId, setCreatedDocId] = useState<string | null>(null);

  // ── Stage 2 ──
  const [verifiedFields, setVerifiedFields] = useState<Record<string,boolean>>({});
  const [verificationNotes, setVerificationNotes] = useState('All fields cross-checked against revenue volume register and Bhoomi database.');

  // ── Stage 3 ──
  type GisMock = ReturnType<typeof buildGisMock>;
  const [gisMock, setGisMock]   = useState<GisMock | null>(null);
  const [gisAction, setGisAction] = useState<'ACCEPT'|'FLAG'|null>(null);

  // ── Stage 4 ──
  const [decisionAction, setDecisionAction] = useState<DecisionAction>('APPROVE');
  const [decisionNotes, setDecisionNotes]   = useState('All deed metadata, spatial parcel boundaries and land records cross-verified and confirmed for digital certification.');
  const [isSubmitting, setIsSubmitting]     = useState(false);

  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() ?? '';
  const hasApiKey = Boolean(apiKey) && apiKey !== 'your_gemini_api_key_here';

  // ── Create file object URL for preview ──
  useEffect(() => {
    if (!selectedFile) { setFileObjectUrl(null); return; }
    const url = URL.createObjectURL(selectedFile);
    setFileObjectUrl(url);
  }, [selectedFile]);

  // ── OCR-complete quick auto-redirect to Processing & Validation workstation ──
  useEffect(() => {
    if (pagePhase !== 'ocr-complete') return;
    setCountdown(1);
    const tm = setTimeout(() => {
      navigateTo('processing-validation');
    }, 600);
    return () => { clearTimeout(tm); };
  }, [pagePhase, navigateTo]);

  // ── File validation ──
  const validateFile = (f: File): string | null => {
    if (f.size / (1024*1024) > MAX_SIZE_MB) return `File too large. Max ${MAX_SIZE_MB} MB.`;
    const ok = ['application/pdf','image/jpeg','image/jpg','image/png','image/tiff','image/webp'];
    if (!ok.includes(f.type) && !f.name.match(/\.(pdf|jpg|jpeg|png|tiff|tif|webp)$/i)) return 'Unsupported format.';
    return null;
  };
  const handleFileSelect = (f: File) => { const e=validateFile(f); setFileError(e); setSelectedFile(e?null:f); };
  const handleDrop = useCallback((e:React.DragEvent)=>{ e.preventDefault(); setIsDragging(false); const f=e.dataTransfer.files?.[0]; if(f) handleFileSelect(f); },[]);

  // ── Field editing (Stage 1) ──
  const editField = (k:string)=>setFields(p=>({...p,[k]:{...(p as Record<string,OcrExtractedField>)[k],isEditing:true}}));
  const saveField = (k:string,v:string)=>setFields(p=>({...p,[k]:{...(p as Record<string,OcrExtractedField>)[k],value:v,isEditing:false}}));
  const fv = (k:string)=>((fields as unknown as Record<string,OcrExtractedField>)[k]?.value??'');

  // ── Start OCR ──
  const handleStartOcr = async () => {
    if (!selectedFile) return;
    setPagePhase('ocr-running');
    const result = await extractDocumentFields(selectedFile, setPipelineState);
    setOcrResult(result);
    setFields(result);

    const extractedFields: LandDocument['extractedFields'] = {
      documentType:  toExtractedField('Document Type',  'documentType',  result.documentType),
      ownerName:     toExtractedField('Owner Name',     'ownerName',     result.ownerName),
      surveyNumber:  toExtractedField('Survey Number',  'surveyNumber',  result.surveyNumber),
      village:       toExtractedField('Village',        'village',       result.village),
      taluk:         toExtractedField('Taluk',          'taluk',         result.taluk),
      district:      toExtractedField('District',       'district',      result.district),
      landArea:      toExtractedField('Land Area',      'landArea',      result.landArea),
      executionDate: toExtractedField('Execution Date', 'executionDate', result.executionDate),
    };

    const safeDocType = VALID_DOC_TYPES.includes(result.documentType.value as LandDocument['documentType'])
      ? result.documentType.value as LandDocument['documentType'] : result.documentType.value as LandDocument['documentType'];

    const docId = uploadNewDocument({
      title:         `${result.documentType.value||'Land Deed'} — Survey ${result.surveyNumber.value||'N/A'}`,
      documentType:  safeDocType,
      ownerName:     result.ownerName.value,
      surveyNumber:  result.surveyNumber.value,
      village:       result.village.value,
      taluk:         result.taluk.value,
      district:      result.district.value,
      landArea:      result.landArea.value,
      extractedFields,
      cadastralDetails: result.cadastralDetails,
      fileUrl:       fileObjectUrl || undefined,
      fileName:      selectedFile.name,
      fileSize:      formatBytes(selectedFile.size),
      fileType:      selectedFile.type,
    });
    setCreatedDocId(docId);
    selectDocument(docId);

    const init: Record<string,boolean> = {};
    FIELD_CONFIG.forEach(([,k])=>{ init[k as string]=false; });
    setVerifiedFields(init);
    setGisMock(buildGisMock(result.surveyNumber.value, result.landArea.value));
    setPagePhase('ocr-complete');
  };

  const handleVerificationComplete = () => { if(createdDocId) saveManualVerification(createdDocId, verificationNotes); setPagePhase('gis-validation'); };
  const handleGisDecision = (a:'ACCEPT'|'FLAG') => { setGisAction(a); setPagePhase('review-decision'); };
  const handleDecisionSubmit = () => {
    if (!createdDocId) return;
    setIsSubmitting(true);
    submitOfficerDecision(createdDocId, decisionAction, decisionNotes, `Pipeline complete. GIS: ${gisAction}.`);
    setTimeout(()=>{ setIsSubmitting(false); setPagePhase('submitted'); setTimeout(()=>navigateTo('queue'),2000); }, 900);
  };
  const handleReset = () => {
    setSelectedFile(null); setFileObjectUrl(null); setFileError(null);
    setOcrResult(null); setFields(emptyFields); setPipelineState({stage:'idle',stageIndex:-1,message:''});
    setCreatedDocId(null); setVerifiedFields({}); setGisMock(null); setGisAction(null); setIsSubmitting(false);
    setPagePhase('upload');
  };

  const allVerified    = Object.keys(verifiedFields).length>0 && Object.values(verifiedFields).every(Boolean);
  const isPipelinePhase = ['digitization','manual-verification','gis-validation','review-decision'].includes(pagePhase);

  const gisChecks = gisMock ? [
    { label:'Area Match (Deed vs GIS)',      ok:gisMock.areaMatch,                   detail: gisMock.areaMatch ? `Doc ${gisMock.docArea} ac matches GIS ${gisMock.gisArea} ac` : `Discrepancy: doc ${gisMock.docArea} ac vs GIS ${gisMock.gisArea} ac` },
    { label:'Boundary Conflict Check',       ok:gisMock.boundaryStatus==='VERIFIED',  detail: gisMock.boundaryStatus==='VERIFIED' ? 'No encroachment on adjacent parcels' : 'Boundary overlap detected — field inspection required' },
    { label:'Encroachment Risk',             ok:['LOW','NONE'].includes(gisMock.encroachmentRisk), detail:`Risk level: ${gisMock.encroachmentRisk}` },
    { label:'Survey Number Registry Match',  ok:true,                                detail:`Survey ${fv('surveyNumber')||'N/A'} found in village cadastral register` },
  ] : [];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div id="officer-upload-page" className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5">

      {/* ── Page Header ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wide">
          <FileUp className="w-4 h-4" />
          <span>{isPipelinePhase ? 'Processing & Validation Pipeline' : 'Automated Ingestion Pipeline'}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          {isPipelinePhase ? 'Land Document Processing Workstation' : 'Land Document Upload & OCR Extraction'}
        </h1>
        {!isPipelinePhase && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload official revenue deeds (PDF, JPG, PNG, TIFF up to 25 MB). AI Vision OCR extracts structured attributes, then the 4-stage processing pipeline launches automatically.
          </p>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* UPLOAD DROPZONE                                               */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {pagePhase === 'upload' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div id="officer-dropzone"
            onDrop={handleDrop}
            onDragOver={e=>{e.preventDefault();setIsDragging(true);}}
            onDragLeave={()=>setIsDragging(false)}
            onClick={()=>fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center gap-3 select-none ${
              isDragging   ? 'border-blue-500 bg-blue-50 scale-[1.01]' :
              selectedFile ? 'border-emerald-400 bg-emerald-50/30'     :
                             'border-blue-300 hover:border-blue-500 bg-blue-50/20 hover:bg-blue-50/50'
            }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xs ${selectedFile ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              {selectedFile ? <CheckCircle2 className="w-9 h-9" /> : <FileUp className="w-9 h-9" />}
            </div>
            {selectedFile ? (
              <>
                <h3 className="text-base font-bold text-emerald-800">File selected — ready to process</h3>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 rounded-lg shadow-xs text-sm">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate max-w-xs">{selectedFile.name}</span>
                  <span className="text-slate-400 text-xs shrink-0">{formatBytes(selectedFile.size)}</span>
                  <button onClick={e=>{e.stopPropagation();setSelectedFile(null);setFileError(null);}} className="ml-1 p-0.5 rounded-full text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4"/></button>
                </div>
                <p className="text-xs text-slate-500">Click to replace</p>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-slate-800">{isDragging ? 'Drop your deed file here' : 'Drag & drop a land deed, or click to browse'}</h3>
                <p className="text-xs text-slate-500">PDF, TIFF, JPG, PNG — up to 25 MB</p>
                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  {['PDF Deeds','TIFF Scans','PNG / JPG Sketches'].map(t=>(
                    <span key={t} className="text-[11px] bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-500 font-mono">{t}</span>
                  ))}
                </div>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES} className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleFileSelect(f);}} />
          {fileError && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0"/>{fileError}
            </div>
          )}
          {!selectedFile && <p className="text-xs text-slate-400 text-center">Please select a land document file to begin OCR processing.</p>}
          <div className="flex justify-center">
            <button id="btn-start-ocr" onClick={handleStartOcr} disabled={!selectedFile || !!fileError}
              className="px-8 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-xs transition-colors flex items-center gap-2">
              <Sparkles className="w-4 h-4"/>
              Request for Digitalization
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* OCR RUNNING                                                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {pagePhase === 'ocr-running' && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 animate-spin"/>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Processing Land Document</h2>
            <p className="text-xs text-slate-500 mt-1 min-h-[1.5rem]">{pipelineState.message}</p>
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            {PIPELINE_STAGES.map((st,idx)=>{
              const done=pipelineState.stageIndex>idx; const cur=pipelineState.stageIndex===idx;
              return (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${done?'bg-emerald-50 border-emerald-300':cur?'bg-blue-50 border-blue-400 ring-1 ring-blue-300':'bg-slate-50 border-slate-200 opacity-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done?'bg-emerald-600 text-white':cur?'bg-blue-600 text-white animate-pulse':'bg-slate-200 text-slate-400'}`}>{done?'✓':idx+1}</div>
                    <div><span className="font-bold text-xs block">{st.title}</span><span className="text-[11px] text-slate-500">{st.desc}</span></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 shrink-0">{done?'Done':cur?'Running…':'Pending'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* OCR COMPLETE — 2s countdown                                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {pagePhase === 'ocr-complete' && ocrResult && (
        <div className="bg-white rounded-xl border border-emerald-200 p-8 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"><CheckCircle2 className="w-9 h-9"/></div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide mb-2">OCR Extraction Complete</span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{ocrResult.documentType.value||'Land Deed'} — {ocrResult.overallConfidence}% Confidence</h2>
            <p className="text-sm text-slate-500 mt-1">AI Vision OCR extracted all 8 fields. Launching processing pipeline in <strong className="text-blue-700 text-base">{countdown}s</strong>…</p>
          </div>
          <div className="flex justify-center">
            <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{width:'100%',transition:'width 2.2s linear'}}/>
            </div>
          </div>
          <p className="text-xs text-slate-400">AI Digitization → Manual Verification → GIS Validation → Review &amp; Decision</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* PIPELINE SECTION — tabs + 2-column layout                     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isPipelinePhase && (
        <>
          {/* Stage tabs — full width */}
          <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs flex gap-1 overflow-x-auto">
            {PIPELINE_STEPS.map(step=>{
              const pi=PHASE_ORDER.indexOf(step.phase); const ci=PHASE_ORDER.indexOf(pagePhase);
              const done=ci>pi; const active=pagePhase===step.phase;
              const {Icon}=step;
              return (
                <button key={step.id} onClick={()=>{if(done)setPagePhase(step.phase);}} disabled={!done&&!active}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all min-w-[130px] ${
                    active ? 'bg-blue-700 text-white shadow-xs' :
                    done   ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer' :
                             'text-slate-400 cursor-not-allowed opacity-50'
                  }`}>
                  {done&&!active ? <Check className="w-3.5 h-3.5 shrink-0"/> : <Icon className="w-3.5 h-3.5 shrink-0"/>}
                  <span className="whitespace-nowrap">{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/*   2-COLUMN GRID                                          */}
          {/*   LEFT:  document preview  |  RIGHT: stage content       */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

            {/* ── LEFT COLUMN: persistent document preview ── */}
            <DocPreviewPanel
              file={selectedFile}
              fileObjectUrl={fileObjectUrl}
              fields={fields}
              ocrResult={ocrResult}
            />

            {/* ── RIGHT COLUMN: stage-specific content ── */}
            <div>

              {/* ─── STAGE 1 — AI DIGITIZATION ─── */}
              {pagePhase === 'digitization' && ocrResult && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
                  {/* Header */}
                  <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-blue-600"/>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Stage 1 — AI Digitization</span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Extracted Fields</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Review all OCR fields. Click <strong>Edit</strong> to correct errors.</p>
                      </div>
                      <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-bold ${ocrResult.overallConfidence>=85?'bg-emerald-100 text-emerald-800':ocrResult.overallConfidence>=60?'bg-amber-100 text-amber-800':'bg-red-100 text-red-700'}`}>
                        {ocrResult.overallConfidence}% confidence
                      </span>
                    </div>
                  </div>

                  {/* Field rows */}
                  <div className="divide-y divide-slate-100 flex-1">
                    {FIELD_CONFIG.map(([label,key,mono])=>(
                      <FieldRow key={key as string} label={label} fieldKey={key as string}
                        field={(fields as unknown as Record<string,OcrExtractedField>)[key as string]}
                        mono={mono} onEdit={editField} onSave={saveField} />
                    ))}
                  </div>

                  {/* Raw text */}
                  {ocrResult.rawText && (
                    <div className="px-5 py-3 border-t border-slate-100">
                      <details>
                        <summary className="text-xs text-slate-500 hover:text-blue-700 cursor-pointer font-medium flex items-center gap-1.5 select-none">
                          <FileText className="w-3.5 h-3.5"/>Show raw OCR text
                        </summary>
                        <pre className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">{ocrResult.rawText}</pre>
                      </details>
                    </div>
                  )}

                  <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
                    <button onClick={()=>setPagePhase('manual-verification')}
                      className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors">
                      Confirm Digitization<ArrowRight className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STAGE 2 — MANUAL VERIFICATION ─── */}
              {pagePhase === 'manual-verification' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-4 h-4 text-blue-600"/>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Stage 2 — Manual Verification</span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Officer Cross-Verification</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Compare each field against the original deed. Tick once confirmed.</p>
                  </div>

                  <div className="px-5 py-4 space-y-2">
                    {FIELD_CONFIG.map(([label,key])=>{
                      const field=(fields as unknown as Record<string,OcrExtractedField>)[key as string];
                      const ok=verifiedFields[key as string]||false;
                      return (
                        <label key={key as string} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${ok?'bg-emerald-50 border-emerald-200':'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${ok?'bg-emerald-600 border-emerald-600':'border-slate-300 bg-white'}`}>
                            {ok&&<Check className="w-3 h-3 text-white"/>}
                          </div>
                          <input type="checkbox" className="sr-only" checked={ok} onChange={e=>setVerifiedFields(p=>({...p,[key as string]:e.target.checked}))}/>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">{label}</span>
                            <span className={`text-sm font-semibold truncate block ${ok?'text-emerald-800':'text-slate-800'}`}>
                              {field?.value||<span className="italic text-slate-400 font-normal text-xs">Not detected</span>}
                            </span>
                          </div>
                          <StatusBadge status={field?.confidence||'LOW'} size="sm"/>
                        </label>
                      );
                    })}
                  </div>

                  {/* Progress */}
                  <div className="px-5 py-3 border-t border-slate-100">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Verification progress</span>
                      <span className="font-bold">{Object.values(verifiedFields).filter(Boolean).length}/{Object.keys(verifiedFields).length}</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{width:`${(Object.values(verifiedFields).filter(Boolean).length/Math.max(Object.keys(verifiedFields).length,1))*100}%`}}/>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="px-5 py-3 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Officer Notes</label>
                    <textarea value={verificationNotes} onChange={e=>setVerificationNotes(e.target.value)} rows={2}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-400 resize-none"/>
                  </div>

                  <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                    <button onClick={()=>setPagePhase('digitization')} className="text-xs text-slate-500 hover:text-slate-800 font-medium">← Back</button>
                    <button onClick={handleVerificationComplete} disabled={!allVerified}
                      className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors">
                      {!allVerified&&<span className="text-xs opacity-75">Verify all •</span>}
                      Complete<ArrowRight className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STAGE 3 — GIS VALIDATION ─── */}
              {pagePhase === 'gis-validation' && gisMock && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <FileCheck2 className="w-4 h-4 text-blue-600"/>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Stage 3 — GIS Validation</span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Spatial & Cadastral Cross-Check</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Comparing deed attributes against GIS parcel registry and Bhoomi database.</p>
                  </div>

                  {/* Metric cards */}
                  <div className="px-5 pt-4 grid grid-cols-2 gap-2.5">
                    {[
                      {label:'Parcel ID', value:gisMock.parcelId,       mono:true},
                      {label:'GIS Area',  value:`${gisMock.gisArea} ac`, mono:true},
                      {label:'Deed Area', value:`${gisMock.docArea} ac`, mono:true},
                      {label:'Land Use',  value:gisMock.landUse,          mono:false},
                    ].map(({label,value,mono})=>(
                      <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">{label}</p>
                        <p className={`text-sm font-bold text-slate-900 mt-0.5 ${mono?'font-mono':''}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Checks */}
                  <div className="px-5 py-4 space-y-2">
                    {gisChecks.map(({label,ok,detail})=>(
                      <div key={label} className={`flex items-start gap-3 p-3 rounded-xl border ${ok?'bg-emerald-50 border-emerald-200':'bg-red-50 border-red-200'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${ok?'bg-emerald-600':'bg-red-500'}`}>
                          {ok?<Check className="w-3 h-3 text-white"/>:<X className="w-3 h-3 text-white"/>}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${ok?'text-emerald-800':'text-red-800'}`}>{label}</p>
                          <p className={`text-xs mt-0.5 ${ok?'text-emerald-700':'text-red-700'}`}>{detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coordinates */}
                  <div className="px-5 pb-3">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0"/>
                      <span><strong>Centroid:</strong> {gisMock.coordinates} — {fv('village')}, {fv('taluk')}</span>
                    </div>
                  </div>

                  {gisMock.spatialConflict && (
                    <div className="px-5 pb-3">
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"/>
                        <span><strong>Spatial conflict.</strong> Discrepancy of {Math.abs(parseFloat(gisMock.docArea)-parseFloat(gisMock.gisArea)).toFixed(2)} ac. Field inspection recommended.</span>
                      </div>
                    </div>
                  )}

                  <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                    <button onClick={()=>setPagePhase('manual-verification')} className="text-xs text-slate-500 hover:text-slate-800 font-medium">← Back</button>
                    <div className="flex gap-2">
                      {gisMock.spatialConflict && (
                        <button onClick={()=>handleGisDecision('FLAG')} className="px-3.5 py-2 rounded-lg border border-amber-400 text-amber-700 hover:bg-amber-50 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                          <AlertTriangle className="w-3.5 h-3.5"/>Flag
                        </button>
                      )}
                      <button onClick={()=>handleGisDecision('ACCEPT')} className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors">
                        GIS Validated<ArrowRight className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STAGE 4 — REVIEW & DECISION ─── */}
              {pagePhase === 'review-decision' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckSquare className="w-4 h-4 text-blue-600"/>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Stage 4 — Review &amp; Decision</span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Officer Recommendation</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Submit your final recommendation. Approved docs go to Sub-Registrar for signing.</p>
                  </div>

                  {/* Doc summary */}
                  <div className="px-5 pt-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
                      <p className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Document Summary</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {[['Type',fv('documentType')],['Owner',fv('ownerName')],['Survey',fv('surveyNumber')],['Area',fv('landArea')],['Village',fv('village')],['District',fv('district')]].map(([k,v])=>(
                          <div key={k}><span className="text-slate-400">{k}: </span><span className="font-semibold text-slate-800">{v||'—'}</span></div>
                        ))}
                      </div>
                      {gisAction==='FLAG' && (
                        <div className="flex items-center gap-2 pt-2 mt-1 border-t border-slate-200 text-amber-700">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0"/>
                          <span>GIS: Spatial conflict flagged — field inspection recommended</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Decision */}
                  <div className="px-5 pt-4">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">Officer Decision</p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {([
                        {action:'APPROVE'as DecisionAction,label:'Approve', Icon:CheckCircle2,color:'emerald',desc:'→ Sub-Registrar'},
                        {action:'RETURN' as DecisionAction,label:'Return',  Icon:RotateCcw,   color:'amber',  desc:'→ Citizen'},
                        {action:'REJECT' as DecisionAction,label:'Reject',  Icon:X,           color:'red',    desc:'→ Rejected'},
                      ]).map(({action,label,Icon,color,desc})=>{
                        const a=decisionAction===action;
                        return (
                          <label key={action} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${a?(color==='emerald'?'border-emerald-500 bg-emerald-50':color==='amber'?'border-amber-400 bg-amber-50':'border-red-400 bg-red-50'):'border-slate-200 bg-white hover:border-slate-300'}`}>
                            <input type="radio" className="sr-only" checked={a} onChange={()=>setDecisionAction(action)}/>
                            <Icon className={`w-5 h-5 ${a?(color==='emerald'?'text-emerald-600':color==='amber'?'text-amber-600':'text-red-500'):'text-slate-400'}`}/>
                            <span className={`text-xs font-bold ${a?(color==='emerald'?'text-emerald-800':color==='amber'?'text-amber-800':'text-red-700'):'text-slate-700'}`}>{label}</span>
                            <span className="text-[10px] text-slate-400">{desc}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="px-5 pt-4">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Decision Notes</label>
                    <textarea value={decisionNotes} onChange={e=>setDecisionNotes(e.target.value)} rows={3}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-400 resize-none"/>
                  </div>

                  <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between mt-2">
                    <button onClick={()=>setPagePhase('gis-validation')} className="text-xs text-slate-500 hover:text-slate-800 font-medium">← Back</button>
                    <button onClick={handleDecisionSubmit} disabled={isSubmitting}
                      className={`px-5 py-2.5 rounded-lg text-white text-sm font-semibold flex items-center gap-2 shadow-xs disabled:opacity-60 transition-colors ${decisionAction==='APPROVE'?'bg-emerald-700 hover:bg-emerald-800':decisionAction==='RETURN'?'bg-amber-600 hover:bg-amber-700':'bg-red-600 hover:bg-red-700'}`}>
                      {isSubmitting?<><Clock className="w-4 h-4 animate-spin"/>Submitting…</>:<><ShieldCheck className="w-4 h-4"/>Submit: {decisionAction}</>}
                    </button>
                  </div>
                </div>
              )}

            </div>{/* END right column */}
          </div>{/* END 2-col grid */}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SUBMITTED — 2s auto-redirect                                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {pagePhase === 'submitted' && (
        <div className="bg-white rounded-xl border border-emerald-200 p-8 sm:p-10 shadow-xs text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10"/>
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2 ${decisionAction==='APPROVE'?'bg-emerald-100 text-emerald-800':decisionAction==='RETURN'?'bg-amber-100 text-amber-800':'bg-red-100 text-red-700'}`}>
              {decisionAction==='APPROVE'?'Forwarded for Digital Signing':decisionAction==='RETURN'?'Returned to Citizen':'Document Rejected'}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Processing Pipeline Complete</h2>
            <p className="text-sm text-slate-500 mt-1">Decision recorded in audit trail. Redirecting to Document Queue in <strong className="text-blue-700">2s</strong>…</p>
          </div>
          <div className="max-w-xs mx-auto space-y-1.5">
            {['AI Digitization','Manual Verification','GIS Validation','Review & Decision'].map(s=>(
              <div key={s} className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                <Check className="w-3.5 h-3.5 shrink-0"/><span>{s} — Complete</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button onClick={()=>navigateTo('queue')} className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm flex items-center gap-2 shadow-xs transition-colors">
              <FileText className="w-4 h-4"/>Go to Document Queue
            </button>
            <button onClick={handleReset} className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5"/>Upload Another
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
