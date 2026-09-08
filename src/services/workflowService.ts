import { supabase } from '../lib/supabase';
import { DigitalSignatureData } from '../types';

export const workflowService = {
  async submitOfficerDecision(
    docId: string,
    action: 'APPROVE' | 'RETURN' | 'REJECT' | 'NEEDS_MANUAL_REVIEW',
    reason?: string,
    comments?: string
  ) {
    const { data, error } = await supabase.rpc('submit_officer_decision', {
      p_doc_id: docId,
      p_action: action,
      p_reason: reason || action,
      p_comments: comments || 'Recorded by verification officer',
    });

    if (error) {
      console.error('Error submitting officer decision:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async approveDocumentAndSign(
    docId: string,
    signerData: {
      certificateId: string;
      signerName: string;
      signerDesignation: string;
      signatureHash?: string;
    }
  ) {
    const { data, error } = await supabase.rpc('approve_document_and_sign', {
      p_doc_id: docId,
      p_certificate_id: signerData.certificateId,
      p_signer_name: signerData.signerName,
      p_signer_designation: signerData.signerDesignation,
      p_signature_hash: signerData.signatureHash,
    });

    if (error) {
      console.error('Error approving and signing document:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async resolveGisConflict(
    docId: string,
    resolution: 'ACCEPT_GIS' | 'FLAG_FIELD_INSPECTION',
    notes: string = ''
  ) {
    const { data, error } = await supabase.rpc('resolve_gis_conflict', {
      p_doc_id: docId,
      p_resolution: resolution,
      p_notes: notes,
    });

    if (error) {
      console.error('Error resolving GIS conflict:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async getWorkflowHistory(docId: string) {
    const { data, error } = await supabase
      .from('workflow_history')
      .select('*')
      .eq('document_id', docId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
