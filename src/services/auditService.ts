import { supabase } from '../lib/supabase';
import { AuditEvent, UserRole } from '../types';

export const auditService = {
  async getAuditTrailForDocument(documentId: string): Promise<AuditEvent[]> {
    const { data, error } = await supabase
      .from('audit_events')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching audit trail for document:', error);
      return [];
    }

    return (data || []).map((a) => ({
      id: a.id,
      timestamp: new Date(a.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      actorName: a.actor_name,
      actorRole: a.actor_role as UserRole,
      action: a.action,
      status: a.status,
      comments: a.comments || undefined,
      digitalSignatureId: a.digital_signature_id || undefined,
    }));
  },

  async getAllSystemAuditEvents(limit: number = 100): Promise<AuditEvent[]> {
    const { data, error } = await supabase
      .from('audit_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching all audit events:', error);
      return [];
    }

    return (data || []).map((a) => ({
      id: a.id,
      timestamp: new Date(a.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      actorName: a.actor_name,
      actorRole: a.actor_role as UserRole,
      action: a.action,
      status: a.status,
      comments: a.comments || undefined,
      digitalSignatureId: a.digital_signature_id || undefined,
    }));
  },

  async recordAuditEvent(event: {
    documentId?: string;
    action: string;
    status: string;
    comments?: string;
    previousStatus?: string;
    newStatus?: string;
  }) {
    const user = (await supabase.auth.getUser()).data.user;
    const profile = user ? (await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()).data : null;

    const { data, error } = await supabase.from('audit_events').insert({
      document_id: event.documentId || null,
      actor_id: user?.id || null,
      actor_name: profile?.full_name || 'System Operator',
      actor_role: (profile?.role as any) || 'CITIZEN',
      action: event.action,
      status: event.status,
      comments: event.comments || null,
      previous_status: (event.previousStatus as any) || null,
      new_status: (event.newStatus as any) || null,
    });

    if (error) console.error('Error inserting audit event:', error);
    return data;
  },
};
