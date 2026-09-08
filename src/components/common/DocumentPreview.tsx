import React, { useState, useRef } from 'react';
import { LandDocument } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  SunMedium,
  Maximize2,
  FileText,
  ShieldAlert,
  Award,
  Download,
  FileUp,
  ExternalLink,
} from 'lucide-react';

interface DocumentPreviewProps {
  document: LandDocument;
  highlightField?: string;
  showTools?: boolean;
  className?: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  highlightField,
  showTools = true,
  className = '',
}) => {
  const { uploadedFileUrl, uploadedFileName, attachFileToDocument } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 20, 180));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 20, 60));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleToggleContrast = () => setHighContrast((prev) => !prev);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setHighContrast(false);
  };

  const handleAttachPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      attachFileToDocument(document.id, file);
    }
  };

  // Determine effective uploaded file URL
  const effectiveFileUrl = document.fileUrl || (document.id.startsWith('doc-') ? uploadedFileUrl : null);
  const effectiveFileName = document.fileName || (document.id.startsWith('doc-') ? uploadedFileName : null);

  const isPdf = Boolean(
    document.fileType?.includes('pdf') ||
    effectiveFileName?.toLowerCase().endsWith('.pdf') ||
    (effectiveFileUrl && effectiveFileUrl.startsWith('blob:')) // Deed scans in this app are PDFs/images
  );

  const isLowConfidenceScenario = document.scenarioType === 'LOW_CONFIDENCE';
  const isSurveyConflictScenario = document.scenarioType === 'SURVEY_CONFLICT';

  return (
    <div
      id="document-preview-container"
      className={`flex flex-col bg-slate-100 border border-slate-300 rounded-lg overflow-hidden ${className} ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      }`}
    >
      {/* Document Viewer Toolbar */}
      {showTools && (
        <div className="bg-slate-200/90 backdrop-blur border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-medium truncate max-w-xs">
            <FileText className="w-4 h-4 text-slate-600 shrink-0" />
            <span className="font-semibold text-slate-900 truncate">
              {effectiveFileName || document.documentNumber}
            </span>
            <span className="text-slate-500 shrink-0">({document.documentType})</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Direct attach/replace PDF input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.tiff"
              onChange={handleAttachPdf}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors shadow-2xs mr-1"
              title="Attach or replace original scanned PDF document"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>{effectiveFileUrl ? 'Replace PDF' : 'Attach PDF'}</span>
            </button>

            {effectiveFileUrl && (
              <a
                href={effectiveFileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded hover:bg-slate-300 active:bg-slate-400 text-slate-700 transition-colors mr-1"
                title="Open PDF in new browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              id="doc-zoom-out"
              onClick={handleZoomOut}
              aria-label="Zoom Out"
              className="p-1.5 rounded hover:bg-slate-300 active:bg-slate-400 text-slate-700 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-slate-600 font-mono text-[11px] min-w-[40px] text-center">
              {zoom}%
            </span>
            <button
              id="doc-zoom-in"
              onClick={handleZoomIn}
              aria-label="Zoom In"
              className="p-1.5 rounded hover:bg-slate-300 active:bg-slate-400 text-slate-700 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            <button
              id="doc-rotate"
              onClick={handleRotate}
              aria-label="Rotate document"
              className="p-1.5 rounded hover:bg-slate-300 active:bg-slate-400 text-slate-700 transition-colors"
              title="Rotate 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              id="doc-high-contrast"
              onClick={handleToggleContrast}
              aria-label="Toggle optical enhancement filter"
              className={`p-1.5 rounded transition-colors ${
                highContrast
                  ? 'bg-slate-800 text-amber-300 font-bold'
                  : 'hover:bg-slate-300 text-slate-700'
              }`}
              title="Optical Enhancement (Invert / Contrast for faded ink)"
            >
              <SunMedium className="w-3.5 h-3.5" />
            </button>

            <button
              id="doc-reset"
              onClick={handleReset}
              className="px-2 py-1 rounded text-[11px] hover:bg-slate-300 text-slate-700 font-medium"
            >
              Reset
            </button>

            <span className="w-px h-4 bg-slate-300 mx-1" />

            <button
              id="doc-fullscreen"
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label="Toggle fullscreen document view"
              className="p-1.5 rounded hover:bg-slate-300 active:bg-slate-400 text-slate-700 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Scanned Document Canvas / Render Area */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-slate-200/50 select-none min-h-[360px] relative">
        {effectiveFileUrl ? (
          <div
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
              width: '100%',
              height: '100%',
            }}
            className={`w-full h-full min-h-[500px] flex flex-col items-center justify-center ${
              highContrast ? 'filter invert contrast-125' : ''
            }`}
          >
            {isPdf ? (
              <iframe
                src={`${effectiveFileUrl}#toolbar=1&navpanes=0`}
                title={effectiveFileName || document.documentNumber || 'Uploaded PDF Document'}
                className="w-full h-full min-h-[500px] rounded-lg border border-slate-300 shadow-md bg-white"
              />
            ) : (
              <img
                src={effectiveFileUrl}
                alt={effectiveFileName || 'Original Scanned Document'}
                className="max-w-full max-h-[540px] object-contain rounded-lg shadow-md bg-white border border-slate-300"
              />
            )}
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
            className={`w-full max-w-[540px] aspect-[1/1.414] shadow-md border rounded p-6 sm:p-8 flex flex-col justify-between relative transition-colors duration-200 ${
              highContrast
                ? 'bg-neutral-900 text-yellow-100 border-neutral-700 filter invert contrast-125'
                : 'bg-[#fffdf9] text-slate-800 border-[#e8dfcf]'
            }`}
          >
          {/* Official Emblem & Watermark Header */}
          <div className="border-b-2 border-double border-slate-400/60 pb-3 text-center relative">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full border-2 border-slate-600 flex items-center justify-center font-serif text-xs font-bold tracking-widest text-slate-700 bg-slate-100/70">
                GOI
              </div>
              <div>
                <p className="text-[10px] tracking-widest font-semibold uppercase text-slate-600">
                  Government Land Records Administration
                </p>
                <p className="font-serif text-sm font-bold text-slate-900">
                  SUB-REGISTRAR OFFICE & REVENUE REGISTRY
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono pt-1">
              <span>VOL: 2024/B-IV</span>
              <span className="font-bold text-slate-800 tracking-wider">
                DEED NO: {document.documentNumber}
              </span>
              <span>PAGES: 1 OF 3</span>
            </div>

            {/* Official Stamp badge */}
            <div className="absolute top-1 right-1 -rotate-12 border-2 border-red-700/60 text-red-800/80 rounded px-1.5 py-0.5 text-[9px] font-mono uppercase font-bold tracking-wider pointer-events-none">
              REGISTERED
            </div>
          </div>

          {/* Document Body */}
          <div className="flex-1 py-4 space-y-3 text-[11px] sm:text-xs leading-relaxed font-serif">
            <div className="text-center font-bold tracking-wide uppercase text-slate-800 border-b border-slate-200 pb-1">
              SCHEDULE OF IMMOVABLE PROPERTY & {document.documentType.toUpperCase()}
            </div>

            <p className="text-justify indent-4">
              This deed of conveyance is executed on this day in favor of the grantee{' '}
              <strong
                className={`px-1 rounded ${
                  highlightField === 'ownerName'
                    ? 'bg-amber-200 text-amber-950 font-bold ring-2 ring-amber-400'
                    : ''
                }`}
              >
                {document.ownerName}
              </strong>
              , for the land parcel situated within the revenue village jurisdiction of{' '}
              <strong
                className={`px-1 rounded ${
                  highlightField === 'village'
                    ? 'bg-amber-200 text-amber-950 font-bold ring-2 ring-amber-400'
                    : ''
                }`}
              >
                {document.village}
              </strong>
              , Taluk of {document.taluk}, District of {document.district}.
            </p>

            {/* Survey Number Highlight Block */}
            <div
              className={`p-2.5 rounded border transition-all ${
                isSurveyConflictScenario
                  ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-400/50'
                  : isLowConfidenceScenario
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-slate-50 border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1 font-sans">
                <span className="font-semibold text-slate-700">Survey Particulars:</span>
                {isSurveyConflictScenario && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700">
                    <ShieldAlert className="w-3 h-3" />
                    Conflict in text (124/8A vs 124/3A)
                  </span>
                )}
                {isLowConfidenceScenario && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800">
                    <ShieldAlert className="w-3 h-3" />
                    Handwritten - low optical clarity
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Survey No:</span>{' '}
                  <span
                    className={`font-mono font-bold text-xs ${
                      isSurveyConflictScenario
                        ? 'text-rose-700 underline decoration-wavy'
                        : isLowConfidenceScenario
                        ? 'font-serif italic text-amber-900'
                        : 'text-slate-900'
                    }`}
                  >
                    {document.surveyNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Extent:</span>{' '}
                  <span className="font-mono font-bold text-slate-900">
                    {document.landArea}
                  </span>
                </div>
              </div>
            </div>

            {/* Boundaries Description */}
            <div className="border border-dashed border-slate-300 p-2 rounded text-[10px] space-y-1">
              <span className="font-sans font-semibold text-slate-700 uppercase tracking-wider block">
                Schedule of Boundaries:
              </span>
              <p className="text-slate-600 font-mono">
                {document.extractedFields.boundaries?.value ||
                  'North by Survey Boundary, South by Village Access Road, East by Adjacent Survey, West by Public Canal.'}
              </p>
            </div>
          </div>

          {/* Footer Seals, Signatures & Watermark */}
          <div className="pt-2 border-t border-slate-300/80 flex items-end justify-between">
            <div className="text-[9px] text-slate-500 font-mono">
              <p>Certified True Digital Copy</p>
              <p>Registration Stamp Duty: Paid ₹14,200</p>
              <p>State Revenue Document Portal</p>
            </div>

            {/* Digital Signature Badge if Approved */}
            {document.digitalSignature ? (
              <div className="border-2 border-emerald-600 bg-emerald-50 text-emerald-900 px-2 py-1 rounded text-right">
                <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-800">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  DIGITALLY SIGNED
                </div>
                <p className="text-[9px] font-mono text-emerald-700">
                  {document.digitalSignature.signerName}
                </p>
                <p className="text-[8px] text-emerald-600">
                  {document.digitalSignature.signDate}
                </p>
              </div>
            ) : (
              <div className="text-right border-t border-slate-400 pt-1 w-28">
                <div className="font-serif italic text-[11px] text-slate-700">
                  R. Kumar / SR
                </div>
                <p className="text-[8px] font-mono text-slate-500 uppercase">
                  Sub-Registrar Seal
                </p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
