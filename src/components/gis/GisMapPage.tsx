import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { GisParcelData } from '../../types';
import {
  Search,
  ZoomIn,
  ZoomOut,
  Navigation,
  Globe,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Layers,
  Compass,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

import { getCoimbatoreGeneratedParcels, COIMBATORE_DATASET_VILLAGES } from '../../data/coimbatoreDataset';
import { getOtherDistrictsGeneratedParcels, OTHER_DISTRICTS_VILLAGES } from '../../data/otherDistrictsDataset';

interface GisMapPageProps {
  embedded?: boolean;
}

const cbeGen = getCoimbatoreGeneratedParcels();
const otherGen = getOtherDistrictsGeneratedParcels();

// TAMIL NADU GEOGRAPHIC LOCATIONS & CADASTRAL BOUNDARIES
const TAMIL_NADU_CENTER: L.LatLngExpression = [11.1271, 78.6569];
const VANDALUR_CADASTRE_CENTER: L.LatLngExpression = [12.8904, 80.0812];

const BASE_TN_LOCATIONS: Record<string, { lat: number; lng: number; zoom: number; label: string }> = {
  ALL: { lat: 11.1271, lng: 78.6569, zoom: 7.5, label: 'All Tamil Nadu (தமிழ்நாடு)' },
  Vandalur: { lat: 12.8904, lng: 80.0812, zoom: 15.5, label: 'Vandalur (வண்டலூர் - Chengalpattu)' },
  Padappai: { lat: 12.8950, lng: 80.0150, zoom: 15.5, label: 'Padappai (படப்பை - Sriperumbudur)' },
  Guduvancheri: { lat: 12.8450, lng: 80.0650, zoom: 15.5, label: 'Guduvancheri (கூடுவாஞ்சேரி)' },
  Mudichur: { lat: 12.9150, lng: 80.0600, zoom: 15.5, label: 'Mudichur (முடிச்சூர் - Tambaram)' },
  Coimbatore: { lat: 11.0168, lng: 76.9558, zoom: 12, label: 'Coimbatore Center (கோயம்புத்தூர்)' },
  Mettupalayam: { lat: 11.3000, lng: 76.9350, zoom: 13, label: 'Mettupalayam (மேட்டுப்பாளையம்)' },
  Sulur: { lat: 11.0250, lng: 77.1250, zoom: 13, label: 'Sulur (சூலூர்)' },
  Pollachi: { lat: 10.6600, lng: 77.0000, zoom: 13, label: 'Pollachi (பொள்ளாச்சி)' },
  Madurai: { lat: 9.9252, lng: 78.1198, zoom: 12, label: 'Madurai (மதுரை)' },
  Tiruchirappalli: { lat: 10.7905, lng: 78.7047, zoom: 12, label: 'Tiruchirappalli (திருச்சிராப்பள்ளி)' },
  Salem: { lat: 11.6643, lng: 78.1460, zoom: 12, label: 'Salem (சேலம்)' },
  Chennai: { lat: 13.0827, lng: 80.2707, zoom: 12, label: 'Chennai Metropolitan (சென்னை)' },
};

const TN_LOCATIONS: Record<string, { lat: number; lng: number; zoom: number; label: string }> = {
  ...BASE_TN_LOCATIONS,
};

COIMBATORE_DATASET_VILLAGES.forEach((v) => {
  const key = `${v.villageName} (${v.subDistrictName})`;
  TN_LOCATIONS[key] = {
    lat: v.lat,
    lng: v.lng,
    zoom: 15.5,
    label: `📍 ${v.villageName} (${v.subDistrictName})`,
  };
});

OTHER_DISTRICTS_VILLAGES.forEach((v) => {
  const key = `${v.villageName} (${v.subDistrictName}, ${v.districtName})`;
  TN_LOCATIONS[key] = {
    lat: v.lat,
    lng: v.lng,
    zoom: 15.5,
    label: `📍 ${v.villageName} (${v.subDistrictName})`,
  };
});

// REAL GEOGRAPHIC LAT/LNG POLYGON COORDINATES FOR TAMIL NADU CADASTRAL PARCELS
const CADASTRAL_GEO_POLYGONS: Record<string, L.LatLngExpression[]> = {
  ...cbeGen.geoPolygons,
  ...otherGen.geoPolygons,
  'TN-CGL-1243A': [
    [12.8910, 80.0800],
    [12.8935, 80.0835],
    [12.8905, 80.0850],
    [12.8885, 80.0810],
  ],
  'TN-CGL-1244B': [
    [12.8935, 80.0835],
    [12.8955, 80.0870],
    [12.8920, 80.0885],
    [12.8905, 80.0850],
  ],
  'TN-SRP-0882C': [
    [12.8950, 80.0150],
    [12.8975, 80.0190],
    [12.8940, 80.0210],
    [12.8920, 80.0170],
  ],
  'TN-CGL-1521A': [
    [12.8450, 80.0650],
    [12.8485, 80.0700],
    [12.8440, 80.0730],
    [12.8415, 80.0680],
  ],
  'TN-TBM-2045B': [
    [12.9150, 80.0600],
    [12.9180, 80.0635],
    [12.9145, 80.0660],
    [12.9120, 80.0620],
  ],
  'TN-CGL-1248A': [
    [12.8955, 80.0870],
    [12.8980, 80.0910],
    [12.8945, 80.0925],
    [12.8920, 80.0885],
  ],
};

type BaseMapStyle = 'SATELLITE' | 'STREET' | 'HYBRID';

export const GisMapPage: React.FC<GisMapPageProps> = ({ embedded = false }) => {
  const {
    gisParcels,
    selectedParcelId,
    selectParcel,
    documents,
    navigateTo,
    selectDocument,
    t,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<Record<string, L.Polygon>>({});
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const referenceTileLayerRef = useRef<L.TileLayer | null>(null);

  // Search & Map Mode State
  const [mapSearch, setMapSearch] = useState('');
  const [activeVillageFilter, setActiveVillageFilter] = useState('ALL');
  const [mapStyle, setMapStyle] = useState<BaseMapStyle>('SATELLITE');
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [isLocating, setIsLocating] = useState(false);

  // Active selected parcel
  const activeParcel: GisParcelData | undefined =
    gisParcels.find((p) => p.parcelId === selectedParcelId) || gisParcels[0];

  // Associated document if any
  const associatedDocument = documents.find(
    (d) => d.surveyNumber === activeParcel?.surveyNumber
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered initially on Vandalur Cadastre
    const map = L.map(mapContainerRef.current, {
      center: VANDALUR_CADASTRE_CENTER,
      zoom: 15,
      minZoom: 6,
      maxZoom: 19,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Base Tile Layer based on mapStyle (Satellite, Street, Hybrid)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (referenceTileLayerRef.current) {
      map.removeLayer(referenceTileLayerRef.current);
      referenceTileLayerRef.current = null;
    }

    if (mapStyle === 'SATELLITE' || mapStyle === 'HYBRID') {
      // High-Resolution Esri World Imagery (HD Satellite)
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri, Maxar, Earthstar Geographics, Tamil Nadu Cadastre',
          maxZoom: 19,
        }
      ).addTo(map);
      baseTileLayerRef.current = satLayer;

      if (mapStyle === 'HYBRID') {
        // Overlay crisp road & place names
        const refLayer = L.tileLayer(
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 19,
          }
        ).addTo(map);
        referenceTileLayerRef.current = refLayer;
      }
    } else {
      // Clean, high-contrast street map (CartoDB Voyager)
      const streetLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);
      baseTileLayerRef.current = streetLayer;
    }
  }, [mapStyle]);

  // Sync Parcels Polygons on Leaflet Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing polygon layers
    Object.values(polygonLayersRef.current).forEach((poly: L.Polygon) => poly.remove());
    polygonLayersRef.current = {};

    if (!showBoundaries) return;

    gisParcels.forEach((parcel) => {
      const geoCoords = CADASTRAL_GEO_POLYGONS[parcel.parcelId];
      if (!geoCoords) return;

      const isSelected = parcel.parcelId === selectedParcelId;
      const isConflict = parcel.status === 'CONFLICT';

      const fillColor = isSelected
        ? '#10b981' // emerald green
        : isConflict
        ? '#ef4444' // red
        : parcel.status === 'BUFFER_RESTRICTED'
        ? '#f59e0b' // amber
        : parcel.status === 'PENDING'
        ? '#eab308' // yellow
        : '#059669';

      const strokeColor = isSelected ? '#34d399' : isConflict ? '#f87171' : '#6ee7b7';

      const polygon = L.polygon(geoCoords, {
        color: strokeColor,
        weight: isSelected ? 3.5 : 2,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.6 : isConflict ? 0.5 : 0.35,
      }).addTo(map);

      // Tooltip with Survey Number & Owner
      polygon.bindTooltip(
        `<div class="font-sans text-xs font-semibold py-0.5 px-1">
          <span class="font-bold">Survey ${parcel.surveyNumber}</span>
          <br/><span class="text-slate-500">${parcel.village}</span>
        </div>`,
        { sticky: true, className: 'cadastre-tooltip' }
      );

      polygon.on('click', () => {
        selectParcel(parcel.parcelId);
        const matchedDoc = documents.find((d) => d.surveyNumber === parcel.surveyNumber);
        if (matchedDoc) selectDocument(matchedDoc.id);
      });

      polygonLayersRef.current[parcel.parcelId] = polygon;
    });
  }, [gisParcels, selectedParcelId, showBoundaries, selectParcel, selectDocument, documents]);

  // Handle Zoom controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetMap = () => {
    setActiveVillageFilter('ALL');
    mapInstanceRef.current?.flyTo(TAMIL_NADU_CENTER, 7.5, {
      duration: 1.5,
    });
  };

  // Find My Land / GPS Location
  const handleLocateMyLand = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          mapInstanceRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 16, {
            duration: 1.2,
          });
        },
        () => {
          // Fallback to active parcel or Vandalur
          setIsLocating(false);
          selectParcel('TN-CGL-1243A');
          mapInstanceRef.current?.flyTo([12.8904, 80.0812], 16, { duration: 1.2 });
        },
        { timeout: 4000 }
      );
    } else {
      setIsLocating(false);
      selectParcel('TN-CGL-1243A');
      mapInstanceRef.current?.flyTo([12.8904, 80.0812], 16, { duration: 1.2 });
    }
  };

  const handleVillageFilterChange = (villageKey: string) => {
    setActiveVillageFilter(villageKey);
    const loc = TN_LOCATIONS[villageKey];
    if (loc && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], loc.zoom, { duration: 1.2 });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearch.trim()) return;

    const matched = gisParcels.find(
      (p) =>
        p.surveyNumber.toLowerCase().includes(mapSearch.toLowerCase()) ||
        p.parcelId.toLowerCase().includes(mapSearch.toLowerCase()) ||
        p.village.toLowerCase().includes(mapSearch.toLowerCase())
    );

    if (matched) {
      selectParcel(matched.parcelId);
      const coords = CADASTRAL_GEO_POLYGONS[matched.parcelId];
      if (coords && coords[0] && mapInstanceRef.current) {
        const center = coords[0] as [number, number];
        mapInstanceRef.current.flyTo(center, 16.5, { duration: 1.2 });
      }
    }
  };

  return (
    <div
      id="gis-map-page"
      className={`flex flex-col relative overflow-hidden bg-slate-900 ${
        embedded
          ? 'h-[560px] rounded-2xl border border-slate-200 shadow-sm'
          : 'h-[calc(100vh-104px)]'
      }`}
    >
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Search & Village Filter */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-md border border-slate-200/90"
        >
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="gis-map-search-input"
              type="text"
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              placeholder={t('mapSearchPlaceholder')}
              className="pl-9 pr-2 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none w-40 sm:w-56 font-sans bg-transparent"
            />
          </div>

          <select
            value={activeVillageFilter}
            onChange={(e) => handleVillageFilterChange(e.target.value)}
            className="text-xs font-semibold py-1.5 px-2 rounded-xl bg-slate-100 text-slate-700 border-none outline-none cursor-pointer max-w-[130px] sm:max-w-[180px] truncate"
          >
            {Object.entries(TN_LOCATIONS).map(([key, loc]) => (
              <option key={key} value={key}>
                {loc.label}
              </option>
            ))}
          </select>
        </form>

        {/* Map Layer Switcher (Satellite / Clean Map / Hybrid) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200/90 text-xs">
            <button
              onClick={() => setMapStyle('SATELLITE')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                mapStyle === 'SATELLITE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('mapSatellite')}
            </button>
            <button
              onClick={() => setMapStyle('STREET')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                mapStyle === 'STREET'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('mapStreet')}
            </button>
            <button
              onClick={() => setMapStyle('HYBRID')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                mapStyle === 'HYBRID'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('mapHybrid')}
            </button>
          </div>

          {/* GPS Find My Land Button */}
          <button
            onClick={handleLocateMyLand}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md text-emerald-800 text-xs font-bold shadow-md hover:bg-emerald-50 transition-colors border border-slate-200/90 pointer-events-auto"
            title={t('mapFindMe')}
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('mapFindMe')}</span>
          </button>
        </div>
      </div>

      {/* Floating Zoom Controls (Bottom Left) */}
      <div className="absolute bottom-5 left-3 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom In"
          className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 hover:bg-slate-100 shadow-md border border-slate-200 transition-colors"
          title={t('mapZoomIn')}
        >
          <ZoomIn className="w-4 h-4 text-slate-700" />
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom Out"
          className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 hover:bg-slate-100 shadow-md border border-slate-200 transition-colors"
          title={t('mapZoomOut')}
        >
          <ZoomOut className="w-4 h-4 text-slate-700" />
        </button>
        <button
          onClick={handleResetMap}
          aria-label="Reset View"
          className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 hover:bg-slate-100 shadow-md border border-slate-200 transition-colors"
          title={t('mapReset')}
        >
          <Globe className="w-4 h-4 text-emerald-600" />
        </button>
      </div>

      {/* Leaflet Map Viewport */}
      <div
        ref={mapContainerRef}
        className="flex-1 w-full h-full relative z-0 overflow-hidden select-none"
      />

      {/* Clean, Farmer-Friendly Parcel Details Card (Bottom Right) */}
      {activeParcel && (
        <div
          id="parcel-info-drawer"
          className="absolute bottom-4 right-3 z-20 w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-4 sm:p-5 space-y-3.5 animate-in slide-in-from-bottom-2"
        >
          <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t('parcelTitle')}
                </span>
                <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-600 font-semibold">
                  {activeParcel.parcelId}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <span>{t('surveyNumber')}:</span>
                <span className="font-mono text-emerald-700">{activeParcel.surveyNumber}</span>
              </h3>
            </div>

            <StatusBadge status={activeParcel.status} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-50/80 p-2 rounded-xl">
              <span className="text-slate-500 block text-[10px] font-medium">{t('jurisdiction')}</span>
              <span className="font-bold text-slate-800">{activeParcel.village}</span>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-xl">
              <span className="text-slate-500 block text-[10px] font-medium">{t('landArea')}</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">
                {activeParcel.areaAcres} {t('acres')}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">
                (~{(activeParcel.areaAcres * 100).toFixed(0)} {t('cents')})
              </span>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-xl">
              <span className="text-slate-500 block text-[10px] font-medium">{t('landType')}</span>
              <span className="text-slate-800 font-semibold truncate block">
                {activeParcel.landUse.includes('Nanjai')
                  ? t('wetland')
                  : activeParcel.landUse.includes('Punjai')
                  ? t('dryland')
                  : t('residential')}
              </span>
            </div>

            <div className="bg-slate-50/80 p-2 rounded-xl">
              <span className="text-slate-500 block text-[10px] font-medium">{t('roadAccess')}</span>
              <span className="text-slate-800 font-semibold">
                {activeParcel.roadAccess ? `✓ ${t('roadYes')}` : `✕ ${t('roadNo')}`}
              </span>
            </div>
          </div>

          {/* Verification Status Notice */}
          {activeParcel.status === 'CONFLICT' ? (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{t('boundaryConflictAlert')}</span>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('boundaryVerifiedNotice')}</span>
            </div>
          )}

          {/* Associated Land Deed / Document Link */}
          {associatedDocument && (
            <div className="pt-1">
              <button
                onClick={() => {
                  selectDocument(associatedDocument.id);
                  navigateTo('document-details', associatedDocument.id);
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>
                  {t('viewDocumentBtn')} ({associatedDocument.documentNumber})
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
