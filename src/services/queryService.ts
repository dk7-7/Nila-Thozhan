import { supabase } from '../lib/supabase';

export const queryService = {
  async submitCitizenQuery(
    documentId: string,
    citizenId: string,
    subject: string,
    message: string
  ) {
    const { data, error } = await supabase
      .from('citizen_queries')
      .insert({
        document_id: documentId,
        citizen_id: citizenId,
        subject,
        message,
        status: 'OPEN',
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting citizen query:', error);
      throw error;
    }

    return data;
  },

  async respondToQuery(queryId: string, response: string, officerId: string) {
    const { data, error } = await supabase
      .from('citizen_queries')
      .update({
        officer_response: response,
        responded_by: officerId,
        status: 'RESOLVED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', queryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getQueriesForDocument(documentId: string) {
    const { data, error } = await supabase
      .from('citizen_queries')
      .select('*, profiles:citizen_id(full_name, role)')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
