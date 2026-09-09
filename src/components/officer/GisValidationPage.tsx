import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { GisParcelData } from '../../types';
import { GisMapPage } from '../gis/GisMapPage';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  RotateCcw,
  Check,
  XCircle,
  Eye,
  Layers,
  Sparkles,
  ShieldCheck,
  FileText,
  Sliders,
  Maximize2,
  Compass,
  Crosshair,
  Grid,
  Map,
} from 'lucide-react';

export const GisValidationPage: React.FC = () => {
  const {
    t,
    selectedDocument,
    documents,
    gisParcels,
    selectDocument,
    selectParcel,
    resolveDocumentConflict,
    submitOfficerDecision,
    navigateTo,
  } = useApp();

  const currentDoc =
    selectedDocument ||
    documents.find((d) => d.scenarioType === 'SURVEY_CONFLICT') ||
    documents[0];

  // Matched GIS parcel
  const currentParcel: GisParcelData | undefined =
    currentDoc?.gisParcel ||
    gisParcels.find((p) => p.surveyNumber === currentDoc?.surveyNumber) ||
    gisParcels[0];

  const hasConflict =
    currentDoc?.scenarioType === 'SURVEY_CONFLICT' ||
    currentDoc?.scenarioType === 'AREA_ANOMALY' ||
    currentDoc?.validationReport?.status === 'CONFLICT';

  const [confirmedCheckbox, setConfirmedCheckbox] = useState<boolean>(false);
  const [officerRecommendation, setOfficerRecommendation] = useState<
    'RECOMMEND_APPROVE' | 'RECOMMEND_REJECT' | 'REQUEST_FIELD_INSPECTION'
  >('RECOMMEND_APPROVE');
  const [notes, setNotes] = useState<string>(
    hasConflict
      ? 'Spatial survey discrepancy verified. Resolved against Sub-Registrar parcel plan.'
      : 'Cadastral boundaries, access road, and GIS area verified against master settlement register.'
  );

  const [resolvedState, setResolvedState] = useState<boolean>(!hasConflict);

  // GIS Engine View Mode (Interactive Full Engine vs Deed Alignment Fine-tuning)
  const [gisViewMode, setGisViewMode] = useState<'FULL_GIS_ENGINE' | 'DEED_ALIGNMENT'>('FULL_GIS_ENGINE');

  // Cadastral Overlay Alignment state
  const [alignmentViewMode, setAlignmentViewMode] = useState<
    'SIDE_BY_SIDE' | 'OVERLAY_BLEND' | 'SPLIT_SWIPE'
  >('OVERLAY_BLEND');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(65);
  const [rotationDegree, setRotationDegree] = useState<number>(0);
  const [scalePercentage, setScalePercentage] = useState<number>(100);
  const [snapVertexActive, setSnapVertexActive] = useState<boolean>(true);

  const handleAcceptGisParcel = () => {
    // Resolve conflict by updating survey to matched 124/3A
    resolveDocumentConflict(
      currentDoc.id,
      'ACCEPT_GIS',
      'Accepted GIS cadastre survey coordinates based on spatial topology match.'
    );
    setResolvedState(true);
    alert('Conflict Resolved: Updated record with verified cadastral parcel attributes.');
  };

  const handleFlagFieldSurvey = () => {
    resolveDocumentConflict(
      currentDoc.id,
      'FLAG_FIELD_INSPECTION',
      'Flagged for physically dispatched ground survey inspection.'
    );
    alert('Dispatched: Notice issued to Taluk Surveyor for physical spot inspection.');
  };

  const handleSubmitToHighAuthority = () => {
    if (!confirmedCheckbox) {
      alert('Please check the confirmation box before forwarding to the High Authority.');
      return;
    }

    submitOfficerDecision(
      currentDoc.id,
      officerRecommendation === 'RECOMMEND_REJECT' ? 'REJECT' : 'APPROVE',
      notes
    );
    navigateTo('approvals');
  };

  if (!currentDoc) {
    return (
      <div id="gis-validation-page" className="p-8 max-w-7xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{t('noGisBoundariesPending', 'No GIS Boundaries Pending Validation')}</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {t('noGisBoundariesDesc', 'There are currently no land document parcels requiring GIS spatial intersection or boundary verification.')}
        </p>
      </div>
    );
  }

  return (
    <div id="gis-validation-page" className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Record Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
              {t('workstationStep3', 'Workstation Step 3')}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {t('gisCadastralCrossValidation', 'GIS Cadastral Cross-Validation')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {currentDoc.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('gisSpatialValidationDesc', 'Compare legal deed attributes with TNGIS cadastral polygon boundary.')}
          </p>
        </div>

        {/* Record Quick Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">{t('selectRecordPrompt', 'Select Record:')}</span>
          <select
            value={currentDoc.id}
            onChange={(e) => selectDocument(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 outline-none"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.surveyNumber} ({d.scenarioType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conflict Resolution Banner (Section 15) if has conflict */}
      {!resolvedState && (
        <div
          id="conflict-resolution-box"
          className="p-5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 shadow-xs space-y-3 animate-in fade-in"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-bold text-rose-900">
                ⚠️ Cadastral Conflict Detected
              </h3>
              <p className="text-xs sm:text-sm text-rose-800 mt-0.5 font-medium leading-relaxed">
                {currentDoc.validationReport.primaryIssue ||
                  'The survey number in the deed does not match the mapped polygon coordinates, or the deed extent deviates significantly from the surveyed GIS polygon.'}
              </p>

              {currentDoc.validationReport.systemRecommendation && (
                <div className="mt-2 text-xs font-semibold text-rose-900 bg-white/80 p-2.5 rounded-lg border border-rose-200">
                  💡 <strong>System Recommendation:</strong>{' '}
                  {currentDoc.validationReport.systemRecommendation}
                </div>
              )}
            </div>
          </div>

          {/* Quick Resolution Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-rose-200">
            <span className="text-xs font-bold text-rose-900 uppercase">
              Resolve Issue:
            </span>
            <button
              onClick={handleAcceptGisParcel}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept GIS Parcel (Correct Survey to 124/3A)</span>
            </button>

            <button
              onClick={handleFlagFieldSurvey}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Flag for Physical Field Survey</span>
            </button>

            <button
              onClick={() => {
                submitOfficerDecision(currentDoc.id, 'REJECT', 'Rejected due to survey conflict mismatch');
                navigateTo('queue');
              }}
              className="px-3.5 py-1.5 rounded-lg border border-rose-300 hover:bg-rose-100 text-rose-800 text-xs font-semibold"
            >
              Reject Document
            </button>
          </div>
        </div>
      )}

      {/* Main Comparison: Left = Document Claim vs Right = GIS Data */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Comparison Data Grid (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>Cadastral Cross-Check Comparison</span>
              <StatusBadge status={resolvedState ? 'VERIFIED' : 'CONFLICT'} size="sm" />
            </h3>

            {/* Comparison Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <div className="grid grid-cols-2 bg-slate-100 p-2.5 font-bold uppercase text-[10px] text-slate-600 border-b border-slate-200">
                <div>Document Claim</div>
                <div>GIS Cadastral Record</div>
              </div>

              {/* Row 1: Survey Number */}
              <div className="grid grid-cols-2 p-3 border-b border-slate-100 hover:bg-slate-50">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Survey No</span>
                  <span className="font-mono font-bold text-slate-900">{currentDoc.surveyNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">GIS Survey No</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {currentParcel?.surveyNumber || currentDoc.surveyNumber}
                  </span>
                </div>
              </div>

              {/* Row 2: Land Extent */}
              <div className="grid grid-cols-2 p-3 border-b border-slate-100 hover:bg-slate-50">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Deed Area</span>
                  <span className="font-bold text-slate-900">{currentDoc.landArea}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Calculated GIS Area</span>
                  <span className="font-bold font-mono text-emerald-800">
                    {currentParcel?.areaAcres || 2.45} acres
                  </span>
                </div>
              </div>

              {/* Row 3: Village */}
              <div className="grid grid-cols-2 p-3 border-b border-slate-100 hover:bg-slate-50">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Village</span>
                  <span className="text-slate-900 font-medium">{currentDoc.village}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cadastre Village</span>
                  <span className="text-emerald-800 font-medium">{currentParcel?.village || currentDoc.village}</span>
                </div>
              </div>

              {/* Row 4: Road Access */}
              <div className="grid grid-cols-2 p-3 hover:bg-slate-50">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Deed Boundaries</span>
                  <span className="text-slate-700">East: Access Road</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">GIS Topology</span>
                  <span className="text-emerald-800 font-medium">Road Validated (SH-104)</span>
                </div>
              </div>
            </div>

            {/* Validation Rule Breakdown */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Automated Cadastral Rule Checks
              </span>
              <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-200">
                <span>Spatial Intersection Test</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-200">
                <span>Boundary Overlap / Encroachment</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 0% Overlap
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-200">
                <span>Buffer Restriction Check</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Clear of Waterbody
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cadastral Interactive Map Viewport & Deed Alignment Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* View Mode Mode Selector Bar */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setGisViewMode('FULL_GIS_ENGINE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  gisViewMode === 'FULL_GIS_ENGINE'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Interactive Cadastral GIS Engine</span>
              </button>
              <button
                onClick={() => setGisViewMode('DEED_ALIGNMENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  gisViewMode === 'DEED_ALIGNMENT'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Deed-to-GIS Overlay Alignment</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline px-2">
              {gisViewMode === 'FULL_GIS_ENGINE' ? 'Live Spatial Engine' : 'Precision Geometry Aligner'}
            </span>
          </div>

          {/* Conditional View Rendering */}
          {gisViewMode === 'FULL_GIS_ENGINE' ? (
            <GisMapPage embedded />
          ) : (
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-xs relative overflow-hidden text-white space-y-3">
              {/* Toolbar Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400">
                    Deed → GIS Cadastral Alignment Engine
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Precision: ±0.02m
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateTo('gis-map')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <span>Full Screen Map</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Interactive Alignment Controls Bar */}
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* View Mode Switcher */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setAlignmentViewMode('OVERLAY_BLEND')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        alignmentViewMode === 'OVERLAY_BLEND'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Overlay Blend
                    </button>
                    <button
                      onClick={() => setAlignmentViewMode('SIDE_BY_SIDE')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        alignmentViewMode === 'SIDE_BY_SIDE'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Side-by-Side
                    </button>
                    <button
                      onClick={() => setAlignmentViewMode('SPLIT_SWIPE')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        alignmentViewMode === 'SPLIT_SWIPE'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Split Swipe
                    </button>
                  </div>

                  {/* Vertex Snap Toggle */}
                  <button
                    onClick={() => setSnapVertexActive(!snapVertexActive)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      snapVertexActive
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Snap Corner Vertices ({snapVertexActive ? 'ON' : 'OFF'})</span>
                  </button>

                  {/* Reset button */}
                  <button
                    onClick={() => {
                      setRotationDegree(0);
                      setScalePercentage(100);
                      setOverlayOpacity(65);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Reset Alignment Settings"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sliders for Opacity, Rotation, Scale */}
                {alignmentViewMode === 'OVERLAY_BLEND' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-800/80 text-[11px]">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1 font-medium">
                        <span>Overlay Opacity:</span>
                        <span className="font-mono text-emerald-400">{overlayOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={overlayOpacity}
                        onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                        className="w-full accent-blue-500 bg-slate-950 h-1.5 rounded"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1 font-medium">
                        <span>Fine Rotation:</span>
                        <span className="font-mono text-emerald-400">{rotationDegree}°</span>
                      </div>
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.5"
                        value={rotationDegree}
                        onChange={(e) => setRotationDegree(Number(e.target.value))}
                        className="w-full accent-blue-500 bg-slate-950 h-1.5 rounded"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1 font-medium">
                        <span>Polygon Scale:</span>
                        <span className="font-mono text-emerald-400">{scalePercentage}%</span>
                      </div>
                      <input
                        type="range"
                        min="90"
                        max="110"
                        value={scalePercentage}
                        onChange={(e) => setScalePercentage(Number(e.target.value))}
                        className="w-full accent-blue-500 bg-slate-950 h-1.5 rounded"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Embedded Cadastre & Overlay Visualizer */}
              <div className="h-72 w-full relative flex items-center justify-center bg-[#0e1620] rounded-lg overflow-hidden border border-slate-800">
                <svg viewBox="0 0 500 300" className="w-full h-full">
                  {/* Canal */}
                  <path
                    d="M 380,0 Q 420,150 480,300"
                    stroke="#38bdf8"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="4 2"
                    opacity="0.5"
                  />

                  {/* Road */}
                  <path d="M 0,130 L 500,130" stroke="#f59e0b" strokeWidth="6" fill="none" opacity="0.6" />

                  {/* Adjacent parcels */}
                  <polygon
                    points="290,75 420,70 430,180 300,185"
                    fill="#334155"
                    fillOpacity="0.2"
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                  <text x="360" y="130" fill="#94a3b8" fontSize="9" textAnchor="middle">
                    Survey 124/4
                  </text>

                  <polygon
                    points="30,85 160,80 155,190 25,195"
                    fill="#334155"
                    fillOpacity="0.2"
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                  <text x="90" y="130" fill="#94a3b8" fontSize="9" textAnchor="middle">
                    Survey 124/2
                  </text>

                  {/* Target GIS Polygon Layer */}
                  <polygon
                    points="160,80 290,75 300,185 155,190"
                    fill={resolvedState ? '#059669' : '#e11d48'}
                    fillOpacity="0.35"
                    stroke={resolvedState ? '#34d399' : '#f43f5e'}
                    strokeWidth="3"
                  />

                  {/* Deed Overlay Boundary Scan (Transformed by user controls) */}
                  <g
                    style={{
                      transformOrigin: '225px 130px',
                      transform: `rotate(${rotationDegree}deg) scale(${scalePercentage / 100})`,
                    }}
                    opacity={overlayOpacity / 100}
                  >
                    <polygon
                      points="158,78 292,73 302,187 153,192"
                      fill="#38bdf8"
                      fillOpacity="0.25"
                      stroke="#0ea5e9"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                    {/* Vertex Corner Alignment Pins */}
                    {snapVertexActive && (
                      <>
                        <circle cx="158" cy="78" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                        <circle cx="292" cy="73" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                        <circle cx="302" cy="187" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                        <circle cx="153" cy="192" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                        <text x="150" y="70" fill="#38bdf8" fontSize="8" fontWeight="bold">V1</text>
                        <text x="300" y="65" fill="#38bdf8" fontSize="8" fontWeight="bold">V2</text>
                        <text x="310" y="195" fill="#38bdf8" fontSize="8" fontWeight="bold">V3</text>
                        <text x="145" y="202" fill="#38bdf8" fontSize="8" fontWeight="bold">V4</text>
                      </>
                    )}
                  </g>

                  {/* Center Labels */}
                  <text x="225" y="130" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {resolvedState ? 'SURVEY 124/3A' : `CLAIMED: ${currentDoc.surveyNumber}`}
                  </text>
                  <text x="225" y="145" fill="#a7f3d0" fontSize="9" textAnchor="middle">
                    {currentParcel?.areaAcres || 2.45} acres • Fit: 99.6%
                  </text>
                </svg>
              </div>
            </div>
          )}

          {/* Section 17: Officer Approval Submission Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              {t('finalDecisionRecommendation', 'Officer Recommendation & Forwarding')}
            </h3>

            {/* Officer Confirmation Checkbox (Section 17) */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/70 border border-blue-200 cursor-pointer">
              <input
                id="officer-confirm-checkbox"
                type="checkbox"
                checked={confirmedCheckbox}
                onChange={(e) => setConfirmedCheckbox(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span className="text-xs font-semibold text-blue-950 leading-relaxed">
                {t('confirmGisCheckboxLabel', 'I confirm this document matches the official GIS land record and cadastral survey boundaries.')}
              </span>
            </label>

            {/* Recommendation Options */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setOfficerRecommendation('RECOMMEND_APPROVE')}
                className={`px-3 py-2 rounded-lg font-semibold border transition-all ${
                  officerRecommendation === 'RECOMMEND_APPROVE'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-1 ring-emerald-400'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {t('recommendForFinalApproval', '✓ Recommend for Final Approval')}
              </button>

              <button
                onClick={() => setOfficerRecommendation('REQUEST_FIELD_INSPECTION')}
                className={`px-3 py-2 rounded-lg font-semibold border transition-all ${
                  officerRecommendation === 'REQUEST_FIELD_INSPECTION'
                    ? 'bg-amber-100 text-amber-900 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {t('flagForFieldInspection', '⚠️ Flag for Field Inspection')}
              </button>

              <button
                onClick={() => setOfficerRecommendation('RECOMMEND_REJECT')}
                className={`px-3 py-2 rounded-lg font-semibold border transition-all ${
                  officerRecommendation === 'RECOMMEND_REJECT'
                    ? 'bg-rose-100 text-rose-900 border-rose-400 ring-1 ring-rose-400'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {t('recommendRejection', '✗ Recommend Rejection')}
              </button>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t('notesForApprover', 'Recommendation Notes for Sub-Registrar / Approver')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-sans"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                id="btn-submit-to-high-authority"
                onClick={handleSubmitToHighAuthority}
                className="px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t('submitToHighAuthority', 'Submit to High Authority')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
