import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Edit, Car, MapPin } from 'lucide-react-native';
import { useScheduleStore } from '@/store/scheduleStore';
import { useTimeOffStore } from '@/store/timeOffStore';
import { formatDate } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import CalendarView from '@/components/CalendarView';
import RosterTable from '@/components/RosterTable';
import Button from '@/components/Button';

export default function RosterScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getShiftsByDate } = useScheduleStore();
  const { fetchTimeOffRequests } = useTimeOffStore();
  const [dailyShifts, setDailyShifts] = useState(getShiftsByDate(selectedDate));

  useEffect(() => {
    setDailyShifts(getShiftsByDate(selectedDate));
    fetchTimeOffRequests(selectedDate);
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEditRoster = () => {
    router.push(`/roster/edit?date=${selectedDate.toISOString()}`);
  };

  return (
    <View style={styles.container}>
      <CalendarView 
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.dateTitle}>{formatDate(selectedDate)}</Text>
          <Button 
            title="Edit Roster"
            onPress={handleEditRoster}
            variant="primary"
            size="small"
            icon={<Edit size={16} color="white" />}
          />
        </View>
        
        {dailyShifts.length > 0 ? (
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {dailyShifts.map((shift) => (
              <View key={shift.id} style={styles.shiftSection}>
                <View style={styles.shiftHeader}>
                  <Text style={styles.shiftTitle}>{shift.title}</Text>
                  <Text style={styles.shiftTime}>
                    {new Date(shift.startTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - {new Date(shift.endTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
                
                <RosterTable shift={shift} date={selectedDate} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={40} color={Colors.text.light} />
            <Text style={styles.emptyTitle}>No shifts scheduled</Text>
            <Text style={styles.emptyDescription}>
              There are no shifts scheduled for this date.
            </Text>
          </View>
        )}
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  shiftSection: {
    marginBottom: 24,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  shiftTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  shiftTime: {
    fontSize: 14,
    color: Colors.text.secondary,
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
});
