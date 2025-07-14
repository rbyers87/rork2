import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, SectionList } from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, Clock } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { Shift, RecurringShift } from '@/types/schedule';
import { formatDate } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import CalendarView from '@/components/CalendarView';
import ShiftCard from '@/components/ShiftCard';

type ShiftSection = {
  title: string;
  data: (Shift | RecurringShift)[];
};

export default function MyScheduleScreen() {
  const { user } = useAuthStore();
  const { shifts } = useScheduleStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const myShifts = shifts.filter(shift => 
    user && shift.officers.includes(user.id)
  );
  
  const getShiftsByDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return myShifts.filter(shift => {
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
        
        // More complex patterns would need more logic
      }
      
      return false;
    });
  };
  
  const organizeShiftsBySection = (): ShiftSection[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayShifts = myShifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return shiftDate.getDate() === today.getDate() &&
             shiftDate.getMonth() === today.getMonth() &&
             shiftDate.getFullYear() === today.getFullYear();
    });
    
    const tomorrowShifts = myShifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return shiftDate.getDate() === tomorrow.getDate() &&
             shiftDate.getMonth() === tomorrow.getMonth() &&
             shiftDate.getFullYear() === tomorrow.getFullYear();
    });
    
    const upcomingShifts = myShifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return shiftDate > tomorrow;
    }).sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    const sections: ShiftSection[] = [];
    
    if (todayShifts.length > 0) {
      sections.push({ title: 'Today', data: todayShifts });
    }
    
    if (tomorrowShifts.length > 0) {
      sections.push({ title: 'Tomorrow', data: tomorrowShifts });
    }
    
    if (upcomingShifts.length > 0) {
      sections.push({ title: 'Upcoming', data: upcomingShifts });
    }
    
    return sections;
  };
  
  const [dailyShifts, setDailyShifts] = useState(getShiftsByDate(selectedDate));
  const [sections, setSections] = useState(organizeShiftsBySection());
  
  useEffect(() => {
    setDailyShifts(getShiftsByDate(selectedDate));
    setSections(organizeShiftsBySection());
  }, [selectedDate, shifts, user]);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.notLoggedIn}>
          Please log in to view your schedule
        </Text>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen options={{ title: 'My Schedule' }} />
      
      <View style={styles.container}>
        <CalendarView 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
        
        <View style={styles.content}>
          <Text style={styles.dateTitle}>{formatDate(selectedDate)}</Text>
          
          {dailyShifts.length > 0 ? (
            <FlatList
              data={dailyShifts}
              renderItem={({ item }) => <ShiftCard shift={item} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.shiftsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Clock size={40} color={Colors.text.light} />
              <Text style={styles.emptyTitle}>No shifts scheduled</Text>
              <Text style={styles.emptyDescription}>
                You don't have any shifts scheduled for this date.
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  shiftsList: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  notLoggedIn: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    backgroundColor: Colors.background,
    paddingVertical: 8,
    marginBottom: 8,
  },
});
