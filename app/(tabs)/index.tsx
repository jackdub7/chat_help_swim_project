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
import { Plus, Clock, Users as UsersIcon, TrendingUp } from 'lucide-react-native';
import { parseTimeToStandardFormat, validateTimeInput } from '@/utils/timeFormatter';
import { useAuth } from '@/hooks/useAuth';
import { useTimeEntries } from '@/hooks/useTimeEntries';

export default function TimesScreen() {
  const { user, userProfile } = useAuth();
  const { timeEntries, addTimeEntry, addBulkTimeEntries, isLoading: timeEntriesLoading } = useTimeEntries(user?.id);

  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    stroke: 'Freestyle',
    distance: '',
    time: '',
    testSet: '',
    notes: '',
  });
  const [bulkData, setBulkData] = useState('');

  const strokes = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM'];
  const distances = [25, 50, 100, 200, 400, 800, 1500];

  const handleAddTime = async () => {
    if (!newEntry.distance || !newEntry.time || !newEntry.testSet) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate and format time input
    if (!validateTimeInput(newEntry.time)) {
      Alert.alert('Error', 'Please enter a valid time (e.g., 1:35.6, 24.5, or 12:40.98)');
      return;
    }

    // Parse and format the time to standard format
    const formattedTime = parseTimeToStandardFormat(newEntry.time);

    const result = await addTimeEntry({
      stroke: newEntry.stroke,
      distance: parseInt(newEntry.distance),
      time: formattedTime,
      test_set: newEntry.testSet,
      notes: newEntry.notes,
    });

    if (result.success) {
      setNewEntry({ 
        stroke: 'Freestyle', 
        distance: '', 
        time: '', 
        testSet: '',
        notes: ''
      });
      setShowModal(false);
      Alert.alert('Success', `Time entry added successfully!\nFormatted time: ${formattedTime}`);
    } else {
      Alert.alert('Error', result.error || 'Failed to add time entry');
    }
  };

  const handleBulkImport = async () => {
    if (!bulkData.trim()) {
      Alert.alert('Error', 'Please enter data to import');
      return;
    }

    try {
      const lines = bulkData.trim().split('\n');
      const newEntries: Array<{
        swimmer_name: string;
        stroke: string;
        distance: number;
        time: string;
        test_set: string;
        notes?: string;
      }> = [];

      lines.forEach((line, index) => {
        const parts = line.split(',').map(part => part.trim().replace(/"/g, ''));
        
        if (parts.length >= 5) {
          const [swimmer_name, stroke, distance, time, test_set, notes = ''] = parts;
          
          // Basic validation
          if (swimmer_name && stroke && distance && time && test_set && validateTimeInput(time)) {
            const formattedTime = parseTimeToStandardFormat(time);
            
            newEntries.push({
              swimmer_name,
              stroke,
              distance: parseInt(distance),
              time: formattedTime,
              test_set,
              notes,
            });
          }
        }
      });

      if (newEntries.length > 0) {
        const result = await addBulkTimeEntries(newEntries);
        
        if (result.success) {
          setBulkData('');
          setShowBulkModal(false);
          Alert.alert('Success', `${result.count} time entries imported successfully!`);
        } else {
          Alert.alert('Error', result.error || 'Failed to import time entries');
        }
      } else {
        Alert.alert('Error', 'No valid entries found. Please check the format.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import data. Please check the format.');
    }
  };

  const recentTimes = timeEntries.slice(0, 5);
  const totalSwimmers = new Set(timeEntries.map(entry => entry.users.name)).size;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Swimming Times</Text>
          <Text style={styles.subtitle}>Track your performance</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Clock size={24} color="#0066CC" />
            <Text style={styles.statNumber}>{timeEntries.length}</Text>
            <Text style={styles.statLabel}>Total Times</Text>
          </View>
          <View style={styles.statCard}>
            <UsersIcon size={24} color="#0066CC" />
            <Text style={styles.statNumber}>{totalSwimmers}</Text>
            <Text style={styles.statLabel}>Swimmers</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#00B4A6" />
            <Text style={styles.statNumber}>+5%</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowModal(true)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Add Time</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowBulkModal(true)}
          >
            <Text style={styles.secondaryButtonText}>Bulk Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Times</Text>
          {recentTimes.map((entry) => (
            <View key={entry.id} style={styles.timeCard}>
              <View style={styles.timeHeader}>
                <Text style={styles.swimmerName}>{entry.users.name}</Text>
                <Text style={styles.timeValue}>{entry.time}</Text>
              </View>
              <View style={styles.timeDetails}>
                <Text style={styles.timeDetail}>
                  {entry.distance}m {entry.stroke}
                </Text>
                <Text style={styles.timeDetail}>{entry.test_set}</Text>
              </View>
              <Text style={styles.timeDate}>
                {new Date(entry.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Time Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Time</Text>
            <TouchableOpacity onPress={handleAddTime}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Stroke</Text>
              <View style={styles.segmentedControl}>
                {strokes.map((stroke) => (
                  <TouchableOpacity
                    key={stroke}
                    style={[
                      styles.segmentButton,
                      newEntry.stroke === stroke && styles.segmentButtonActive,
                    ]}
                    onPress={() => setNewEntry({ ...newEntry, stroke })}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        newEntry.stroke === stroke && styles.segmentTextActive,
                      ]}
                    >
                      {stroke}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Distance (meters) *</Text>
              <View style={styles.distanceGrid}>
                {distances.map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.distanceButton,
                      newEntry.distance === distance.toString() && styles.distanceButtonActive,
                    ]}
                    onPress={() => setNewEntry({ ...newEntry, distance: distance.toString() })}
                  >
                    <Text
                      style={[
                        styles.distanceText,
                        newEntry.distance === distance.toString() && styles.distanceTextActive,
                      ]}
                    >
                      {distance}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time (mm:ss.ss) *</Text>
              <TextInput
                style={styles.textInput}
                value={newEntry.time}
                onChangeText={(text) => setNewEntry({ ...newEntry, time: text })}
                placeholder="1:35.6 or 24.5 or 12:40.98"
                keyboardType="numbers-and-punctuation"
              />
              <Text style={styles.inputHint}>
                Accepts flexible formats - will auto-format to mm:ss.ss
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Test Set *</Text>
              <TextInput
                style={styles.textInput}
                value={newEntry.testSet}
                onChangeText={(text) => setNewEntry({ ...newEntry, testSet: text })}
                placeholder="Time Trial, Distance Set, etc."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newEntry.notes}
                onChangeText={(text) => setNewEntry({ ...newEntry, notes: text })}
                placeholder="Additional notes about this time..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Bulk Entry Modal */}
      <Modal
        visible={showBulkModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBulkModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bulk Time Entry</Text>
            <TouchableOpacity onPress={handleBulkImport}>
              <Text style={styles.modalSave}>Import</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.bulkInstructions}>
              Enter times in CSV format or paste from spreadsheet:
            </Text>
            <Text style={styles.bulkExample}>
              Format: Swimmer Name, Stroke, Distance, Time, Test Set, Notes (optional)
            </Text>
            <Text style={styles.bulkNote}>
              Times can be in flexible formats: 1:35.6, 24.5, 12:40.98, etc.
            </Text>
            <TextInput
              style={styles.bulkTextArea}
              value={bulkData}
              onChangeText={setBulkData}
              multiline
              numberOfLines={10}
              placeholder="John Doe, Freestyle, 100, 1:02.45, Time Trial, Great technique&#10;Jane Smith, Backstroke, 200, 2:24.5, Sprint Set"
              textAlignVertical="top"
            />
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
    flex: 2,
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
    alignItems: 'center',
    justifyContent: 'center',
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
  timeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  swimmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0066CC',
  },
  timeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeDate: {
    fontSize: 12,
    color: '#9CA3AF',
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
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  distanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    minWidth: 60,
    alignItems: 'center',
  },
  distanceButtonActive: {
    backgroundColor: '#0066CC',
  },
  distanceText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  distanceTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bulkInstructions: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
  },
  bulkExample: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  bulkNote: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  bulkTextArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    height: 200,
    fontFamily: 'monospace',
  },
  textArea: {
    height: 80,
    paddingTop: 16,
  },
});