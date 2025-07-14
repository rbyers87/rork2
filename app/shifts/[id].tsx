import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Users, 
  Repeat, 
  Edit, 
  Trash 
} from 'lucide-react-native';
import { useScheduleStore } from '@/store/scheduleStore';
import { Shift, RecurringShift } from '@/types/schedule';
import { formatDateTimeRange } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import OfficerAvatar from '@/components/OfficerAvatar';
import { officers } from '@/mocks/officers';

export default function ShiftDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { shifts, deleteShift } = useScheduleStore();
  const [shift, setShift] = useState<Shift | RecurringShift | null>(null);
  
  useEffect(() => {
    if (id) {
      const foundShift = shifts.find(s => s.id === id);
      if (foundShift) {
        setShift(foundShift);
      }
    }
  }, [id, shifts]);
  
  const handleEdit = () => {
    router.push(`/shifts/edit/${id}`);
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Shift',
      'Are you sure you want to delete this shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            if (id) {
              deleteShift(id as string);
              router.back();
            }
          }
        },
      ]
    );
  };
  
  const assignedOfficers = officers.filter(officer => 
    shift?.officers.includes(officer.id)
  );
  
  const isRecurring = shift && 'recurrence' in shift;
  
  if (!shift) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Shift not found</Text>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: shift.title,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Button
                title="Edit"
                onPress={handleEdit}
                variant="outline"
                size="small"
                icon={<Edit size={16} color={Colors.primary} />}
              />
              <Button
                title="Delete"
                onPress={handleDelete}
                variant="danger"
                size="small"
                icon={<Trash size={16} color="white" />}
              />
            </View>
          ),
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.card, { borderLeftColor: shift.color || Colors.primary }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{shift.title}</Text>
            {isRecurring && (
              <View style={styles.badge}>
                <Repeat size={14} color="white" />
                <Text style={styles.badgeText}>Recurring</Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={20} color={Colors.text.secondary} />
            <Text style={styles.detailText}>
              {formatDateTimeRange(shift.startTime, shift.endTime)}
            </Text>
          </View>
          
          {shift.location && (
            <View style={styles.detailRow}>
              <MapPin size={20} color={Colors.text.secondary} />
              <Text style={styles.detailText}>{shift.location}</Text>
            </View>
          )}
          
          {isRecurring && (
            <View style={styles.detailRow}>
              <Repeat size={20} color={Colors.text.secondary} />
              <Text style={styles.detailText}>
                {(shift as RecurringShift).recurrence.pattern.charAt(0).toUpperCase() + 
                (shift as RecurringShift).recurrence.pattern.slice(1)} recurrence
                {(shift as RecurringShift).recurrence.daysOfWeek && 
                  ` on ${(shift as RecurringShift).recurrence.daysOfWeek.map(day => 
                    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
                  ).join(', ')}`
                }
              </Text>
            </View>
          )}
        </View>
        
        {shift.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{shift.notes}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Officers</Text>
          
          {assignedOfficers.length > 0 ? (
            <View style={styles.officersContainer}>
              {assignedOfficers.map(officer => (
                <View key={officer.id} style={styles.officerCard}>
                  <OfficerAvatar 
                    name={officer.name} 
                    image={officer.avatar} 
                    size={50}
                  />
                  <View style={styles.officerInfo}>
                    <Text style={styles.officerName}>{officer.name}</Text>
                    <Text style={styles.officerDetails}>
                      {officer.rank} • {officer.badge}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No officers assigned to this shift</Text>
              <Button
                title="Assign Officers"
                onPress={handleEdit}
                variant="primary"
                size="small"
                icon={<Users size={16} color="white" />}
              />
            </View>
          )}
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  notesCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  officersContainer: {
    gap: 8,
  },
  officerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
  },
  officerInfo: {
    marginLeft: 12,
  },
  officerName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  officerDetails: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  notFound: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
