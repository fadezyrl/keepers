import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Avatar,
  BackHeader,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
} from '../../components';
import {useApp} from '../../context/AppContext';
import {useCachedMember} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {ClubMember} from '../../types';
import {colors, spacing, typography, useThemeColors} from '../../theme';
import {socialUrl} from '../../utils/social';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberProfile'>;

const STAR_FILL = '#B8A078';

function formatJoined(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatGender(value?: string) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function MemberProfileScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const {width} = useWindowDimensions();
  const {members} = useApp();
  const fromDirectory = useMemo(
    () => members.find(m => m.id === route.params.memberId),
    [members, route.params.memberId],
  );
  const memberQuery = useCachedMember(route.params.memberId);
  // Prefer API detail so ratings/history are real — directory list is identity-only.
  const member = memberQuery.data;
  const loading = !member && memberQuery.isLoading;
  const contentWidth = Math.max(0, width - spacing.lg * 2);

  if (loading) {
    return (
      <Screen scroll>
        <BackHeader title="Members" onBack={() => navigation.goBack()} />
        <LoadingState label="Loading member profile..." />
      </Screen>
    );
  }

  if (!member) {
    return (
      <Screen scroll>
        <BackHeader title="Members" onBack={() => navigation.goBack()} />
        <ErrorState
          title="Member unavailable"
          message={
            fromDirectory
              ? 'Could not load the full profile for this member.'
              : 'This member profile could not be found.'
          }
          actionLabel="Retry"
          onAction={() => {
            void memberQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      onRefresh={async () => {
        await memberQuery.refetch();
      }}>
      <BackHeader title="Members" onBack={() => navigation.goBack()} />
      <ProfileHero member={member} theme={theme} />
      <AboutSection member={member} theme={theme} />
      <RatingSection member={member} theme={theme} />
      <AttendanceSection member={member} theme={theme} />
      <VehicleSection
        member={member}
        theme={theme}
        contentWidth={contentWidth}
      />
      <SocialSection member={member} theme={theme} />
      <View style={styles.bottomPad} />
    </Screen>
  );
}

function ProfileHero({
  member,
  theme,
}: {
  member: ClubMember;
  theme: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={styles.hero}>
      <View
        style={[
          styles.avatarRing,
          {borderColor: theme.border, backgroundColor: theme.bgMuted},
        ]}>
        <Avatar uri={member.avatar} size={128} />
      </View>
      <Text style={[styles.name, {color: theme.text}]}>{member.name}</Text>
      {member.username ? (
        <Text style={[styles.username, {color: theme.textMuted}]}>
          @{member.username}
        </Text>
      ) : null}
      <View style={[styles.levelPill, {borderColor: theme.border}]}>
        <Text style={[styles.levelText, {color: theme.text}]}>
          {member.membership}
        </Text>
      </View>
    </View>
  );
}

function AboutSection({
  member,
  theme,
}: {
  member: ClubMember;
  theme: ReturnType<typeof useThemeColors>;
}) {
  const joined = formatJoined(member.joinedAt);
  const gender = formatGender(member.gender);
  const rows = [
    joined ? {label: 'Joined', value: joined} : null,
    gender ? {label: 'Gender', value: gender} : null,
    member.nationality
      ? {label: 'Nationality', value: member.nationality}
      : null,
  ].filter(Boolean) as Array<{label: string; value: string}>;

  if (rows.length === 0 && !member.bio) {
    return (
      <Section title="About" theme={theme}>
        <Text style={[styles.emptyCopy, {color: theme.textMuted}]}>
          No profile details shared yet.
        </Text>
      </Section>
    );
  }

  return (
    <Section title="About" theme={theme}>
      {rows.map(row => (
        <DetailRow
          key={row.label}
          label={row.label}
          value={row.value}
          theme={theme}
        />
      ))}
      {member.bio ? (
        <Text style={[styles.bio, {color: theme.text}]}>{member.bio}</Text>
      ) : null}
    </Section>
  );
}

function RatingSection({
  member,
  theme,
}: {
  member: ClubMember;
  theme: ReturnType<typeof useThemeColors>;
}) {
  const ratings = member.ratings;
  const hasRatings =
    ratings != null &&
    ratings.ratingsReceived > 0 &&
    ratings.overallAverage != null;

  return (
    <Section title="Rating" theme={theme}>
      {!hasRatings ? (
        <Text style={[styles.emptyCopy, {color: theme.textMuted}]}>
          No Marshall ratings yet. Averages appear after verified drive ratings
          are recorded.
        </Text>
      ) : (
        <>
          <RatingRow
            label="Overall"
            value={ratings.overallAverage}
            theme={theme}
            emphasize
          />
          {ratings.categoryAverages.map(cat => (
            <RatingRow
              key={cat.criterionId}
              label={cat.name}
              value={cat.sampleSize > 0 ? cat.average : null}
              theme={theme}
            />
          ))}
        </>
      )}
    </Section>
  );
}

function AttendanceSection({
  member,
  theme,
}: {
  member: ClubMember;
  theme: ReturnType<typeof useThemeColors>;
}) {
  const history = member.progressionHistory;
  const totalAttendance = member.attendance?.total;

  const rows: Array<{label: string; value: string}> = [
    {
      label: 'Total attendance',
      value:
        totalAttendance == null ? '—' : String(Math.max(0, totalAttendance)),
    },
    {
      label: 'Junior',
      value: String(history?.junior ?? 0),
    },
    {
      label: 'Intermediate',
      value: String(history?.intermediate ?? 0),
    },
    {
      label: 'Advanced',
      value: String(history?.advanced ?? 0),
    },
    {
      label: 'Pre-Marshall',
      value: String(history?.preMarshall ?? 0),
    },
    {
      label: 'Marshall',
      value: String(history?.marshall ?? 0),
    },
  ];

  return (
    <Section title="Attendance & Membership History" theme={theme}>
      <Text style={[styles.sectionHint, {color: theme.textMuted}]}>
        Progression counts reflect completed history only — not the current
        level or role.
      </Text>
      {rows.map(row => (
        <DetailRow
          key={row.label}
          label={row.label}
          value={row.value}
          theme={theme}
          valueAlign="end"
        />
      ))}
    </Section>
  );
}

function VehicleSection({
  member,
  theme,
  contentWidth,
}: {
  member: ClubMember;
  theme: ReturnType<typeof useThemeColors>;
  contentWidth: number;
}) {
  const [aspect, setAspect] = useState(16 / 10);
  const uri = member.vehicleImage;

  useEffect(() => {
    if (!uri) {
      setAspect(16 / 10);
      return;
    }
    let cancelled = false;
    Image.getSize(
      uri,
      (w, h) => {
        if (!cancelled && w > 0 && h > 0) {
          setAspect(w / h);
        }
      },
      () => {
        if (!cancelled) setAspect(16 / 10);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [uri]);

  const hasVehicle =
    Boolean(member.vehicle) ||
    Boolean(member.vehicleYear) ||
    Boolean(uri) ||
    Boolean(member.vehicleVin);

  if (!hasVehicle) {
    return (
      <Section title="Car Information" theme={theme}>
        <Text style={[styles.emptyCopy, {color: theme.textMuted}]}>
          No vehicle details are available for this member.
        </Text>
      </Section>
    );
  }

  const imageHeight = Math.round(contentWidth / Math.max(aspect, 0.5));

  return (
    <Section title="Car Information" theme={theme}>
      {uri ? (
        <View
          style={[
            styles.vehicleFrame,
            {
              width: contentWidth,
              height: imageHeight,
              backgroundColor: theme.bgMuted,
              borderColor: theme.border,
            },
          ]}>
          <Image
            source={{uri, cache: 'force-cache'}}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            accessibilityLabel={`${member.name} vehicle`}
          />
        </View>
      ) : (
        <View
          style={[
            styles.vehiclePlaceholder,
            {backgroundColor: theme.bgMuted, borderColor: theme.border},
          ]}>
          <Icon name="car" size={28} color={theme.textMuted} />
          <Text style={[styles.emptyCopy, {color: theme.textMuted}]}>
            No vehicle photo uploaded
          </Text>
        </View>
      )}

      {member.vehicle ? (
        <DetailRow label="Vehicle" value={member.vehicle} theme={theme} />
      ) : null}
      {member.vehicleYear ? (
        <DetailRow
          label="Model year"
          value={member.vehicleYear}
          theme={theme}
        />
      ) : null}
      {member.vehicleVin ? (
        <DetailRow label="VIN" value={member.vehicleVin} theme={theme} />
      ) : null}
    </Section>
  );
}

function SocialSection({
  member,
  theme,
}: {
  member: ClubMember;
  theme: ReturnType<typeof useThemeColors>;
}) {
  const links = [
    member.social?.instagram
      ? {
          key: 'instagram' as const,
          label: 'Instagram',
          handle: member.social.instagram,
        }
      : null,
    member.social?.facebook
      ? {
          key: 'facebook' as const,
          label: 'Facebook',
          handle: member.social.facebook,
        }
      : null,
    member.social?.tiktok
      ? {
          key: 'tiktok' as const,
          label: 'TikTok',
          handle: member.social.tiktok,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: 'instagram' | 'facebook' | 'tiktok';
    label: string;
    handle: string;
  }>;

  if (links.length === 0) {
    return (
      <Section title="Social Media" theme={theme}>
        <Text style={[styles.emptyCopy, {color: theme.textMuted}]}>
          No social links added.
        </Text>
      </Section>
    );
  }

  return (
    <Section title="Social Media" theme={theme}>
      {links.map(link => (
        <Pressable
          key={link.key}
          accessibilityRole="link"
          accessibilityLabel={`Open ${link.label}`}
          onPress={() => {
            void Linking.openURL(socialUrl(link.key, link.handle));
          }}
          style={({pressed}) => [
            styles.socialRow,
            {borderBottomColor: theme.border, opacity: pressed ? 0.7 : 1},
          ]}>
          <View style={styles.socialLeft}>
            <Icon name={link.key} size={18} color={theme.text} />
            <View>
              <Text style={[styles.socialLabel, {color: theme.textMuted}]}>
                {link.label}
              </Text>
              <Text style={[styles.socialHandle, {color: theme.text}]}>
                {link.handle}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={14} color={theme.textMuted} />
        </Pressable>
      ))}
    </Section>
  );
}

function Section({
  title,
  theme,
  children,
}: {
  title: string;
  theme: ReturnType<typeof useThemeColors>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, {color: theme.textMuted}]}>{title}</Text>
      <View style={[styles.sectionRule, {backgroundColor: theme.border}]} />
      {children}
    </View>
  );
}

function DetailRow({
  label,
  value,
  theme,
  valueAlign = 'start',
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useThemeColors>;
  valueAlign?: 'start' | 'end';
}) {
  return (
    <View style={[styles.detailRow, {borderBottomColor: theme.border}]}>
      <Text style={[styles.detailLabel, {color: theme.textMuted}]}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          {
            color: theme.text,
            textAlign: valueAlign,
          },
        ]}>
        {value}
      </Text>
    </View>
  );
}

function RatingRow({
  label,
  value,
  theme,
  emphasize = false,
}: {
  label: string;
  value: number | null | undefined;
  theme: ReturnType<typeof useThemeColors>;
  emphasize?: boolean;
}) {
  return (
    <View style={[styles.ratingRow, {borderBottomColor: theme.border}]}>
      <Text
        style={[
          emphasize ? styles.ratingLabelEmph : styles.ratingLabel,
          {color: emphasize ? theme.text : theme.textMuted},
        ]}>
        {label}
      </Text>
      <View style={styles.ratingRight}>
        {value == null ? (
          <Text style={[styles.ratingEmpty, {color: theme.textMuted}]}>
            —
          </Text>
        ) : (
          <>
            <StarRow value={value} />
            <Text style={[styles.ratingNumber, {color: theme.text}]}>
              {value.toFixed(1)}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

function StarRow({value}: {value: number}) {
  const clamped = Math.max(0, Math.min(5, value));
  return (
    <View style={styles.stars}>
      {[0, 1, 2, 3, 4].map(index => {
        const fill = Math.max(0, Math.min(1, clamped - index));
        return <StarSlot key={index} fill={fill} />;
      })}
    </View>
  );
}

function StarSlot({fill}: {fill: number}) {
  const clipWidth = Math.round(14 * Math.max(0, Math.min(1, fill)));
  return (
    <View style={styles.starSlot}>
      <Icon name="star" size={14} color={colors.greige} />
      {clipWidth > 0 ? (
        <View style={[styles.starFillClip, {width: clipWidth}]}>
          <Icon name="star" size={14} color={STAR_FILL} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  avatarRing: {
    padding: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  name: {
    ...typography.hero,
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    marginTop: spacing.lg,
    textTransform: 'none',
    letterSpacing: 0.4,
    fontWeight: '300',
  },
  username: {
    ...typography.caption,
    marginTop: spacing.xs,
    letterSpacing: 0.8,
  },
  levelPill: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
  },
  levelText: {
    ...typography.label,
    letterSpacing: 2.4,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.section,
    marginBottom: spacing.sm,
  },
  sectionRule: {
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  sectionHint: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  emptyCopy: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  bio: {
    ...typography.body,
    marginTop: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailLabel: {
    ...typography.label,
    flexShrink: 0,
    maxWidth: '42%',
  },
  detailValue: {
    ...typography.body,
    flex: 1,
    fontSize: 15,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ratingLabel: {
    ...typography.label,
    flex: 1,
  },
  ratingLabelEmph: {
    ...typography.body,
    fontSize: 15,
    letterSpacing: 0.2,
    flex: 1,
  },
  ratingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingNumber: {
    ...typography.caption,
    color: colors.black,
    minWidth: 28,
    textAlign: 'right',
  },
  ratingEmpty: {
    ...typography.caption,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  starSlot: {
    width: 14,
    height: 14,
    overflow: 'hidden',
  },
  starFillClip: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  vehicleFrame: {
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  vehiclePlaceholder: {
    minHeight: 160,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  socialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  socialLabel: {
    ...typography.label,
    marginBottom: 2,
  },
  socialHandle: {
    ...typography.body,
    fontSize: 15,
  },
  bottomPad: {
    height: spacing.xxl,
  },
});
