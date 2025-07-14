import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Modal, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock, X } from 'lucide-react-native';
import { useScheduleStore } from '@/store/scheduleStore';
import { useTimeOffStore } from '@/store/timeOffStore';
import { useAuthStore } from '@/store/authStore';
import { Shift, RecurringShift, TimeOffType } from '@/types/schedule';
import { officers } from '@/mocks/officers';
import { formatDateTimeRange } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import OfficerAvatar from '@/components/OfficerAvatar';

export default function ShiftOfficerScreen() {
  const { id: shiftId, officerId } = useLocalSearchParams();
  const router = useRouter();
  const { shifts } = useScheduleStore();
  const { convertShiftToTimeOff } = useTimeOffStore();
  const { user } = useAuthStore();
  
  const [shift, setShift] = useState<Shift | RecurringShift | null>(null);
  const [officer, setOfficer] = useState<any>(null);
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  
  useEffect(() => {
    if (shiftId) {
      const foundShift = shifts.find(s => s.id === shiftId);
      if (foundShift) {
        setShift(foundShift);
      }
    }
    
    if (officerId) {
      const foundOfficer = officers.find(o => o.id === officerId);
      if (foundOfficer) {
        setOfficer(foundOfficer);
      }
    }
  }, [shiftId, officerId, shifts]);

  const handleConvertToTimeOff = (type: TimeOffType) => {
    if (!shift || !officer || !user) return;
    
    Alert.alert(
      'Convert to Time Off',
      `Convert ${officer.name}'s shift to ${type} time?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Convert',
          onPress: async () => {
            try {
              const shiftDate = new Date(shift.startTime).toISOString().split('T')[0];
              await convertShiftToTimeOff(
                shift.id,
                officer.id,
                type,
                shiftDate,
                `Converted from ${shift.title}`
              );
              setShowTimeOffModal(false);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to convert shift to time off');
            }
          }
        }
      ]
    );
  };

  if (!shift || !officer) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Shift or officer not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `${officer.name} - ${shift.title}`,
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.officerCard}>
          <OfficerAvatar 
            name={officer.name} 
            image={officer.avatar} 
            size={80}
          />
          
          <View style={styles.officerInfo}>
            <Text style={styles.officerName}>{officer.name}</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{officer.badge}</Text>
            </View>
            <Text style={styles.officerRank}>{officer.rank}</Text>
            <Text style={styles.officerDepartment}>{officer.department}</Text>
          </View>
        </View>

        <View style={styles.shiftCard}>
          <Text style={styles.shiftTitle}>{shift.title}</Text>
          
          <View style={styles.detailRow}>
            <Clock size={20} color={Colors.text.secondary} />
            <Text style={styles.detailText}>
              {formatDateTimeRange(shift.startTime, shift.endTime)}
            </Text>
          </View>
          
          {shift.location && (
            <View style={styles.detailRow}>
              <Calendar size={20} color={Colors.text.secondary} />
              <Text style={styles.detailText}>{shift.location}</Text>
            </View>
          )}
        </View>

        {officer.ptoBalances && (
          <View style={styles.ptoCard}>
            <Text style={styles.ptoTitle}>PTO Balances</Text>
            
            <View style={styles.ptoBalances}>
              <View style={styles.ptoItem}>
                <Text style={styles.ptoLabel}>Vacation</Text>
                <Text style={styles.ptoValue}>{officer.ptoBalances.vacation}h</Text>
              </View>
              
              <View style={styles.ptoItem}>
                <Text style={styles.ptoLabel}>Holiday</Text>
                <Text style={styles.ptoValue}>{officer.ptoBalances.holiday}h</Text>
              </View>
              
              <View style={styles.ptoItem}>
                <Text style={styles.ptoLabel}>Sick</Text>
                <Text style={styles.ptoValue}>{officer.ptoBalances.sick}h</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Actions</Text>
          
          <Button
            title="Convert to Time Off"
            onPress={() => setShowTimeOffModal(true)}
            variant="outline"
            size="large"
            fullWidth
            icon={<Calendar size={20} color={Colors.primary} />}
          />
        </View>
      </ScrollView>

      {/* Time Off Modal */}
      <Modal
        visible={showTimeOffModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeOffModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Convert to Time Off</Text>
              <Pressable onPress={() => setShowTimeOffModal(false)}>
                <X size={24} color={Colors.text.primary} />
              </Pressable>
            </View>
            
            <Text style={styles.modalDescription}>
              Select the type of time off for {officer.name}:
            </Text>
            
            <View style={styles.timeOffOptions}>
              <Button
                title={`Vacation (${officer.ptoBalances?.vacation || 0}h available)`}
                onPress={() => handleConvertToTimeOff('vacation')}
                variant="outline"
                size="large"
                fullWidth
                disabled={(officer.ptoBalances?.vacation || 0) < 8}
              />
              
              <Button
                title={`Holiday (${officer.ptoBalances?.holiday || 0}h available)`}
                onPress={() => handleConvertToTimeOff('holiday')}
                variant="outline"
                size="large"
                fullWidth
                disabled={(officer.ptoBalances?.holiday || 0) < 8}
              />
              
              <Button
                title={`Sick Leave (${officer.ptoBalances?.sick || 0}h available)`}
                onPress={() => handleConvertToTimeOff('sick')}
                variant="outline"
                size="large"
                fullWidth
                disabled={(officer.ptoBalances?.sick || 0) < 8}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  officerCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  officerInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  officerName: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  badgeContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  badgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  officerRank: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  officerDepartment: {
    fontSize: 16,
    color: Colors.text.light,
  },
  shiftCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  shiftTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  ptoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ptoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  ptoBalances: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ptoItem: {
    alignItems: 'center',
  },
  ptoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  ptoValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  notFound: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  timeOffOptions: {
    gap: 12,
  },
});
