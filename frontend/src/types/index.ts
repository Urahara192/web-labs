export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  createdBy: string;
  participants: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface EventState {
  events: Event[];
  userEvents: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  isLoading: boolean;
  error: string | null;
} 