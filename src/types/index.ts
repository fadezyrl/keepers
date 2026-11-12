export type Difficulty = 'Easy' | 'Moderate' | 'Advanced' | 'Expert';

export type TripStatus =
  | 'upcoming'
  | 'completed'
  | 'full'
  | 'registered'
  | 'pending'
  | 'waitlist';

export type TripFilter = 'all' | 'joined';

export type DisplayMode = 'light' | 'dark';

export type MembershipLevel = 'Junior' | 'Intermediate' | 'Advanced';

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  tripId?: string;
}

export interface ClubMember {
  id: string;
  name: string;
  username: string;
  avatar: string;
  membership: MembershipLevel;
  vehicle: string;
  vehicleImage?: string;
  joinedAt: string;
  nationality?: string;
  bio?: string;
  social?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  destination: string;
  meetingPoint: string;
  date: string;
  time: string;
  difficulty: Difficulty;
  tripType: string;
  requiredMembership: MembershipLevel;
  minTripsRequired: number;
  coverImage: string;
  gallery: string[];
  maxParticipants: number;
  registeredCount: number;
  vehicleRequirements: string;
  instructions: string;
  location: {
    label: string;
    latitude: number;
    longitude: number;
  };
  organizer: {
    name: string;
    role: string;
    avatar: string;
    phone: string;
  };
  organizerId?: string;
  participants: Participant[];
  status: TripStatus;
  routeSummary: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  vehicle?: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  description: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
}

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  bio: string;
  photo: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  url?: string;
}

export interface GalleryItem {
  id: string;
  image: string;
  caption: string;
}

export type NotificationType =
  | 'trip'
  | 'registration'
  | 'reminder'
  | 'event'
  | 'club'
  | 'admin';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  nationality: string;
  gender: string;
  emergencyContact: string;
  avatar: string;
  membership: MembershipLevel;
  completedTrips: number;
  vehicle: {
    manufacturer: string;
    model: string;
    year: string;
    vin: string;
    image: string;
  };
  social: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  notificationPrefs: {
    trips: boolean;
    events: boolean;
    club: boolean;
  };
  privacy: {
    showVehicle: boolean;
    showSocial: boolean;
  };
  roles?: string[];
  permissions?: string[];
  status?: string;
}
