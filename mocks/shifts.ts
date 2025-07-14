import { Shift, RecurringShift } from '@/types/schedule';
import { addDays, addHours, startOfDay } from '@/utils/dateUtils';

// Helper to create dates relative to today
const today = new Date();
const startOfToday = startOfDay(today);

export const shifts: (Shift | RecurringShift)[] = [
  {
    id: '1',
    title: 'Morning Patrol',
    type: 'morning',
    startTime: addHours(startOfToday, 6).toISOString(),
    endTime: addHours(startOfToday, 14).toISOString(),
    officers: ['1', '2'],
    location: 'Downtown',
    color: '#3B82F6',
  },
  {
    id: '2',
    title: 'Afternoon Patrol',
    type: 'afternoon',
    startTime: addHours(startOfToday, 14).toISOString(),
    endTime: addHours(startOfToday, 22).toISOString(),
    officers: ['3'],
    location: 'Westside',
    color: '#8B5CF6',
  },
  {
    id: '3',
    title: 'Night Patrol',
    type: 'night',
    startTime: addHours(startOfToday, 22).toISOString(),
    endTime: addHours(addDays(startOfToday, 1), 6).toISOString(),
    officers: ['4'],
    location: 'Citywide',
    color: '#1E3A8A',
  },
  {
    id: '4',
    title: 'Traffic Control',
    type: 'morning',
    startTime: addHours(addDays(startOfToday, 1), 8).toISOString(),
    endTime: addHours(addDays(startOfToday, 1), 16).toISOString(),
    officers: ['3', '5'],
    location: 'Highway 101',
    color: '#10B981',
    recurrence: {
      pattern: 'weekly',
      interval: 1,
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
      endsOn: addDays(today, 90).toISOString(),
      exceptions: [],
    },
  },
  {
    id: '5',
    title: 'Special Event',
    type: 'custom',
    startTime: addHours(addDays(startOfToday, 3), 10).toISOString(),
    endTime: addHours(addDays(startOfToday, 3), 18).toISOString(),
    officers: ['1', '2', '3'],
    location: 'City Park',
    notes: 'Annual city festival security detail',
    color: '#F59E0B',
  },
];
