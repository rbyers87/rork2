import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Bell, 
  Moon, 
  LogOut, 
  Shield, 
  Clock, 
  Calendar, 
  Users, 
  ChevronRight 
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Colors from '@/constants/colors';
import OfficerAvatar from '@/components/OfficerAvatar';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <Pressable 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <ChevronRight size={20} color={Colors.text.light} />)}
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {user ? (
        <View style={styles.profileSection}>
          <OfficerAvatar 
            name={user.name} 
            image={user.avatar} 
            size={80}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileDetails}>
              {user.rank} • {user.badge}
            </Text>
            <Text style={styles.profileDepartment}>{user.department}</Text>
          </View>
        </View>
      ) : (
        <Pressable 
          style={styles.loginPrompt}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginText}>Log in to manage your schedule</Text>
        </Pressable>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <SettingItem 
          icon={<Bell size={22} color={Colors.primary} />}
          title="Notifications"
          subtitle="Receive alerts about schedule changes"
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={notificationsEnabled ? Colors.primary : Colors.text.light}
            />
          }
        />
        
        <SettingItem 
          icon={<Moon size={22} color={Colors.primary} />}
          title="Dark Mode"
          subtitle="Switch to dark theme"
          rightElement={
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={darkModeEnabled ? Colors.primary : Colors.text.light}
            />
          }
        />
      </View>

      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administration</Text>
          
          <SettingItem 
            icon={<Shield size={22} color={Colors.primary} />}
            title="Department Settings"
            subtitle="Manage department-wide settings"
            onPress={() => router.push('/admin/department')}
          />
          
          <SettingItem 
            icon={<Users size={22} color={Colors.primary} />}
            title="Manage Officers"
            subtitle="Add, edit or remove officers"
            onPress={() => router.push('/admin/officers')}
          />
          
          <SettingItem 
            icon={<Clock size={22} color={Colors.primary} />}
            title="Shift Templates"
            subtitle="Create and manage shift templates"
            onPress={() => router.push('/admin/templates')}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <SettingItem 
          icon={<Calendar size={22} color={Colors.primary} />}
          title="My Schedule"
          subtitle="View your upcoming shifts"
          onPress={() => router.push('/my-schedule')}
        />
        
        {user && (
          <SettingItem 
            icon={<LogOut size={22} color={Colors.error} />}
            title="Log Out"
            subtitle="Sign out of your account"
            onPress={handleLogout}
          />
        )}
      </View>
      
      <Text style={styles.version}>Police Scheduler v1.0.0</Text>
    </ScrollView>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  profileDepartment: {
    fontSize: 14,
    color: Colors.text.light,
  },
  loginPrompt: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  loginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    color: Colors.text.light,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
});
