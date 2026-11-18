import {NavigatorScreenParams} from '@react-navigation/native';
import {TripStatus, UserProfile} from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: {email?: string} | undefined;
  ResetPassword: {accessToken?: string; email?: string} | undefined;
};

export type MainTabParamList = {
  Discover: {category?: string} | undefined;
  Members: undefined;
  Gallery: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Trips: {tab?: 'upcoming' | 'calendar' | 'mine'} | undefined;
  TripDetails: {tripId: string};
  RegistrationConfirm: {
    tripId: string;
    status: TripStatus;
    message: string;
  };
  Notifications: undefined;
  NotificationPreferences: undefined;
  EditProfile: undefined;
  GalleryViewer: {images: string[]; index: number};
  Legal: {type: 'terms' | 'privacy'};
  ForgotPasswordModal: undefined;
  MembersDirectory: undefined;
  MemberProfile: {memberId: string};
  About: undefined;
  DisplayMode: undefined;
  ClubProtocols: undefined;
  SafetyBriefing: undefined;
  ClubBrochure: undefined;
  MarshallHub: undefined;
  CreateDrive: undefined;
  DriveParticipants: {tripId: string};
  ManageTripMedia: {tripId: string};
  ChatInbox: undefined;
  ChatThread: {conversationId: string; title?: string};
  RateMember: {tripId: string; memberId: string; memberName: string};
  MarshallUpgrades: undefined;
  MyProgress: undefined;
  MyAdventureHistory: undefined;
  MyTripPerformance: {tripId: string};
};
