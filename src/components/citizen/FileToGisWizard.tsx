import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileUp,
  Search,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileText,
  Clock,
  ShieldCheck,
  Layers,
  Crosshair,
  Sliders,
} from 'lucide-react';
import { GisParcelData } from '../../types';

export const FileToGisWizard: React.FC = () => {
  const { gisParcels, navigateTo, selectParcel, uploadNewDocument } = useApp();

  const [step, setStep] = useState<number>(1);
  const [selectedFileName, setSelectedFileName] = useState<string>('Sale_Deed_Krishnapuram_124_3A.pdf');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [readingProgressStage, setReadingProgressStage] = useState<number>(0);
  const [showAlignmentOverlay, setShowAlignmentOverlay] = useState<boolean>(true);
  const [alignmentOpacity, setAlignmentOpacity] = useState<number>(70);
  const [identifiedSurvey, setIdentifiedSurvey] = useState<string>('124/3A');
  const [identifiedVillage, setIdentifiedVillage] = useState<string>('Krishnapuram');
  const [identifiedDistrict, setIdentifiedDistrict] = useState<string>('Bengaluru Rural');
  const [identifiedArea, setIdentifiedArea] = useState<string>('2.45 acres');
  const [matchedParcel, setMatchedParcel] = useState<GisParcelData | null>(gisParcels[0]);
  const [isLowConfidence, setIsLowConfidence] = useState<boolean>(false);
  const [multipleCandidateParcels, setMultipleCandidateParcels] = useState<GisParcelData[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedDocId, setSubmittedDocId] = useState<string | null>(null);
  const [submissionRef, setSubmissionRef] = useState<string>('');

  // Simulation presets for quick testing
  const presets = [
    {
      label: 'Standard Clear Deed (Survey 124/3A)',
      filename: 'Sale_Deed_124_3A.pdf',
      survey: '124/3A',
      village: 'Krishnapuram',
      district: 'Bengaluru Rural',
      area: '2.45 acres',
      parcelIndex: 0,
      lowConfidence: false,
    },
    {
      label: 'Ancestral Title (Survey 210/1)',
      filename: 'Partition_Deed_210_1.pdf',
      survey: '210/1',
      village: 'Ramnagar',
      district: 'Bengaluru Rural',
      area: '3.50 acres',
      parcelIndex: 3,
      lowConfidence: false,
    },
    {
      label: 'Ambiguous Deed (Low Confidence - Multiple Candidates)',
      filename: 'Aged_Patta_Survey88_Ambiguous.pdf',
      survey: '88/2B',
      village: 'Krishnapuram',
      district: 'Bengaluru Rural',
      area: '1.80 acres',
      parcelIndex: 1,
      lowConfidence: true,
    },
  ];

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setSelectedFileName(preset.filename);
    setIdentifiedSurvey(preset.survey);
    setIdentifiedVillage(preset.village);
    setIdentifiedDistrict(preset.district);
    setIdentifiedArea(preset.area);
    setMatchedParcel(gisParcels[preset.parcelIndex]);
    setIsLowConfidence(preset.lowConfidence);
    if (preset.lowConfidence) {
      setMultipleCandidateParcels([gisParcels[1], gisParcels[2]]);
    } else {
      setMultipleCandidateParcels([]);
    }
  };

  const handleStartProcessing = () => {
    setStep(2);
    setIsProcessing(true);
    setReadingProgressStage(0);

    // Reading stage sequence
    setTimeout(() => setReadingProgressStage(1), 700);
    setTimeout(() => setReadingProgressStage(2), 1500);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 2400);
  };

  const handleConfirmLand = () => {
    if (matchedParcel) {
      selectParcel(matchedParcel.parcelId);
    }
    setStep(4);
  };

  const handleOpenFullGis = () => {
    if (matchedParcel) {
      selectParcel(matchedParcel.parcelId);
    }
    navigateTo('gis-map', undefined, matchedParcel?.parcelId);
  };

  const handleSaveDocument = () => {
    const newId = uploadNewDocument({
      title: `Land Record - Survey ${identifiedSurvey}`,
      surveyNumber: identifiedSurvey,
      village: identifiedVillage,
      district: identifiedDistrict,
      landArea: identifiedArea,
    });
    setSubmittedDocId(newId);
    setSubmissionRef(`REQ-2026-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsSubmitted(true);
  };

  return (
    <div id="file-to-gis-wizard" className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Citizen GIS Assistant</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Find My Land From My Document
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Upload your land deed to instantly locate and highlight your cadastral parcel on the official state GIS map.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isSubmitted
                  ? 'bg-emerald-100 text-emerald-800'
                  : step === s
                  ? 'bg-blue-700 text-white'
                  : step > s
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span>{isSubmitted || step > s ? '✓' : s}</span>
              <span className="hidden sm:inline">
                {s === 1 ? 'Upload' : s === 2 ? 'Reading' : s === 3 ? 'Identified' : 'On Map'}
              </span>
            </div>
          ))}
          {isSubmitted && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-700 text-white">
              <span>✓</span>
              <span className="hidden sm:inline">Submitted</span>
            </div>
          )}
        </div>
      </div>

      {/* STEP 1: Upload Document */}
      {!isSubmitted && step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Step 1: Upload Document</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag and drop or select your registered deed, sale agreement, or RTC Patta (PDF, JPG, PNG).
            </p>
          </div>

          {/* Drag & Drop Box */}
          <div
            id="dropzone-citizen"
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center"
            onClick={handleStartProcessing}
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-3 shadow-xs">
              <FileUp className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-800">
              Drag & Drop your land document here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports scanned PDFs, camera photos of deeds, or Patta certificates (up to 25 MB)
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
                Selected: <strong>{selectedFileName}</strong>
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartProcessing();
              }}
              className="mt-6 px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs flex items-center gap-2"
            >
              <span>Scan & Identify Land Parcel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets for Demo */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Or Try a Sample Land Document
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedFileName === preset.filename
                      ? 'bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-400'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>{preset.survey}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight truncate">
                    {preset.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Reading Document */}
      {!isSubmitted && step === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 shadow-xs text-center space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto animate-pulse">
            <Search className="w-8 h-8 animate-spin" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Step 2: Reading Document...</h2>
            <p className="text-xs text-slate-500 mt-1">
              Intelligent OCR engine is extracting nominal and cadastral properties from {selectedFileName}.
            </p>
          </div>

          {/* Progress Sequence */}
          <div className="max-w-md mx-auto space-y-3 text-left">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className={`w-3 h-3 rounded-full ${readingProgressStage >= 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className="text-xs font-semibold text-slate-800">
                Reading document & enhancing image quality...
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className={`w-3 h-3 rounded-full ${readingProgressStage >= 1 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-xs font-semibold text-slate-800">
                Identifying land details & village jurisdiction...
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className={`w-3 h-3 rounded-full ${readingProgressStage >= 2 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className="text-xs font-semibold text-slate-800">
                Finding survey number & matching cadastral coordinates...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Land Identified */}
      {!isSubmitted && step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 3: Land Identified</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                We successfully detected the land details recorded in your document.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Extraction Complete
            </span>
          </div>

          {/* Low Confidence Fallback Warning if applicable */}
          {isLowConfidence && (
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Multiple Possible Locations Found</span>
              </div>
              <p className="text-xs text-amber-800">
                We found multiple possible locations due to faint handwriting in the survey number. Please verify and select the correct parcel before continuing.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {multipleCandidateParcels.map((parcel) => (
                  <button
                    key={parcel.parcelId}
                    onClick={() => {
                      setIdentifiedSurvey(parcel.surveyNumber);
                      setMatchedParcel(parcel);
                      setIsLowConfidence(false);
                    }}
                    className="p-2.5 rounded-lg bg-white border border-amber-300 hover:border-blue-500 text-left text-xs font-medium"
                  >
                    <span className="font-bold text-slate-900">Survey {parcel.surveyNumber}</span>
                    <span className="text-slate-500 block text-[11px]">{parcel.areaAcres} acres • {parcel.landUse}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Identified Details Card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-slate-500 block">Survey Number</span>
              <span className="text-lg font-bold font-mono text-blue-900 mt-0.5 block">
                {identifiedSurvey}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Village</span>
              <span className="text-base font-semibold text-slate-900 mt-0.5 block">
                {identifiedVillage}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">District</span>
              <span className="text-base font-semibold text-slate-900 mt-0.5 block">
                {identifiedDistrict}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Identified Extent</span>
              <span className="text-base font-semibold text-slate-900 mt-0.5 block">
                {identifiedArea}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Choose Different File</span>
            </button>

            <button
              id="btn-confirm-and-view-map"
              onClick={handleConfirmLand}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <span>View On Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: View on Map */}
      {!isSubmitted && step === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 4: View on Map</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cadastral parcel located in Krishnapuram revenue block.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Auto-Zoomed & Highlighted
            </span>
          </div>

          {/* Primary Result Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-emerald-900">
                This is the land parcel associated with your document.
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Cadastral polygon coordinates matched with official Survey of India / Bhoomi registry base layer.
              </p>
            </div>
          </div>

          {/* Interactive Cadastral Map View with Alignment Overlay */}
          <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-900 text-white relative shadow-md">
            {/* Top Toolbar */}
            <div className="bg-slate-900/90 backdrop-blur px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">Cadastre Layer:</span>
                <strong className="text-emerald-400 font-mono">Survey {identifiedSurvey}</strong>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Alignment Match: 99.8%
                </span>
              </div>

              {/* Toggle Alignment Layer Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAlignmentOverlay(!showAlignmentOverlay)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all border ${
                    showAlignmentOverlay
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Deed Overlay Scan ({showAlignmentOverlay ? 'ON' : 'OFF'})</span>
                </button>

                {showAlignmentOverlay && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span>Opacity:</span>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={alignmentOpacity}
                      onChange={(e) => setAlignmentOpacity(Number(e.target.value))}
                      className="w-20 accent-blue-500 bg-slate-800 h-1.5 rounded"
                    />
                    <span className="font-mono text-emerald-400 w-8">{alignmentOpacity}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Vector Cadastral Canvas */}
            <div className="w-full h-72 relative flex items-center justify-center bg-[#18232c] overflow-hidden">
              <svg viewBox="0 0 500 300" className="w-full h-full">
                {/* Grid Lines */}
                <defs>
                  <pattern id="wizard-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2a3846" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="500" height="300" fill="url(#wizard-grid)" />

                {/* Road Line */}
                <path d="M 0,130 L 500,130" stroke="#f59e0b" strokeWidth="8" fill="none" opacity="0.5" />
                <text x="250" y="125" fill="#fde68a" fontSize="8" fontWeight="bold" textAnchor="middle">
                  VILLAGE ACCESS MAIN ROAD
                </text>

                {/* Target Matched GIS Parcel */}
                <polygon
                  points="160,80 290,75 300,185 155,190"
                  fill="#059669"
                  fillOpacity="0.35"
                  stroke="#34d399"
                  strokeWidth="3"
                />

                {/* Optional Deed Overlay Scan Layer */}
                {showAlignmentOverlay && (
                  <g opacity={alignmentOpacity / 100}>
                    <polygon
                      points="158,78 292,73 302,187 153,192"
                      fill="#38bdf8"
                      fillOpacity="0.25"
                      stroke="#0ea5e9"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                    <circle cx="158" cy="78" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                    <circle cx="292" cy="73" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                    <circle cx="302" cy="187" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                    <circle cx="153" cy="192" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                    <text x="145" y="72" fill="#38bdf8" fontSize="8" fontWeight="bold">P1</text>
                    <text x="296" y="68" fill="#38bdf8" fontSize="8" fontWeight="bold">P2</text>
                    <text x="306" y="195" fill="#38bdf8" fontSize="8" fontWeight="bold">P3</text>
                    <text x="145" y="200" fill="#38bdf8" fontSize="8" fontWeight="bold">P4</text>
                  </g>
                )}

                {/* Centroid Label & Badge */}
                <text x="225" y="125" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                  SURVEY {identifiedSurvey}
                </text>
                <text x="225" y="140" fill="#a7f3d0" fontSize="9" textAnchor="middle">
                  {matchedParcel?.areaAcres || 2.45} acres • {identifiedVillage}
                </text>
                <text x="225" y="155" fill="#34d399" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                  ✓ VERIFIED CADASTRAL ALIGNMENT
                </text>

                {/* Neighboring ghost parcels */}
                <polygon
                  points="290,75 420,70 430,180 300,185"
                  fill="#334155"
                  fillOpacity="0.2"
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                <text x="360" y="130" fill="#94a3b8" fontSize="9" textAnchor="middle">
                  Survey 124/4 (2.10 ac)
                </text>

                <polygon
                  points="30,85 160,80 155,190 25,195"
                  fill="#334155"
                  fillOpacity="0.2"
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                <text x="90" y="130" fill="#94a3b8" fontSize="9" textAnchor="middle">
                  Survey 124/2 (1.80 ac)
                </text>
              </svg>
            </div>
          </div>

          {/* Next Steps Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Locate Another Document
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-save-and-submit-request"
                onClick={handleSaveDocument}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Verification Request</span>
              </button>

              <button
                id="btn-open-full-gis-page"
                onClick={handleOpenFullGis}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5"
              >
                <span>Open GIS Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Request Sent Successfully View */}
      {isSubmitted && (
        <div
          id="wizard-request-sent-success-view"
          className="bg-white rounded-xl border border-emerald-200 p-8 sm:p-10 shadow-xs text-center space-y-6 animate-in fade-in"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              Request Sent Successfully
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Request Sent Successfully
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your land document has been verified against spatial cadastral boundaries and submitted to the state revenue registry.
            </p>
          </div>

          {/* Receipt Info Box */}
          <div className="max-w-lg mx-auto bg-slate-50 rounded-xl border border-slate-200 p-5 text-left divide-y divide-slate-200/80 text-xs">
            <div className="pb-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Application Reference No.</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 text-xs">
                {submissionRef || 'REQ-2026-88129'}
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Survey Number</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {identifiedSurvey}
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Village & District</span>
              <span className="text-slate-800">{identifiedVillage}, {identifiedDistrict}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Matched GIS Parcel</span>
              <span className="font-mono font-semibold text-emerald-700">
                {matchedParcel?.parcelId || 'KA-BLR-HK-001'}
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Land Extent</span>
              <span className="font-semibold text-slate-900">{identifiedArea}</span>
            </div>
            <div className="pt-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Submission Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3" />
                <span>Pending Officer Verification</span>
              </span>
            </div>
          </div>

          {/* Guidance note */}
          <div className="max-w-lg mx-auto p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs text-left flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block text-emerald-950">Next Steps</span>
              <p className="text-emerald-800">
                Your file has been routed to the Taluk Tahsildar & Revenue Inspector. You can track this verification anytime in the My Documents section.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="btn-wizard-view-docs"
              onClick={() => {
                navigateTo('my-documents');
              }}
              className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>View in My Documents</span>
            </button>

            {submittedDocId && (
              <button
                id="btn-wizard-track-details"
                onClick={() => {
                  navigateTo('document-details', submittedDocId);
                }}
                className="px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
              >
                <span>Track Request Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              id="btn-wizard-open-gis"
              onClick={handleOpenFullGis}
              className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Open Full GIS Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setStep(1);
                setIsSubmitted(false);
              }}
              className="px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-semibold"
            >
              Locate Another Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
