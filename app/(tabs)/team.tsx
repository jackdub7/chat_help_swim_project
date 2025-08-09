import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Users, Mail, UserPlus, CreditCard as Edit3 } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTeams } from '@/hooks/useTeams';

export default function TeamScreen() {
  const { user, userProfile } = useAuth();
  const { teams, swimmerTeams, createTeam, joinTeamByCode, isLoading } = useTeams(user?.id, userProfile?.role);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    const result = await createTeam({
      name: teamName.trim(),
      description: `Swimming team managed by ${userProfile?.name}`,
    });

    if (result.success) {
      setTeamName('');
      setShowCreateTeamModal(false);
      Alert.alert('Success', `Team "${teamName}" created successfully!`);
    } else {
      Alert.alert('Error', result.error || 'Failed to create team');
    }
  };

  const handleJoinTeam = async () => {
    if (!teamCode.trim()) {
      Alert.alert('Error', 'Please enter a team code');
      return;
    }

    const result = await joinTeamByCode(teamCode.trim().toUpperCase());

    if (result.success) {
      setTeamCode('');
      setShowJoinTeamModal(false);
      Alert.alert('Success', `Successfully joined team: ${result.data?.name}`);
    } else {
      Alert.alert('Error', result.error || 'Failed to join team');
    }
  };

  // Get current team data based on user role
  const currentTeam = userProfile?.role === 'coach' ? teams[0] : swimmerTeams[0]?.teams;
  const teamMembers = userProfile?.role === 'coach' ? teams[0]?.team_members || [] : [];
  const swimmers = teamMembers.filter(member => member.users);
  const totalMembers = teamMembers.length + 1; // +1 for coach

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Team Management</Text>
          <Text style={styles.subtitle}>Manage your swimming team</Text>
        </View>

        {/* Team Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color="#0066CC" />
            <Text style={styles.statNumber}>{swimmers.length}</Text>
            <Text style={styles.statLabel}>Swimmers</Text>
          </View>
          <View style={styles.statCard}>
            <UserPlus size={24} color="#0066CC" />
            <Text style={styles.statNumber}>{totalMembers}</Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
          <View style={styles.statCard}>
            <Edit3 size={24} color="#00B4A6" />
            <Text style={styles.statNumber}>{currentTeam?.name ? '1' : '0'}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {userProfile?.role === 'coach' ? (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setShowInviteModal(true)}
              >
                <Mail size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Share Team Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowCreateTeamModal(true)}
              >
                <Plus size={20} color="#0066CC" />
                <Text style={styles.secondaryButtonText}>Create Team</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowJoinTeamModal(true)}
            >
              <UserPlus size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Join Team</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Current Team Info */}
        {currentTeam && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team: {currentTeam.name}</Text>
            
            {/* Coach Info */}
            {userProfile?.role === 'swimmer' && swimmerTeams[0]?.teams.users && (
              <View style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{swimmerTeams[0].teams.users.name}</Text>
                  <Text style={styles.memberEmail}>{swimmerTeams[0].teams.users.email}</Text>
                  <Text style={styles.memberJoinDate}>Coach</Text>
                </View>
                <View style={styles.memberActions}>
                  <View style={styles.coachBadge}>
                    <Text style={styles.coachBadgeText}>Coach</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Team Members Section */}
        {swimmers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            {swimmers.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.users.name}</Text>
                  <Text style={styles.memberEmail}>{member.users.email}</Text>
                  <Text style={styles.memberJoinDate}>
                    Joined: {new Date(member.joined_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.memberActions}>
                  {userProfile?.role === 'coach' && (
                    <TouchableOpacity style={styles.editButton}>
                      <Edit3 size={16} color="#0066CC" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Team Code Section - Only for coaches */}
        {userProfile?.role === 'coach' && currentTeam && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Join Code</Text>
            <View style={styles.teamCodeCard}>
              <Text style={styles.teamCodeTitle}>Share this code with swimmers:</Text>
              <View style={styles.teamCodeContainer}>
                <Text style={styles.teamCode}>{currentTeam.team_code}</Text>
                <TouchableOpacity style={styles.copyButton}>
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.teamCodeDescription}>
                Swimmers can use this code to join your team
              </Text>
            </View>
          </View>
        )}

        {/* No Team Message */}
        {!currentTeam && (
          <View style={styles.section}>
            <View style={styles.noTeamCard}>
              <Users size={48} color="#9CA3AF" />
              <Text style={styles.noTeamTitle}>
                {userProfile?.role === 'coach' ? 'No Team Created' : 'No Team Joined'}
              </Text>
              <Text style={styles.noTeamDescription}>
                {userProfile?.role === 'coach' 
                  ? 'Create a team to start managing swimmers and tracking their performance.'
                  : 'Join a team using a team code provided by your coach to start tracking times.'
                }
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Share Team Code Modal */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInviteModal(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Share Team Code</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.teamCodeCard}>
              <Text style={styles.teamCodeTitle}>Team Join Code:</Text>
              <View style={styles.teamCodeContainer}>
                <Text style={styles.teamCode}>{currentTeam?.team_code}</Text>
                <TouchableOpacity style={styles.copyButton}>
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.teamCodeDescription}>
                Share this code with swimmers so they can join your team
              </Text>
            </View>

            <View style={styles.inviteInfo}>
              <Text style={styles.inviteInfoText}>
                Swimmers can enter this code in their app to join your team and start tracking their swimming times.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Join Team Modal */}
      <Modal
        visible={showJoinTeamModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowJoinTeamModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Join Team</Text>
            <TouchableOpacity onPress={handleJoinTeam}>
              <Text style={styles.modalSave}>Join</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Team Code</Text>
              <TextInput
                style={styles.textInput}
                value={teamCode}
                onChangeText={setTeamCode}
                placeholder="Enter team code (e.g., ABC123)"
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>

            <View style={styles.teamInfo}>
              <Text style={styles.teamInfoText}>
                Enter the 6-character team code provided by your coach to join their team.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Create Team Modal */}
      <Modal
        visible={showCreateTeamModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateTeamModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create New Team</Text>
            <TouchableOpacity onPress={handleCreateTeam}>
              <Text style={styles.modalSave}>Create</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Team Name</Text>
              <TextInput
                style={styles.textInput}
                value={teamName}
                onChangeText={setTeamName}
                placeholder="Enter team name"
              />
            </View>

            <View style={styles.teamInfo}>
              <Text style={styles.teamInfoText}>
                You'll be automatically assigned as the team coach and can invite swimmers to join.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0066CC',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: '600',
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
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  memberJoinDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  memberStats: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  memberActions: {
    alignItems: 'center',
  },
  coachBadge: {
    backgroundColor: '#00B4A6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  coachBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  teamCodeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  teamCodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  teamCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  teamCode: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0066CC',
    textAlign: 'center',
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: '#0066CC',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  teamCodeDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  noTeamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noTeamTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noTeamDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalSave: {
    fontSize: 16,
    color: '#0066CC',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#0066CC',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  roleButtonInactive: {
    backgroundColor: '#F3F4F6',
  },
  roleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  roleButtonTextInactive: {
    color: '#6B7280',
  },
  inviteInfo: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  inviteInfoText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
  },
  teamInfo: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  teamInfoText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
  },
});