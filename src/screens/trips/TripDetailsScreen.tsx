import React, {useMemo, useState} from 'react';
import {
  Dimensions,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Avatar,
  Button,
  ConfirmModal,
  ErrorState,
  Icon,
  RemoteImage,
  Screen,
  StatusPill,
} from '../../components';
import {useApp} from '../../context/AppContext';
import {usePullToRefresh} from '../../hooks/usePullToRefresh';
import {RootStackParamList} from '../../navigation/types';
import {colors, spacing, typography, useThemeColors} from '../../theme';
import {MembershipLevel, Participant, Trip} from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TripDetails'>;

const HERO_HEIGHT = Math.min(Dimensions.get('window').height * 0.58, 520);

const MEMBERSHIP_RANK: Record<MembershipLevel, number> = {
  Junior: 0,
  Intermediate: 1,
  Advanced: 2,
};

function formatTripDate(date: string, time: string) {
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return `${date} · ${time}`;
  }
  return parsed.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function membershipOk(userLevel: string, required: MembershipLevel) {
  if (!(userLevel in MEMBERSHIP_RANK)) {
    return false;
  }
  return (
    MEMBERSHIP_RANK[userLevel as MembershipLevel] >= MEMBERSHIP_RANK[required]
  );
}

function evaluateEligibility(trip: Trip, membership: string, completedTrips: number) {
  if (!membershipOk(membership, trip.requiredMembership)) {
    return {
      eligible: false,
      message: `Requires ${trip.requiredMembership} membership or higher.`,
    };
  }
  if (completedTrips < trip.minTripsRequired) {
    return {
      eligible: false,
      message: `Requires ${trip.minTripsRequired} completed trips. You have ${completedTrips}.`,
    };
  }
  return {eligible: true, message: ''};
}

export function TripDetailsScreen({navigation, route}: Props) {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const {getTrip, joinTrip, cancelRegistration, user} = useApp();
  const {refreshing, onRefresh} = usePullToRefresh();
  const trip = getTrip(route.params.tripId);

  const [aboutOpen, setAboutOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const slotsLeft = useMemo(() => {
    if (!trip) {
      return 0;
    }
    return Math.max(0, trip.maxParticipants - trip.registeredCount);
  }, [trip]);

  const eligibility = useMemo(() => {
    if (!trip) {
      return {eligible: false, message: ''};
    }
    return evaluateEligibility(trip, user.membership, user.completedTrips);
  }, [trip, user.completedTrips, user.membership]);

  if (!trip) {
    return (
      <Screen scroll>
        <ErrorState
          title="Trip unavailable"
          message="This adventure could not be found."
          actionLabel="Back to Trips"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const isRegistered =
    trip.status === 'registered' ||
    trip.status === 'pending' ||
    trip.status === 'waitlist';

  const isFull = trip.registeredCount >= trip.maxParticipants;
  const hasAboutContent = Boolean(
    trip.description?.trim() || trip.instructions?.trim(),
  );

  const onShare = async () => {
    try {
      await Share.share({
        title: trip.title,
        message: `${trip.title}\n${formatTripDate(trip.date, trip.time)}\n${trip.destination}`,
      });
    } catch {
      // User dismissed share sheet
    }
  };

  const onCallOrganizer = () => {
    const phone = trip.organizer.phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${phone}`).catch(() => {
      setActionError('Unable to place a call on this device.');
    });
  };

  const onOpenMaps = () => {
    const {latitude, longitude, label} = trip.location;
    const encoded = encodeURIComponent(label);
    const url = Platform.select({
      ios: `maps:0,0?q=${encoded}&ll=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${encoded}`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });
    Linking.openURL(url!).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      );
    });
  };

  const onJoin = async () => {
    setActionError(null);
    if (!eligibility.eligible) {
      setActionError(eligibility.message);
      return;
    }
    setBusy(true);
    try {
      const result = await joinTrip(trip.id);
      if (!result.ok) {
        setActionError(result.message);
        return;
      }
      navigation.navigate('RegistrationConfirm', {
        tripId: trip.id,
        status: result.status || 'registered',
        message: result.message,
      });
    } finally {
      setBusy(false);
    }
  };

  const ctaLabel = (() => {
    if (trip.status === 'completed') {
      return 'Adventure Completed';
    }
    if (trip.status === 'waitlist') {
      return 'On Waiting List';
    }
    if (trip.status === 'registered' || trip.status === 'pending') {
      return 'Registered';
    }
    if (!eligibility.eligible) {
      return 'Not Eligible';
    }
    if (isFull) {
      return 'Join Waiting List';
    }
    return 'Join Trip';
  })();

  return (
    <Screen padded={false} edges={[]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.root, {backgroundColor: theme.bg}]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.text}
              colors={[theme.text]}
              progressBackgroundColor={theme.surface}
            />
          }>
          <View style={[styles.hero, {height: HERO_HEIGHT}]}>
            <RemoteImage uri={trip.coverImage} style={StyleSheet.absoluteFill} />
            <View style={styles.heroVeil} />
            <View style={styles.heroVeilBottom} />

            <View
              style={[
                styles.heroChrome,
                {paddingTop: insets.top + spacing.sm},
              ]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => navigation.goBack()}
                style={({pressed}) => [
                  styles.chromeBtn,
                  pressed && styles.chromePressed,
                ]}>
                <Icon name="chevron-left" color={colors.ivory} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share trip"
                onPress={onShare}
                style={({pressed}) => [
                  styles.chromeBtn,
                  pressed && styles.chromePressed,
                ]}>
                <Icon name="share" color={colors.ivory} size={20} />
              </Pressable>
            </View>

            <View style={styles.heroCopy}>
              <StatusPill status={trip.status} tone="dark" />
              <Text style={styles.heroTitle}>{trip.title}</Text>
              <Text style={styles.heroDestination}>{trip.destination}</Text>
            </View>
          </View>

          <View style={[styles.infoPanel, {backgroundColor: theme.bg}]}>
            <View
              style={[
                styles.organizerRow,
                {borderBottomColor: theme.border},
              ]}>
              <Avatar uri={trip.organizer.avatar} size={52} />
              <View style={styles.organizerCopy}>
                <Text style={[styles.organizerLabel, {color: theme.textMuted}]}>
                  Organizer
                </Text>
                <Text style={[styles.organizerName, {color: theme.text}]}>
                  {trip.organizer.name}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Call organizer"
                onPress={onCallOrganizer}
                style={({pressed}) => [
                  styles.callBtn,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.bgMuted,
                  },
                  pressed && {opacity: 0.7},
                ]}>
                <Icon name="phone" size={18} color={theme.text} />
              </Pressable>
            </View>

            <InfoRow
              icon="calendar"
              label="Date & time"
              value={formatTripDate(trip.date, trip.time)}
            />
            <InfoRow
              icon="badge"
              label="Membership level"
              value={trip.requiredMembership}
            />
            <InfoRow
              icon="star"
              label="Minimum trips"
              value={
                trip.minTripsRequired === 0
                  ? 'No minimum'
                  : `${trip.minTripsRequired} completed`
              }
            />
            <InfoRow
              icon="users"
              label="Registered members"
              value={`${trip.registeredCount}`}
              actionLabel="View"
              onAction={() => setMembersOpen(true)}
            />
            <InfoRow
              icon="users"
              label="Total capacity"
              value={`${trip.maxParticipants}`}
              detail={
                slotsLeft === 0
                  ? 'No slots remaining'
                  : `${slotsLeft} slots remaining`
              }
            />
            <InfoRow icon="car" label="Trip type" value={trip.tripType} />
            <InfoRow
              icon="map-pin"
              label="Location"
              value={trip.location.label}
              actionLabel="Maps"
              onAction={onOpenMaps}
              last
            />
          </View>

          <View style={styles.aboutBand}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{expanded: aboutOpen}}
              onPress={() => setAboutOpen(open => !open)}
              style={styles.aboutHeader}>
              <View>
                <Text style={styles.aboutEyebrow}>About the trip</Text>
                <Text style={styles.aboutTitle}>{trip.title}</Text>
              </View>
              <Icon
                name={aboutOpen ? 'chevron-up' : 'chevron-down'}
                color={colors.ivory}
                size={20}
              />
            </Pressable>

            {aboutOpen ? (
              <View style={styles.aboutBody}>
                <Text style={styles.aboutMeta}>
                  {formatTripDate(trip.date, trip.time)}
                  {'  ·  '}
                  {trip.destination}
                </Text>

                {!hasAboutContent ? (
                  <Text style={styles.aboutEmpty}>
                    No description has been provided for this adventure yet.
                  </Text>
                ) : (
                  <>
                    {trip.description?.trim() ? (
                      <Text style={styles.aboutCopy}>{trip.description}</Text>
                    ) : null}
                    {trip.instructions?.trim() ? (
                      <View style={styles.instructionsBlock}>
                        <Text style={styles.instructionsLabel}>
                          Important instructions
                        </Text>
                        <Text style={styles.aboutCopy}>{trip.instructions}</Text>
                      </View>
                    ) : null}
                  </>
                )}
              </View>
            ) : null}
          </View>

          {!eligibility.eligible && !isRegistered && trip.status !== 'completed' ? (
            <View
              style={[
                styles.eligibilityBanner,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.bgMuted,
                },
              ]}>
              <Icon name="alert" size={18} color={theme.text} />
              <View style={styles.eligibilityCopy}>
                <Text style={[styles.eligibilityTitle, {color: theme.text}]}>
                  Eligibility restricted
                </Text>
                <Text style={[styles.eligibilityMessage, {color: theme.text}]}>
                  {eligibility.message}
                </Text>
              </View>
            </View>
          ) : null}

          {actionError ? (
            <Text style={[styles.actionError, {color: theme.text}]}>
              {actionError}
            </Text>
          ) : null}

          <View style={{height: spacing.xxl}} />
        </ScrollView>

        <View
          style={[
            styles.ctaBar,
            {
              borderTopColor: theme.border,
              backgroundColor: theme.bg,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
          ]}>
          {isRegistered ? (
            <>
              <Button label={ctaLabel} onPress={() => undefined} disabled />
              <Button
                label="Cancel Registration"
                onPress={() => setCancelOpen(true)}
                variant="danger"
                style={{marginTop: spacing.sm}}
              />
            </>
          ) : (
            <Button
              label={ctaLabel}
              onPress={onJoin}
              loading={busy}
              disabled={trip.status === 'completed' || !eligibility.eligible}
            />
          )}
        </View>
      </View>

      <MembersModal
        visible={membersOpen}
        participants={trip.participants}
        registeredCount={trip.registeredCount}
        onClose={() => setMembersOpen(false)}
      />

      <ConfirmModal
        visible={cancelOpen}
        title="Cancel registration?"
        message="You will lose your reserved slot for this adventure."
        confirmLabel="Cancel Registration"
        danger
        onCancel={() => setCancelOpen(false)}
        onConfirm={async () => {
          setCancelOpen(false);
          setBusy(true);
          setActionError(null);
          try {
            const result = await cancelRegistration(trip.id);
            if (!result.ok) {
              setActionError(result.message);
            }
          } finally {
            setBusy(false);
          }
        }}
      />
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  value,
  detail,
  actionLabel,
  onAction,
  last,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  value: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
  last?: boolean;
}) {
  const theme = useThemeColors();
  return (
    <View
      style={[
        styles.infoRow,
        {borderBottomColor: theme.border},
        last && styles.infoRowLast,
      ]}>
      <View style={styles.infoIcon}>
        <Icon name={icon} size={16} color={theme.textMuted} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={[styles.infoLabel, {color: theme.textMuted}]}>{label}</Text>
        <Text style={[styles.infoValue, {color: theme.text}]}>{value}</Text>
        {detail ? (
          <Text style={[styles.infoDetail, {color: theme.textMuted}]}>
            {detail}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          style={({pressed}) => [styles.infoAction, pressed && {opacity: 0.65}]}>
          <Text style={[styles.infoActionText, {color: theme.text}]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function MembersModal({
  visible,
  participants,
  registeredCount,
  onClose,
}: {
  visible: boolean;
  participants: Participant[];
  registeredCount: number;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View
        style={[
          styles.membersSheet,
          {
            backgroundColor: theme.bg,
            paddingBottom: Math.max(insets.bottom, spacing.lg),
          },
        ]}>
        <View style={[styles.sheetHandle, {backgroundColor: theme.border}]} />
        <View style={styles.sheetHeader}>
          <View>
            <Text style={[styles.sheetEyebrow, {color: theme.textMuted}]}>
              Registered members
            </Text>
            <Text style={[styles.sheetTitle, {color: theme.text}]}>
              {registeredCount} enrolled
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10}>
            <Icon name="close" color={theme.text} />
          </Pressable>
        </View>

        {participants.length === 0 ? (
          <Text style={[styles.sheetEmpty, {color: theme.textMuted}]}>
            No member profiles listed for this adventure yet.
          </Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {participants.map((member, index) => (
              <View
                key={member.id}
                style={[
                  styles.memberRow,
                  {borderBottomColor: theme.border},
                  index === participants.length - 1 && styles.memberRowLast,
                ]}>
                <Avatar uri={member.avatar} size={44} />
                <View style={styles.memberCopy}>
                  <Text style={[styles.memberName, {color: theme.text}]}>
                    {member.name}
                  </Text>
                  {member.vehicle ? (
                    <Text style={[styles.memberVehicle, {color: theme.textMuted}]}>
                      {member.vehicle}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
            {registeredCount > participants.length ? (
              <Text style={[styles.sheetNote, {color: theme.textMuted}]}>
                +{registeredCount - participants.length} additional members
                registered
              </Text>
            ) : null}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  hero: {
    width: '100%',
    backgroundColor: colors.black,
    overflow: 'hidden',
  },
  heroVeil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17,17,16,0.28)',
  },
  heroVeilBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    backgroundColor: 'rgba(17,17,16,0.72)',
  },
  heroChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chromeBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,17,16,0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  chromePressed: {
    opacity: 0.75,
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroTitle: {
    ...typography.display,
    color: colors.ivory,
    fontSize: 34,
    lineHeight: 38,
    marginTop: spacing.sm,
    maxWidth: '92%',
  },
  heroDestination: {
    ...typography.subtitle,
    color: colors.cream,
    marginTop: spacing.xs,
  },
  infoPanel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    marginBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  organizerCopy: {
    flex: 1,
    marginLeft: spacing.md,
  },
  organizerLabel: {
    ...typography.label,
  },
  organizerName: {
    ...typography.title,
    fontSize: 17,
    marginTop: 4,
  },
  callBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    width: 28,
    paddingTop: 2,
  },
  infoCopy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  infoLabel: {
    ...typography.label,
  },
  infoValue: {
    ...typography.body,
    marginTop: 4,
    lineHeight: 22,
  },
  infoDetail: {
    ...typography.caption,
    marginTop: 2,
  },
  infoAction: {
    paddingTop: 2,
  },
  infoActionText: {
    ...typography.label,
    letterSpacing: 1.8,
  },
  aboutBand: {
    backgroundColor: colors.black,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  aboutEyebrow: {
    ...typography.label,
    color: colors.stone,
  },
  aboutTitle: {
    ...typography.title,
    color: colors.ivory,
    fontSize: 18,
    marginTop: spacing.xs,
    maxWidth: 280,
  },
  aboutBody: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(243,240,234,0.18)',
  },
  aboutMeta: {
    ...typography.caption,
    color: colors.greige,
    marginBottom: spacing.md,
  },
  aboutCopy: {
    ...typography.body,
    color: colors.cream,
    lineHeight: 24,
  },
  aboutEmpty: {
    ...typography.subtitle,
    color: colors.stone,
  },
  instructionsBlock: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(243,240,234,0.12)',
  },
  instructionsLabel: {
    ...typography.label,
    color: colors.greige,
    marginBottom: spacing.sm,
  },
  eligibilityBanner: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  eligibilityCopy: {
    flex: 1,
  },
  eligibilityTitle: {
    ...typography.label,
  },
  eligibilityMessage: {
    ...typography.caption,
    marginTop: 4,
  },
  actionError: {
    ...typography.caption,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  ctaBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,17,16,0.45)',
  },
  membersSheet: {
    maxHeight: '70%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 3,
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  sheetEyebrow: {
    ...typography.label,
  },
  sheetTitle: {
    ...typography.title,
    marginTop: 4,
  },
  sheetEmpty: {
    ...typography.subtitle,
    paddingBottom: spacing.xl,
  },
  sheetNote: {
    ...typography.caption,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  memberRowLast: {
    borderBottomWidth: 0,
  },
  memberCopy: {
    marginLeft: spacing.md,
    flex: 1,
  },
  memberName: {
    ...typography.title,
    fontSize: 16,
  },
  memberVehicle: {
    ...typography.caption,
    marginTop: 2,
  },
});
