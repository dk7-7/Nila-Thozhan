import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

export interface UserProfileData {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  designation?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  isActive: boolean;
}

export const authService = {
  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  },

  async getProfile(userId: string): Promise<UserProfileData | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role as UserRole,
      department: data.department || undefined,
      designation: data.designation || undefined,
      phone: data.phone || undefined,
      location: data.location || undefined,
      avatarUrl: data.avatar_url || undefined,
      isActive: data.is_active,
    };
  },

  async signIn(email: string, password: string): Promise<UserProfileData> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Authentication failed: No user returned');
    }

    const profile = await this.getProfile(data.user.id);
    if (!profile) {
      // Fallback profile if record creation was delayed
      return {
        id: data.user.id,
        email: data.user.email || email,
        fullName: data.user.user_metadata?.full_name || email.split('@')[0],
        role: (data.user.user_metadata?.role as UserRole) || 'CITIZEN',
        isActive: true,
      };
    }

    return profile;
  },

  async signUp(
    email: string,
    password: string,
    profileData: {
      fullName: string;
      role: UserRole;
      phone?: string;
      location?: string;
      department?: string;
      designation?: string;
    }
  ): Promise<UserProfileData> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: profileData.fullName,
          role: profileData.role,
          phone: profileData.phone,
          location: profileData.location,
          department: profileData.department,
          designation: profileData.designation,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed: No user returned');
    }

    return {
      id: data.user.id,
      email: data.user.email || email,
      fullName: profileData.fullName,
      role: profileData.role,
      phone: profileData.phone,
      location: profileData.location,
      department: profileData.department,
      designation: profileData.designation,
      isActive: true,
    };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error);
  },

  async updateProfile(userId: string, updates: Partial<UserProfileData>) {
    const updatePayload: {
      full_name?: string;
      phone?: string;
      location?: string;
      avatar_url?: string;
    } = {};
    if (updates.fullName !== undefined) updatePayload.full_name = updates.fullName;
    if (updates.phone !== undefined) updatePayload.phone = updates.phone;
    if (updates.location !== undefined) updatePayload.location = updates.location;
    if (updates.avatarUrl !== undefined) updatePayload.avatar_url = updates.avatarUrl;

    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
