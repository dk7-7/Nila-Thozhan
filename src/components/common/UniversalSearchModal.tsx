import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, FileText, MapPin, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const UniversalSearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    closeSearchModal,
    searchQuery: initialQuery,
    documents,
    gisParcels,
    navigateTo,
  } = useApp();

  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery, isSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();

  const matchedDocs = normalizedQuery
    ? documents.filter(
        (doc) =>
          doc.documentNumber.toLowerCase().includes(normalizedQuery) ||
          doc.surveyNumber.toLowerCase().includes(normalizedQuery) ||
          doc.ownerName.toLowerCase().includes(normalizedQuery) ||
          doc.village.toLowerCase().includes(normalizedQuery) ||
          doc.district.toLowerCase().includes(normalizedQuery) ||
          doc.status.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const matchedParcels = normalizedQuery
    ? gisParcels.filter(
        (parcel) =>
          parcel.surveyNumber.toLowerCase().includes(normalizedQuery) ||
          parcel.parcelId.toLowerCase().includes(normalizedQuery) ||
          parcel.village.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const handleSelectDoc = (docId: string) => {
    closeSearchModal();
    navigateTo('document-details', docId);
  };

  const handleSelectParcel = (parcelId: string) => {
    closeSearchModal();
    navigateTo('gis-map', undefined, parcelId);
  };

  return (
    <div
      id="universal-search-dialog"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={closeSearchModal}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            id="universal-search-input"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Survey Number (e.g. 124/3A), Document ID, Owner, Village..."
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeSearchModal}
            className="ml-2 text-xs font-medium px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!normalizedQuery && (
            <div className="text-center py-8 text-slate-500 text-sm">
              <p className="font-medium text-slate-700 mb-1">
                Universal Land Record Search
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Quickly locate land deeds, survey numbers, cadastral GIS parcels, or validation reports.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-slate-400">Try searching:</span>
                <button
                  onClick={() => setQuery('124/3A')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300"
                >
                  124/3A (Survey No)
                </button>
                <button
                  onClick={() => setQuery('LR-2024-001')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300"
                >
                  LR-2024-001 (Doc ID)
                </button>
                <button
                  onClick={() => setQuery('Krishnapuram')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300"
                >
                  Krishnapuram (Village)
                </button>
              </div>
            </div>
          )}

          {normalizedQuery && matchedDocs.length === 0 && matchedParcels.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              <p className="font-semibold text-slate-700">No records found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">
                Please check the survey number or village spelling.
              </p>
            </div>
          )}

          {/* Matched Documents */}
          {matchedDocs.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
                Land Documents ({matchedDocs.length})
              </div>
              <div className="space-y-2">
                {matchedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc.id)}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded group-hover:bg-blue-100 transition-colors">
                        <FileText className="w-4 h-4 text-slate-600 group-hover:text-blue-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">
                            {doc.documentNumber}
                          </span>
                          <span className="text-xs text-slate-500">• {doc.documentType}</span>
                          <StatusBadge status={doc.status} size="sm" />
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Survey: <strong className="text-slate-900">{doc.surveyNumber}</strong> |{' '}
                          Owner: <strong>{doc.ownerName}</strong> | {doc.village}, {doc.district}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched GIS Parcels */}
          {matchedParcels.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
                GIS Cadastral Parcels ({matchedParcels.length})
              </div>
              <div className="space-y-2">
                {matchedParcels.map((parcel) => (
                  <div
                    key={parcel.parcelId}
                    onClick={() => handleSelectParcel(parcel.parcelId)}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded group-hover:bg-emerald-100 transition-colors">
                        <MapPin className="w-4 h-4 text-slate-600 group-hover:text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">
                            Survey {parcel.surveyNumber}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            ({parcel.parcelId})
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {parcel.areaAcres} acres
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Village: <strong>{parcel.village}</strong> | Land Use: {parcel.landUse}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-700 flex items-center gap-1 group-hover:underline">
                      View on Map <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
