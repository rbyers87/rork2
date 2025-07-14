import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, Modal, ActivityIndicator } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { Shift, RecurringShift, OfficerAssignment } from '@/types/schedule';
import { useOfficers } from '@/hooks/useOfficers';
import { useBeats } from '@/hooks/useBeats';
import { usePatrolCars } from '@/hooks/usePatrolCars';
import Colors from '@/constants/colors';
import OfficerAvatar from './OfficerAvatar';

interface EditableRosterTableProps {
  shift: Shift | RecurringShift;
  assignments: OfficerAssignment[];
  onAssignmentsChange: (assignments: OfficerAssignment[]) => void;
}

export default function EditableRosterTable({ 
  shift, 
  assignments, 
  onAssignmentsChange 
}: EditableRosterTableProps) {
  const { officers, isLoading: officersLoading } = useOfficers();
  const { beats, isLoading: beatsLoading } = useBeats();
  const { patrolCars, isLoading: carsLoading } = usePatrolCars();
  
  const [selectedOfficer, setSelectedOfficer] = useState<string | null>(null);
  const [showBeatModal, setShowBeatModal] = useState(false);
  const [showCarModal, setShowCarModal] = useState(false);

  const assignedOfficers = officers.filter(officer => 
    shift.officers.includes(officer.id)
  );

  // Separate supervisors and regular officers
  const supervisors = assignedOfficers.filter(officer => officer.isSupervisor);
  const regularOfficers = assignedOfficers.filter(officer => !officer.isSupervisor);

  const getAssignmentForOfficer = (officerId: string) => {
    return assignments.find(assignment => assignment.officerId === officerId) || {
      officerId,
      beatId: undefined,
      carId: undefined,
      notes: '',
    };
  };

  const updateAssignment = (officerId: string, updates: Partial<OfficerAssignment>) => {
    const newAssignments = assignments.map(assignment => 
      assignment.officerId === officerId 
        ? { ...assignment, ...updates }
        : assignment
    );
    
    // If assignment doesn't exist, create it
    if (!assignments.find(a => a.officerId === officerId)) {
      newAssignments.push({
        officerId,
        beatId: undefined,
        carId: undefined,
        notes: '',
        ...updates,
      });
    }
    
    onAssignmentsChange(newAssignments);
  };

  const getBeatName = (beatId?: string) => {
    if (!beatId) return 'Select Beat';
    const beat = beats.find(b => b.id === beatId);
    return beat ? beat.name : 'Select Beat';
  };

  const getCarNumber = (carId?: string) => {
    if (!carId) return 'Select Car';
    const car = patrolCars.find(c => c.id === carId);
    return car ? car.number : 'Select Car';
  };

  const handleBeatSelect = (beatId: string) => {
    if (selectedOfficer) {
      updateAssignment(selectedOfficer, { beatId });
    }
    setShowBeatModal(false);
    setSelectedOfficer(null);
  };

  const handleCarSelect = (carId: string) => {
    if (selectedOfficer) {
      updateAssignment(selectedOfficer, { carId });
    }
    setShowCarModal(false);
    setSelectedOfficer(null);
  };

  const openBeatModal = (officerId: string) => {
    setSelectedOfficer(officerId);
    setShowBeatModal(true);
  };

  const openCarModal = (officerId: string) => {
    setSelectedOfficer(officerId);
    setShowCarModal(true);
  };

  if (officersLoading || beatsLoading || carsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading roster data...</Text>
      </View>
    );
  }

  const RosterRow = ({ officer, isHeader = false }: { officer: any; isHeader?: boolean }) => {
    const assignment = getAssignmentForOfficer(officer.id);
    
    return (
      <View style={[styles.row, isHeader && styles.headerRow]}>
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
          <Pressable 
            style={styles.selectButton}
            onPress={() => openBeatModal(officer.id)}
          >
            <Text style={[styles.selectText, assignment.beatId && styles.selectedText]}>
              {getBeatName(assignment.beatId)}
            </Text>
            <ChevronDown size={16} color={Colors.text.secondary} />
          </Pressable>
        </View>
        
        <View style={styles.carCell}>
          <Pressable 
            style={styles.selectButton}
            onPress={() => openCarModal(officer.id)}
          >
            <Text style={[styles.selectText, assignment.carId && styles.selectedText]}>
              {getCarNumber(assignment.carId)}
            </Text>
            <ChevronDown size={16} color={Colors.text.secondary} />
          </Pressable>
        </View>
        
        <View style={styles.notesCell}>
          <TextInput
            style={styles.notesInput}
            value={assignment.notes || ''}
            onChangeText={(text) => updateAssignment(officer.id, { notes: text })}
            placeholder="Add notes..."
            placeholderTextColor={Colors.text.light}
            multiline
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Table Header */}
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
              <RosterRow key={officer.id} officer={officer} isHeader />
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
              <RosterRow key={officer.id} officer={officer} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Beat Selection Modal */}
      <Modal
        visible={showBeatModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBeatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Beat</Text>
              <Pressable onPress={() => setShowBeatModal(false)}>
                <X size={24} color={Colors.text.primary} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalList}>
              <Pressable 
                style={styles.modalItem}
                onPress={() => handleBeatSelect('')}
              >
                <Text style={styles.modalItemText}>No Beat</Text>
              </Pressable>
              
              {beats.map(beat => (
                <Pressable 
                  key={beat.id}
                  style={styles.modalItem}
                  onPress={() => handleBeatSelect(beat.id)}
                >
                  <View>
                    <Text style={styles.modalItemText}>{beat.name}</Text>
                    <Text style={styles.modalItemSubtext}>{beat.district}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Car Selection Modal */}
      <Modal
        visible={showCarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Car</Text>
              <Pressable onPress={() => setShowCarModal(false)}>
                <X size={24} color={Colors.text.primary} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalList}>
              <Pressable 
                style={styles.modalItem}
                onPress={() => handleCarSelect('')}
              >
                <Text style={styles.modalItemText}>No Car</Text>
              </Pressable>
              
              {patrolCars.map(car => (
                <Pressable 
                  key={car.id}
                  style={styles.modalItem}
                  onPress={() => handleCarSelect(car.id)}
                >
                  <View>
                    <Text style={styles.modalItemText}>Car {car.number}</Text>
                    <Text style={styles.modalItemSubtext}>{car.type}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
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
    maxHeight: 500,
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
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectText: {
    fontSize: 12,
    color: Colors.text.light,
  },
  selectedText: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 12,
    color: Colors.text.primary,
    minHeight: 32,
    textAlignVertical: 'top',
  },
  headerText: {
    fontWeight: '600',
    color: Colors.primary,
  },
  headerSubText: {
    color: Colors.primary + '80',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  modalItemSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
