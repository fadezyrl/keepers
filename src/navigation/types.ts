import {NavigatorScreenParams} from '@react-navigation/native';
import {TripStatus, UserProfile} from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Otp: {
    email: string;
    mode: 'signup' | 'reset';
    profile?: Partial<UserProfile> & {email: string; password: string};
  };
  ResetPassword: {email: string};
};

export type MainTabParamList = {
  Home: undefined;
  Trips: undefined;
  Settings: undefined;
  About: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  TripDetails: {tripId: string};
  RegistrationConfirm: {
    tripId: string;
    status: TripStatus;
    message: string;
  };
  Notifications: undefined;
  EditProfile: undefined;
  GalleryViewer: {images: string[]; index: number};
  Legal: {type: 'terms' | 'privacy'};
  ForgotPasswordModal: undefined;
  MembersDirectory: undefined;
  MemberProfile: {memberId: string};
  DisplayMode: undefined;
  ClubProtocols: undefined;
  SafetyBriefing: undefined;
  ClubBrochure: undefined;
  MarshallHub: undefined;
  CreateDrive: undefined;
  DriveParticipants: {tripId: string};
  RateMember: {tripId: string; memberId: string; memberName: string};
  MarshallUpgrades: undefined;
};
