export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      officers: {
        Row: {
          id: string
          name: string
          badge: string
          rank: string
          department: string
          email: string
          phone: string | null
          avatar: string | null
          is_supervisor: boolean
          vacation_balance: number
          holiday_balance: number
          sick_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          badge: string
          rank: string
          department: string
          email: string
          phone?: string | null
          avatar?: string | null
          is_supervisor?: boolean
          vacation_balance?: number
          holiday_balance?: number
          sick_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          badge?: string
          rank?: string
          department?: string
          email?: string
          phone?: string | null
          avatar?: string | null
          is_supervisor?: boolean
          vacation_balance?: number
          holiday_balance?: number
          sick_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      shifts: {
        Row: {
          id: string
          title: string
          type: 'morning' | 'afternoon' | 'night' | 'custom'
          start_time: string
          end_time: string
          location: string | null
          notes: string | null
          color: string | null
          is_recurring: boolean
          recurrence_pattern: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom' | null
          recurrence_interval: number | null
          recurrence_days_of_week: number[] | null
          recurrence_ends_on: string | null
          recurrence_exceptions: string[] | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          type: 'morning' | 'afternoon' | 'night' | 'custom'
          start_time: string
          end_time: string
          location?: string | null
          notes?: string | null
          color?: string | null
          is_recurring?: boolean
          recurrence_pattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom' | null
          recurrence_interval?: number | null
          recurrence_days_of_week?: number[] | null
          recurrence_ends_on?: string | null
          recurrence_exceptions?: string[] | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          type?: 'morning' | 'afternoon' | 'night' | 'custom'
          start_time?: string
          end_time?: string
          location?: string | null
          notes?: string | null
          color?: string | null
          is_recurring?: boolean
          recurrence_pattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom' | null
          recurrence_interval?: number | null
          recurrence_days_of_week?: number[] | null
          recurrence_ends_on?: string | null
          recurrence_exceptions?: string[] | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      shift_assignments: {
        Row: {
          id: string
          shift_id: string
          officer_id: string
          beat_id: string | null
          car_id: string | null
          notes: string | null
          status: 'assigned' | 'requested' | 'confirmed' | 'declined'
          assigned_by: string | null
          assigned_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shift_id: string
          officer_id: string
          beat_id?: string | null
          car_id?: string | null
          notes?: string | null
          status?: 'assigned' | 'requested' | 'confirmed' | 'declined'
          assigned_by?: string | null
          assigned_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shift_id?: string
          officer_id?: string
          beat_id?: string | null
          car_id?: string | null
          notes?: string | null
          status?: 'assigned' | 'requested' | 'confirmed' | 'declined'
          assigned_by?: string | null
          assigned_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      time_off_requests: {
        Row: {
          id: string
          officer_id: string
          date: string
          type: 'vacation' | 'holiday' | 'sick'
          shift_id: string | null
          status: 'pending' | 'approved' | 'denied'
          notes: string | null
          requested_at: string
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          officer_id: string
          date: string
          type: 'vacation' | 'holiday' | 'sick'
          shift_id?: string | null
          status?: 'pending' | 'approved' | 'denied'
          notes?: string | null
          requested_at?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          officer_id?: string
          date?: string
          type?: 'vacation' | 'holiday' | 'sick'
          shift_id?: string | null
          status?: 'pending' | 'approved' | 'denied'
          notes?: string | null
          requested_at?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      beats: {
        Row: {
          id: string
          name: string
          district: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          district: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          district?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patrol_cars: {
        Row: {
          id: string
          number: string
          type: string
          status: 'available' | 'maintenance' | 'assigned'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          number: string
          type: string
          status?: 'available' | 'maintenance' | 'assigned'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          number?: string
          type?: string
          status?: 'available' | 'maintenance' | 'assigned'
          created_at?: string
          updated_at?: string
        }
      }
      swap_requests: {
        Row: {
          id: string
          requested_by: string
          requested_to: string
          shift_id: string
          offered_shift_id: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          requested_by: string
          requested_to: string
          shift_id: string
          offered_shift_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          requested_by?: string
          requested_to?: string
          shift_id?: string
          offered_shift_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          resolved_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
