<file path="store/scheduleStore.ts">
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Shift, RecurringShift, ShiftAssignment, SwapRequest, OfficerAssignment } from '@/types/schedule';

interface ScheduleState {
  shifts: (Shift | RecurringShift)[];
  assignments: ShiftAssignment[];
  swapRequests: SwapRequest[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchShifts: () => Promise<void>;
  addShift: (shift: Shift | RecurringShift) => Promise<void>;
  updateShift: (id: string, shift: Partial<Shift | RecurringShift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  
  assignOfficer: (shiftId: string, officerId: string, assignedBy: string) => Promise<void>;
  removeOfficerFromShift: (shiftId: string, officerId: string) => Promise<void>;
  updateAssignments: (shiftId: string, assignments: OfficerAssignment[]) => Promise<void>;
  
  requestSwap: (request: Omit<SwapRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  approveSwap: (id: string) => Promise<void>;
  rejectSwap: (id: string) => Promise<void>;
  
  getShiftsByDate: (date: Date) => (Shift | RecurringShift)[];
  getShiftsByOfficer: (officerId: string) => (Shift | RecurringShift)[];
  clearError: () => void;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  shifts: [],
  assignments: [],
  swapRequests: [],
  isLoading: false,
  error: null,

  fetchShifts: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time', { ascending: true });

      if (shiftsError) throw shiftsError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('shift_assignments')
        .select('*');

      if (assignmentsError) throw assignmentsError;

      // Transform database data to app format
      const shifts = shiftsData.map(shift => {
        const shiftAssignments = assignmentsData.filter(a => a.shift_id === shift.id);
        const officers = shiftAssignments.map(a => a.officer_id);
        const assignments = shiftAssignments.map(a => ({
          officerId: a.officer_id,
          beatId: a.beat_id,
          carId: a.car_id,
          notes: a.notes,
        }));

        const baseShift = {
          id: shift.id,
          title: shift.title,
          type: shift.type as any,
          startTime: shift.start_time,
          endTime: shift.end_time,
          officers,
          assignments,
          location: shift.location,
          notes: shift.notes,
          color: shift.color,
        };

        if (shift.is_recurring) {
          return {
            ...baseShift,
            recurrence: {
              pattern: shift.recurrence_pattern as any,
              interval: shift.recurrence_interval || 1,
              daysOfWeek: shift.recurrence_days_of_week,
              endsOn: shift.recurrence_ends_on,
              exceptions: shift.recurrence_exceptions || [],
            },
          } as RecurringShift;
        }

        return baseShift as Shift;
      });

      set({ shifts, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch shifts',
        isLoading: false,
      });
    }
  },

  addShift: async (shift) => {
    try {
      set({ isLoading: true, error: null });
      
      const isRecurring = 'recurrence' in shift;
      
      const { data: shiftData, error: shiftError } = await supabase
        .from('shifts')
        .insert({
          id: shift.id,
          title: shift.title,
          type: shift.type,
          start_time: shift.startTime,
          end_time: shift.endTime,
          location: shift.location,
          notes: shift.notes,
          color: shift.color,
          is_recurring: isRecurring,
          recurrence_pattern: isRecurring ? shift.recurrence.pattern : null,
          recurrence_interval: isRecurring ? shift.recurrence.interval : null,
          recurrence_days_of_week: isRecurring ? shift.recurrence.daysOfWeek : null,
          recurrence_ends_on: isRecurring ? shift.recurrence.endsOn : null,
          recurrence_exceptions: isRecurring ? shift.recurrence.exceptions : null,
          created_by: 'current-user-id', // TODO: Get from auth store
        })
        .select()
        .single();

      if (shiftError) throw shiftError;

      // Add officer assignments
      if (shift.officers.length > 0) {
        const assignments = shift.officers.map(officerId => ({
          shift_id: shift.id,
          officer_id: officerId,
          status: 'assigned' as const,
          assigned_at: new Date().toISOString(),
        }));

        const { error: assignmentError } = await supabase
          .from('shift_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      await get().fetchShifts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add shift',
        isLoading: false,
      });
    }
  },

  updateShift: async (id, updatedShift) => {
    try {
      set({ isLoading: true, error: null });
      
      const updateData: any = {};
      
      if (updatedShift.title) updateData.title = updatedShift.title;
      if (updatedShift.type) updateData.type = updatedShift.type;
      if (updatedShift.startTime) updateData.start_time = updatedShift.startTime;
      if (updatedShift.endTime) updateData.end_time = updatedShift.endTime;
      if (updatedShift.location !== undefined) updateData.location = updatedShift.location;
      if (updatedShift.notes !== undefined) updateData.notes = updatedShift.notes;
      if (updatedShift.color) updateData.color = updatedShift.color;
      
      if ('recurrence' in updatedShift && updatedShift.recurrence) {
        updateData.is_recurring = true;
        updateData.recurrence_pattern = updatedShift.recurrence.pattern;
        updateData.recurrence_interval = updatedShift.recurrence.interval;
        updateData.recurrence_days_of_week = updatedShift.recurrence.daysOfWeek;
        updateData.recurrence_ends_on = updatedShift.recurrence.endsOn;
        updateData.recurrence_exceptions = updatedShift.recurrence.exceptions;
      }

      const { error } = await supabase
        .from('shifts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Handle assignments update
      if (updatedShift.assignments) {
        // Delete existing assignments
        await supabase
          .from('shift_assignments')
          .delete()
          .eq('shift_id', id);

        // Insert new assignments
        if (updatedShift.assignments.length > 0) {
          const assignments = updatedShift.assignments.map(assignment => ({
            shift_id: id,
            officer_id: assignment.officerId,
            beat_id: assignment.beatId,
            car_id: assignment.carId,
            notes: assignment.notes,
            status: 'assigned' as const,
            assigned_at: new Date().toISOString(),
          }));

          const { error: assignmentError } = await supabase
            .from('shift_assignments')
            .insert(assignments);

          if (assignmentError) throw assignmentError;
        }
      }

      await get().fetchShifts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update shift',
        isLoading: false,
      });
    }
  },

  deleteShift: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      // Delete assignments first
      await supabase
        .from('shift_assignments')
        .delete()
        .eq('shift_id', id);

      // Delete shift
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await get().fetchShifts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete shift',
        isLoading: false,
      });
    }
  },

  assignOfficer: async (shiftId, officerId, assignedBy) => {
    try {
      const { error } = await supabase
        .from('shift_assignments')
        .insert({
          shift_id: shiftId,
          officer_id: officerId,
          status: 'assigned',
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
        });

      if (error) throw error;

      await get().fetchShifts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to assign officer',
      });
    }
  },

  removeOfficerFromShift: async (shiftId, officerId) => {
    try {
      const { error } = await supabase
        .from('shift_assignments')
        .delete()
        .eq('shift_id', shiftId)
        .eq('officer_id', officerId);

      if (error) throw error;

      await get().fetchShifts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove officer',
      });
    }
  },

  updateAssignments: async (shiftId, assignments) => {
    try {
      // Delete existing assignments
      await supabase
        .from('shift_assignments')
        .delete()
        .eq('shift_id', shiftId);

      // Insert new assignments
      if (assignments.length > 0) {
        const assignmentData = assignments.map(assignment => ({
          shift_id: shiftId,
          officer_id: assignment.officerId,
          beat_id: assignment.beatId,
          car_id: assignment.carId,
          notes: assignment.notes,
          status: 'assigned' as const,
          assigned_at: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from('shift_assignments')
          .insert(assignmentData);

        if (error) throw error;
      }

      await get().fetchShifts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update assignments',
      });
    }
  },

  requestSwap: async (request) => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .insert({
          requested_by: request.requestedBy,
          requested_to: request.requestedTo,
          shift_id: request.shiftId,
          offered_shift_id: request.offeredShiftId,
          status: 'pending',
        });

      if (error) throw error;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to request swap',
      });
    }
  },

  approveSwap: async (id) => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({
          status: 'approved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to approve swap',
      });
    }
  },

  rejectSwap: async (id) => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({
          status: 'rejected',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reject swap',
      });
    }
  },

  getShiftsByDate: (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return get().shifts.filter((shift) => {
      const shiftDate = new Date(shift.startTime).toISOString().split('T')[0];
      
      // Check for direct date match
      if (shiftDate === dateStr) return true;
      
      // Check recurring shifts
      if ('recurrence' in shift) {
        const recurrence = shift.recurrence;
        
        if (recurrence.pattern === 'daily') {
          return true;
        }
        
        if (recurrence.pattern === 'weekly') {
          const dayOfWeek = date.getDay();
          return recurrence.daysOfWeek?.includes(dayOfWeek) || false;
        }
      }
      
      return false;
    });
  },

  getShiftsByOfficer: (officerId) => {
    return get().shifts.filter((shift) => 
      shift.officers.includes(officerId)
    );
  },

  clearError: () => set({ error: null }),
}));
</file>
