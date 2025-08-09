import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, UserCheck } from 'lucide-react-native';

interface RoleSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectRole: (role: 'swimmer' | 'coach') => void;
  currentRole?: 'swimmer' | 'coach';
}

export default function RoleSelector({ visible, onClose, onSelectRole, currentRole }: RoleSelectorProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you'll be using the app
          </Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              currentRole === 'swimmer' && styles.roleCardActive,
            ]}
            onPress={() => onSelectRole('swimmer')}
          >
            <View style={styles.roleIcon}>
              <Users size={32} color={currentRole === 'swimmer' ? '#FFFFFF' : '#0066CC'} />
            </View>
            <Text style={[
              styles.roleTitle,
              currentRole === 'swimmer' && styles.roleTitleActive,
            ]}>
              Swimmer
            </Text>
            <Text style={[
              styles.roleDescription,
              currentRole === 'swimmer' && styles.roleDescriptionActive,
            ]}>
              Track your personal swimming times, join teams, and monitor your progress
            </Text>
            <View style={styles.roleFeatures}>
              <Text style={[
                styles.roleFeature,
                currentRole === 'swimmer' && styles.roleFeatureActive,
              ]}>
                • Personal time tracking
              </Text>
              <Text style={[
                styles.roleFeature,
                currentRole === 'swimmer' && styles.roleFeatureActive,
              ]}>
                • Join teams with codes
              </Text>
              <Text style={[
                styles.roleFeature,
                currentRole === 'swimmer' && styles.roleFeatureActive,
              ]}>
                • View team information
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              currentRole === 'coach' && styles.roleCardActive,
            ]}
            onPress={() => onSelectRole('coach')}
          >
            <View style={styles.roleIcon}>
              <UserCheck size={32} color={currentRole === 'coach' ? '#FFFFFF' : '#0066CC'} />
            </View>
            <Text style={[
              styles.roleTitle,
              currentRole === 'coach' && styles.roleTitleActive,
            ]}>
              Coach
            </Text>
            <Text style={[
              styles.roleDescription,
              currentRole === 'coach' && styles.roleDescriptionActive,
            ]}>
              Create and manage teams, track swimmer performance, and analyze team data
            </Text>
            <View style={styles.roleFeatures}>
              <Text style={[
                styles.roleFeature,
                currentRole === 'coach' && styles.roleFeatureActive,
              ]}>
                • Create and manage teams
              </Text>
              <Text style={[
                styles.roleFeature,
                currentRole === 'coach' && styles.roleFeatureActive,
              ]}>
                • Invite swimmers to teams
              </Text>
              <Text style={[
                styles.roleFeature,
                currentRole === 'coach' && styles.roleFeatureActive,
              ]}>
                • View all team member data
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={onClose}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roleCardActive: {
    borderColor: '#0066CC',
    backgroundColor: '#0066CC',
  },
  roleIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  roleTitleActive: {
    color: '#FFFFFF',
  },
  roleDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  roleDescriptionActive: {
    color: '#E5E7EB',
  },
  roleFeatures: {
    gap: 8,
  },
  roleFeature: {
    fontSize: 14,
    color: '#6B7280',
  },
  roleFeatureActive: {
    color: '#E5E7EB',
  },
  footer: {
    padding: 20,
  },
  continueButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});