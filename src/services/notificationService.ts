import { supabase } from '../lib/supabase';
import { NotificationItem, UserRole } from '../types';

export const notificationService = {
  async getNotifications(userId?: string, role?: UserRole): Promise<NotificationItem[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return (data || []).map((n) => ({
      id: n.id,
      targetRoles: n.target_roles as UserRole[],
      title: n.title,
      message: n.message,
      timestamp: new Date(n.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: n.read,
      documentId: n.document_id || undefined,
      type: n.type as any,
    }));
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) console.error('Error marking notification read:', error);
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) console.error('Error marking all notifications read:', error);
  },

  subscribeToNotifications(
    callback: (newNotification: NotificationItem) => void
  ) {
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const n = payload.new as any;
          callback({
            id: n.id,
            targetRoles: n.target_roles as UserRole[],
            title: n.title,
            message: n.message,
            timestamp: new Date(n.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            read: n.read,
            documentId: n.document_id || undefined,
            type: n.type as any,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
