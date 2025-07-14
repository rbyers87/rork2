export type ShiftType = 'morning' | 'afternoon' | 'night' | 'custom';

export type RecurrencePattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';

export type TimeOffType = 'vacation' | 'holiday' | 'sick';

export interface Officer {
  id: string;
  name: string;
  badge: string;
  rank: string;
  department: string;
  email: string;
  phone?: string;
  avatar?: string;
  isSupervisor?: boolean;
  ptoBalances?: {
    vacation: number;
    holiday: number;
    sick: number;
  };
}

export interface Beat {
  id: string;
  name: string;
  district: string;
  description?: string;
}

export interface PatrolCar {
  id: string;
  number: string;
  type: string;
  status: 'available' | 'maintenance' | 'assigned';
}

export interface OfficerAssignment {
  officerId: string;
  beatId?: string;
  carId?: string;
  notes?: string;
}

export interface Shift {
  id: string;
  title: string;
  type: ShiftType;
  startTime: string; // ISO string
  endTime: string; // ISO string
  officers: string[]; // Officer IDs
  assignments?: OfficerAssignment[]; // Beat and car assignments
  notes?: string;
  location?: string;
  color?: string;
}

export interface RecurringShift extends Shift {
  recurrence: {
    pattern: RecurrencePattern;
    interval: number; // Every X days/weeks/months
    daysOfWeek?: number[]; // 0-6, Sunday to Saturday
    endsOn?: string; // ISO string or null for never
    exceptions?: string[]; // ISO date strings for exceptions
  };
}

export interface TimeOffRequest {
  id: string;
  officerId: string;
  date: string; // ISO date string
  type: TimeOffType;
  shiftId?: string; // Optional - if replacing a specific shift
  status: 'pending' | 'approved' | 'denied';
  notes?: string;
  requestedAt: string; // ISO string
  approvedBy?: string; // Officer ID
  approvedAt?: string; // ISO string
}

export interface ShiftAssignment {
  shiftId: string;
  officerId: string;
  status: 'assigned' | 'requested' | 'confirmed' | 'declined';
  assignedBy?: string; // Officer ID
  assignedAt: string; // ISO string
}

export interface SwapRequest {
  id: string;
  requestedBy: string; // Officer ID
  requestedTo: string; // Officer ID
  shiftId: string;
  offeredShiftId?: string; // Optional shift offered in exchange
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string; // ISO string
  resolvedAt?: string; // ISO string
}
