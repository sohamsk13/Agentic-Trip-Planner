export interface Activity {
  time: string;
  title: string;
  description: string;
  icon: 'hotel' | 'beach' | 'food' | 'activity' | 'sunset' | 'transport';
  mood?: string;
}

export interface DayItinerary {
  day: number;
  title: string;
  activities: Activity[];
  image?: string;
}

export interface BudgetBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface Accommodation {
  name: string;
  location: string;
  price: number;
  amenities: string[];
}

export interface Trip {
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  mode: 'chill' | 'party' | 'budget' | 'explore';
  accommodation: Accommodation;
  itinerary: DayItinerary[];
  budget: {
    total: number;
    breakdown: BudgetBreakdown[];
    dailyBreakdown: { day: number; spend: number }[];
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  highlights: string[];
  tips: string[];
}

export interface MapLocation {
  name: string;
  latitude: number;
  longitude: number;
  type: 'hotel' | 'beach' | 'restaurant' | 'activity';
  description?: string;
}
