import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, MapPin, Users } from 'lucide-react-native';
import { Shift, RecurringShift } from '@/types/schedule';
import { formatTime } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import OfficerAvatar from './OfficerAvatar';
import { officers } from '@/mocks/officers';

interface ShiftCardProps {
  shift: Shift | RecurringShift;
  compact?: boolean;
}

export default function ShiftCard({ shift, compact = false }: ShiftCardProps) {
  const router = useRouter();
  const startTime = new Date(shift.startTime);
  const endTime = new Date(shift.endTime);
  
  const assignedOfficers = officers.filter(officer => 
    shift.officers.includes(officer.id)
  );

  const handlePress = () => {
    router.push(`/shifts/${shift.id}`);
  };

  const isRecurring = 'recurrence' in shift;
  
  return (
    <Pressable 
      style={[styles.card, { borderLeftColor: shift.color || Colors.primary }]} 
      onPress={handlePress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{shift.title}</Text>
        {isRecurring && (
          <View style={styles.recurringBadge}>
            <Text style={styles.recurringText}>Recurring</Text>
          </View>
        )}
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Clock size={16} color={Colors.text.secondary} />
          <Text style={styles.detailText}>
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
        </View>
        
        {shift.location && (
          <View style={styles.detailRow}>
            <MapPin size={16} color={Colors.text.secondary} />
            <Text style={styles.detailText}>{shift.location}</Text>
          </View>
        )}
        
        {!compact && (
          <View style={styles.officersSection}>
            <View style={styles.detailRow}>
              <Users size={16} color={Colors.text.secondary} />
              <Text style={styles.detailText}>
                {assignedOfficers.length} {assignedOfficers.length === 1 ? 'Officer' : 'Officers'}
              </Text>
            </View>
            
            <View style={styles.avatarRow}>
              {assignedOfficers.slice(0, 3).map((officer) => (
                <View key={officer.id} style={styles.avatarWrapper}>
                  <OfficerAvatar 
                    name={officer.name} 
                    image={officer.avatar}
                    size={32}
                  />
                </View>
              ))}
              
              {assignedOfficers.length > 3 && (
                <View style={styles.moreAvatars}>
                  <Text style={styles.moreAvatarsText}>+{assignedOfficers.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  recurringBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recurringText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  officersSection: {
    marginTop: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  avatarWrapper: {
    marginRight: -8,
  },
  moreAvatars: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  moreAvatarsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
});
