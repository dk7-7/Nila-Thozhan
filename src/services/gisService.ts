import { supabase } from '../lib/supabase';
import { GisParcelData } from '../types';

export const gisService = {
  async getAllParcels(): Promise<GisParcelData[]> {
    const { data, error } = await supabase
      .from('gis_parcels')
      .select('*')
      .order('survey_number', { ascending: true });

    if (error) {
      console.error('Error fetching GIS parcels:', error);
      return [];
    }

    return (data || []).map((p) => ({
      parcelId: p.parcel_id,
      surveyNumber: p.survey_number,
      village: p.village,
      areaAcres: Number(p.area_acres),
      centroid: { x: Number(p.centroid_x), y: Number(p.centroid_y) },
      coordinates: p.coordinates as [number, number][],
      landUse: p.land_use,
      waterBodyAdjacent: p.water_body_adjacent,
      roadAccess: p.road_access,
      historicalBoundaryMatch: p.historical_boundary_match,
      spatialConflict: p.spatial_conflict,
      status: p.status,
    }));
  },

  async getParcelById(parcelId: string): Promise<GisParcelData | null> {
    const { data, error } = await supabase
      .from('gis_parcels')
      .select('*')
      .eq('parcel_id', parcelId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      parcelId: data.parcel_id,
      surveyNumber: data.survey_number,
      village: data.village,
      areaAcres: Number(data.area_acres),
      centroid: { x: Number(data.centroid_x), y: Number(data.centroid_y) },
      coordinates: data.coordinates as [number, number][],
      landUse: data.land_use,
      waterBodyAdjacent: data.water_body_adjacent,
      roadAccess: data.road_access,
      historicalBoundaryMatch: data.historical_boundary_match,
      spatialConflict: data.spatial_conflict,
      status: data.status,
    };
  },
};
