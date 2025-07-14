<file path="store/authStore.ts">
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Officer } from '@/types/schedule';

interface AuthState {
  user: Officer | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Fetch officer data
        const { data: officer, error: officerError } = await supabase
          .from('officers')
          .select('*')
          .eq('email', email)
          .single();

        if (officerError) throw officerError;

        if (officer) {
          const officerData: Officer = {
            id: officer.id,
            name: officer.name,
            badge: officer.badge,
            rank: officer.rank,
            department: officer.department,
            email: officer.email,
            phone: officer.phone,
            avatar: officer.avatar,
            isSupervisor: officer.is_supervisor,
          };

          set({
            user: officerData,
            isAuthenticated: true,
            isAdmin: ['Lieutenant', 'Captain', 'Chief'].includes(officer.rank),
            isLoading: false,
          });
        }
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Logout failed',
        isLoading: false,
      });
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch officer data
        const { data: officer, error } = await supabase
          .from('officers')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (!error && officer) {
          const officerData: Officer = {
            id: officer.id,
            name: officer.name,
            badge: officer.badge,
            rank: officer.rank,
            department: officer.department,
            email: officer.email,
            phone: officer.phone,
            avatar: officer.avatar,
            isSupervisor: officer.is_supervisor,
          };

          set({
            user: officerData,
            isAuthenticated: true,
            isAdmin: ['Lieutenant', 'Captain', 'Chief'].includes(officer.rank),
          });
        }
      }
      
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Initialization failed',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    useAuthStore.getState().logout();
  }
});
</file>
