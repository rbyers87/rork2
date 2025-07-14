import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Search } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { useOfficers } from '@/hooks/useOfficers';
import Colors from '@/constants/colors';
import OfficerAvatar from './OfficerAvatar';

interface OfficerSelectorProps {
  selectedOfficers: string[];
  onSelectOfficer: (officerId: string) => void;
  onRemoveOfficer: (officerId: string) => void;
}

export default function OfficerSelector({
  selectedOfficers,
  onSelectOfficer,
  onRemoveOfficer,
}: OfficerSelectorProps) {
  const { officers, isLoading, error } = useOfficers();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOfficers = officers.filter(
    (officer) =>
      officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.rank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOfficerItem = ({ item }: { item: any }) => {
    const isSelected = selectedOfficers.includes(item.id);
    
    return (
      <Pressable
        style={[
          styles.officerItem,
          isSelected && styles.selectedOfficerItem,
        ]}
        onPress={() => {
          if (isSelected) {
            onRemoveOfficer(item.id);
          } else {
            onSelectOfficer(item.id);
          }
        }}
      >
        <View style={styles.officerInfo}>
          <OfficerAvatar name={item.name} image={item.avatar} size={40} />
          <View style={styles.officerDetails}>
            <Text style={styles.officerName}>{item.name}</Text>
            <Text style={styles.officerMeta}>
              {item.rank} • {item.badge}
            </Text>
          </View>
        </View>
        
        <View style={[
          styles.checkbox,
          isSelected && styles.checkedBox,
        ]}>
          {isSelected && <View style={styles.checkmark} />}
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading officers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading officers: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Officers</Text>
      
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, badge or rank"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.text.light}
        />
      </View>
      
      <FlatList
        data={filteredOfficers}
        renderItem={renderOfficerItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
      
      {selectedOfficers.length > 0 && (
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedOfficers.length} {selectedOfficers.length === 1 ? 'officer' : 'officers'} selected
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    color: Colors.text.primary,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  officerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.card,
  },
  selectedOfficerItem: {
    backgroundColor: Colors.primary + '10',
  },
  officerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officerDetails: {
    marginLeft: 12,
  },
  officerName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  officerMeta: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  selectedCount: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
  },
});
