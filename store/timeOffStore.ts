<file path="store/timeOffStore.ts">
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { TimeOffRequest, TimeOffType } from '@/types/schedule';

interface TimeOffState {
  timeOffRequests: TimeOffRequest[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTimeOffRequests: (date?: Date) => Promise<void>;
  requestTimeOff: (request: Omit<TimeOffRequest, 'id' | 'requestedAt' | 'status'>) => Promise<void>;
  approveTimeOff: (id: string, approvedBy: string) => Promise<void>;
  denyTimeOff: (id: string, approvedBy: string) => Promise<void>;
  convertShiftToTimeOff: (shiftId: string, officerId: string, type: TimeOffType, date: string, notes?: string) => Promise<void>;
  updateOfficerPTOBalance: (officerId: string, type: TimeOffType, hours: number) => Promise<void>;
  
  getTimeOffByDate: (date: Date) => TimeOffRequest[];
  getTimeOffByOfficer: (officerId: string) => TimeOffRequest[];
  clearError: () => void;
}

export const useTimeOffStore = create<TimeOffState>((set, get) => ({
  timeOffRequests: [],
  isLoading: false,
  error: null,

  fetchTimeOffRequests: async (date) => {
    try {
      set({ isLoading: true, error: null });
      
      let query = supabase
        .from('time_off_requests')
        .select('*')
        .order('date', { ascending: true });

      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        query = query.eq('date', dateStr);
      }

      const { data, error } = await query;

      if (error) throw error;

      const timeOffRequests: TimeOffRequest[] = data.map(request => ({
        id: request.id,
        officerId: request.officer_id,
        date: request.date,
        type: request.type as TimeOffType,
        shiftId: request.shift_id,
        status: request.status as any,
        notes: request.notes,
        requestedAt: request.requested_at,
        approvedBy: request.approved_by,
        approvedAt: request.approved_at,
      }));

      set({ timeOffRequests, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch time off requests',
        isLoading: false,
      });
    }
  },

  requestTimeOff: async (request) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('time_off_requests')
        .insert({
          officer_id: request.officerId,
          date: request.date,
          type: request.type,
          shift_id: request.shiftId,
          notes: request.notes,
          status: 'pending',
        });

      if (error) throw error;

      await get().fetchTimeOffRequests();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to request time off',
        isLoading: false,
      });
    }
  },

  approveTimeOff: async (id, approvedBy) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('time_off_requests')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await get().fetchTimeOffRequests();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to approve time off',
        isLoading: false,
      });
    }
  },

  denyTimeOff: async (id, approvedBy) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('time_off_requests')
        .update({
          status: 'denied',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await get().fetchTimeOffRequests();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to deny time off',
        isLoading: false,
      });
    }
  },

  convertShiftToTimeOff: async (shiftId, officerId, type, date, notes) => {
    try {
      set({ isLoading: true, error: null });
      
      // Create time off request
      const { error: timeOffError } = await supabase
        .from('time_off_requests')
        .insert({
          officer_id: officerId,
          date,
          type,
          shift_id: shiftId,
          notes,
          status: 'approved', // Auto-approve when converting from shift
        });

      if (timeOffError) throw timeOffError;

      // Remove officer from shift assignment
      const { error: assignmentError } = await supabase
        .from('shift_assignments')
        .delete()
        .eq('shift_id', shiftId)
        .eq('officer_id', officerId);

      if (assignmentError) throw assignmentError;

      // Deduct from PTO balance (assuming 8 hours per shift)
      await get().updateOfficerPTOBalance(officerId, type, -8);

      await get().fetchTimeOffRequests();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to convert shift to time off',
        isLoading: false,
      });
    }
  },

  updateOfficerPTOBalance: async (officerId, type, hours) => {
    try {
      const balanceField = `${type}_balance`;
      
      // Get current balance
      const { data: officer, error: fetchError } = await supabase
        .from('officers')
        .select(balanceField)
        .eq('id', officerId)
        .single();

      if (fetchError) throw fetchError;

      const currentBalance = officer[balanceField] || 0;
      const newBalance = Math.max(0, currentBalance + hours);

      // Update balance
      const { error: updateError } = await supabase
        .from('officers')
        .update({ [balanceField]: newBalance })
        .eq('id', officerId);

      if (updateError) throw updateError;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update PTO balance',
      });
    }
  },

  getTimeOffByDate: (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return get().timeOffRequests.filter(request => 
      request.date === dateStr && request.status === 'approved'
    );
  },

  getTimeOffByOfficer: (officerId) => {
    return get().timeOffRequests.filter(request => 
      request.officerId === officerId
    );
  },

  clearError: () => set({ error: null }),
}));
</file>
