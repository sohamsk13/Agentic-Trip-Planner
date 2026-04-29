// Re-export canonical types from api.ts so all components use one source of truth
export type {
  ActivityItem,
  DayPlanItem,
  BudgetLineItem,
  BudgetSummary,
  StayOption,
  LocationItem,
  Coordinates,
  TripPlanResponse as Trip,
} from './api';

export interface MapLocation {
  name: string;
  lat: number;
  lng: number;
  type: 'hotel' | 'beach' | 'restaurant' | 'activity';
  description?: string;
}
