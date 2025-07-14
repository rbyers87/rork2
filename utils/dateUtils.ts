// Date utility functions for the scheduling app

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTimeRange(start: Date | string, end: Date | string): string {
  if (typeof start === 'string') {
    start = new Date(start);
  }
  if (typeof end === 'string') {
    end = new Date(end);
  }
  
  const sameDay = start.toDateString() === end.toDateString();
  
  if (sameDay) {
    return `${formatDate(start)}, ${formatTime(start)} - ${formatTime(end)}`;
  } else {
    return `${formatDate(start)}, ${formatTime(start)} - ${formatDate(end)}, ${formatTime(end)}`;
  }
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  
  const weekStart = new Date(date);
  weekStart.setDate(diff);
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(weekStart);
    current.setDate(weekStart.getDate() + i);
    dates.push(current);
  }
  
  return dates;
}

export function getMonthDates(year: number, month: number): Date[] {
  const dates = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  for (let d = 1; d <= lastDay.getDate(); d++) {
    dates.push(new Date(year, month, d));
  }
  
  return dates;
}

export function getDayName(date: Date, short = false): string {
  return date.toLocaleDateString('en-US', { weekday: short ? 'short' : 'long' });
}

export function getMonthName(date: Date, short = false): string {
  return date.toLocaleDateString('en-US', { month: short ? 'short' : 'long' });
}
