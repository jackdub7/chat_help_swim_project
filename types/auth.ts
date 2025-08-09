export interface User {
  id: string;
  name: string;
  email: string;
  role: 'swimmer' | 'coach';
  teamId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}