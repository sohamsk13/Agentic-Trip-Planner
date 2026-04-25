import { Trip, MapLocation } from './types';

export const tripData: Trip = {
  destination: 'Goa',
  startDate: 'May 12',
  endDate: 'May 15',
  duration: 3,
  mode: 'chill',
  accommodation: {
    name: 'Beachfront Resort',
    location: 'North Goa',
    price: 5000,
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa'],
  },
  itinerary: [
    {
      day: 1,
      title: 'Arrival & Beach Bliss',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
      activities: [
        {
          time: '1:00 PM',
          title: 'Arrive at Hotel',
          description: 'Check in and settle in',
          icon: 'hotel',
          mood: '😊',
        },
        {
          time: '2:00 PM',
          title: 'Relax at Baga Beach',
          description: 'Enjoy the sandy shores and ocean breeze',
          icon: 'beach',
          mood: '🏖️',
        },
        {
          time: '6:00 PM',
          title: 'Sunset & Dinner',
          description: 'Watch the sunset and enjoy local cuisine',
          icon: 'sunset',
          mood: '🌅',
        },
      ],
    },
    {
      day: 2,
      title: 'Adventure & Water Sports',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
      activities: [
        {
          time: '9:00 AM',
          title: 'Breakfast at Hotel',
          description: 'Energize for the day ahead',
          icon: 'food',
          mood: '🍽️',
        },
        {
          time: '10:30 AM',
          title: 'Water Sports',
          description: 'Jet skiing, parasailing, and more',
          icon: 'activity',
          mood: '🏄',
        },
        {
          time: '6:00 PM',
          title: 'Beach Market Visit',
          description: 'Shop for souvenirs and local crafts',
          icon: 'activity',
          mood: '🛍️',
        },
      ],
    },
    {
      day: 3,
      title: 'Cultural Exploration',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
      activities: [
        {
          time: '8:00 AM',
          title: 'Temple Visit',
          description: 'Explore local spiritual sites',
          icon: 'activity',
          mood: '🙏',
        },
        {
          time: '12:00 PM',
          title: 'Local Lunch',
          description: 'Traditional Goan cuisine',
          icon: 'food',
          mood: '😋',
        },
        {
          time: '4:00 PM',
          title: 'Departure',
          description: 'Checkout and head to airport',
          icon: 'transport',
          mood: '✈️',
        },
      ],
    },
  ],
  budget: {
    total: 20000,
    breakdown: [
      { category: 'Beach', amount: 8000, percentage: 40, color: '#F59E0B' },
      { category: 'Nightlife', amount: 6000, percentage: 30, color: '#DC2626' },
      { category: 'Culture', amount: 4000, percentage: 20, color: '#10B981' },
      { category: 'Transport', amount: 2000, percentage: 10, color: '#3B82F6' },
    ],
    dailyBreakdown: [
      { day: 1, spend: 5000 },
      { day: 2, spend: 8000 },
      { day: 3, spend: 7000 },
    ],
  },
  coordinates: {
    latitude: 15.4909,
    longitude: 73.8278,
  },
  highlights: [
    'Pristine beaches with golden sand',
    'Water sports and adventure activities',
    'Vibrant nightlife and local markets',
    'Cultural and spiritual heritage sites',
  ],
  tips: [
    'Best time to visit is November to February',
    'Try local specialties like fish curry and bebinca',
    'Respect local customs when visiting temples',
    'Wear sunscreen and stay hydrated',
  ],
};

export const mapLocations: MapLocation[] = [
  {
    name: 'Calangute Beach',
    latitude: 15.5493,
    longitude: 73.7553,
    type: 'beach',
    description: 'Popular spot for sun and fun',
  },
  {
    name: 'Fort Aguada',
    latitude: 15.4835,
    longitude: 73.7663,
    type: 'activity',
    description: 'Historical fort with sea views',
  },
  {
    name: "Tito's Lane",
    latitude: 15.5498,
    longitude: 73.7553,
    type: 'restaurant',
    description: 'Famous restaurant and club',
  },
];
