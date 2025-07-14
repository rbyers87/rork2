import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useScheduleStore } from '@/store/scheduleStore';
import { formatDate } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import CalendarView from '@/components/CalendarView';
import ShiftCard from '@/components/ShiftCard';
import Button from '@/components/Button';

export default function ScheduleScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { 
    shifts, 
    getShiftsByDate, 
    fetchShifts, 
    isLoading, 
    error, 
    clearError 
  } = useScheduleStore();
  const [dailyShifts, setDailyShifts] = useState(getShiftsByDate(selectedDate));

  useEffect(() => {
    fetchShifts();
  }, []);

  useEffect(() => {
    setDailyShifts(getShiftsByDate(selectedDate));
  }, [selectedDate, shifts]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCreateShift = () => {
    router.push('/shifts/create');
  };

  const handleRetry = () => {
    clearError();
    fetchShifts();
  };

  if (isLoading && shifts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading shifts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error Loading Shifts</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="Retry"
          onPress={handleRetry}
          variant="primary"
        />
      </View>
    );
  }

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
            title="Create Shift"
            onPress={handleCreateShift}
            variant="primary"
            size="small"
            icon={<Plus size={16} color="white" />}
          />
        </View>
        
        {dailyShifts.length > 0 ? (
          <FlatList
            data={dailyShifts}
            renderItem={({ item }) => <ShiftCard shift={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.shiftsList}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={fetchShifts}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No shifts scheduled</Text>
            <Text style={styles.emptyDescription}>
              There are no shifts scheduled for this date. Tap the button above to create a new shift.
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
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
});
