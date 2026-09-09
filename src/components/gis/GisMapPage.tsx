import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';

import { useApp } from '../../context/AppContext';
import {
  Search,
  ZoomIn,
  ZoomOut,
  Navigation,
  FileText,
  CheckCircle2,
  Layers,
  Compass,
  ExternalLink,
  RotateCcw,
  X,
  Building,
  UserCheck,
} from 'lucide-react';

interface GisMapPageProps {
  embedded?: boolean;
}

const GEOSERVER_URL = 'https://tngis.tn.gov.in/app/wms';

// Authentic Tamil Nadu Major Cities & Taluks
const TN_LOCATIONS: Record<string, { lat: number; lng: number; zoom: number; label: string }> = {
  ALL: { lat: 11.1271, lng: 78.6569, zoom: 7.5, label: 'All Tamil Nadu (தமிழ்நாடு)' },
  Vandalur: { lat: 12.8904, lng: 80.0812, zoom: 16, label: 'Vandalur (வண்டலூர் - Chengalpattu)' },
  Padappai: { lat: 12.8950, lng: 80.0150, zoom: 16, label: 'Padappai (படப்பை - Sriperumbudur)' },
  Guduvancheri: { lat: 12.8450, lng: 80.0650, zoom: 16, label: 'Guduvancheri (கூடுவாஞ்சேரி)' },
  Mudichur: { lat: 12.9150, lng: 80.0600, zoom: 16, label: 'Mudichur (முடிச்சூர் - Tambaram)' },
  Coimbatore: { lat: 11.0168, lng: 76.9558, zoom: 14, label: 'Coimbatore Center (கோயம்புத்தூர்)' },
  Mettupalayam: { lat: 11.3000, lng: 76.9350, zoom: 14.5, label: 'Mettupalayam (மேட்டுப்பாளையம்)' },
  Sulur: { lat: 11.0250, lng: 77.1250, zoom: 14.5, label: 'Sulur (சூலூர்)' },
  Pollachi: { lat: 10.6600, lng: 77.0000, zoom: 14.5, label: 'Pollachi (பொள்ளாச்சி)' },
  Madurai: { lat: 9.9252, lng: 78.1198, zoom: 14, label: 'Madurai (மதுரை)' },
  Tiruchirappalli: { lat: 10.7905, lng: 78.7047, zoom: 14, label: 'Tiruchirappalli (திருச்சிராப்பள்ளி)' },
  Salem: { lat: 11.6643, lng: 78.1460, zoom: 14, label: 'Salem (சேலம்)' },
  Chennai: { lat: 13.0827, lng: 80.2707, zoom: 14, label: 'Chennai Metropolitan (சென்னை)' },
};

type BaseMapStyle = 'GOOGLE_SATELLITE' | 'GOOGLE_HYBRID' | 'OSM' | 'ESRI_IMAGERY';

export interface TamilNilamInspectionResult {
  latitude: number;
  longitude: number;
  surveyNumber?: string;
  subdivision?: string;
  kide?: string;
  villageName?: string;
  villageTamilName?: string;
  talukName?: string;
  districtName?: string;
  ownerName?: string;
  landClassification?: string;
  areaExtent?: string;
  pattaNumber?: string;
  ruralUrban?: string;
  isFmb?: boolean | number | string;
  ulpin?: string;
  districtCode?: string | number;
  talukCode?: string | number;
  rawTamilNilam?: any;
  rawOwnership?: any;
  wmsProperties?: any;
  error?: string;
  hasData?: boolean;
}

export const GisMapPage: React.FC<GisMapPageProps> = ({ embedded = false }) => {
  const {
    gisParcels,
    selectedParcelId,
    documents,
    navigateTo,
    selectDocument,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const parcelLayerRef = useRef<TileLayer<TileWMS> | null>(null);
  const baseLayerRef = useRef<TileLayer<XYZ | OSM> | null>(null);
  const highwayLayerRef = useRef<TileLayer<TileWMS> | null>(null);
  const cadastreLayerRef = useRef<TileLayer<TileWMS> | null>(null);

  // States
  const [mapSearch, setMapSearch] = useState('');
  const [activeVillageFilter, setActiveVillageFilter] = useState('Vandalur');
  const [baseMapStyle, setBaseMapStyle] = useState<BaseMapStyle>('GOOGLE_HYBRID');
  const [showTngisCadastre, setShowTngisCadastre] = useState(true);
  const [showHighways, setShowHighways] = useState(true);

  // Click & Inspection states
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [inspectionData, setInspectionData] = useState<TamilNilamInspectionResult | null>(null);
  const [showInspectionDrawer, setShowInspectionDrawer] = useState(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Derive selected parcel if any
  const activeParcel = gisParcels.find((p) => p.parcelId === selectedParcelId);
  const linkedDocument = documents.find(
    (d) =>
      (inspectionData?.surveyNumber && (d.surveyNumber === inspectionData.surveyNumber || d.surveyNumber === `${inspectionData.surveyNumber}/${inspectionData.subdivision}` || d.surveyNumber === inspectionData.kide)) ||
      (inspectionData?.ulpin && d.ulpin === inspectionData.ulpin) ||
      (activeParcel && (d.gisParcelId === activeParcel.parcelId || d.surveyNumber === activeParcel.surveyNumber))
  );

  /* ---------------------------------------------------------
     TNGIS API Calls (through Vite /api proxy)
  --------------------------------------------------------- */
  const fetchTamilNilamInfo = async (latitude: number, longitude: number): Promise<any> => {
    try {
      const res = await fetch('/api/land-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      console.warn('TNGIS Proxy /api/land-info fetch:', e.message);
      return { success: 0, message: e.message };
    }
  };

  const fetchUrbanOwnership = async (landData: any): Promise<any> => {
    try {
      if (!landData || String(landData.rural_urban).toLowerCase() !== 'urban') {
        return null;
      }
      const params = {
        district_code: landData.district_code || '',
        taluk_code: landData.taluk_code || '',
        town_code: landData.revenue_town_code || landData.town_code || '',
        ward_code: landData.firka_ward_number || landData.ward_code || 0,
        block_code: landData.urban_block_number || landData.block_code || '',
        survey_number: landData.survey_number || '',
        sub_division_number:
          landData.sub_division_number || landData.sub_division || (landData.is_fmb == 1 ? landData.sub_division || '-' : '-'),
        areaType: landData.rural_urban || 'urban',
      };

      const res = await fetch('/api/urban-ownership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  /* ---------------------------------------------------------
     Handle Click on Map (Inspector)
  --------------------------------------------------------- */
  const handleMapClick = useCallback(
    async (coordinate: number[]) => {
      const [lng, lat] = toLonLat(coordinate);
      setInspectionLoading(true);
      setShowInspectionDrawer(true);

      // Place a pinpoint marker on the clicked location
      if (vectorSourceRef.current) {
        vectorSourceRef.current.clear();
        const pinFeature = new Feature({
          geometry: new Point(coordinate),
          isSelectionPin: true,
        });
        pinFeature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: '#10b981' }),
              stroke: new Stroke({ color: '#ffffff', width: 2.5 }),
            }),
          })
        );
        vectorSourceRef.current.addFeature(pinFeature);
      }

      try {
        // 1. Get WMS feature info if available
        let wmsProperties: any = null;
        if (parcelLayerRef.current && mapInstanceRef.current) {
          const source = parcelLayerRef.current.getSource();
          const view = mapInstanceRef.current.getView();
          const resolution = view.getResolution();
          const projection = view.getProjection();

          if (source && resolution && projection) {
            const url = source.getFeatureInfoUrl(coordinate, resolution, projection, {
              INFO_FORMAT: 'application/json',
              FEATURE_COUNT: 5,
            });

            if (url) {
              try {
                const wmsRes = await fetch(url);
                if (wmsRes.ok) {
                  const wmsJson = await wmsRes.json();
                  wmsProperties = wmsJson?.features?.[0]?.properties || null;
                }
              } catch (wmsErr) {
                console.warn('WMS FeatureInfo failed:', wmsErr);
              }
            }
          }
        }

        // 2. Query Tamil Nilam / TNGIS Proxy
        const tnResult = await fetchTamilNilamInfo(lat, lng);
        const landData = tnResult?.data || {};

        let ownershipData: any = null;
        if (tnResult?.success === 1 && String(landData.rural_urban).toLowerCase() === 'urban') {
          ownershipData = await fetchUrbanOwnership(landData);
        }

        const ownershipPayload = ownershipData?.data || ownershipData || {};
        const uchittaNatham = ownershipPayload?.UchittaNatham || {};
        const urbanData = ownershipPayload?.UaregData || {};

        // Extract authentic Survey Number & Sub-division
        const surveyNum =
          landData.survey_number ||
          wmsProperties?.survey_number ||
          (wmsProperties?.kide ? wmsProperties.kide.split('/')[0] : '') ||
          '';

        const subDiv =
          landData.sub_division_number ||
          landData.sub_division ||
          wmsProperties?.sub_division ||
          (wmsProperties?.kide && wmsProperties.kide.includes('/') ? wmsProperties.kide.split('/')[1] : '') ||
          '';

        const kide =
          wmsProperties?.kide ||
          (surveyNum && subDiv ? `${surveyNum}/${subDiv}` : surveyNum || '');

        const village =
          landData.village_name ||
          wmsProperties?.village_name ||
          '';

        const villageTamil =
          landData.village_tamil_name ||
          '';

        const taluk =
          landData.taluk_name ||
          wmsProperties?.taluk_name ||
          '';

        const district =
          landData.district_name ||
          wmsProperties?.district_name ||
          '';

        // Extract authentic owner name
        let owner = '';
        if (uchittaNatham?.owner) {
          owner = String(uchittaNatham.owner)
            .trim()
            .replace(/^\[\s*/, '')
            .replace(/\s*\]$/, '');
        } else if (urbanData?.pattadhar_name) {
          owner = String(urbanData.pattadhar_name).trim();
        } else if (landData.owner_name) {
          owner = String(landData.owner_name).trim();
        } else if (landData.pattadar_name) {
          owner = String(landData.pattadar_name).trim();
        } else if (wmsProperties?.owner_name) {
          owner = String(wmsProperties.owner_name).trim();
        }

        // Extract authentic land classification
        const classification =
          urbanData?.land_type ||
          landData.land_type ||
          landData.land_classification ||
          wmsProperties?.land_type ||
          (landData.rural_urban ? `${landData.rural_urban} Land` : '');

        // Extract authentic area extent
        const area =
          uchittaNatham?.extent ||
          urbanData?.total_extent ||
          landData.extent ||
          landData.area ||
          wmsProperties?.area ||
          wmsProperties?.extent ||
          '';

        // Extract authentic patta number
        const patta =
          uchittaNatham?.patta_no ||
          urbanData?.patta_no ||
          landData.patta_number ||
          landData.patta_no ||
          wmsProperties?.patta_number ||
          '';

        const ulpin =
          landData.ulpin ||
          wmsProperties?.ulpin ||
          '';

        const ruralUrban =
          landData.rural_urban ||
          wmsProperties?.rural_urban ||
          '';

        const districtCode =
          landData.district_code ||
          wmsProperties?.district_code ||
          '';

        const talukCode =
          landData.taluk_code ||
          wmsProperties?.taluk_code ||
          '';

        const hasData = Boolean(
          surveyNum || kide || village || taluk || district || owner || patta || ulpin || area
        );

        setInspectionData({
          latitude: lat,
          longitude: lng,
          surveyNumber: surveyNum || undefined,
          subdivision: subDiv || undefined,
          kide: kide || undefined,
          villageName: village || undefined,
          villageTamilName: villageTamil || undefined,
          talukName: taluk || undefined,
          districtName: district || undefined,
          ownerName: owner || undefined,
          landClassification: classification || undefined,
          areaExtent: area || undefined,
          pattaNumber: patta || undefined,
          ruralUrban: ruralUrban || undefined,
          isFmb: landData.is_fmb ?? (wmsProperties?.is_fmb ? 1 : undefined),
          ulpin: ulpin || undefined,
          districtCode: districtCode || undefined,
          talukCode: talukCode || undefined,
          rawTamilNilam: landData,
          rawOwnership: ownershipData,
          wmsProperties,
          hasData,
        });
      } catch (err: any) {
        console.error('Inspection failed:', err);
        setInspectionData({
          latitude: lat,
          longitude: lng,
          hasData: false,
          error: err.message,
        });
      } finally {
        setInspectionLoading(false);
      }
    },
    []
  );

  /* ---------------------------------------------------------
     Initialize OpenLayers Map Instance
  --------------------------------------------------------- */
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 1. Base Layer (Google Satellite / Hybrid XYZ)
    const baseSource = new XYZ({
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      crossOrigin: 'anonymous',
    });
    const baseTileLayer = new TileLayer({
      source: baseSource,
    });
    baseLayerRef.current = baseTileLayer;

    // 2. TNGIS Cadastral WMS Layer (fmb_ulpin)
    const wmsSource = new TileWMS({
      url: GEOSERVER_URL,
      params: {
        LAYERS: 'cadastral_analysis:fmb_ulpin',
        STYLES: 'fmb_ulpin_sld',
        TILED: true,
      },
      serverType: 'geoserver',
      crossOrigin: 'anonymous',
    });

    const cadastreLayer = new TileLayer({
      source: wmsSource,
      opacity: 0.85,
      visible: true,
    });
    cadastreLayerRef.current = cadastreLayer;
    parcelLayerRef.current = cadastreLayer;

    // 3. National & State Highways Overlay
    const highwaySource = new TileWMS({
      url: GEOSERVER_URL,
      params: {
        LAYERS: 'generic_viewer:national_highways,generic_viewer:state_highways',
        TILED: true,
      },
      serverType: 'geoserver',
      crossOrigin: 'anonymous',
    });

    const highwayLayer = new TileLayer({
      source: highwaySource,
      opacity: 0.9,
      visible: true,
    });
    highwayLayerRef.current = highwayLayer;

    // 4. Vector Layer for Click Marker Pin ONLY (No dummy polygon overlays)
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 10,
    });

    // 5. Initial View centered on Vandalur / Tamil Nadu
    const initialLocation = TN_LOCATIONS.Vandalur;
    const initialView = new View({
      center: fromLonLat([initialLocation.lng, initialLocation.lat]),
      zoom: initialLocation.zoom,
      maxZoom: 21,
      minZoom: 6,
    });

    const map = new Map({
      target: mapContainerRef.current,
      layers: [baseTileLayer, cadastreLayer, highwayLayer, vectorLayer],
      view: initialView,
      controls: [], // custom UI controls
    });

    mapInstanceRef.current = map;

    // Pointer move listener for coordinate display
    map.on('pointermove', (evt) => {
      if (evt.coordinate) {
        const [lng, lat] = toLonLat(evt.coordinate);
        setCursorCoords({ lat, lng });
      }
    });

    // Single click listener for inspection
    map.on('singleclick', (evt) => {
      if (evt.coordinate) {
        handleMapClick(evt.coordinate);
      }
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [handleMapClick]);

  /* ---------------------------------------------------------
     Update Basemap Layer
  --------------------------------------------------------- */
  useEffect(() => {
    if (!baseLayerRef.current) return;

    let newSource: XYZ | OSM;
    switch (baseMapStyle) {
      case 'GOOGLE_SATELLITE':
        newSource = new XYZ({
          url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          crossOrigin: 'anonymous',
        });
        break;
      case 'GOOGLE_HYBRID':
        newSource = new XYZ({
          url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          crossOrigin: 'anonymous',
        });
        break;
      case 'ESRI_IMAGERY':
        newSource = new XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          crossOrigin: 'anonymous',
        });
        break;
      case 'OSM':
      default:
        newSource = new OSM();
        break;
    }
    baseLayerRef.current.setSource(newSource);
  }, [baseMapStyle]);

  /* ---------------------------------------------------------
     Update Layer Visibilities
  --------------------------------------------------------- */
  useEffect(() => {
    if (cadastreLayerRef.current) {
      cadastreLayerRef.current.setVisible(showTngisCadastre);
    }
  }, [showTngisCadastre]);

  useEffect(() => {
    if (highwayLayerRef.current) {
      highwayLayerRef.current.setVisible(showHighways);
    }
  }, [showHighways]);

  /* ---------------------------------------------------------
     Fly to Selected Village/Preset
  --------------------------------------------------------- */
  const handleLocationChange = (locKey: string) => {
    setActiveVillageFilter(locKey);
    const loc = TN_LOCATIONS[locKey];
    if (loc && mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      view.animate({
        center: fromLonLat([loc.lng, loc.lat]),
        zoom: loc.zoom,
        duration: 800,
      });
    }
  };

  /* ---------------------------------------------------------
     Zoom & Control Actions
  --------------------------------------------------------- */
  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    const view = mapInstanceRef.current.getView();
    const currentZoom = view.getZoom() || 15;
    view.animate({ zoom: currentZoom + 1, duration: 250 });
  };

  const handleZoomOut = () => {
    if (!mapInstanceRef.current) return;
    const view = mapInstanceRef.current.getView();
    const currentZoom = view.getZoom() || 15;
    view.animate({ zoom: currentZoom - 1, duration: 250 });
  };

  const handleResetView = () => {
    handleLocationChange('Vandalur');
  };

  const handleLocateMe = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const view = mapInstanceRef.current?.getView();
          view?.animate({
            center: fromLonLat([lng, lat]),
            zoom: 17,
            duration: 800,
          });
          handleMapClick(fromLonLat([lng, lat]));
        },
        () => {
          handleLocationChange('Vandalur');
        }
      );
    }
  };

  // Search filter
  const filteredLocationKeys = Object.keys(TN_LOCATIONS).filter((key) =>
    TN_LOCATIONS[key].label.toLowerCase().includes(mapSearch.toLowerCase())
  );

  return (
    <div className={`relative w-full ${embedded ? 'h-[500px]' : 'h-[calc(100vh-64px)]'} overflow-hidden bg-slate-900`}>
      {/* 1. OpenLayers Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" tabIndex={0} />

      {/* 2. Top Header Bar: Search, Village Dropdown, Basemap Switcher */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Search & Location Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-2xl pointer-events-auto max-w-xl w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Tamil Nadu Survey # / Village..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-100 bg-slate-800/80 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
            />
          </div>

          <select
            value={activeVillageFilter}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-slate-800/90 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[220px]"
          >
            {filteredLocationKeys.map((k) => (
              <option key={k} value={k} className="bg-slate-900 text-slate-200">
                {TN_LOCATIONS[k].label}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Basemap Selector & Layer Controls */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-2xl pointer-events-auto">
          {/* Basemap Toggles */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setBaseMapStyle('GOOGLE_HYBRID')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                baseMapStyle === 'GOOGLE_HYBRID' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => setBaseMapStyle('GOOGLE_SATELLITE')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                baseMapStyle === 'GOOGLE_SATELLITE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setBaseMapStyle('OSM')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                baseMapStyle === 'OSM' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Street
            </button>
          </div>

          {/* TNGIS Cadastral Overlay Toggle */}
          <button
            onClick={() => setShowTngisCadastre(!showTngisCadastre)}
            title="Toggle TNGIS FMB / ULPIN Cadastral Boundaries"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showTngisCadastre
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TNGIS FMB</span>
          </button>

          {/* Locate My Land */}
          <button
            onClick={handleLocateMe}
            title="Locate using GPS"
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Find My Land</span>
          </button>
        </div>
      </div>

      {/* 3. Floating Left Zoom & Navigation Controls */}
      <div className="absolute left-4 bottom-8 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl p-1 flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-700" />
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleResetView}
          className="p-2.5 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 text-emerald-400 rounded-xl border border-slate-700/80 shadow-2xl transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Live Cursor Coordinates Indicator */}
      {cursorCoords && (
        <div className="absolute left-4 bottom-2 z-10 text-[10px] text-slate-400 font-mono bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-800">
          Lat: {cursorCoords.lat.toFixed(6)} | Lng: {cursorCoords.lng.toFixed(6)} | EPSG:4326 (TNGIS WGS84)
        </div>
      )}

      {/* 5. TNGIS Authentic Attribution Badge */}
      <div className="absolute right-4 bottom-2 z-10 text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur-sm px-2.5 py-0.5 rounded border border-slate-800 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>TNGIS GeoServer • OpenLayers 10 • Google Satellite HD</span>
      </div>

      {/* 6. Floating Cadastral Inspection Card / Drawer */}
      {showInspectionDrawer && inspectionData && (
        <div className="absolute right-4 bottom-8 top-20 z-20 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-right-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-linear-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <span>Tamil Nilam Live Cadastre</span>
                  {inspectionLoading && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>
                <div className="text-sm font-bold truncate">
                  {inspectionData.kide
                    ? `Survey No: ${inspectionData.kide}`
                    : inspectionData.surveyNumber
                    ? `Survey No: ${inspectionData.surveyNumber}${
                        inspectionData.subdivision && inspectionData.subdivision !== '-'
                          ? `/${inspectionData.subdivision}`
                          : ''
                      }`
                    : 'Cadastral Parcel'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInspectionDrawer(false)}
              className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs">
            {inspectionLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
                <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Querying Tamil Nadu TNGIS Registry...</span>
              </div>
            ) : (
              <>
                {/* Cadastral & Location Highlights */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Village / Taluk</div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate" title={`${inspectionData.villageName || ''}, ${inspectionData.talukName || ''}`}>
                      {inspectionData.villageName || 'Tamil Nadu'}
                      {inspectionData.talukName ? `, ${inspectionData.talukName}` : ''}
                    </div>
                    {inspectionData.villageTamilName && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">
                        {inspectionData.villageTamilName}
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Area Extent</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {inspectionData.areaExtent || 'Not available'}
                    </div>
                    {inspectionData.districtName && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {inspectionData.districtName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Owner & Pattadar Details */}
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-1.5">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Registered Pattadar / Owner</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {inspectionData.ownerName ? (
                      inspectionData.ownerName
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-normal italic">
                        Not available in public registry
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-emerald-100 dark:border-emerald-900/40">
                    <span>Patta Number:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {inspectionData.pattaNumber || '-'}
                    </span>
                  </div>
                </div>

                {/* Land Classification & ULPIN */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Classification:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">
                      {inspectionData.landClassification || 'Cadastral Parcel'}
                    </span>
                  </div>

                  {inspectionData.ulpin && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">ULPIN:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {inspectionData.ulpin}
                      </span>
                    </div>
                  )}

                  {inspectionData.ruralUrban && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Area Type:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 uppercase">
                        {inspectionData.ruralUrban}
                      </span>
                    </div>
                  )}

                  {(inspectionData.districtCode || inspectionData.talukCode) && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Admin LGD Codes:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {inspectionData.districtCode ? `Dist: ${inspectionData.districtCode}` : ''}
                        {inspectionData.talukCode ? ` | Taluk: ${inspectionData.talukCode}` : ''}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Coordinates (WGS84):</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {inspectionData.latitude.toFixed(6)}, {inspectionData.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {linkedDocument ? (
                  <div className="p-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Matched Land Deed</span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-mono">
                        {linkedDocument.documentNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 truncate">{linkedDocument.title}</div>
                    <button
                      onClick={() => {
                        selectDocument(linkedDocument.id);
                        navigateTo('document-details', linkedDocument.id);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Full Land Document</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 space-y-2">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Request for Digitalization</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Coordinates clicked on TNGIS live cadastral map. Upload and submit a digitalization request for this parcel to initiate AI validation and cadastral verification.
                    </p>
                    <button
                      onClick={() => navigateTo('upload')}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Request for Digitalization</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
