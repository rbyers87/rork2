import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Save } from 'lucide-react-native';
import { useScheduleStore } from '@/store/scheduleStore';
import { OfficerAssignment } from '@/types/schedule';
import { formatDate } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import EditableRosterTable from '@/components/EditableRosterTable';

export default function EditRosterScreen() {
  const { date } = useLocalSearchParams();
  const router = useRouter();
  const { getShiftsByDate, updateShift } = useScheduleStore();
  
  const selectedDate = new Date(date as string);
  const [shifts, setShifts] = useState(getShiftsByDate(selectedDate));
  const [assignments, setAssignments] = useState<{ [shiftId: string]: OfficerAssignment[] }>({});

  useEffect(() => {
    const dailyShifts = getShiftsByDate(selectedDate);
    setShifts(dailyShifts);
    
    // Initialize assignments from existing shift data
    const initialAssignments: { [shiftId: string]: OfficerAssignment[] } = {};
    dailyShifts.forEach(shift => {
      initialAssignments[shift.id] = shift.assignments || shift.officers.map(officerId => ({
        officerId,
        beatId: undefined,
        carId: undefined,
        notes: '',
      }));
    });
    setAssignments(initialAssignments);
  }, [selectedDate]);

  const handleSave = () => {
    try {
      // Update each shift with new assignments
      Object.entries(assignments).forEach(([shiftId, shiftAssignments]) => {
        updateShift(shiftId, { assignments: shiftAssignments });
      });
      
      Alert.alert('Success', 'Roster assignments saved successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save roster assignments');
    }
  };

  const updateAssignments = (shiftId: string, newAssignments: OfficerAssignment[]) => {
    setAssignments(prev => ({
      ...prev,
      [shiftId]: newAssignments,
    }));
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Edit Roster - ${formatDate(selectedDate)}`,
          headerRight: () => (
            <Button
              title="Save"
              onPress={handleSave}
              variant="primary"
              size="small"
              icon={<Save size={16} color="white" />}
            />
          ),
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {shifts.length > 0 ? (
          shifts.map((shift) => (
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
              
              <EditableRosterTable 
                shift={shift}
                assignments={assignments[shift.id] || []}
                onAssignmentsChange={(newAssignments) => updateAssignments(shift.id, newAssignments)}
              />
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No shifts scheduled</Text>
            <Text style={styles.emptyDescription}>
              There are no shifts scheduled for this date.
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
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
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
