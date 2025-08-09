export interface TimeEntry {
  id: string;
  swimmerId: string;
  swimmerName: string;
  stroke: 'Freestyle' | 'Backstroke' | 'Breaststroke' | 'Butterfly' | 'IM';
  distance: number;
  time: string;
  date: string;
  testSet: string;
  coachId?: string;
  teamId?: string;
  notes?: string;
}

export interface Team {
  id: string;
  name: string;
  coachId: string;
  joinCode: string;
  createdAt: string;
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'swimmer' | 'coach';
  joinDate: string;
  totalTimes: number;
  bestTime?: string;
}

export interface PerformanceData {
  swimmer: string;
  times: TimeEntry[];
  personalBests: { [key: string]: TimeEntry };
  improvements: { [key: string]: number };
}