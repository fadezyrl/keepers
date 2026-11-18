export type Difficulty = 'Easy' | 'Moderate' | 'Advanced' | 'Expert';

export type TripStatus =
  | 'upcoming'
  | 'completed'
  | 'cancelled'
  | 'full'
  | 'registered'
  | 'pending'
  | 'waitlist';

/** API list filter values accepted by GET /trips */
export type TripFilter = 'all' | 'joined';

/** Trips tab UI sections */
export type TripsTab = 'upcoming' | 'calendar' | 'mine';

export type DisplayMode = 'light' | 'dark';

export type MembershipLevel = 'Junior' | 'Intermediate' | 'Advanced';

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  tripId?: string;
}

export interface ClubMemberRatingCategory {
  criterionId: string;
  code: string;
  name: string;
  average: number | null;
  sampleSize: number;
}

export interface ClubMemberProgressionHistory {
  junior: number;
  intermediate: number;
  advanced: number;
  preMarshall: number;
  marshall: number;
}

export interface ClubMember {
  id: string;
  name: string;
  username: string;
  avatar: string;
  membership: MembershipLevel;
  membershipCode?: string;
  gender?: string;
  vehicle: string;
  vehicleYear?: string;
  vehicleVin?: string;
  vehicleImage?: string;
  joinedAt: string;
  nationality?: string;
  bio?: string;
  social?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  roles?: Array<{code: string; name: string} | string>;
  ratings?: {
    ratingsReceived: number;
    overallAverage: number | null;
    categoryAverages: ClubMemberRatingCategory[];
  };
  attendance?: {
    total: number;
    completedTrips: number;
  };
  progressionHistory?: ClubMemberProgressionHistory;
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
  /** Canonical drive category (Desert / Camping / Mountain / Trips & Events). */
  category: string;
  tripType: string;
  requiredMembership: MembershipLevel;
  minTripsRequired: number;
  coverImage: string;
  gallery: string[];
  /** Promo / highlight videos for the trip (remote URLs). */
  videos?: string[];
  /** Full media rows with ids (organizer manage UI). */
  mediaItems?: TripMediaItem[];
  maxParticipants: number;
  registeredCount: number;
  pendingCount?: number;
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
  createdBy?: string;
  participants: Participant[];
  status: TripStatus;
  /** Backend trip lifecycle: draft | published | cancelled | completed */
  publishStatus?: string;
  myRegistration?: {
    id?: string;
    status?: string;
    registeredAt?: string;
  } | null;
  routeSummary: string;
  /** organizer = Marshall-owned drive; assigned = Pre-Marshall view-only */
  accessMode?: 'organizer' | 'assigned';
}

export interface TripMediaItem {
  id: string;
  mediaType: 'image' | 'video';
  url: string;
  caption?: string | null;
}

export interface ReadinessChecklistItem {
  id: string;
  code: string;
  label: string;
  selected: boolean;
  submittedAt?: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  vehicle?: string;
  registrationId?: string;
  registrationStatus?: string;
  registeredAt?: string;
  /** Present for Marshall (own drives) / Admin viewers */
  readinessChecklist?: ReadinessChecklistItem[];
}

export interface VehicleReadinessRequirement {
  id: string;
  code: string;
  label: string;
  displayOrder: number;
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
  | 'admin'
  | 'upgrade'
  | 'announcement';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, unknown>;
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
    registrations?: boolean;
    ratings?: boolean;
  };
  privacy: {
    showVehicle: boolean;
    showSocial: boolean;
  };
  roles?: string[];
  permissions?: string[];
  status?: string;
}

export type MembershipLevelInfo = {
  id: string;
  code: string;
  name: string;
  rank: number;
  description?: string | null;
  minCompletedTrips?: number;
  minAverageRating?: number | null;
};

export type ProgressRequirement = {
  code: string;
  label: string;
  current: number | null;
  required: number | null;
  met: boolean;
};

export type MemberProgress = {
  member: {id: string; firstName: string; lastName: string; name: string};
  membership: MembershipLevelInfo | null;
  stats: {
    completedTrips: number;
    attendedDrives: number;
    ratingsReceived: number;
    overallAverage: number | null;
  };
  performance: {
    overallAverage: number | null;
    ratingsReceived: number;
    categoryAverages: Array<{
      criterionId: string;
      code: string;
      name: string;
      average: number | null;
      sampleSize: number;
    }>;
    ratingTrend: Array<{
      tripId: string;
      title: string;
      date: string;
      overall: number | null;
      ratedAt: string;
    }>;
    criteria: Array<{
      id: string;
      code: string;
      name: string;
      description?: string | null;
      minScore: number;
      maxScore: number;
      displayOrder: number;
    }>;
  };
  progression: {
    currentLevel: MembershipLevelInfo | null;
    nextLevel: MembershipLevelInfo | null;
    completedTrips: number;
    remainingDrives: number | null;
    progressRatio: number | null;
    eligibleForRecommendation: boolean;
    upgradeStatus: string;
    activeRecommendation: {
      id: string;
      status: string;
      toLevel: string;
      toCode: string;
      fromLevel?: string | null;
      recommendedBy: string;
      notes?: string | null;
      createdAt: string;
    } | null;
    latestDecision: {
      id: string;
      status: string;
      toLevel: string;
      toCode: string;
      fromLevel?: string | null;
      recommendedBy: string;
      recommendationNotes?: string | null;
      decisionNotes?: string | null;
      createdAt: string;
      reviewedAt?: string | null;
    } | null;
    requirements: ProgressRequirement[];
    upgradeHistory: Array<{
      id: string;
      status: string;
      fromLevel?: string | null;
      toLevel: string;
      recommendedBy: string;
      recommendationNotes?: string | null;
      decisionNotes?: string | null;
      createdAt: string;
      reviewedAt?: string | null;
    }>;
    membershipHistory: Array<{
      id: string;
      fromLevel?: string | null;
      toLevel: string;
      reason?: string | null;
      createdAt: string;
    }>;
  };
  levels: MembershipLevelInfo[];
};

export type MemberHistoryFilter =
  | 'all'
  | 'attended'
  | 'completed'
  | 'absent'
  | 'cancelled'
  | 'upcoming';

export type MemberTripHistoryItem = {
  tripId: string;
  title: string;
  destination: string;
  date: string;
  time?: string | null;
  status: string;
  coverImage?: string | null;
  organizerName?: string | null;
  registrationStatus?: string | null;
  attendanceStatus: string;
  attended?: boolean | null;
  membershipAtTime?: string | null;
  rating: {
    id: string;
    overall: number | null;
    ratedAt: string;
    marshallName?: string | null;
  } | null;
};

export type MemberTripHistoryPage = {
  items: MemberTripHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

export type MemberTripPerformance = {
  trip: {
    id: string;
    title: string;
    description?: string | null;
    destination: string;
    meetingPoint?: string | null;
    date: string;
    time?: string | null;
    status: string;
    coverImage?: string | null;
    difficulty?: string | null;
    organizerName?: string | null;
  };
  attendance: {
    status: string;
    attended?: boolean | null;
    markedAt?: string | null;
    notes?: string | null;
    registrationStatus?: string | null;
  };
  rating: {
    id: string;
    overall: number | null;
    feedback?: string | null;
    ratedAt: string;
    updatedAt?: string | null;
    marshallName: string;
    scores: Array<{
      criterionId: string;
      code: string;
      name: string;
      score: number;
      minScore: number;
      maxScore: number;
    }>;
  } | null;
};
