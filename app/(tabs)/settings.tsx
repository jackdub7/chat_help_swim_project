import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Download, Trash2, LogOut, Shield, Wifi, CircleHelp as HelpCircle, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  
  const { user, userProfile, logout, updateUserRole } = useAuth();

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your swimming data will be exported as a CSV file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Exporting data...') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => console.log('Deleting account...'),
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          onPress: async () => {
            const result = await logout();
            
            if (result.success) {
              router.replace('/');
            } else {
              Alert.alert('Error', result.error || 'Failed to log out');
            }
          }
        },
      ]
    );
  };

  const handleRoleChange = async () => {
    const newRole = userProfile?.role === 'coach' ? 'swimmer' : 'coach';
    
    Alert.alert(
      'Change Role',
      `Are you sure you want to change your role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change', 
          onPress: async () => {
            const result = await updateUserRole(newRole);
            
            if (result.success) {
              Alert.alert('Success', `Role changed to ${newRole} successfully!`);
            } else {
              Alert.alert('Error', result.error || 'Failed to change role');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your preferences</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <User size={20} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Profile Information</Text>
                <Text style={styles.settingSubtitle}>
                  {userProfile?.name || user?.email} • {userProfile?.role === 'coach' ? 'Coach' : 'Swimmer'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleRoleChange}>
            <View style={styles.settingLeft}>
              <Shield size={20} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Change Role</Text>
                <Text style={styles.settingSubtitle}>
                  Switch between swimmer and coach
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>Get notified about new times</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#0066CC' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Data & Sync Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Sync</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Wifi size={20} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Auto Sync</Text>
                <Text style={styles.settingSubtitle}>Sync data automatically</Text>
              </View>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: '#D1D5DB', true: '#0066CC' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <View style={styles.settingLeft}>
              <Download size={20} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Export Data</Text>
                <Text style={styles.settingSubtitle}>Download your swimming data</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Shield size={20} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Offline Mode</Text>
                <Text style={styles.settingSubtitle}>Use app without internet</Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: '#D1D5DB', true: '#0066CC' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <HelpCircle size={20} color="#6B7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Help & Support</Text>
                <Text style={styles.settingSubtitle}>Get help and contact support</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.dataCard}>
            <Text style={styles.dataTitle}>Storage Usage</Text>
            <View style={styles.dataBar}>
              <View style={styles.dataProgress} />
            </View>
            <Text style={styles.dataText}>2.4 MB of 100 MB used</Text>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#0066CC" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Trash2 size={20} color="#DC2626" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>SwimTracker v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2025 Swimming Performance</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  dataBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  dataProgress: {
    height: '100%',
    width: '2.4%',
    backgroundColor: '#0066CC',
    borderRadius: 4,
  },
  dataText: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0066CC',
    gap: 8,
  },
  logoutText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
    gap: 8,
  },
  deleteText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});