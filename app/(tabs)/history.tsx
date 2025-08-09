import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Download, Calendar, TrendingUp } from 'lucide-react-native';

interface HistoryEntry {
  id: string;
  swimmer: string;
  stroke: string;
  distance: number;
  time: string;
  date: string;
  testSet: string;
  improvement?: string;
}

export default function HistoryScreen() {
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStroke, setSelectedStroke] = useState('All');
  const [selectedDistance, setSelectedDistance] = useState('All');

  const historyData: HistoryEntry[] = [
    {
      id: '1',
      swimmer: 'John Doe',
      stroke: 'Freestyle',
      distance: 100,
      time: '1:02.45',
      date: '2025-01-16',
      testSet: 'Time Trial',
      improvement: '-0.32',
    },
    {
      id: '2',
      swimmer: 'Jane Smith',
      stroke: 'Backstroke',
      distance: 200,
      time: '2:25.12',
      date: '2025-01-16',
      testSet: 'Distance Set',
      improvement: '+1.15',
    },
    {
      id: '3',
      swimmer: 'John Doe',
      stroke: 'Freestyle',
      distance: 50,
      time: '28.67',
      date: '2025-01-15',
      testSet: 'Sprint Set',
      improvement: '-0.18',
    },
    {
      id: '4',
      swimmer: 'Mike Johnson',
      stroke: 'Butterfly',
      distance: 100,
      time: '1:15.89',
      date: '2025-01-15',
      testSet: 'Time Trial',
    },
    {
      id: '5',
      swimmer: 'Sarah Wilson',
      stroke: 'Breaststroke',
      distance: 200,
      time: '2:45.23',
      date: '2025-01-14',
      testSet: 'Distance Set',
      improvement: '-2.34',
    },
  ];

  const strokes = ['All', 'Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM'];
  const distances = ['All', '25', '50', '100', 'All'];

  const filteredData = historyData.filter(entry => {
    const matchesSearch = entry.swimmer.toLowerCase().includes(searchText.toLowerCase()) ||
                         entry.stroke.toLowerCase().includes(searchText.toLowerCase()) ||
                         entry.testSet.toLowerCase().includes(searchText.toLowerCase());
    const matchesStroke = selectedStroke === 'All' || entry.stroke === selectedStroke;
    const matchesDistance = selectedDistance === 'All' || entry.distance.toString() === selectedDistance;
    
    return matchesSearch && matchesStroke && matchesDistance;
  });

  const groupedData = filteredData.reduce((groups: { [key: string]: HistoryEntry[] }, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

  const exportData = () => {
    // In a real app, this would export to CSV or generate a PDF
    console.log('Exporting data...', filteredData);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Time History</Text>
        <Text style={styles.subtitle}>Track progress over time</Text>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search swimmers, strokes, or sets..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color="#0066CC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton} onPress={exportData}>
          <Download size={20} color="#0066CC" />
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {(selectedStroke !== 'All' || selectedDistance !== 'All') && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersText}>Filters: </Text>
          {selectedStroke !== 'All' && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{selectedStroke}</Text>
            </View>
          )}
          {selectedDistance !== 'All' && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{selectedDistance}m</Text>
            </View>
          )}
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedData).map(([date, entries]) => (
          <View key={date} style={styles.dateGroup}>
            <View style={styles.dateHeader}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.dateText}>{date}</Text>
            </View>
            {entries.map((entry) => (
              <View key={entry.id} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.swimmerName}>{entry.swimmer}</Text>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeValue}>{entry.time}</Text>
                    {entry.improvement && (
                      <View
                        style={[
                          styles.improvementBadge,
                          entry.improvement.startsWith('-')
                            ? styles.improvementPositive
                            : styles.improvementNegative,
                        ]}
                      >
                        <TrendingUp
                          size={12}
                          color={entry.improvement.startsWith('-') ? '#059669' : '#DC2626'}
                        />
                        <Text
                          style={[
                            styles.improvementText,
                            entry.improvement.startsWith('-')
                              ? styles.improvementTextPositive
                              : styles.improvementTextNegative,
                          ]}
                        >
                          {entry.improvement}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <Text style={styles.eventDetail}>
                    {entry.distance}m {entry.stroke}
                  </Text>
                  <Text style={styles.setDetail}>{entry.testSet}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter Results</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalSave}>Apply</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Stroke</Text>
              <View style={styles.filterOptions}>
                {strokes.map((stroke) => (
                  <TouchableOpacity
                    key={stroke}
                    style={[
                      styles.filterOption,
                      selectedStroke === stroke && styles.filterOptionActive,
                    ]}
                    onPress={() => setSelectedStroke(stroke)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedStroke === stroke && styles.filterOptionTextActive,
                      ]}
                    >
                      {stroke}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Distance</Text>
              <View style={styles.filterOptions}>
                {['All', '25', '50', '100', '200', '400'].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.filterOption,
                      selectedDistance === distance && styles.filterOptionActive,
                    ]}
                    onPress={() => setSelectedDistance(distance)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedDistance === distance && styles.filterOptionTextActive,
                      ]}
                    >
                      {distance === 'All' ? 'All' : `${distance}m`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSelectedStroke('All');
                setSelectedDistance('All');
              }}
            >
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  filterChip: {
    backgroundColor: '#0066CC',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  filterChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
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
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066CC',
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  improvementPositive: {
    backgroundColor: '#DCFCE7',
  },
  improvementNegative: {
    backgroundColor: '#FEE2E2',
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '600',
  },
  improvementTextPositive: {
    color: '#059669',
  },
  improvementTextNegative: {
    color: '#DC2626',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventDetail: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  setDetail: {
    fontSize: 14,
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
  filterGroup: {
    marginBottom: 32,
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  filterOptionActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  clearFiltersButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  clearFiltersText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});