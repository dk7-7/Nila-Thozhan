import { supabase } from '../lib/supabase';

export const ticketService = {
  async submitSupportTicket(
    category: string,
    subject: string,
    message: string,
    contactEmail?: string
  ): Promise<{ id: string; ticketNumber: string; status: string }> {
    const { data, error } = await supabase.rpc('create_support_ticket', {
      p_category: category,
      p_subject: subject,
      p_message: message,
      p_contact_email: contactEmail || undefined,
    });

    if (error) {
      console.error('Error submitting support ticket:', error);
      throw new Error(error.message);
    }

    const res = data as any;
    return {
      id: res.id,
      ticketNumber: res.ticket_number,
      status: res.status,
    };
  },

  async getUserTickets(userId: string) {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
