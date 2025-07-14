import React from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { useOfficers } from '@/hooks/useOfficers';
import Colors from '@/constants/colors';
import OfficerAvatar from '@/components/OfficerAvatar';
import Button from '@/components/Button';

export default function OfficersScreen() {
  const router = useRouter();
  const { officers, isLoading, error, refetch } = useOfficers();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredOfficers = officers.filter(
    (officer) =>
      officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOfficerPress = (officerId: string) => {
    router.push(`/officers/${officerId}`);
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
        <Text style={styles.errorTitle}>Error Loading Officers</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="Retry"
          onPress={refetch}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search officers"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.text.light}
        />
      </View>
      
      <FlatList
        data={filteredOfficers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.officerCard}
            onPress={() => handleOfficerPress(item.id)}
          >
            <OfficerAvatar 
              name={item.name} 
              image={item.avatar} 
              size={50}
            />
            <View style={styles.officerInfo}>
              <Text style={styles.officerName}>{item.name}</Text>
              <Text style={styles.officerDetails}>
                {item.rank} • {item.badge}
              </Text>
              <Text style={styles.officerDepartment}>{item.department}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
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
    paddingBottom: 20,
  },
  officerCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  officerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  officerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  officerDetails: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  officerDepartment: {
    fontSize: 14,
    color: Colors.text.light,
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
