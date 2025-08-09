import { TimeEntry } from '@/types/swimming';

export const exportToCSV = (timeEntries: TimeEntry[]): string => {
  const headers = [
    'Date',
    'Swimmer',
    'Stroke',
    'Distance (m)',
    'Time',
    'Test Set',
    'Notes'
  ];

  const csvContent = [
    headers.join(','),
    ...timeEntries.map(entry => [
      entry.date,
      `"${entry.swimmerName}"`,
      entry.stroke,
      entry.distance,
      entry.time,
      `"${entry.testSet}"`,
      `"${entry.notes || ''}"`
    ].join(','))
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string) => {
  // In a real app, this would trigger a file download
  // For web, you'd create a blob and download link
  // For mobile, you'd use the file system API
  console.log('Downloading CSV:', filename);
  console.log(csvContent);
};

export const generatePerformanceReport = (timeEntries: TimeEntry[], swimmerName?: string): string => {
  const filteredEntries = swimmerName 
    ? timeEntries.filter(entry => entry.swimmerName === swimmerName)
    : timeEntries;

  const totalTimes = filteredEntries.length;
  const strokes = [...new Set(filteredEntries.map(entry => entry.stroke))];
  const distances = [...new Set(filteredEntries.map(entry => entry.distance))];
  
  let report = `Swimming Performance Report\n`;
  report += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  
  if (swimmerName) {
    report += `Swimmer: ${swimmerName}\n`;
  }
  
  report += `Total Times Recorded: ${totalTimes}\n`;
  report += `Strokes: ${strokes.join(', ')}\n`;
  report += `Distances: ${distances.join('m, ')}m\n\n`;

  // Add detailed times
  report += `Detailed Times:\n`;
  filteredEntries.forEach(entry => {
    report += `${entry.date} - ${entry.swimmerName} - ${entry.distance}m ${entry.stroke} - ${entry.time} (${entry.testSet})\n`;
  });

  return report;
};