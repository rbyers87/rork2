import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock } from 'lucide-react-native';
import { Shift, RecurringShift } from '@/types/schedule';
import { useTimeOffStore } from '@/store/timeOffStore';
import { officers } from '@/mocks/officers';
import { beats } from '@/mocks/beats';
import { patrolCars } from '@/mocks/cars';
import Colors from '@/constants/colors';
import OfficerAvatar from './OfficerAvatar';

interface RosterTableProps {
  shift: Shift | RecurringShift;
  date: Date;
}

export default function RosterTable({ shift, date }: RosterTableProps) {
  const router = useRouter();
  const { getTimeOffByDate } = useTimeOffStore();
  
  const assignedOfficers = officers.filter(officer => 
    shift.officers.includes(officer.id)
  );

  const timeOffRequests = getTimeOffByDate(date);
  
  // Group time off by type
  const timeOffByType = {
    vacation: timeOffRequests.filter(req => req.type === 'vacation'),
    holiday: timeOffRequests.filter(req => req.type === 'holiday'),
    sick: timeOffRequests.filter(req => req.type === 'sick'),
  };

  // Separate supervisors and regular officers
  const supervisors = assignedOfficers.filter(officer => officer.isSupervisor);
  const regularOfficers = assignedOfficers.filter(officer => !officer.isSupervisor);

  const getAssignmentForOfficer = (officerId: string) => {
    return shift.assignments?.find(assignment => assignment.officerId === officerId);
  };

  const getBeatName = (beatId?: string) => {
    if (!beatId) return '-';
    const beat = beats.find(b => b.id === beatId);
    return beat ? beat.name : '-';
  };

  const getCarNumber = (carId?: string) => {
    if (!carId) return '-';
    const car = patrolCars.find(c => c.id === carId);
    return car ? car.number : '-';
  };

  const handleOfficerPress = (officerId: string) => {
    router.push(`/shifts/${shift.id}/officer/${officerId}`);
  };

  const RosterRow = ({ officer, isHeader = false, onPress }: { 
    officer: any; 
    isHeader?: boolean;
    onPress?: () => void;
  }) => {
    const assignment = getAssignmentForOfficer(officer.id);
    
    return (
      <Pressable 
        style={[styles.row, isHeader && styles.headerRow]}
        onPress={onPress}
      >
        <View style={styles.officerCell}>
          <OfficerAvatar 
            name={officer.name} 
            image={officer.avatar} 
            size={32}
          />
          <View style={styles.officerInfo}>
            <Text style={[styles.officerName, isHeader && styles.headerText]}>
              {officer.name}
            </Text>
            <Text style={[styles.officerBadge, isHeader && styles.headerSubText]}>
              {officer.rank} • {officer.badge}
            </Text>
          </View>
        </View>
        
        <View style={styles.beatCell}>
          <Text style={[styles.cellText, isHeader && styles.headerText]}>
            {getBeatName(assignment?.beatId)}
          </Text>
        </View>
        
        <View style={styles.carCell}>
          <Text style={[styles.cellText, isHeader && styles.headerText]}>
            {getCarNumber(assignment?.carId)}
          </Text>
        </View>
        
        <View style={styles.notesCell}>
          <Text style={[styles.cellText, styles.notesText, isHeader && styles.headerText]}>
            {assignment?.notes || ''}
          </Text>
        </View>
      </Pressable>
    );
  };

  const TimeOffRow = ({ officerId, type }: { officerId: string; type: string }) => {
    const officer = officers.find(o => o.id === officerId);
    if (!officer) return null;

    return (
      <View style={styles.timeOffRow}>
        <View style={styles.officerCell}>
          <OfficerAvatar 
            name={officer.name} 
            image={officer.avatar} 
            size={32}
          />
          <View style={styles.officerInfo}>
            <Text style={styles.officerName}>{officer.name}</Text>
            <Text style={styles.officerBadge}>
              {officer.rank} • {officer.badge}
            </Text>
          </View>
        </View>
        
        <View style={styles.timeOffTypeCell}>
          <Text style={[styles.timeOffTypeText, styles[`${type}Text` as keyof typeof styles]]}>
            {type.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Active Officers Table */}
      <View style={styles.tableHeader}>
        <View style={styles.officerHeaderCell}>
          <Text style={styles.headerLabel}>Officer</Text>
        </View>
        <View style={styles.beatHeaderCell}>
          <Text style={styles.headerLabel}>Beat</Text>
        </View>
        <View style={styles.carHeaderCell}>
          <Text style={styles.headerLabel}>Car</Text>
        </View>
        <View style={styles.notesHeaderCell}>
          <Text style={styles.headerLabel}>Notes</Text>
        </View>
      </View>

      <ScrollView style={styles.tableBody} nestedScrollEnabled>
        {/* Supervisors Section */}
        {supervisors.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Supervisors</Text>
            </View>
            {supervisors.map(officer => (
              <RosterRow 
                key={officer.id} 
                officer={officer} 
                isHeader 
                onPress={() => handleOfficerPress(officer.id)}
              />
            ))}
          </View>
        )}

        {/* Officers Section */}
        {regularOfficers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Officers</Text>
            </View>
            {regularOfficers.map(officer => (
              <RosterRow 
                key={officer.id} 
                officer={officer}
                onPress={() => handleOfficerPress(officer.id)}
              />
            ))}
          </View>
        )}

        {assignedOfficers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No officers assigned to this shift</Text>
          </View>
        )}
      </ScrollView>

      {/* Time Off Section */}
      {(timeOffByType.vacation.length > 0 || timeOffByType.holiday.length > 0 || timeOffByType.sick.length > 0) && (
        <View style={styles.timeOffSection}>
          <View style={styles.timeOffHeader}>
            <Text style={styles.timeOffTitle}>Time Off</Text>
          </View>
          
          {timeOffByType.vacation.length > 0 && (
            <View style={styles.timeOffCategory}>
              <Text style={styles.timeOffCategoryTitle}>Vacation</Text>
              {timeOffByType.vacation.map(request => (
                <TimeOffRow 
                  key={request.id} 
                  officerId={request.officerId} 
                  type="vacation" 
                />
              ))}
            </View>
          )}
          
          {timeOffByType.holiday.length > 0 && (
            <View style={styles.timeOffCategory}>
              <Text style={styles.timeOffCategoryTitle}>Holiday</Text>
              {timeOffByType.holiday.map(request => (
                <TimeOffRow 
                  key={request.id} 
                  officerId={request.officerId} 
                  type="holiday" 
                />
              ))}
            </View>
          )}
          
          {timeOffByType.sick.length > 0 && (
            <View style={styles.timeOffCategory}>
              <Text style={styles.timeOffCategoryTitle}>Sick Leave</Text>
              {timeOffByType.sick.map(request => (
                <TimeOffRow 
                  key={request.id} 
                  officerId={request.officerId} 
                  type="sick" 
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  officerHeaderCell: {
    flex: 2,
  },
  beatHeaderCell: {
    flex: 1,
  },
  carHeaderCell: {
    flex: 1,
  },
  notesHeaderCell: {
    flex: 1.5,
  },
  headerLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  tableBody: {
    maxHeight: 400,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    backgroundColor: Colors.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: Colors.primary + '10',
  },
  officerCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  officerInfo: {
    marginLeft: 8,
  },
  officerName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  officerBadge: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  beatCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  carCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  notesCell: {
    flex: 1.5,
    paddingHorizontal: 8,
  },
  cellText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  notesText: {
    fontStyle: 'italic',
    color: Colors.text.secondary,
  },
  headerText: {
    fontWeight: '600',
    color: Colors.primary,
  },
  headerSubText: {
    color: Colors.primary + '80',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  timeOffSection: {
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  timeOffHeader: {
    backgroundColor: Colors.text.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  timeOffTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  timeOffCategory: {
    paddingVertical: 8,
  },
  timeOffCategoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: Colors.border,
  },
  timeOffRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  timeOffTypeCell: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timeOffTypeText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vacationText: {
    backgroundColor: Colors.success + '20',
    color: Colors.success,
  },
  holidayText: {
    backgroundColor: Colors.warning + '20',
    color: Colors.warning,
  },
  sickText: {
    backgroundColor: Colors.error + '20',
    color: Colors.error,
  },
});
