import {
  Announcement,
  AppNotification,
  ClubMember,
  EventItem,
  GalleryItem,
  HeroSlide,
  Sponsor,
  TeamMember,
  Trip,
  UserProfile,
} from '../types';
import {images} from './images';

export const currentUser: UserProfile = {
  id: 'u1',
  firstName: 'Jovany',
  lastName: 'Ortiz',
  username: 'jovany.ortiz',
  email: 'jovany@keepers.ae',
  phone: '+971 50 123 4567',
  nationality: 'United Arab Emirates',
  gender: 'Male',
  emergencyContact: '+971 55 987 6543',
  avatar: images.avatars.user,
  membership: 'Advanced',
  completedTrips: 3,
  vehicle: {
    manufacturer: 'Jeep',
    model: 'Wrangler Rubicon',
    year: '2024',
    vin: '1C4HJXDG5EW123456',
    image: images.vehicle,
  },
  social: {
    instagram: '@jovany.ortiz',
    facebook: 'Jovany Ortiz',
    tiktok: '@jovany4x4',
  },
  notificationPrefs: {
    trips: true,
    events: true,
    club: true,
  },
  privacy: {
    showVehicle: true,
    showSocial: true,
  },
};

export const trips: Trip[] = [
  {
    id: 't1',
    title: 'Liwa Dawn Expedition',
    description:
      'Traverse the towering red dunes of Liwa Oasis at first light. A cinematic desert run reserved for capable 4x4s and experienced keepers.',
    destination: 'Liwa Oasis, Abu Dhabi',
    meetingPoint: 'Al Ain Road Rest Area · Gate 3',
    date: '2026-11-22',
    time: '05:30',
    difficulty: 'Advanced',
    tripType: 'Desert Expedition',
    requiredMembership: 'Advanced',
    minTripsRequired: 2,
    coverImage: images.trips.liwa,
    gallery: [images.trips.liwa, images.trips.emptyQuarter, images.trips.nightDrive],
    maxParticipants: 18,
    registeredCount: 12,
    vehicleRequirements: 'Low-range 4x4 · All-terrains · Recovery points · Full tank',
    instructions:
      'Arrive 20 minutes early. Convoy radios on channel 7. Carry 10L water per person and desert recovery kit.',
    location: {
      label: 'Liwa Oasis, Abu Dhabi',
      latitude: 23.1332,
      longitude: 53.7809,
    },
    organizer: {
      name: 'Omar Al Mansoori',
      role: 'Lead Expedition Guide',
      avatar: images.team.guide,
      phone: '+971501112233',
    },
    participants: [
      {id: 'p1', name: 'Sara N.', avatar: images.avatars.d, vehicle: 'Toyota LC300'},
      {id: 'p2', name: 'Hassan R.', avatar: images.avatars.a, vehicle: 'Nissan Patrol'},
      {id: 'p3', name: 'Maya K.', avatar: images.avatars.b, vehicle: 'Jeep Gladiator'},
    ],
    status: 'upcoming',
    routeSummary: 'Liwa South Ridge → Moreeb Dune → Oasis Camp',
  },
  {
    id: 't2',
    title: 'Hatta Mountain Traverse',
    description:
      'Technical mountain trails, wadi crossings and elevated viewpoints across the Hatta highlands.',
    destination: 'Hatta, Dubai',
    meetingPoint: 'Hatta Dam Parking',
    date: '2026-12-05',
    time: '07:00',
    difficulty: 'Moderate',
    tripType: 'Mountain Traverse',
    requiredMembership: 'Intermediate',
    minTripsRequired: 1,
    coverImage: images.trips.hatta,
    gallery: [images.trips.hatta, images.trips.jebel],
    maxParticipants: 20,
    registeredCount: 20,
    vehicleRequirements: 'High clearance 4x4 · A/T tires recommended',
    instructions: 'Helmets optional for open vehicles. Convoy leader briefing at 06:45.',
    location: {
      label: 'Hatta Dam Parking, Dubai',
      latitude: 24.7965,
      longitude: 56.1143,
    },
    organizer: {
      name: 'Layla Hassan',
      role: 'Operations Lead',
      avatar: images.team.ops,
      phone: '+971502223344',
    },
    participants: [
      {id: 'p4', name: 'Omar F.', avatar: images.avatars.c, vehicle: 'Ford Bronco'},
    ],
    status: 'full',
    routeSummary: 'Dam Trail → Wadi Qahfi → Ridge Overlook',
  },
  {
    id: 't3',
    title: 'Fossil Rock Night Drive',
    description:
      'Under a clear desert sky, navigate Fossil Rock formations with guided night protocols.',
    destination: 'Fossil Rock, Sharjah',
    meetingPoint: 'Mleiha Visitor Center',
    date: '2026-11-29',
    time: '18:30',
    difficulty: 'Easy',
    tripType: 'Night Drive',
    requiredMembership: 'Junior',
    minTripsRequired: 0,
    coverImage: images.trips.fossil,
    gallery: [images.trips.fossil, images.trips.nightDrive],
    maxParticipants: 24,
    registeredCount: 8,
    vehicleRequirements: 'Any 4x4 · Working lights · Full spare',
    instructions: 'Night driving lights mandatory. No music during convoy segments.',
    location: {
      label: 'Mleiha Visitor Center, Sharjah',
      latitude: 25.1236,
      longitude: 55.7914,
    },
    organizer: {
      name: 'Omar Al Mansoori',
      role: 'Lead Expedition Guide',
      avatar: images.team.guide,
      phone: '+971501112233',
    },
    participants: [],
    status: 'registered',
    routeSummary: 'Mleiha → Fossil Ridge → Star Camp',
  },
  {
    id: 't4',
    title: 'Jebel Jais Ascent',
    description:
      'High-altitude switchbacks and panoramic summit runs for skilled mountain drivers.',
    destination: 'Jebel Jais, Ras Al Khaimah',
    meetingPoint: 'Jais Base Camp Lot',
    date: '2026-10-12',
    time: '06:00',
    difficulty: 'Expert',
    tripType: 'Mountain Traverse',
    requiredMembership: 'Advanced',
    minTripsRequired: 4,
    coverImage: images.trips.jebel,
    gallery: [images.trips.jebel],
    maxParticipants: 12,
    registeredCount: 12,
    vehicleRequirements: 'Locked differentials preferred · Mountain recovery kit',
    instructions: 'Weather dependent. Abort protocol if winds exceed 45 km/h.',
    location: {
      label: 'Jebel Jais Base Camp, Ras Al Khaimah',
      latitude: 25.9535,
      longitude: 56.1526,
    },
    organizer: {
      name: 'Khalid Rahman',
      role: 'Club Director',
      avatar: images.team.lead,
      phone: '+971503334455',
    },
    participants: [],
    status: 'completed',
    routeSummary: 'Base → Mid Ridge → Summit Point',
  },
  {
    id: 't5',
    title: 'Empty Quarter Crossing',
    description:
      'A multi-stage Rub’ al Khali dune crossing for elite keepers seeking the ultimate desert challenge.',
    destination: 'Empty Quarter Border Zone',
    meetingPoint: 'Seih Al Salam Muster',
    date: '2027-01-18',
    time: '04:45',
    difficulty: 'Expert',
    tripType: 'Crossing',
    requiredMembership: 'Advanced',
    minTripsRequired: 8,
    coverImage: images.trips.emptyQuarter,
    gallery: [images.trips.emptyQuarter, images.trips.liwa],
    maxParticipants: 10,
    registeredCount: 4,
    vehicleRequirements: 'Desert-prepped 4x4 · Dual spare · Satellite comms',
    instructions: 'Mandatory pre-trip briefing one week prior. Medical waiver required.',
    location: {
      label: 'Seih Al Salam Muster, Empty Quarter',
      latitude: 22.9747,
      longitude: 52.9481,
    },
    organizer: {
      name: 'Khalid Rahman',
      role: 'Club Director',
      avatar: images.team.lead,
      phone: '+971503334455',
    },
    participants: [],
    status: 'upcoming',
    routeSummary: 'Seih Al Salam → Deep Dunes → Border Camp',
  },
];

export const events: EventItem[] = [
  {
    id: 'e1',
    title: 'Members Night Drive Briefing',
    date: '2026-11-18 · 20:00',
    location: 'Keepers HQ, Dubai',
    image: images.events.meetup,
    description: 'Protocol refresher and convoy briefing for the Fossil Rock night run.',
  },
  {
    id: 'e2',
    title: 'Recovery Workshop',
    date: '2026-11-25 · 10:00',
    location: 'Al Qudra Training Grounds',
    image: images.events.workshop,
    description: 'Hands-on winch, kinetic rope and sand ladder masterclass.',
  },
  {
    id: 'e3',
    title: 'Annual Keepers Gala',
    date: '2026-12-20 · 19:00',
    location: 'Desert Resort Pavilion',
    image: images.events.gala,
    description: 'Exclusive evening celebrating a year of expeditions and partnerships.',
  },
];

export const announcements: Announcement[] = [
  {
    id: 'a1',
    title: 'Winter Expedition Calendar Released',
    body: 'Five signature desert and mountain adventures are now open for registration.',
    date: '2 days ago',
  },
  {
    id: 'a2',
    title: 'New Recovery Kit Standard',
    body: 'All registered vehicles must carry the updated Keepers recovery checklist from December.',
    date: '5 days ago',
  },
  {
    id: 'a3',
    title: 'Welcome 24 New Keepers',
    body: 'Our community continues to grow — introduce yourself in the members lounge.',
    date: '1 week ago',
  },
];

export const team: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Khalid Rahman',
    designation: 'Club Director',
    bio: 'Architect of Keepers culture. Two decades across Arabian deserts and mountain ranges.',
    photo: images.team.lead,
  },
  {
    id: 'tm2',
    name: 'Layla Hassan',
    designation: 'Operations Lead',
    bio: 'Precision logistics, safety systems and expedition orchestration.',
    photo: images.team.ops,
  },
  {
    id: 'tm3',
    name: 'Omar Al Mansoori',
    designation: 'Lead Expedition Guide',
    bio: 'Specialist in dune navigation, night convoy and high-risk recovery.',
    photo: images.team.guide,
  },
  {
    id: 'tm4',
    name: 'Nora Ellis',
    designation: 'Creative & Media',
    bio: 'Captures the cinematic soul of every Keepers journey.',
    photo: images.team.media,
  },
];

export const sponsors: Sponsor[] = [
  {
    id: 's1',
    name: 'Jeep',
    logo: 'jeep',
    url: 'https://www.jeep.com',
  },
  {
    id: 's2',
    name: 'Toyota',
    logo: 'toyota',
    url: 'https://www.toyota.com',
  },
  {
    id: 's3',
    name: 'Ford',
    logo: 'ford',
    url: 'https://www.ford.com',
  },
  {
    id: 's4',
    name: 'Nissan',
    logo: 'nissan',
    url: 'https://www.nissanusa.com',
  },
  {
    id: 's5',
    name: 'Hyundai',
    logo: 'hyundai',
    url: 'https://www.hyundai.com',
  },
  {
    id: 's6',
    name: 'Kia',
    logo: 'kia',
    url: 'https://www.kia.com',
  },
];

export const gallery: GalleryItem[] = images.gallery.map((image, index) => ({
  id: `g${index + 1}`,
  image,
  caption: [
    'Golden convoy · mountains',
    'Dune slide · Rubicon',
    'Wadi crossing',
    'Desert crest',
    'Night trail lights',
    'Coastal convoy',
    'Shoreline trail',
    'Camels on trail',
    'Keepers mark',
  ][index] ?? `Frame ${index + 1}`,
}));

export const notificationsSeed: AppNotification[] = [
  {
    id: 'n1',
    type: 'registration',
    title: 'Registration Confirmed',
    body: 'You are confirmed for Fossil Rock Night Drive.',
    timestamp: 'Just now',
    read: false,
  },
  {
    id: 'n2',
    type: 'trip',
    title: 'New Adventure Announced',
    body: 'Empty Quarter Crossing opens for elite keepers.',
    timestamp: '1h ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'reminder',
    title: 'Trip Reminder',
    body: 'Liwa Dawn Expedition starts in 11 days. Prep checklist ready.',
    timestamp: 'Yesterday',
    read: false,
  },
  {
    id: 'n4',
    type: 'event',
    title: 'Event Update',
    body: 'Recovery Workshop seats are filling fast.',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'club',
    title: 'Club Update',
    body: 'Winter Expedition Calendar is live on Home.',
    timestamp: '3 days ago',
    read: true,
  },
  {
    id: 'n6',
    type: 'admin',
    title: 'Admin Announcement',
    body: 'Membership renewals for 2027 begin next month.',
    timestamp: '1 week ago',
    read: true,
  },
];

export const clubStory = {
  about:
    'Keepers Adventures 4x4 is an exclusive off-road collective built for those who treat the desert as cathedral and the machine as instrument. We craft expeditions that are precise, cinematic and unforgettable.',
  mission:
    'To unite exceptional drivers through meticulously designed adventures that elevate skill, camaraderie and respect for the terrain.',
  vision:
    'Become the defining private 4x4 adventure society of the region — where technology, craftsmanship and wilderness converge.',
  contact: {
    email: 'hello@keepersadventures.ae',
    phone: '+971 4 555 0190',
    address: 'Keepers HQ · Al Quoz Creative Zone, Dubai, UAE',
    website: 'www.keepersadventures.ae',
    social: {
      instagram: '@keepersadventure',
      facebook: 'Keepers Adventures 4x4',
      tiktok: '@keepers4x4',
      youtube: 'Keepers Adventures',
    },
  },
};

export const heroSlides: HeroSlide[] = [
  {
    id: 'hs1',
    image: images.trips.liwa,
    title: 'LIWA DAWN EXPEDITION',
    subtitle: 'Towering red dunes at first light · Registration open',
    tripId: 't1',
  },
  {
    id: 'hs2',
    image: images.trips.fossil,
    title: 'FOSSIL ROCK NIGHT DRIVE',
    subtitle: 'Guided night protocols under clear desert skies',
    tripId: 't3',
  },
  {
    id: 'hs3',
    image: images.trips.emptyQuarter,
    title: 'EMPTY QUARTER CROSSING',
    subtitle: 'Elite multi-stage Rub’ al Khali challenge',
    tripId: 't5',
  },
  {
    id: 'hs4',
    image: images.events.gala,
    title: 'ANNUAL KEEPERS GALA',
    subtitle: 'Celebrate a year of expeditions and partnerships',
  },
];

export const members: ClubMember[] = [
  {
    id: 'm1',
    name: 'Jovany Ortiz',
    username: 'jovany.ortiz',
    avatar: images.avatars.user,
    membership: 'Advanced',
    vehicle: 'Jeep Wrangler Rubicon 2024',
    vehicleImage: images.vehicle,
    joinedAt: 'Jan 2024',
    nationality: 'United Arab Emirates',
    bio: 'Founding keeper focused on dune navigation and convoy discipline.',
    social: {
      instagram: '@jovany.ortiz',
      facebook: 'Jovany Ortiz',
      tiktok: '@jovany4x4',
    },
  },
  {
    id: 'm2',
    name: 'Sara Nasser',
    username: 'sara.n',
    avatar: images.avatars.d,
    membership: 'Intermediate',
    vehicle: 'Toyota Land Cruiser 300',
    vehicleImage: images.trips.hatta,
    joinedAt: 'Mar 2024',
    nationality: 'United Arab Emirates',
    bio: 'Mountain trails and weekend convoy regular.',
    social: {instagram: '@sara.nasser'},
  },
  {
    id: 'm3',
    name: 'Hassan Rahman',
    username: 'hassan.r',
    avatar: images.avatars.a,
    membership: 'Advanced',
    vehicle: 'Nissan Patrol Nismo',
    vehicleImage: images.trips.liwa,
    joinedAt: 'Feb 2024',
    nationality: 'United Arab Emirates',
    bio: 'Recovery specialist and night-drive enthusiast.',
    social: {instagram: '@hassan.r', tiktok: '@hassan4x4'},
  },
  {
    id: 'm4',
    name: 'Maya Khalid',
    username: 'maya.k',
    avatar: images.avatars.b,
    membership: 'Junior',
    vehicle: 'Jeep Gladiator Mojave',
    vehicleImage: images.trips.fossil,
    joinedAt: 'Jun 2024',
    nationality: 'United Kingdom',
    bio: 'New member building confidence on graded desert routes.',
    social: {instagram: '@maya.k'},
  },
  {
    id: 'm5',
    name: 'Omar Faris',
    username: 'omar.f',
    avatar: images.avatars.c,
    membership: 'Intermediate',
    vehicle: 'Ford Bronco Raptor',
    vehicleImage: images.trips.jebel,
    joinedAt: 'Apr 2024',
    nationality: 'Jordan',
    bio: 'Photography-led expeditions and ridge overlook runs.',
    social: {facebook: 'Omar Faris', instagram: '@omar.f'},
  },
  {
    id: 'm6',
    name: 'Nora Ellis',
    username: 'nora.ellis',
    avatar: images.team.media,
    membership: 'Junior',
    vehicle: 'Toyota Prado VX',
    vehicleImage: images.trips.nightDrive,
    joinedAt: 'Aug 2024',
    nationality: 'United States',
    bio: 'Documenting Keepers journeys and campfire evenings.',
    social: {instagram: '@nora.ellis', tiktok: '@nora.ontrail'},
  },
  {
    id: 'm7',
    name: 'Khalid Rahman',
    username: 'khalid.r',
    avatar: images.team.lead,
    membership: 'Advanced',
    vehicle: 'Land Rover Defender 110',
    vehicleImage: images.trips.emptyQuarter,
    joinedAt: 'Jan 2023',
    nationality: 'United Arab Emirates',
    bio: 'Club director and high-altitude route planner.',
    social: {instagram: '@khalid.keepers'},
  },
];

export const clubProtocols = {
  title: 'Club Protocols',
  sections: [
    {
      heading: 'Convoy Discipline',
      body: 'Maintain radio contact on the assigned channel. Never overtake the lead vehicle. Signal hazards immediately. Keep visual contact with the vehicle behind you.',
    },
    {
      heading: 'Vehicle Readiness',
      body: 'All vehicles must arrive with a full tank, inflated spare, recovery points, sand ladders or equivalent, first-aid kit and sufficient water for every occupant.',
    },
    {
      heading: 'Member Conduct',
      body: 'Respect terrain, wildlife and fellow keepers. No reckless driving, no littering, no unauthorized drone flights without guide approval.',
    },
    {
      heading: 'Cancellation',
      body: 'Cancel registrations at least 24 hours before departure unless emergency conditions apply. Repeated no-shows may affect future booking priority.',
    },
  ],
};

export const safetyBriefing = {
  title: 'Safety Briefing & Disclaimer',
  sections: [
    {
      heading: 'Inherent Risk',
      body: 'Off-road adventure involves inherent risk including vehicle damage, injury or extreme weather. Participation is voluntary and at your own risk.',
    },
    {
      heading: 'Medical Fitness',
      body: 'Members must disclose relevant medical conditions privately to guides. Carry personal medication. Emergency contacts must be current in your profile.',
    },
    {
      heading: 'Recovery & Assistance',
      body: 'Follow guide instructions during recoveries. Never stand in the path of a winch line. Use rated recovery gear only.',
    },
    {
      heading: 'Disclaimer',
      body: 'Keepers Adventures 4x4, its organizers and partners are not liable for personal injury, loss or vehicle damage arising from participation, except where prohibited by law.',
    },
  ],
};

export const clubBrochure = {
  title: 'Club Brochure',
  intro:
    'Keepers Adventures 4x4 is an exclusive members collective for precision off-road expeditions across the UAE and beyond.',
  highlights: [
    'Curated desert, mountain and night expeditions',
    'Professional guides and recovery support',
    'Members directory and private community',
    'Workshops, briefings and annual gala',
    'Partner benefits with premium gear brands',
  ],
  membership:
    'Membership is invitation-based and subject to vehicle readiness and conduct standards. Platinum, Gold and Silver tiers unlock priority registration and exclusive events.',
};

export const appInfo = {
  name: 'Keepers Adventures 4x4',
  version: '1.0.0',
  build: '2026.11.11',
  platform: 'iOS & Android',
};
