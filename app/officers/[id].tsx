import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Mail, Phone, Calendar, Clock, Award } from 'lucide-react-native';
import { useScheduleStore } from '@/store/scheduleStore';
import { useTimeOffStore } from '@/store/timeOffStore';
import { Officer } from '@/types/schedule';
import { officers } from '@/mocks/officers';
import { formatDateTimeRange } from '@/utils/dateUtils';
import Colors from '@/constants/colors';
import OfficerAvatar from '@/components/OfficerAvatar';
import ShiftCard from '@/components/ShiftCard';

export default function OfficerDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { shifts } = useScheduleStore();
  const { getTimeOffByOfficer } = useTimeOffStore();
  const [officer, setOfficer] = useState<Officer | null>(null);
  
  useEffect(() => {
    if (id) {
      const foundOfficer = officers.find(o => o.id === id);
      if (foundOfficer) {
        setOfficer(foundOfficer);
      }
    }
  }, [id]);
  
  const officerShifts = shifts.filter(shift => 
    shift.officers.includes(id as string)
  );
  
  const upcomingShifts = officerShifts.filter(shift => 
    new Date(shift.startTime) > new Date()
  ).sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const timeOffRequests = getTimeOffByOfficer(id as string);
  const approvedTimeOff = timeOffRequests.filter(req => req.status === 'approved');
  
  if (!officer) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Officer not found</Text>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen options={{ title: officer.name }} />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <OfficerAvatar 
            name={officer.name} 
            image={officer.avatar} 
            size={100}
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.officerName}>{officer.name}</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{officer.badge}</Text>
            </View>
            <Text style={styles.officerRank}>{officer.rank}</Text>
            <Text style={styles.officerDepartment}>{officer.department}</Text>
          </View>
        </View>
        
        <View style={styles.contactCard}>
          <Pressable style={styles.contactItem}>
            <Mail size={20} color={Colors.primary} />
            <Text style={styles.contactText}>{officer.email}</Text>
          </Pressable>
          
          {officer.phone && (
            <Pressable style={styles.contactItem}>
              <Phone size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{officer.phone}</Text>
            </Pressable>
          )}
        </View>

        {/* PTO Balances */}
        {officer.ptoBalances && (
          <View style={styles.ptoCard}>
            <View style={styles.ptoHeader}>
              <Award size={20} color={Colors.primary} />
              <Text style={styles.ptoTitle}>PTO Balances</Text>
            </View>
            
            <View style={styles.ptoBalances}>
              <View style={styles.ptoItem}>
                <Text style={styles.ptoValue}>{officer.ptoBalances.vacation}</Text>
                <Text style={styles.ptoLabel}>Vacation Hours</Text>
              </View>
              
              <View style={styles.ptoDivider} />
              
              <View style={styles.ptoItem}>
                <Text style={styles.ptoValue}>{officer.ptoBalances.holiday}</Text>
                <Text style={styles.ptoLabel}>Holiday Hours</Text>
              </View>
              
              <View style={styles.ptoDivider} />
              
              <View style={styles.ptoItem}>
                <Text style={styles.ptoValue}>{officer.ptoBalances.sick}</Text>
                <Text style={styles.ptoLabel}>Sick Hours</Text>
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Shifts</Text>
          
          {upcomingShifts.length > 0 ? (
            <View>
              {upcomingShifts.slice(0, 5).map(shift => (
                <ShiftCard key={shift.id} shift={shift} />
              ))}
              
              {upcomingShifts.length > 5 && (
                <Pressable 
                  style={styles.viewAllButton}
                  onPress={() => router.push(`/officers/${id}/shifts`)}
                >
                  <Text style={styles.viewAllText}>
                    View all {upcomingShifts.length} shifts
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={40} color={Colors.text.light} />
              <Text style={styles.emptyText}>No upcoming shifts</Text>
            </View>
          )}
        </View>

        {/* Time Off History */}
        {approvedTimeOff.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Time Off</Text>
            
            <View style={styles.timeOffList}>
              {approvedTimeOff.slice(0, 5).map(request => (
                <View key={request.id} style={styles.timeOffItem}>
                  <View style={styles.timeOffInfo}>
                    <Text style={styles.timeOffDate}>
                      {new Date(request.date).toLocaleDateString()}
                    </Text>
                    <Text style={[
                      styles.timeOffType,
                      styles[`${request.type}Badge` as keyof typeof styles]
                    ]}>
                      {request.type.toUpperCase()}
                    </Text>
                  </View>
                  {request.notes && (
                    <Text style={styles.timeOffNotes}>{request.notes}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Summary</Text>
          
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{officerShifts.length}</Text>
              <Text style={styles.statLabel}>Total Shifts</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{upcomingShifts.length}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {officerShifts.filter(s => 'recurrence' in s).length}
              </Text>
              <Text style={styles.statLabel}>Recurring</Text>
            </View>
          </View>
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
  profileCard: {
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
  profileInfo: {
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
  contactCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  ptoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ptoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  ptoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  ptoBalances: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ptoItem: {
    alignItems: 'center',
    flex: 1,
  },
  ptoValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  ptoLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  ptoDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  timeOffList: {
    gap: 8,
  },
  timeOffItem: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
  },
  timeOffInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeOffDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  timeOffType: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  vacationBadge: {
    backgroundColor: Colors.success + '20',
    color: Colors.success,
  },
  holidayBadge: {
    backgroundColor: Colors.warning + '20',
    color: Colors.warning,
  },
  sickBadge: {
    backgroundColor: Colors.error + '20',
    color: Colors.error,
  },
  timeOffNotes: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  notFound: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
