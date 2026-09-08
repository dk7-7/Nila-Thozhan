import { supabase } from '../lib/supabase';

export interface SystemReportsStats {
  total_documents: number;
  processing_count: number;
  digitized_count: number;
  under_verification_count: number;
  gis_verified_count: number;
  ready_for_approval_count: number;
  approved_count: number;
  rejected_count: number;
  needs_attention_count: number;
  avg_confidence_score: number;
  high_confidence_count: number;
  medium_confidence_count: number;
  low_confidence_count: number;
}

export const reportService = {
  async getSystemStats(): Promise<SystemReportsStats> {
    const { data, error } = await supabase.rpc('get_system_reports_stats');
    if (error) {
      console.error('Error fetching system stats via RPC:', error);
      // Fallback direct count query if user is Citizen or RPC fails
      const { data: docs } = await supabase.from('land_documents').select('status, overall_confidence, confidence_score');
      const allDocs = docs || [];
      return {
        total_documents: allDocs.length,
        processing_count: allDocs.filter((d) => d.status === 'PROCESSING').length,
        digitized_count: allDocs.filter((d) => d.status === 'DIGITIZED').length,
        under_verification_count: allDocs.filter((d) => d.status === 'UNDER_VERIFICATION').length,
        gis_verified_count: allDocs.filter((d) => d.status === 'GIS_VERIFIED').length,
        ready_for_approval_count: allDocs.filter((d) => d.status === 'READY_FOR_APPROVAL').length,
        approved_count: allDocs.filter((d) => d.status === 'APPROVED').length,
        rejected_count: allDocs.filter((d) => d.status === 'REJECTED').length,
        needs_attention_count: allDocs.filter((d) => d.status === 'NEEDS_ATTENTION').length,
        avg_confidence_score: allDocs.length > 0 ? Math.round(allDocs.reduce((acc, d) => acc + (d.confidence_score || 0), 0) / allDocs.length) : 95,
        high_confidence_count: allDocs.filter((d) => d.overall_confidence === 'HIGH').length,
        medium_confidence_count: allDocs.filter((d) => d.overall_confidence === 'MEDIUM').length,
        low_confidence_count: allDocs.filter((d) => d.overall_confidence === 'LOW').length,
      };
    }

    return data as unknown as SystemReportsStats;
  },
};
