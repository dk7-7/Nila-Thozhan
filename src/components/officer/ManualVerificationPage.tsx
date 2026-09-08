import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentPreview } from '../common/DocumentPreview';
import { StatusBadge } from '../common/StatusBadge';
import {
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Check,
  ArrowRight,
  XCircle,
  Compass,
  FileText,
  MapPin,
  LandPlot,
  Building2,
  Layers,
  Sparkles,
  Hash,
} from 'lucide-react';
import type { CadastralBoundaries } from '../../types';

export const ManualVerificationPage: React.FC = () => {
  const {
    selectedDocument,
    documents,
    selectDocument,
    updateDocumentField,
    updateCadastralDetails,
    updateCadastralBoundaries,
    submitOfficerDecision,
    navigateTo,
  } = useApp();

  // Prioritize selected document, then newly uploaded documents, then under verification or low confidence
  const currentDoc =
    selectedDocument ||
    documents.find((d) => d.id.startsWith('doc-')) ||
    documents.find((d) => d.scenarioType === 'LOW_CONFIDENCE') ||
    documents[0];

  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [editingBoundaryKey, setEditingBoundaryKey] = useState<keyof CadastralBoundaries | null>(null);
  const [editingBoundaryValue, setEditingBoundaryValue] = useState<string>('');

  const [officerNotes, setOfficerNotes] = useState<string>(
    currentDoc?.officerNotes || 'Survey number and Tamil cadastral boundaries verified against Sub-Registrar volume 412, page 88.'
  );

  if (!currentDoc) {
    return <div className="p-8 text-center text-slate-500">No documents found.</div>;
  }

  const cadastral = currentDoc.cadastralDetails;
  const boundaries = cadastral?.boundaries || {
    north: 'Survey Boundary 143-B',
    south: 'Village Access Road',
    east: 'Adjacent Survey 144',
    west: 'Public Canal',
    tamilNorth: 'வடக்கு: சர்வே எல்லை 143-B',
    tamilSouth: 'தெற்கு: கிராமப் பாதை',
    tamilEast: 'கிழக்கு: பக்கத்து சர்வே 144',
    tamilWest: 'மேற்கு: பொது வாய்க்கால்',
  };

  const handleStartEdit = (key: string, currentValue: string) => {
    setEditingFieldKey(key);
    setEditingValue(currentValue);
  };

  const handleSaveEdit = (key: string) => {
    updateDocumentField(currentDoc.id, key, editingValue);
    setEditingFieldKey(null);
  };

  const handleStartBoundaryEdit = (key: keyof CadastralBoundaries, val: string) => {
    setEditingBoundaryKey(key);
    setEditingBoundaryValue(val);
  };

  const handleSaveBoundaryEdit = (key: keyof CadastralBoundaries) => {
    updateCadastralBoundaries(currentDoc.id, { [key]: editingBoundaryValue });
    setEditingBoundaryKey(null);
  };

  const handleFieldClick = (fieldKey: string) => {
    setHighlightedField(fieldKey);
  };

  const handleSendToGis = () => {
    submitOfficerDecision(currentDoc.id, 'APPROVE', officerNotes);
    navigateTo('gis-validation', currentDoc.id);
  };

  const handleReject = () => {
    const reason = prompt('Please enter the reason for rejection / return:', 'Legibility issue in survey number');
    if (reason) {
      submitOfficerDecision(currentDoc.id, 'REJECT', reason);
      navigateTo('queue');
    }
  };

  return (
    <div id="manual-verification-page" className="space-y-5 max-w-7xl mx-auto">
      {/* Top Header & Scenario Switcher Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              Workstation Step 2
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Tamil Cadastral & Deed Verification
            </span>
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Tamil Nadu Revenue Suite (TN-RoR)
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            {currentDoc.title} ({currentDoc.documentNumber})
          </h1>
        </div>

        {/* Quick Document Picker */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">Select Record:</span>
          <select
            value={currentDoc.id}
            onChange={(e) => selectDocument(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 outline-none"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.surveyNumber} - {d.scenarioType} ({d.overallConfidence})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Screen: LEFT = Document Viewer, RIGHT = Extracted Verification Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: Document Image Viewer (6 cols) */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Original Scanned Document
              </h2>
              {highlightedField && (
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded animate-pulse">
                  Focus: {highlightedField.toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">High-Res Optical Layer</span>
          </div>

          <DocumentPreview
            document={currentDoc}
            highlightField={highlightedField || undefined}
            className="h-[640px]"
          />
        </div>

        {/* RIGHT: Extracted Fields for Verification (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Extracted Cadastral Metadata & Tamil Registry Fields
                </h3>
                <p className="text-xs text-slate-500">
                  Dual-language optical extraction verified against TN Land Records (தமிழ்நாடு நில ஆவணங்கள்).
                </p>
              </div>
              <StatusBadge status={currentDoc.overallConfidence} size="sm" />
            </div>

            {/* Tamil Cadastral Badge Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">பட்டா எண் (Patta No)</span>
                <span className="font-mono font-bold text-blue-700">{cadastral?.pattaNumber || '640'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">நில வகை (Land Type)</span>
                <span className="font-semibold text-slate-800">{cadastral?.landClassification || 'புன்செய் (Dry Land)'}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">சார்பதிவாளர் (SRO)</span>
                <span className="font-medium text-slate-700 truncate block">{cadastral?.sroJurisdiction || 'Kangeyam SRO'}</span>
              </div>
            </div>

            {/* Field Rows */}
            <div className="space-y-2.5">
              {/* Field: Owner Name (Dual Language: Tamil + English) */}
              <div
                onClick={() => handleFieldClick('ownerName')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  highlightedField === 'ownerName'
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-400'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Owner Name / பட்டாதாரர் பெயர்
                    </span>
                    <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                      Dual Script
                    </span>
                  </div>
                  <StatusBadge status="HIGH" size="sm" />
                </div>
                <div className="flex items-center justify-between mt-1">
                  {editingFieldKey === 'ownerName' ? (
                    <div className="flex items-center gap-2 flex-1 mr-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="text-xs font-bold px-2 py-1 border rounded w-full bg-white"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit('ownerName')}
                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {currentDoc.ownerName}
                      </div>
                      {cadastral?.tamilOwnerName && (
                        <div className="text-xs font-semibold text-emerald-800 mt-0.5">
                          {cadastral.tamilOwnerName}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit('ownerName', currentDoc.ownerName);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-700 rounded hover:bg-white"
                      title="Edit value"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Field: Survey Number */}
              <div
                onClick={() => handleFieldClick('surveyNumber')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  currentDoc.overallConfidence === 'LOW'
                    ? 'border-amber-300 bg-amber-50/70'
                    : highlightedField === 'surveyNumber'
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-400'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Survey Number & Sub-Division / புல எண்
                    </span>
                    {currentDoc.overallConfidence === 'LOW' && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Faint Optical Scan
                      </span>
                    )}
                  </div>
                  <StatusBadge status={currentDoc.overallConfidence} size="sm" />
                </div>

                <div className="flex items-center justify-between mt-1">
                  {editingFieldKey === 'surveyNumber' ? (
                    <div className="flex items-center gap-2 flex-1 mr-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="text-xs font-mono font-bold px-2 py-1 border rounded w-full bg-white"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit('surveyNumber')}
                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-mono font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                      {currentDoc.surveyNumber}
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit('surveyNumber', currentDoc.surveyNumber);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-700 rounded hover:bg-white"
                    title="Correct Survey Number"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Field: Village & Taluk & District */}
              <div
                onClick={() => handleFieldClick('village')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  highlightedField === 'village'
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-400'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Jurisdiction / கிராமம் & வட்டம் & மாவட்டம்
                  </span>
                  <StatusBadge status="HIGH" size="sm" />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <span className="text-sm font-semibold text-slate-900">
                      {currentDoc.village}, {currentDoc.taluk}, {currentDoc.district}
                    </span>
                    {(cadastral?.tamilVillage || cadastral?.tamilTaluk) && (
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {cadastral?.tamilVillage}, {cadastral?.tamilTaluk}, {cadastral?.tamilDistrict}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit('village', currentDoc.village);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-700 rounded hover:bg-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Field: Land Extent / Area */}
              <div
                onClick={() => handleFieldClick('landArea')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  highlightedField === 'landArea'
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-400'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Land Extent & Area / பரப்பளவு
                  </span>
                  <StatusBadge status="HIGH" size="sm" />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-mono font-bold text-slate-900">
                    {currentDoc.landArea}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit('landArea', currentDoc.landArea);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-700 rounded hover:bg-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Four Boundaries (நான்கு எல்லைகள்) Schedule Grid */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Schedule of Boundaries / நான்கு எல்லைகள்
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">GIS Cadastral Polygon Sync</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* North */}
                  <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-600 flex items-center gap-1 text-[11px]">
                        ⬆️ North (வடக்கு)
                      </span>
                      <button
                        onClick={() => handleStartBoundaryEdit('north', boundaries.north || '')}
                        className="text-slate-400 hover:text-blue-600"
                        title="Edit boundary"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    {editingBoundaryKey === 'north' ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="text"
                          value={editingBoundaryValue}
                          onChange={(e) => setEditingBoundaryValue(e.target.value)}
                          className="text-xs px-1.5 py-0.5 border rounded w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveBoundaryEdit('north')}
                          className="p-1 bg-emerald-600 text-white rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-800 font-medium">
                        {boundaries.north || 'Survey Boundary 143-B'}
                        {boundaries.tamilNorth && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{boundaries.tamilNorth}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* South */}
                  <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-600 flex items-center gap-1 text-[11px]">
                        ⬇️ South (தெற்கு)
                      </span>
                      <button
                        onClick={() => handleStartBoundaryEdit('south', boundaries.south || '')}
                        className="text-slate-400 hover:text-blue-600"
                        title="Edit boundary"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    {editingBoundaryKey === 'south' ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="text"
                          value={editingBoundaryValue}
                          onChange={(e) => setEditingBoundaryValue(e.target.value)}
                          className="text-xs px-1.5 py-0.5 border rounded w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveBoundaryEdit('south')}
                          className="p-1 bg-emerald-600 text-white rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-800 font-medium">
                        {boundaries.south || 'Village Access Road'}
                        {boundaries.tamilSouth && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{boundaries.tamilSouth}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* East */}
                  <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-600 flex items-center gap-1 text-[11px]">
                        ➡️ East (கிழக்கு)
                      </span>
                      <button
                        onClick={() => handleStartBoundaryEdit('east', boundaries.east || '')}
                        className="text-slate-400 hover:text-blue-600"
                        title="Edit boundary"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    {editingBoundaryKey === 'east' ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="text"
                          value={editingBoundaryValue}
                          onChange={(e) => setEditingBoundaryValue(e.target.value)}
                          className="text-xs px-1.5 py-0.5 border rounded w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveBoundaryEdit('east')}
                          className="p-1 bg-emerald-600 text-white rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-800 font-medium">
                        {boundaries.east || 'Adjacent Survey 144'}
                        {boundaries.tamilEast && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{boundaries.tamilEast}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* West */}
                  <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-600 flex items-center gap-1 text-[11px]">
                        ⬅️ West (மேற்கு)
                      </span>
                      <button
                        onClick={() => handleStartBoundaryEdit('west', boundaries.west || '')}
                        className="text-slate-400 hover:text-blue-600"
                        title="Edit boundary"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    {editingBoundaryKey === 'west' ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="text"
                          value={editingBoundaryValue}
                          onChange={(e) => setEditingBoundaryValue(e.target.value)}
                          className="text-xs px-1.5 py-0.5 border rounded w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveBoundaryEdit('west')}
                          className="p-1 bg-emerald-600 text-white rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-800 font-medium">
                        {boundaries.west || 'Public Canal'}
                        {boundaries.tamilWest && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{boundaries.tamilWest}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Remarks / Notes Box */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Officer Verification Remarks (சரிபார்ப்புக் குறிப்புகள்)
              </label>
              <textarea
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                rows={2}
                placeholder="Add verification notes, field survey verification reference, or volume number..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-sans"
              />
            </div>

            {/* Quick Actions Bar */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleReject}
                className="px-3.5 py-2 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject / Return Document</span>
              </button>

              <button
                id="btn-confirm-and-gis"
                onClick={handleSendToGis}
                className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Confirm & Send to GIS Validation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

