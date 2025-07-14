import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Switch, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, FileText, Users, Repeat } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useScheduleStore } from '@/store/scheduleStore';
import { useAuthStore } from '@/store/authStore';
import { ShiftType, RecurrencePattern } from '@/types/schedule';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import RecurrenceSelector from '@/components/RecurrenceSelector';
import OfficerSelector from '@/components/OfficerSelector';

export default function CreateShiftScreen() {
  const router = useRouter();
  const { addShift } = useScheduleStore();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ShiftType>('morning');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setHours(startDate.getHours() + 8)));
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('weekly');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  const handleSave = () => {
    if (!title) {
      alert('Please enter a shift title');
      return;
    }
    
    const newShift = {
      id: Date.now().toString(),
      title,
      type,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      officers: selectedOfficers,
      location,
      notes,
      color: getShiftColor(type),
    };
    
    if (isRecurring) {
      const recurringShift = {
        ...newShift,
        recurrence: {
          pattern: recurrencePattern,
          interval: 1,
          daysOfWeek: [startDate.getDay()],
          endsOn: new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from start
        },
      };
      addShift(recurringShift);
    } else {
      addShift(newShift);
    }
    
    router.back();
  };
  
  const getShiftColor = (shiftType: ShiftType): string => {
    switch (shiftType) {
      case 'morning':
        return '#3B82F6'; // Blue
      case 'afternoon':
        return '#8B5CF6'; // Purple
      case 'night':
        return '#1E3A8A'; // Dark blue
      case 'custom':
        return '#10B981'; // Green
      default:
        return Colors.primary;
    }
  };
  
  const handleSelectOfficer = (officerId: string) => {
    setSelectedOfficers([...selectedOfficers, officerId]);
  };
  
  const handleRemoveOfficer = (officerId: string) => {
    setSelectedOfficers(selectedOfficers.filter(id => id !== officerId));
  };
  
  const onChangeStartDate = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      
      // Ensure end date is after start date
      if (selectedDate > endDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setHours(selectedDate.getHours() + 8);
        setEndDate(newEndDate);
      }
    }
  };
  
  const onChangeEndDate = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (selectedDate > startDate) {
        setEndDate(selectedDate);
      } else {
        alert('End time must be after start time');
      }
    }
  };
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Create Shift',
          headerRight: () => (
            <Button
              title="Save"
              onPress={handleSave}
              variant="primary"
              size="small"
            />
          ),
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Shift Title</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter shift title"
              placeholderTextColor={Colors.text.light}
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Shift Type</Text>
          <View style={styles.shiftTypeContainer}>
            {(['morning', 'afternoon', 'night', 'custom'] as ShiftType[]).map((shiftType) => (
              <Button
                key={shiftType}
                title={shiftType.charAt(0).toUpperCase() + shiftType.slice(1)}
                onPress={() => setType(shiftType)}
                variant={type === shiftType ? 'primary' : 'outline'}
                size="small"
              />
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Time</Text>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerButton}>
              <Calendar size={20} color={Colors.text.secondary} />
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.datePickerButton}>
              <Clock size={20} color={Colors.text.secondary} />
              <Text style={styles.dateText}>
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Button
              title="Change"
              onPress={() => setShowStartDatePicker(true)}
              variant="outline"
              size="small"
            />
          </View>
          
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="datetime"
              display="default"
              onChange={onChangeStartDate}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>End Time</Text>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerButton}>
              <Calendar size={20} color={Colors.text.secondary} />
              <Text style={styles.dateText}>
                {endDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.datePickerButton}>
              <Clock size={20} color={Colors.text.secondary} />
              <Text style={styles.dateText}>
                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Button
              title="Change"
              onPress={() => setShowEndDatePicker(true)}
              variant="outline"
              size="small"
            />
          </View>
          
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="datetime"
              display="default"
              onChange={onChangeEndDate}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputContainer}>
            <MapPin size={20} color={Colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter location"
              placeholderTextColor={Colors.text.light}
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <View style={styles.textAreaContainer}>
            <FileText size={20} color={Colors.text.secondary} style={styles.textAreaIcon} />
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter any additional notes"
              placeholderTextColor={Colors.text.light}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <View style={styles.switchLabel}>
              <Repeat size={20} color={Colors.primary} />
              <Text style={styles.switchText}>Recurring Shift</Text>
            </View>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={isRecurring ? Colors.primary : Colors.text.light}
            />
          </View>
          
          {isRecurring && (
            <RecurrenceSelector
              value={recurrencePattern}
              onChange={setRecurrencePattern}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <OfficerSelector
            selectedOfficers={selectedOfficers}
            onSelectOfficer={handleSelectOfficer}
            onRemoveOfficer={handleRemoveOfficer}
          />
        </View>
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  inputIcon: {
    marginRight: 8,
  },
  shiftTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  textArea: {
    flex: 1,
    height: 100,
    fontSize: 16,
    color: Colors.text.primary,
    textAlignVertical: 'top',
  },
  textAreaIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
});
