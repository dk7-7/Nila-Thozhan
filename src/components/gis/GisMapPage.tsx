import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { GisParcelData } from '../../types';
import { SentinelSettingsModal } from './SentinelSettingsModal';
import {
  SentinelBandMode,
  getBandDetails,
  getStoredSentinelCredentials,
  fetchSentinelMetaData,
  calculateSentinelLandMetrics,
  SentinelMetaData,
} from '../../services/sentinelService';
import {
  Layers,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  AlertTriangle,
  ExternalLink,
  Ruler,
  Satellite,
  Globe,
  MapPin,
  X,
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
  ALL: { lat: 11.1271, lng: 78.6569, zoom: 7.5, label: 'All Tamil Nadu (State View)' },
  Coimbatore: { lat: 11.0168, lng: 76.9558, zoom: 12, label: 'Coimbatore District Center' },
  Thoothukkudi: { lat: 8.7642, lng: 78.1348, zoom: 12, label: 'Thoothukkudi District' },
  Perambalur: { lat: 11.2333, lng: 78.8833, zoom: 12, label: 'Perambalur District' },
  'The Nilgiris': { lat: 11.4000, lng: 76.7000, zoom: 12, label: 'The Nilgiris District' },
  Mettupalayam: { lat: 11.3000, lng: 76.9350, zoom: 13, label: 'Mettupalayam Sub-District' },
  Sulur: { lat: 11.0250, lng: 77.1250, zoom: 13, label: 'Sulur Sub-District' },
  Thondamuthur: { lat: 10.9850, lng: 76.8420, zoom: 13, label: 'Thondamuthur Sub-District' },
  Pollachi: { lat: 10.6600, lng: 77.0000, zoom: 13, label: 'Pollachi Sub-District' },
  Anaimalai: { lat: 10.4800, lng: 76.8500, zoom: 13, label: 'Anaimalai Sub-District' },
  Vandalur: { lat: 12.8904, lng: 80.0812, zoom: 15.5, label: 'Vandalur (Chengalpattu)' },
  Padappai: { lat: 12.8950, lng: 80.0150, zoom: 15.5, label: 'Padappai (Sriperumbudur)' },
  Guduvancheri: { lat: 12.8450, lng: 80.0650, zoom: 15.5, label: 'Guduvancheri (Vandalur)' },
  Mudichur: { lat: 12.9150, lng: 80.0600, zoom: 15.5, label: 'Mudichur (Tambaram)' },
  Chennai: { lat: 13.0827, lng: 80.2707, zoom: 12, label: 'Chennai Metropolitan Zone' },
  Madurai: { lat: 9.9252, lng: 78.1198, zoom: 12, label: 'Madurai District' },
  Tiruchirappalli: { lat: 10.7905, lng: 78.7047, zoom: 12, label: 'Tiruchirappalli (Trichy)' },
  Salem: { lat: 11.6643, lng: 78.1460, zoom: 12, label: 'Salem District' },
};

// Dynamically populate all dataset villages into location options
const TN_LOCATIONS: Record<string, { lat: number; lng: number; zoom: number; label: string }> = {
  ...BASE_TN_LOCATIONS,
};

COIMBATORE_DATASET_VILLAGES.forEach((v) => {
  const key = `${v.villageName} (${v.subDistrictName})`;
  TN_LOCATIONS[key] = {
    lat: v.lat,
    lng: v.lng,
    zoom: 15.5,
    label: `📍 ${v.villageName} (${v.subDistrictName}, CBE)`,
  };
});

OTHER_DISTRICTS_VILLAGES.forEach((v) => {
  const key = `${v.villageName} (${v.subDistrictName}, ${v.districtName})`;
  TN_LOCATIONS[key] = {
    lat: v.lat,
    lng: v.lng,
    zoom: 15.5,
    label: `📍 ${v.villageName} (${v.subDistrictName}, ${v.districtName.substring(0, 3).toUpperCase()})`,
  };
});

// REAL GEOGRAPHIC LAT/LNG POLYGON COORDINATES FOR TAMIL NADU CADASTRAL PARCELS
const CADASTRAL_GEO_POLYGONS: Record<string, L.LatLngExpression[]> = {
  ...cbeGen.geoPolygons,
  ...otherGen.geoPolygons,
  // CHENGALPATTU / KANCHIPURAM PARCELS
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

export const GisMapPage: React.FC<GisMapPageProps> = ({ embedded = false }) => {
  const {
    gisParcels,
    selectedParcelId,
    selectParcel,
    documents,
    navigateTo,
    selectDocument,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<Record<string, L.Polygon>>({});

  // Search & Filter state
  const [mapSearch, setMapSearch] = useState('');
  const [activeVillageFilter, setActiveVillageFilter] = useState('ALL');
  const [currentZoom, setCurrentZoom] = useState(14);

  // Interactive Measurement Tool state
  const [measurementMode, setMeasurementMode] = useState<'NONE' | 'DISTANCE' | 'AREA'>('NONE');

  // Sentinel-2 Satellite Multispectral State
  const [sentinelBandMode, setSentinelBandMode] = useState<SentinelBandMode>('TRUE_COLOR');
  const [isSentinelSettingsOpen, setIsSentinelSettingsOpen] = useState(false);
  const [hasSentinelCreds, setHasSentinelCreds] = useState<boolean>(() => {
    const creds = getStoredSentinelCredentials();
    return Boolean(creds.clientId && creds.clientSecret);
  });
  const [sentinelMeta, setSentinelMeta] = useState<SentinelMetaData | null>(null);

  useEffect(() => {
    fetchSentinelMetaData().then((meta) => setSentinelMeta(meta));
  }, [hasSentinelCreds]);

  // Layer toggles
  const [layers, setLayers] = useState({
    sentinelSatellite: true,
    landParcels: true,
    roads: true,
    waterBodies: true,
    buildings: true,
    historicalParcels: false,
    validationIssues: true,
  });

  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState(false);

  // Active selected parcel
  const activeParcel: GisParcelData | undefined =
    gisParcels.find((p) => p.parcelId === selectedParcelId) || gisParcels[0];

  // Associated document if any
  const associatedDocument = documents.find(
    (d) => d.surveyNumber === activeParcel?.surveyNumber
  );

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet Map centered on Tamil Nadu Vandalur Cadastre
    const map = L.map(mapContainerRef.current, {
      center: VANDALUR_CADASTRE_CENTER,
      zoom: 14,
      minZoom: 6,
      maxZoom: 19,
      zoomControl: false, // We render custom floating zoom buttons
    });

    // High-Resolution Esri World Imagery Satellite Tile Layer for Tamil Nadu
    const tileLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Esri, Maxar, Earthstar Geographics, Tamil Nadu Land Cadastre',
        maxZoom: 19,
      }
    ).addTo(map);

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Leaflet Tile Pane CSS Filters when Multispectral Band changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const tilePane = mapInstanceRef.current.getPane('tilePane');
    if (tilePane) {
      let filter = 'brightness(1.05) contrast(1.1)';
      if (sentinelBandMode === 'NDVI') {
        filter = 'hue-rotate(85deg) contrast(145%) saturate(230%)';
      } else if (sentinelBandMode === 'FALSE_COLOR') {
        filter = 'hue-rotate(280deg) contrast(150%) saturate(210%)';
      } else if (sentinelBandMode === 'MOISTURE') {
        filter = 'hue-rotate(180deg) contrast(130%) saturate(200%)';
      }
      tilePane.style.filter = filter;
    }
  }, [sentinelBandMode]);

  // Sync Parcels Polygons on Leaflet Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing polygon layers
    Object.values(polygonLayersRef.current).forEach((poly: L.Polygon) => poly.remove());
    polygonLayersRef.current = {};

    if (!layers.landParcels) return;

    gisParcels.forEach((parcel) => {
      const geoCoords = CADASTRAL_GEO_POLYGONS[parcel.parcelId];
      if (!geoCoords) return;

      const isSelected = parcel.parcelId === selectedParcelId;
      const isConflict = parcel.status === 'CONFLICT';

      const fillColor = isSelected
        ? '#059669'
        : isConflict
        ? '#e11d48'
        : parcel.status === 'BUFFER_RESTRICTED'
        ? '#d97706'
        : parcel.status === 'PENDING'
        ? '#eab308'
        : '#10b981';

      const strokeColor = isSelected ? '#34d399' : isConflict ? '#f43f5e' : '#6ee7b7';

      const polygon = L.polygon(geoCoords, {
        color: strokeColor,
        weight: isSelected ? 3.5 : 2,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.65 : isConflict ? 0.5 : 0.35,
      }).addTo(map);


      polygon.on('click', () => {
        selectParcel(parcel.parcelId);
        const matchedDoc = documents.find((d) => d.surveyNumber === parcel.surveyNumber);
        if (matchedDoc) selectDocument(matchedDoc.id);
      });

      polygonLayersRef.current[parcel.parcelId] = polygon;
    });
  }, [gisParcels, selectedParcelId, layers.landParcels, selectParcel, selectDocument, documents]);

  // Handle Zoom controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetMap = () => {
    // Reset to Full Tamil Nadu View
    setActiveVillageFilter('ALL');
    mapInstanceRef.current?.flyTo(TN_LOCATIONS.ALL.lat ? [TN_LOCATIONS.ALL.lat, TN_LOCATIONS.ALL.lng] : TAMIL_NADU_CENTER, 7.5, {
      duration: 1.5,
    });
  };

  const handleSimulateCurrentLocation = () => {
    selectParcel('TN-CGL-1243A');
    mapInstanceRef.current?.flyTo([12.8904, 80.0812], 16, { duration: 1.2 });
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
      className={`flex flex-col relative overflow-hidden bg-slate-950 ${
        embedded
          ? 'h-[560px] rounded-xl border border-slate-800'
          : 'h-[calc(100vh-100px)] -m-4 sm:-m-6'
      }`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Search & Village / District Navigation Filter */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl p-1.5 shadow-lg border border-slate-200"
        >
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="gis-map-search-input"
              type="text"
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              placeholder="Search Survey # or Village..."
              className="pl-8 pr-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none w-44 sm:w-56 font-sans"
            />
          </div>

          <select
            value={activeVillageFilter}
            onChange={(e) => handleVillageFilterChange(e.target.value)}
            className="text-xs font-semibold py-1.5 px-2 rounded-lg bg-slate-100 text-slate-700 border-none outline-none cursor-pointer"
          >
            {Object.entries(TN_LOCATIONS).map(([key, loc]) => (
              <option key={key} value={key}>
                {loc.label}
              </option>
            ))}
          </select>
        </form>

        {/* Action buttons: Current Location, Measurement & Layer Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              if (measurementMode === 'NONE') setMeasurementMode('DISTANCE');
              else if (measurementMode === 'DISTANCE') setMeasurementMode('AREA');
              else setMeasurementMode('NONE');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg transition-colors border ${
              measurementMode !== 'NONE'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white/95 backdrop-blur-md text-slate-800 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>{measurementMode === 'NONE' ? 'Measure GIS' : `Measure: ${measurementMode}`}</span>
          </button>

          <button
            onClick={() => setIsSentinelSettingsOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg transition-colors border ${
              hasSentinelCreds
                ? 'bg-emerald-700 text-white border-emerald-600'
                : 'bg-white/95 backdrop-blur-md text-slate-800 border-slate-200 hover:bg-slate-100'
            }`}
            title="Configure Copernicus Sentinel-2 OAuth Credentials"
          >
            <Satellite className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {hasSentinelCreds ? 'Sentinel-2 Connected' : 'Sentinel API Config'}
            </span>
          </button>

          <button
            onClick={handleSimulateCurrentLocation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 text-xs font-semibold shadow-lg hover:bg-slate-100 transition-colors border border-slate-200"
            title="Fly to Active Vandalur Cadastre Parcel"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">My Cadastre</span>
          </button>

          <button
            onClick={() => setIsLayerDrawerOpen(!isLayerDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg transition-colors border ${
              isLayerDrawerOpen
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white/95 backdrop-blur-md text-slate-800 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Map Layers</span>
          </button>
        </div>
      </div>

      {/* Floating Sentinel-2 Multispectral Band Selector Bar */}
      {layers.sentinelSatellite && (
        <div className="absolute top-18 left-4 z-20 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-white text-xs shadow-xl">
            <div className="flex items-center gap-1.5 px-2 text-emerald-400 font-bold border-r border-slate-800 shrink-0">
              <Satellite className="w-4 h-4" />
              <span className="hidden md:inline">Sentinel-2 L2A</span>
            </div>

            {(['TRUE_COLOR', 'NDVI', 'FALSE_COLOR', 'MOISTURE'] as SentinelBandMode[]).map((mode) => {
              const details = getBandDetails(mode);
              const isActive = sentinelBandMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setSentinelBandMode(mode)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={details.description}
                >
                  <span>{details.label.split(' ')[0]}</span>
                  <span className="text-[9px] opacity-75 font-mono">({details.code.split(',')[0]})</span>
                </button>
              );
            })}
          </div>

          {/* Live Orbit Telemetry Badge */}
          {sentinelMeta && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-emerald-400 font-bold">
                Pass: {sentinelMeta.acquisitionDate}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Cloud: {sentinelMeta.cloudCoverPercent}%</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[10px]">{sentinelMeta.spatialResolution}</span>
            </div>
          )}
        </div>
      )}

      {/* Layer Control Panel Floating Drawer */}
      {isLayerDrawerOpen && (
        <div className="absolute top-18 right-4 z-30 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Cadastral Layers</span>
            </h4>
            <button
              onClick={() => setIsLayerDrawerOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
              <span className="flex items-center gap-2 font-medium text-slate-800">
                <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-700" />
                🛰️ Esri High-Res Satellite Map
              </span>
              <input
                type="checkbox"
                checked={layers.sentinelSatellite}
                onChange={() => toggleLayer('sentinelSatellite')}
                className="rounded text-blue-600 focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
              <span className="flex items-center gap-2 font-medium text-slate-800">
                <span className="w-3 h-3 rounded bg-emerald-500/80 border border-emerald-600" />
                Land Parcels (TN Cadastre)
              </span>
              <input
                type="checkbox"
                checked={layers.landParcels}
                onChange={() => toggleLayer('landParcels')}
                className="rounded text-blue-600 focus:ring-0"
              />
            </label>
          </div>
        </div>
      )}

      {/* Floating Zoom & Interactive Map Controls (Bottom Left) */}
      <div className="absolute bottom-6 left-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom In Map"
          className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 hover:bg-slate-100 shadow-xl border border-slate-200 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom Out Map"
          className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 hover:bg-slate-100 shadow-xl border border-slate-200 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetMap}
          aria-label="Reset to Tamil Nadu State Map View"
          className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 hover:bg-slate-100 shadow-xl border border-slate-200 transition-colors"
          title="Full Tamil Nadu Map View"
        >
          <Globe className="w-4 h-4 text-emerald-600" />
        </button>
      </div>

      {/* Tamil Nadu Map Viewport Leaflet Container */}
      <div
        ref={mapContainerRef}
        className="flex-1 w-full h-full relative z-0 overflow-hidden select-none"
      />

      {/* Floating Parcel Inspector Drawer (Bottom Right) */}
      {activeParcel && (
        <div
          id="parcel-info-drawer"
          className="absolute bottom-4 right-4 z-20 w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in slide-in-from-bottom-2"
        >
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cadastral Parcel
                </span>
                <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                  {activeParcel.parcelId}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                Survey {activeParcel.surveyNumber}
              </h3>
            </div>

            <StatusBadge status={activeParcel.status} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Village Jurisdiction</span>
              <span className="font-semibold text-slate-800">{activeParcel.village}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">GIS Calculated Area</span>
              <span className="font-bold text-slate-900 font-mono">{activeParcel.areaAcres} acres</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Land Classification</span>
              <span className="text-slate-700">{activeParcel.landUse}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Road Access & Water</span>
              <span className="text-slate-700">
                {activeParcel.roadAccess ? 'Road: Yes' : 'No Direct Road'} •{' '}
                {activeParcel.waterBodyAdjacent ? 'Waterway Adjacent' : 'Dry'}
              </span>
            </div>
          </div>

          {/* Sentinel-2 Multispectral Land Inspection Card */}
          {(() => {
            const landMetrics = calculateSentinelLandMetrics(activeParcel.surveyNumber);
            return (
              <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Satellite className="w-3.5 h-3.5" />
                    <span>Sentinel-2 Multispectral Telemetry</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">10m Optical</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">NDVI Crop Health</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex-1 bg-slate-950 h-1.5 rounded overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded"
                          style={{ width: `${Math.min(landMetrics.ndviScore * 100, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-emerald-400 font-bold text-[11px]">
                        {landMetrics.ndviScore}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Moisture Rating</span>
                    <span className="font-bold text-sky-400 text-[11px] block mt-0.5">
                      {Math.round(landMetrics.moistureIndex * 100)}% NDWI
                    </span>
                  </div>
                </div>

                <div className="text-[11px] pt-1 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-300 truncate">{landMetrics.vegetationStatus}</span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      landMetrics.encroachmentRisk === 'HIGH'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    Encroachment: {landMetrics.encroachmentRisk}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Associated Land Document Quick Link if available */}
          {associatedDocument && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-blue-950 block">
                  Associated Deed: {associatedDocument.documentNumber}
                </span>
                <span className="text-blue-700 text-[11px]">
                  Grantee: {associatedDocument.ownerName}
                </span>
              </div>
              <button
                onClick={() => {
                  selectDocument(associatedDocument.id);
                  navigateTo('document-details', associatedDocument.id);
                }}
                className="px-2.5 py-1.5 rounded bg-blue-700 text-white font-semibold text-xs hover:bg-blue-800 transition-colors flex items-center gap-1"
              >
                <span>View Deed</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {activeParcel.status === 'CONFLICT' && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Spatial Conflict Detected:</strong> Document claims Survey 124/8A but spatial topology aligns with 124/3A.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Sentinel-2 Copernicus OAuth Settings Modal */}
      <SentinelSettingsModal
        isOpen={isSentinelSettingsOpen}
        onClose={() => setIsSentinelSettingsOpen(false)}
        onCredentialsUpdated={() => {
          const creds = getStoredSentinelCredentials();
          setHasSentinelCreds(Boolean(creds.clientId && creds.clientSecret));
        }}
      />
    </div>
  );
};
